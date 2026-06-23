import Foundation

enum SailyCMSError: Error, LocalizedError {
    case notAuthenticated
    case server(status: Int, message: String)

    var errorDescription: String? {
        switch self {
        case .notAuthenticated:
            return "Not signed in to Saily."
        case .server(let status, let message):
            return "Saily server error (\(status)): \(message)"
        }
    }
}

/// Talks to the Saily backend's CMS extension (`/api/saily/cms/...`),
/// authenticated via the shared-auth bearer token used by `/api/saily/me`.
@MainActor
final class SailyCMSClient: ObservableObject {
    @Published var baseURL: URL
    @Published var bearerToken: String?

    init(baseURL: URL, bearerToken: String? = nil) {
        self.baseURL = baseURL
        self.bearerToken = bearerToken
    }

    private func request(path: String, method: String = "GET", body: Data? = nil) async throws -> Data {
        guard let token = bearerToken, !token.isEmpty else {
            throw SailyCMSError.notAuthenticated
        }

        var components = URLComponents(url: baseURL, resolvingAgainstBaseURL: false)
        components?.path = path
        guard let url = components?.url else {
            throw SailyCMSError.server(status: -1, message: "Invalid Saily backend URL")
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        if let body {
            request.httpBody = body
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        }

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse else {
            throw SailyCMSError.server(status: -1, message: "No response")
        }
        guard (200..<300).contains(http.statusCode) else {
            let message = String(data: data, encoding: .utf8) ?? ""
            throw SailyCMSError.server(status: http.statusCode, message: message)
        }
        return data
    }

    private func articlePath(slug: String) throws -> String {
        var allowed = CharacterSet.urlPathAllowed
        allowed.remove(charactersIn: "/?#")
        guard let encodedSlug = slug.addingPercentEncoding(withAllowedCharacters: allowed), !encodedSlug.isEmpty else {
            throw SailyCMSError.server(status: -1, message: "Invalid article slug")
        }
        return "/api/saily/cms/articles/\(encodedSlug)"
    }

    func listArticles() async throws -> [ArticleSummary] {
        let data = try await request(path: "/api/saily/cms/articles")
        return try JSONDecoder().decode([ArticleSummary].self, from: data)
    }

    func loadArticle(slug: String) async throws -> ArticleDocument {
        let data = try await request(path: try articlePath(slug: slug))
        return try JSONDecoder().decode(ArticleDocument.self, from: data)
    }

    func saveArticle(slug: String, frontmatter: [String: AnyCodable], body: String) async throws -> ArticleDocument {
        struct Payload: Encodable {
            let frontmatter: [String: AnyCodable]
            let body: String
        }
        let payload = Payload(frontmatter: frontmatter, body: body)
        let encoded = try JSONEncoder().encode(payload)
        let data = try await request(path: try articlePath(slug: slug), method: "PUT", body: encoded)
        return try JSONDecoder().decode(ArticleDocument.self, from: data)
    }

    func createDraft(slug: String, title: String) async throws -> ArticleDocument {
        try await saveArticle(
            slug: slug,
            frontmatter: [
                "title": AnyCodable(title),
                "status": AnyCodable("draft"),
                "summary": AnyCodable("")
            ],
            body: "# \(title)\n\n"
        )
    }
}
