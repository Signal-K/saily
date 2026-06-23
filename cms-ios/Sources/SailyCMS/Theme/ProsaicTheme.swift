import SwiftUI

/// Color palette ported from Prosaic's `themes/light.tcss` and
/// `themes/dark.tcss`, so the Saily CMS editor feels like the Prosaic TUI.
enum ProsaicTheme {
    struct Palette {
        let primary: Color
        let secondary: Color
        let background: Color
        let surface: Color
        let text: Color
        let textMuted: Color
        let textDim: Color
        let border: Color
        let accent: Color
        let error: Color
        let success: Color
        let warning: Color
    }

    static let light = Palette(
        primary: Color(hex: 0x703327),
        secondary: Color(hex: 0x715E12),
        background: Color(hex: 0xFFFFFC),
        surface: Color(hex: 0xFFFFFC),
        text: Color(hex: 0x5A3D35),
        textMuted: Color(hex: 0x8A6D60),
        textDim: Color(hex: 0xA89080),
        border: Color(hex: 0xC8C8C4),
        accent: Color(hex: 0xFFFFED),
        error: Color(hex: 0xC24038),
        success: Color(hex: 0x5A7A32),
        warning: Color(hex: 0xB8860B)
    )

    // Dark palette mirrors light.tcss structure; tuned to dark.tcss values.
    static let dark = Palette(
        primary: Color(hex: 0xE0A899),
        secondary: Color(hex: 0xD8C27A),
        background: Color(hex: 0x1E1A18),
        surface: Color(hex: 0x262220),
        text: Color(hex: 0xF0E4DD),
        textMuted: Color(hex: 0xBFA89C),
        textDim: Color(hex: 0x8A746A),
        border: Color(hex: 0x3A332F),
        accent: Color(hex: 0x33291C),
        error: Color(hex: 0xE07A6E),
        success: Color(hex: 0x9CBE6E),
        warning: Color(hex: 0xE0B84D)
    )

    static func palette(for colorScheme: ColorScheme) -> Palette {
        colorScheme == .dark ? dark : light
    }
}

extension Color {
    init(hex: UInt32) {
        let r = Double((hex >> 16) & 0xFF) / 255.0
        let g = Double((hex >> 8) & 0xFF) / 255.0
        let b = Double(hex & 0xFF) / 255.0
        self.init(red: r, green: g, blue: b)
    }
}

private struct ProsaicPaletteKey: EnvironmentKey {
    static let defaultValue: ProsaicTheme.Palette = ProsaicTheme.light
}

extension EnvironmentValues {
    var prosaicPalette: ProsaicTheme.Palette {
        get { self[ProsaicPaletteKey.self] }
        set { self[ProsaicPaletteKey.self] = newValue }
    }
}

struct ProsaicThemeModifier: ViewModifier {
    @Environment(\.colorScheme) private var colorScheme

    func body(content: Content) -> some View {
        content.environment(\.prosaicPalette, ProsaicTheme.palette(for: colorScheme))
    }
}

extension View {
    func prosaicThemed() -> some View {
        modifier(ProsaicThemeModifier())
    }
}
