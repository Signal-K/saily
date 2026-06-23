import SwiftUI

/// Right-hand outline panel mirroring Prosaic's `OutlinePanel`: lists
/// Markdown headings and jumps the editor cursor to the selected line.
struct OutlinePanelView: View {
    @Environment(\.prosaicPalette) private var palette

    let headings: [OutlineHeading]
    let onSelect: (OutlineHeading) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("outline")
                .font(.system(.caption, design: .monospaced))
                .foregroundStyle(palette.textMuted)
                .padding(.horizontal, 12)
                .padding(.vertical, 8)

            Divider().overlay(palette.border)

            if headings.isEmpty {
                Text("No headings yet")
                    .font(.system(.caption, design: .monospaced))
                    .foregroundStyle(palette.textDim)
                    .padding(12)
            } else {
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 4) {
                        ForEach(headings) { heading in
                            Button {
                                onSelect(heading)
                            } label: {
                                Text(heading.title)
                                    .font(.system(.callout, design: .monospaced))
                                    .foregroundStyle(palette.text)
                                    .padding(.leading, CGFloat(heading.level - 1) * 12)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                            }
                            .buttonStyle(.plain)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 2)
                        }
                    }
                    .padding(.vertical, 8)
                }
            }
        }
        .frame(minWidth: 160, idealWidth: 200)
        .background(palette.surface)
    }
}
