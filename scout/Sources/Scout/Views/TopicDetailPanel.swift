import SwiftUI

struct TopicDetailPanel: View {
    let topic: Topic
    @EnvironmentObject private var store: TopicStore
    @State private var activeURL: URL? = nil
    @State private var webLoading = false
    @State private var webTitle = ""

    var body: some View {
        GeometryReader { geo in
            VStack(spacing: 0) {
                topPane
                    .frame(height: activeURL != nil ? geo.size.height * 0.35 : geo.size.height - 100)

                Divider()

                if let url = activeURL {
                    readerPane(url: url)
                        .frame(height: geo.size.height * 0.65)
                } else {
                    sourcePicker
                        .frame(height: 100)
                }
            }
        }
        .onChange(of: topic.id) {
            activeURL = nil
            webTitle = ""
        }
    }

    // MARK: - Top pane: topic info

    private var topPane: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                header
                Divider().padding(.vertical, 16)
                sections
                Divider().padding(.vertical, 16)
                actions
            }
            .padding(24)
            .frame(maxWidth: 860, alignment: .leading)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 8) {
                Text("\(topic.category.emoji)  \(topic.category.rawValue)")
                    .font(.caption.weight(.semibold)).foregroundStyle(.secondary)
                    .padding(.horizontal, 10).padding(.vertical, 4)
                    .background(.secondary.opacity(0.1)).clipShape(Capsule())
                if topic.status != .new {
                    Text(topic.status.label)
                        .font(.caption.weight(.semibold)).foregroundStyle(topic.status.badgeColor)
                        .padding(.horizontal, 10).padding(.vertical, 4)
                        .background(topic.status.badgeColor.opacity(0.1)).clipShape(Capsule())
                }
            }
            Text(topic.title).font(.title2.weight(.bold)).fixedSize(horizontal: false, vertical: true)
            Text(topic.hook).font(.body).foregroundStyle(.secondary).fixedSize(horizontal: false, vertical: true)
        }
    }

    private var sections: some View {
        VStack(alignment: .leading, spacing: 18) {
            infoBlock(label: "Reel Angle", icon: "play.rectangle.fill", color: .purple, body: topic.reelAngle)
            infoBlock(label: "Article Angle", icon: "doc.text.fill", color: .blue, body: topic.articleAngle)
            if let link = topic.citizenScienceLink {
                infoBlock(label: "Citizen Science", icon: "person.2.fill", color: .green, body: link)
            }
            if !topic.tags.isEmpty { tagsBlock }
        }
    }

    private func infoBlock(label: String, icon: String, color: Color, body: String) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Label(label, systemImage: icon)
                .font(.caption.weight(.semibold)).foregroundStyle(color)
                .textCase(.uppercase).kerning(0.4)
            Text(body).font(.subheadline).fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var tagsBlock: some View {
        FlowLayout(spacing: 6) {
            ForEach(topic.tags, id: \.self) { tag in
                Text("#\(tag)").font(.caption.weight(.medium)).foregroundStyle(.secondary)
                    .padding(.horizontal, 10).padding(.vertical, 4)
                    .background(Color(.secondarySystemBackground)).clipShape(Capsule())
            }
        }
    }

    private var actions: some View {
        HStack(spacing: 10) {
            if topic.status != .saved && topic.status != .writing && topic.status != .published {
                actionButton("Save", icon: "bookmark.fill", color: .blue) { store.setStatus(.saved, for: topic) }
            }
            if topic.status != .writing && topic.status != .published {
                actionButton("Writing", icon: "pencil", color: .orange) { store.setStatus(.writing, for: topic) }
            }
            if topic.status == .writing {
                actionButton("Published", icon: "checkmark.circle.fill", color: .green) { store.setStatus(.published, for: topic) }
            }
            if topic.status != .new {
                actionButton("Reset", icon: "arrow.counterclockwise", color: .secondary) { store.setStatus(.new, for: topic) }
            }
            Spacer()
            if topic.status != .skipped {
                actionButton("Skip", icon: "xmark", color: .red) { store.setStatus(.skipped, for: topic) }
            }
        }
    }

    private func actionButton(_ label: String, icon: String, color: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Label(label, systemImage: icon).font(.subheadline.weight(.medium))
                .padding(.horizontal, 14).padding(.vertical, 8)
                .background(color.opacity(0.12)).foregroundStyle(color)
                .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
        }
        .buttonStyle(.plain)
    }

    // MARK: - Bottom pane: source picker or reader

    private var sourcePicker: some View {
        VStack(alignment: .leading, spacing: 10) {
            Label("Sources — tap to read", systemImage: "book.pages")
                .font(.caption.weight(.semibold)).foregroundStyle(.orange)
                .textCase(.uppercase).kerning(0.4)
            if topic.sources.isEmpty {
                Text("No sources added for this topic.")
                    .font(.caption).foregroundStyle(.tertiary)
            } else {
                HStack(spacing: 8) {
                    ForEach(topic.sources, id: \.url) { source in
                        if let url = URL(string: source.url) {
                            Button {
                                activeURL = url
                                webTitle = source.label
                            } label: {
                                Label(source.label, systemImage: "doc.text")
                                    .font(.subheadline)
                                    .lineLimit(1)
                                    .padding(.horizontal, 12).padding(.vertical, 8)
                                    .background(Color(.secondarySystemBackground))
                                    .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    Spacer()
                }
            }
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 16)
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func readerPane(url: URL) -> some View {
        VStack(spacing: 0) {
            // Reader toolbar
            HStack(spacing: 12) {
                Button { activeURL = nil } label: {
                    Image(systemName: "chevron.down")
                        .font(.caption.weight(.semibold))
                        .padding(6)
                        .background(Color(.secondarySystemBackground))
                        .clipShape(Circle())
                }
                .buttonStyle(.plain)

                Text(webTitle.isEmpty ? url.host ?? "" : webTitle)
                    .font(.caption.weight(.medium))
                    .foregroundStyle(.secondary)
                    .lineLimit(1)

                Spacer()

                if webLoading {
                    ProgressView().scaleEffect(0.7)
                }

                // Source switcher if multiple sources
                if topic.sources.count > 1 {
                    ForEach(topic.sources, id: \.url) { source in
                        if let u = URL(string: source.url) {
                            Button {
                                activeURL = u
                                webTitle = source.label
                            } label: {
                                Text(source.label)
                                    .font(.caption.weight(.medium))
                                    .lineLimit(1)
                                    .padding(.horizontal, 8).padding(.vertical, 4)
                                    .background(activeURL == u ? Color.orange.opacity(0.15) : Color(.secondarySystemBackground))
                                    .foregroundStyle(activeURL == u ? .orange : .secondary)
                                    .clipShape(Capsule())
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(Color(.secondarySystemBackground))

            Divider()

            WebView(url: url, isLoading: $webLoading, webTitle: $webTitle)
        }
    }
}

extension Topic.Status {
    var badgeColor: Color {
        switch self {
        case .saved: .blue
        case .writing: .orange
        case .published: .green
        case .skipped: .secondary
        case .new: .secondary
        }
    }
}
