import Foundation
import Combine

@MainActor
final class TopicStore: ObservableObject {
    @Published private(set) var topics: [Topic] = []

    private let saveURL: URL = {
        FileManager.default
            .urls(for: .documentDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("scout-topics.json")
    }()

    init() {
        load()
    }

    func setStatus(_ status: Topic.Status, for topic: Topic) {
        guard let idx = topics.firstIndex(where: { $0.id == topic.id }) else { return }
        topics[idx].status = status
        persist()
    }

    func delete(_ topic: Topic) {
        topics.removeAll { $0.id == topic.id }
        persist()
    }

    func add(_ seed: TopicSeed) {
        topics.insert(Topic.fromSeed(seed), at: 0)
        persist()
    }

    func resetToSeeds() {
        try? FileManager.default.removeItem(at: saveURL)
        topics = []
        loadSeeds()
    }

    private func load() {
        var saved: [Topic] = []
        if let data = try? Data(contentsOf: saveURL),
           let decoded = try? JSONDecoder().decode([Topic].self, from: data) {
            saved = decoded
        }
        let seeds = bundleSeeds()
        // Merge: keep user's saved topics, append any seeds not already present by title
        let existingTitles = Set(saved.map(\.title))
        let newFromSeeds = seeds
            .filter { !existingTitles.contains($0.title) }
            .map(Topic.fromSeed)
        topics = saved + newFromSeeds
        persist()
    }

    private func loadSeeds() {
        topics = bundleSeeds().map(Topic.fromSeed)
        persist()
    }

    private func bundleSeeds() -> [TopicSeed] {
        guard let url = Bundle.main.url(forResource: "topics", withExtension: "json"),
              let data = try? Data(contentsOf: url),
              let seeds = try? JSONDecoder().decode([TopicSeed].self, from: data)
        else { return [] }
        return seeds
    }

    private func persist() {
        try? JSONEncoder().encode(topics).write(to: saveURL)
    }
}
