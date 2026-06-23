import SwiftUI

/// Main writing screen, mirroring Prosaic's `EditorScreen`: a Markdown text
/// editor with an optional outline pane, focus mode, reader mode, and a
/// status bar with live word/character counts and autosave.
struct EditorView: View {
    @Environment(\.prosaicPalette) private var palette

    let article: ArticleSummary
    @ObservedObject var client: SailyCMSClient

    @State private var document: ArticleDocument?
    @State private var text: String = ""
    @State private var headings: [OutlineHeading] = []
    @State private var isModified = false
    @State private var isSaving = false
    @State private var showOutline = true
    @State private var showMetadata = false
    @State private var focusMode = false
    @State private var readerMode = false
    @State private var errorMessage: String?
    @State private var title = ""
    @State private var summary = ""
    @State private var status = "draft"
    @State private var heroImage = ""
    @State private var tags = ""
    @State private var sources = ""
    @State private var citizenScienceLinks = ""

    private let autosaveTimer = Timer.publish(every: 10, on: .main, in: .common).autoconnect()
    private let statuses = ["draft", "review", "published", "archived"]

    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 0) {
                editor
                    .frame(maxWidth: .infinity, maxHeight: .infinity)

                if showOutline && !focusMode {
                    Divider().overlay(palette.border)
                    OutlinePanelView(headings: headings, onSelect: jump(to:))
                }
            }

            if !focusMode {
                StatusBarView(
                    filename: "\(article.slug).md",
                    isModified: isModified,
                    wordCount: TextMetrics.wordCount(text),
                    characterCount: TextMetrics.characterCount(text),
                    isSaving: isSaving
                )
            }
        }
        .background(palette.background)
        .navigationTitle(article.displayTitle)
        .toolbar {
            ToolbarItemGroup {
                Button {
                    showMetadata.toggle()
                } label: {
                    Label("Metadata", systemImage: "tag")
                }
                .help("Toggle metadata")

                Button {
                    showOutline.toggle()
                } label: {
                    Label("Outline", systemImage: "list.bullet.indent")
                }
                .help("Toggle outline (Ctrl+O)")

                Button {
                    focusMode.toggle()
                } label: {
                    Label("Focus", systemImage: focusMode ? "rectangle.compress.vertical" : "rectangle.expand.vertical")
                }
                .help("Toggle focus mode (F5)")

                Button {
                    readerMode.toggle()
                } label: {
                    Label("Reader", systemImage: readerMode ? "book.fill" : "book")
                }
                .help("Toggle reader mode (F6)")

                Button {
                    Task { await save() }
                } label: {
                    Label("Save", systemImage: "tray.and.arrow.down")
                }
                .help("Save (Ctrl+S)")
                .disabled(isSaving)

                Button {
                    Task { await publish() }
                } label: {
                    Label("Publish", systemImage: "paperplane")
                }
                .help("Publish to Saily")
                .disabled(isSaving || document?.frontmatter["status"]?.stringValue == "published")
            }
        }
        .task(id: article.slug) {
            await load()
        }
        .inspector(isPresented: $showMetadata) {
            metadataPanel
                .inspectorColumnWidth(min: 260, ideal: 320, max: 420)
        }
        .onReceive(autosaveTimer) { _ in
            guard isModified, !readerMode else { return }
            Task { await save(silent: true) }
        }
        .alert("Saily CMS", isPresented: .constant(errorMessage != nil), actions: {
            Button("OK") { errorMessage = nil }
        }, message: {
            Text(errorMessage ?? "")
        })
    }

    @ViewBuilder
    private var editor: some View {
        TextEditor(text: $text)
            .font(.system(.body, design: .monospaced))
            .scrollContentBackground(.hidden)
            .background(palette.background)
            .foregroundStyle(palette.text)
            .disabled(readerMode)
            .padding(focusMode ? 24 : 12)
            .frame(maxWidth: focusMode ? 680 : .infinity)
            .frame(maxWidth: .infinity)
            .onChange(of: text) { _, newValue in
                isModified = true
                headings = OutlineHeading.parse(from: newValue)
            }
    }

    private var metadataPanel: some View {
        Form {
            Section("Article") {
                TextField("Title", text: $title)
                Picker("Status", selection: $status) {
                    ForEach(statuses, id: \.self) { value in
                        Text(value.capitalized).tag(value)
                    }
                }
                TextField("Summary", text: $summary, axis: .vertical)
                    .lineLimit(3...6)
                TextField("Hero image URL", text: $heroImage)
                    #if os(iOS)
                    .textInputAutocapitalization(.never)
                    .keyboardType(.URL)
                    #endif
            }

            Section("Taxonomy") {
                TextField("Tags", text: $tags, prompt: Text("daily-transit, editorial"))
                TextField("Sources", text: $sources, axis: .vertical)
                    .lineLimit(2...5)
                TextField("Citizen-science links", text: $citizenScienceLinks, axis: .vertical)
                    .lineLimit(2...5)
            }
        }
        .formStyle(.grouped)
        .onChange(of: title) { _, _ in markMetadataChanged() }
        .onChange(of: status) { _, _ in markMetadataChanged() }
        .onChange(of: summary) { _, _ in markMetadataChanged() }
        .onChange(of: heroImage) { _, _ in markMetadataChanged() }
        .onChange(of: tags) { _, _ in markMetadataChanged() }
        .onChange(of: sources) { _, _ in markMetadataChanged() }
        .onChange(of: citizenScienceLinks) { _, _ in markMetadataChanged() }
    }

    private func jump(to heading: OutlineHeading) {
        // Native TextEditor has no line-based cursor API; this is a hook
        // point for a future custom text view that supports it.
    }

    private func load() async {
        do {
            let doc = try await client.loadArticle(slug: article.slug)
            document = doc
            text = doc.body
            applyMetadata(from: doc.frontmatter)
            headings = OutlineHeading.parse(from: doc.body)
            isModified = false
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func save(silent: Bool = false) async {
        guard let document else { return }
        isSaving = true
        defer { isSaving = false }
        do {
            let updated = try await client.saveArticle(
                slug: article.slug,
                frontmatter: currentFrontmatter(from: document.frontmatter),
                body: text
            )
            self.document = updated
            applyMetadata(from: updated.frontmatter)
            isModified = false
        } catch {
            if !silent {
                errorMessage = error.localizedDescription
            }
        }
    }

    /// Saves the article with `status: published`, making it publicly
    /// readable via the Saily Next.js site.
    private func publish() async {
        guard let document else { return }
        isSaving = true
        defer { isSaving = false }
        do {
            var frontmatter = currentFrontmatter(from: document.frontmatter)
            frontmatter["status"] = AnyCodable("published")
            let updated = try await client.saveArticle(
                slug: article.slug,
                frontmatter: frontmatter,
                body: text
            )
            self.document = updated
            applyMetadata(from: updated.frontmatter)
            isModified = false
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func applyMetadata(from frontmatter: [String: AnyCodable]) {
        title = frontmatter["title"]?.stringValue ?? article.displayTitle
        status = frontmatter["status"]?.stringValue ?? article.status
        summary = frontmatter["summary"]?.stringValue ?? article.summary
        heroImage = frontmatter["heroImage"]?.stringValue ?? ""
        tags = csv(from: frontmatter["tags"]?.stringArrayValue ?? article.tags)
        sources = csv(from: frontmatter["sources"]?.stringArrayValue ?? [])
        citizenScienceLinks = csv(from: frontmatter["citizenScienceLinks"]?.stringArrayValue ?? [])
    }

    private func currentFrontmatter(from existing: [String: AnyCodable]) -> [String: AnyCodable] {
        var frontmatter = existing
        frontmatter["title"] = AnyCodable(title.trimmingCharacters(in: .whitespacesAndNewlines))
        frontmatter["status"] = AnyCodable(status)
        frontmatter["summary"] = AnyCodable(summary.trimmingCharacters(in: .whitespacesAndNewlines))
        frontmatter["heroImage"] = AnyCodable(heroImage.trimmingCharacters(in: .whitespacesAndNewlines))
        frontmatter["tags"] = AnyCodable(list(from: tags))
        frontmatter["sources"] = AnyCodable(list(from: sources))
        frontmatter["citizenScienceLinks"] = AnyCodable(list(from: citizenScienceLinks))
        return frontmatter
    }

    private func markMetadataChanged() {
        guard document != nil else { return }
        isModified = true
    }

    private func list(from value: String) -> [String] {
        value
            .split(separator: ",")
            .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
            .filter { !$0.isEmpty }
    }

    private func csv(from value: [String]) -> String {
        value.joined(separator: ", ")
    }
}
