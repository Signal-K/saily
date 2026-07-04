import SwiftUI

enum SidebarItem: Hashable {
    case all
    case status(Topic.Status)
    case category(Topic.Category)
}

struct RootView: View {
    @EnvironmentObject private var store: TopicStore
    @State private var sidebarSelection: SidebarItem? = .all
    @State private var selectedTopicID: Topic.ID? = nil

    var filteredTopics: [Topic] {
        switch sidebarSelection ?? .all {
        case .all:
            return store.topics.filter { $0.status != .skipped }
        case .status(let s):
            return store.topics.filter { $0.status == s }
        case .category(let c):
            return store.topics.filter { $0.category == c && $0.status != .skipped }
        }
    }

    var body: some View {
        NavigationSplitView {
            sidebar
                .navigationSplitViewColumnWidth(min: 180, ideal: 210)
        } content: {
            TopicListView(topics: filteredTopics, selectedTopicID: $selectedTopicID)
                .navigationSplitViewColumnWidth(min: 280, ideal: 360)
        } detail: {
            if let id = selectedTopicID, let topic = store.topics.first(where: { $0.id == id }) {
                TopicDetailPanel(topic: topic)
            } else {
                emptyDetail
            }
        }
    }

    private var sidebar: some View {
        List(selection: $sidebarSelection) {
            Section("Library") {
                Label("All Topics", systemImage: "square.stack.3d.up.fill")
                    .tag(SidebarItem.all)

                ForEach([Topic.Status.new, .saved, .writing, .published], id: \.self) { status in
                    HStack {
                        Label(status.label, systemImage: status.icon)
                        Spacer()
                        let count = store.topics.filter { $0.status == status }.count
                        if count > 0 {
                            Text("\(count)").font(.caption2).foregroundStyle(.secondary)
                                .padding(.horizontal, 6).padding(.vertical, 2)
                                .background(.secondary.opacity(0.15)).clipShape(Capsule())
                        }
                    }
                    .tag(SidebarItem.status(status))
                }
            }

            Section("Categories") {
                ForEach(Topic.Category.allCases, id: \.self) { cat in
                    HStack {
                        Text("\(cat.emoji)  \(cat.rawValue)")
                        Spacer()
                        let count = store.topics.filter { $0.category == cat && $0.status != .skipped }.count
                        if count > 0 {
                            Text("\(count)").font(.caption2).foregroundStyle(.secondary)
                                .padding(.horizontal, 6).padding(.vertical, 2)
                                .background(.secondary.opacity(0.15)).clipShape(Capsule())
                        }
                    }
                    .tag(SidebarItem.category(cat))
                }
            }
        }
        .listStyle(.sidebar)
        .navigationTitle("Scout")
    }

    private var emptyDetail: some View {
        VStack(spacing: 12) {
            Image(systemName: "doc.text")
                .font(.system(size: 44)).foregroundStyle(.tertiary)
            Text("Select a topic")
                .font(.title3).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

extension Topic.Status {
    var label: String {
        switch self {
        case .new: "New"
        case .saved: "Saved"
        case .writing: "Writing"
        case .published: "Published"
        case .skipped: "Skipped"
        }
    }
    var icon: String {
        switch self {
        case .new: "sparkles"
        case .saved: "bookmark.fill"
        case .writing: "pencil"
        case .published: "checkmark.circle.fill"
        case .skipped: "xmark.circle"
        }
    }
}
