import SwiftUI

struct TopicListView: View {
    let topics: [Topic]
    @Binding var selectedTopicID: Topic.ID?
    @EnvironmentObject private var store: TopicStore
    @State private var searchText = ""
    @State private var showAddSheet = false

    private var displayed: [Topic] {
        guard !searchText.isEmpty else { return topics }
        let q = searchText.lowercased()
        return topics.filter {
            $0.title.lowercased().contains(q) ||
            $0.hook.lowercased().contains(q) ||
            $0.tags.joined().lowercased().contains(q)
        }
    }

    var body: some View {
        List(displayed, selection: $selectedTopicID) { topic in
            TopicRow(topic: topic)
                .tag(topic.id)
                .swipeActions(edge: .leading) {
                    if topic.status != .saved {
                        Button { store.setStatus(.saved, for: topic) } label: {
                            Label("Save", systemImage: "bookmark.fill")
                        }.tint(.blue)
                    }
                    if topic.status != .writing {
                        Button { store.setStatus(.writing, for: topic) } label: {
                            Label("Writing", systemImage: "pencil")
                        }.tint(.orange)
                    }
                }
                .swipeActions(edge: .trailing) {
                    Button(role: .destructive) { store.setStatus(.skipped, for: topic) } label: {
                        Label("Skip", systemImage: "xmark")
                    }
                }
                .contextMenu {
                    statusMenu(topic: topic)
                }
        }
        .listStyle(.insetGrouped)
        .searchable(text: $searchText, placement: .toolbar, prompt: "Search topics")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button { showAddSheet = true } label: {
                    Image(systemName: "plus")
                }
            }
        }
        .overlay {
            if displayed.isEmpty {
                ContentUnavailableView(
                    searchText.isEmpty ? "No Topics" : "No Results",
                    systemImage: searchText.isEmpty ? "tray" : "magnifyingglass",
                    description: Text(searchText.isEmpty ? "Nothing in this filter." : "Try a different search.")
                )
            }
        }
        .sheet(isPresented: $showAddSheet) {
            AddTopicView()
        }
    }

    @ViewBuilder
    private func statusMenu(topic: Topic) -> some View {
        Button("Save") { store.setStatus(.saved, for: topic) }
        Button("Start Writing") { store.setStatus(.writing, for: topic) }
        Button("Mark Published") { store.setStatus(.published, for: topic) }
        Divider()
        Button("Mark New") { store.setStatus(.new, for: topic) }
        Button("Skip", role: .destructive) { store.setStatus(.skipped, for: topic) }
    }
}

struct TopicRow: View {
    let topic: Topic

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(alignment: .firstTextBaseline, spacing: 6) {
                Text(topic.title)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.primary)
                    .fixedSize(horizontal: false, vertical: true)
                Spacer()
                statusBadge
            }

            Text(topic.hook)
                .font(.caption)
                .foregroundStyle(.secondary)
                .lineLimit(2)
                .fixedSize(horizontal: false, vertical: true)

            HStack(spacing: 6) {
                Text("\(topic.category.emoji) \(topic.category.rawValue)")
                    .font(.caption2.weight(.medium))
                    .foregroundStyle(.secondary)
                Spacer()
                ForEach(topic.tags.prefix(2), id: \.self) { tag in
                    Text("#\(tag)")
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                }
            }
        }
        .padding(.vertical, 4)
    }

    private var statusBadge: some View {
        let (label, color): (String, Color) = switch topic.status {
        case .saved: ("Saved", .blue)
        case .writing: ("Writing", .orange)
        case .published: ("Published", .green)
        case .skipped: ("Skipped", .secondary)
        default: ("", .clear)
        }
        return Group {
            if !label.isEmpty {
                Text(label)
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(color)
                    .padding(.horizontal, 7).padding(.vertical, 2)
                    .background(color.opacity(0.15))
                    .clipShape(Capsule())
            }
        }
    }
}
