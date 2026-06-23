import SwiftUI

/// Sidebar listing articles from `GET /api/saily/cms/articles`, the rough
/// equivalent of Prosaic's dashboard "find files" / file tree.
struct ArticleListView: View {
    @Environment(\.prosaicPalette) private var palette

    @ObservedObject var client: SailyCMSClient
    @Binding var selection: ArticleSummary?

    @State private var articles: [ArticleSummary] = []
    @State private var errorMessage: String?
    @State private var isLoading = false
    @State private var showNewArticle = false
    @State private var isCreating = false

    var body: some View {
        List(articles, selection: $selection) { article in
            VStack(alignment: .leading, spacing: 2) {
                Text(article.displayTitle)
                    .font(.system(.body, design: .monospaced))
                Text(article.status.isEmpty ? "draft" : article.status)
                    .font(.system(.caption2, design: .monospaced))
                    .foregroundStyle(palette.textMuted)
            }
            .tag(article)
        }
        .navigationTitle("Articles")
        .toolbar {
            ToolbarItem {
                Button {
                    showNewArticle = true
                } label: {
                    Label("New Article", systemImage: "plus")
                }
                .disabled(isCreating)
            }
        }
        .sheet(isPresented: $showNewArticle) {
            NewArticleSheet(isCreating: isCreating) { title, slug in
                await createArticle(title: title, slug: slug)
            }
            .frame(minWidth: 360, minHeight: 260)
        }
        .overlay {
            if isLoading {
                ProgressView()
            } else if let errorMessage {
                ContentUnavailableView(errorMessage, systemImage: "exclamationmark.triangle")
            } else if articles.isEmpty {
                ContentUnavailableView("No articles yet", systemImage: "doc.text")
            }
        }
        .task {
            await reload()
        }
        .refreshable {
            await reload()
        }
    }

    private func reload() async {
        isLoading = true
        defer { isLoading = false }
        do {
            articles = try await client.listArticles()
            errorMessage = nil
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func createArticle(title: String, slug: String) async {
        isCreating = true
        defer { isCreating = false }
        do {
            _ = try await client.createDraft(slug: slug, title: title)
            await reload()
            selection = articles.first { $0.slug == slug }
            errorMessage = nil
            showNewArticle = false
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

private struct NewArticleSheet: View {
    @Environment(\.dismiss) private var dismiss

    let isCreating: Bool
    let onCreate: (String, String) async -> Void

    @State private var title = ""
    @State private var slug = ""
    @State private var didEditSlug = false

    var body: some View {
        Form {
            Section("New Article") {
                TextField("Title", text: $title)
                    .onChange(of: title) { _, newValue in
                        guard !didEditSlug else { return }
                        slug = Self.slugify(newValue)
                    }

                TextField("Slug", text: $slug)
                    #if os(iOS)
                    .textInputAutocapitalization(.never)
                    .keyboardType(.URL)
                    #endif
                    .onChange(of: slug) { _, newValue in
                        didEditSlug = true
                        slug = Self.slugify(newValue)
                    }
            }

            Section {
                HStack {
                    Button("Cancel") {
                        dismiss()
                    }
                    Spacer()
                    Button {
                        Task { await onCreate(title.trimmingCharacters(in: .whitespacesAndNewlines), slug) }
                    } label: {
                        if isCreating {
                            ProgressView()
                        } else {
                            Text("Create Draft")
                        }
                    }
                    .disabled(isCreating || title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || slug.isEmpty)
                    .buttonStyle(.borderedProminent)
                }
            }
        }
        .formStyle(.grouped)
    }

    private static func slugify(_ value: String) -> String {
        var result = ""
        var lastWasHyphen = false

        for scalar in value.lowercased().unicodeScalars {
            let isLetter = CharacterSet.lowercaseLetters.contains(scalar)
            let isDigit = CharacterSet.decimalDigits.contains(scalar)

            if isLetter || isDigit {
                result.unicodeScalars.append(scalar)
                lastWasHyphen = false
            } else if !lastWasHyphen, !result.isEmpty {
                result.append("-")
                lastWasHyphen = true
            }
        }

        return result.trimmingCharacters(in: CharacterSet(charactersIn: "-"))
    }
}
