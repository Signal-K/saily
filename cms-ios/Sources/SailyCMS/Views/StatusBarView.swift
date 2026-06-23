import SwiftUI

/// Bottom status bar mirroring Prosaic's `StatusBar`: filename, modified
/// indicator, word/character counts, and save state.
struct StatusBarView: View {
    @Environment(\.prosaicPalette) private var palette

    let filename: String
    let isModified: Bool
    let wordCount: Int
    let characterCount: Int
    let isSaving: Bool

    var body: some View {
        HStack(spacing: 16) {
            HStack(spacing: 4) {
                Text(filename)
                    .font(.system(.caption, design: .monospaced))
                if isModified {
                    Circle()
                        .fill(palette.warning)
                        .frame(width: 6, height: 6)
                }
            }

            Spacer()

            Text("\(wordCount) words")
                .font(.system(.caption, design: .monospaced))
            Text("\(characterCount) chars")
                .font(.system(.caption, design: .monospaced))

            if isSaving {
                Text("saving…")
                    .font(.system(.caption, design: .monospaced))
                    .foregroundStyle(palette.textMuted)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .foregroundStyle(palette.textMuted)
        .background(palette.surface)
        .overlay(Rectangle().frame(height: 1).foregroundStyle(palette.border), alignment: .top)
    }
}
