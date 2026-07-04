import SwiftUI

struct AddTopicView: View {
    @EnvironmentObject private var store: TopicStore
    @Environment(\.dismiss) private var dismiss

    @State private var title = ""
    @State private var category: Topic.Category = .citizenScience
    @State private var hook = ""
    @State private var reelAngle = ""
    @State private var articleAngle = ""
    @State private var citizenScienceLink = ""
    @State private var tagsRaw = ""
    @State private var sourceLabel = ""
    @State private var sourceURL = ""

    private var canSave: Bool { !title.trimmingCharacters(in: .whitespaces).isEmpty && !hook.isEmpty }

    var body: some View {
        NavigationStack {
            Form {
                Section("Topic") {
                    TextField("Title", text: $title)
                    Picker("Category", selection: $category) {
                        ForEach(Topic.Category.allCases, id: \.self) { cat in
                            Text("\(cat.emoji)  \(cat.rawValue)").tag(cat)
                        }
                    }
                    TextField("Hook (1–2 sentences)", text: $hook, axis: .vertical)
                        .lineLimit(3, reservesSpace: true)
                }
                Section("Content Angles") {
                    TextField("Reel angle", text: $reelAngle, axis: .vertical)
                        .lineLimit(3, reservesSpace: true)
                    TextField("Article angle", text: $articleAngle, axis: .vertical)
                        .lineLimit(3, reservesSpace: true)
                }
                Section("Source") {
                    TextField("Label (e.g. 'arXiv paper')", text: $sourceLabel)
                    TextField("URL", text: $sourceURL)
                        .textContentType(.URL)
                }
                Section("Optional") {
                    TextField("Citizen science link", text: $citizenScienceLink)
                    TextField("Tags (comma separated)", text: $tagsRaw)
                }
            }
            .formStyle(.grouped)
            .navigationTitle("New Topic")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) { Button("Add") { save() }.disabled(!canSave) }
            }
        }
        .frame(minWidth: 480, minHeight: 520)
    }

    private func save() {
        let tags = tagsRaw.split(separator: ",").map { $0.trimmingCharacters(in: .whitespaces) }
        var sources: [TopicSource] = []
        if !sourceURL.isEmpty {
            sources.append(TopicSource(label: sourceLabel.isEmpty ? sourceURL : sourceLabel, url: sourceURL))
        }
        let seed = TopicSeed(
            title: title.trimmingCharacters(in: .whitespaces),
            category: category,
            hook: hook,
            reelAngle: reelAngle,
            articleAngle: articleAngle,
            citizenScienceLink: citizenScienceLink.isEmpty ? nil : citizenScienceLink,
            sources: sources,
            tags: tags
        )
        store.add(seed)
        dismiss()
    }
}
