import Foundation

/// Lightweight metadata for an article, as returned by
/// `GET /api/saily/cms/articles`.
struct ArticleSummary: Identifiable, Codable, Hashable {
    var slug: String
    var title: String
    var status: String
    var summary: String
    var tags: [String]
    var publishedAt: String
    var updatedAt: String

    var id: String { slug }

    var displayTitle: String {
        title.isEmpty ? slug : title
    }
}

/// Full article document, as returned by
/// `GET /api/saily/cms/articles/{slug}` and sent to the `PUT` endpoint.
struct ArticleDocument: Codable {
    var slug: String
    var body: String
    var frontmatter: [String: AnyCodable]

    var title: String {
        frontmatter["title"]?.stringValue ?? slug
    }
}

/// A type-erased JSON value, used for frontmatter fields whose shape
/// (string, array, etc.) varies by article.
struct AnyCodable: Codable, Hashable {
    let value: Any

    init(_ value: Any) {
        self.value = value
    }

    var stringValue: String? {
        value as? String
    }

    var stringArrayValue: [String]? {
        (value as? [Any])?.compactMap { $0 as? String }
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let v = try? container.decode(String.self) {
            value = v
        } else if let v = try? container.decode(Bool.self) {
            value = v
        } else if let v = try? container.decode(Double.self) {
            value = v
        } else if let v = try? container.decode([String].self) {
            value = v
        } else if let v = try? container.decode([String: AnyCodable].self) {
            value = v
        } else {
            value = NSNull()
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch value {
        case let v as String:
            try container.encode(v)
        case let v as Bool:
            try container.encode(v)
        case let v as Double:
            try container.encode(v)
        case let v as [String]:
            try container.encode(v)
        case let v as [String: AnyCodable]:
            try container.encode(v)
        default:
            try container.encodeNil()
        }
    }

    static func == (lhs: AnyCodable, rhs: AnyCodable) -> Bool {
        String(describing: lhs.value) == String(describing: rhs.value)
    }

    func hash(into hasher: inout Hasher) {
        hasher.combine(String(describing: value))
    }
}
