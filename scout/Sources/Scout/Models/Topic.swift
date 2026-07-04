import Foundation

struct TopicSource: Codable, Equatable {
    var label: String
    var url: String
}

struct Topic: Codable, Identifiable, Equatable {
    var id: UUID
    var title: String
    var category: Category
    var hook: String
    var reelAngle: String
    var articleAngle: String
    var citizenScienceLink: String?
    var sources: [TopicSource]
    var tags: [String]
    var status: Status
    var addedDate: Date

    enum Category: String, Codable, CaseIterable {
        case citizenScience = "Citizen Science"
        case spaceTech = "Space Tech"
        case deepSky = "Deep Sky"
        case astrobiology = "Astrobiology"
        case spacecraft = "Spacecraft Design"
        case solarSystem = "Solar System"
        case cosmology = "Cosmology"

        var emoji: String {
            switch self {
            case .citizenScience: return "🔭"
            case .spaceTech: return "🛰"
            case .deepSky: return "✨"
            case .astrobiology: return "🧬"
            case .spacecraft: return "🚀"
            case .solarSystem: return "🪐"
            case .cosmology: return "🌌"
            }
        }
    }

    enum Status: String, Codable, CaseIterable {
        case new
        case saved
        case writing
        case published
        case skipped
    }
}

extension Topic {
    static func fromSeed(_ seed: TopicSeed) -> Topic {
        Topic(
            id: UUID(),
            title: seed.title,
            category: seed.category,
            hook: seed.hook,
            reelAngle: seed.reelAngle,
            articleAngle: seed.articleAngle,
            citizenScienceLink: seed.citizenScienceLink,
            sources: seed.sources,
            tags: seed.tags,
            status: .new,
            addedDate: Date()
        )
    }
}

struct TopicSeed: Codable {
    var title: String
    var category: Topic.Category
    var hook: String
    var reelAngle: String
    var articleAngle: String
    var citizenScienceLink: String?
    var sources: [TopicSource]
    var tags: [String]
}
