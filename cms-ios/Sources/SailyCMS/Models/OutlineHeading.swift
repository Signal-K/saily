import Foundation

/// A Markdown heading extracted from the editor text, used to populate the
/// outline panel (mirrors Prosaic's `OutlinePanel`).
struct OutlineHeading: Identifiable, Hashable {
    let id = UUID()
    let level: Int
    let title: String
    let line: Int

    /// Parses `## Heading` style lines (levels 1-6) out of Markdown text.
    static func parse(from text: String) -> [OutlineHeading] {
        var headings: [OutlineHeading] = []
        let lines = text.components(separatedBy: "\n")
        for (index, line) in lines.enumerated() {
            var hashes = 0
            for char in line {
                if char == "#" { hashes += 1 } else { break }
            }
            guard hashes > 0, hashes <= 6 else { continue }
            guard line.count > hashes, line[line.index(line.startIndex, offsetBy: hashes)] == " " else { continue }

            let title = line.dropFirst(hashes).trimmingCharacters(in: .whitespaces)
            guard !title.isEmpty else { continue }

            headings.append(OutlineHeading(level: hashes, title: title, line: index))
        }
        return headings
    }
}
