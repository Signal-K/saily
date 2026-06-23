import Foundation

/// Word/character counting, mirroring Prosaic's `core.metrics` helpers.
enum TextMetrics {
    static func wordCount(_ text: String) -> Int {
        text.split { $0.isWhitespace || $0.isNewline }.count
    }

    static func characterCount(_ text: String) -> Int {
        text.count
    }
}
