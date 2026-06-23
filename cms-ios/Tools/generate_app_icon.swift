import AppKit
import Foundation
import ImageIO
import UniformTypeIdentifiers

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let iconSet = root.appendingPathComponent("Sources/SailyCMS/App/Assets.xcassets/AppIcon.appiconset")
try FileManager.default.createDirectory(at: iconSet, withIntermediateDirectories: true)

struct IconImage: Encodable {
    let idiom: String
    let size: String
    let scale: String
    let filename: String
}

func drawIcon(size: Int, destination: URL) throws {
    let rep = NSBitmapImageRep(
        bitmapDataPlanes: nil,
        pixelsWide: size,
        pixelsHigh: size,
        bitsPerSample: 8,
        samplesPerPixel: 4,
        hasAlpha: true,
        isPlanar: false,
        colorSpaceName: .deviceRGB,
        bytesPerRow: 0,
        bitsPerPixel: 0
    )!

    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
    NSGraphicsContext.current?.cgContext.setShouldAntialias(true)

    let scale = CGFloat(size) / 1024.0
    func x(_ value: CGFloat) -> CGFloat { value * scale }
    func y(_ value: CGFloat) -> CGFloat { (1024.0 - value) * scale }
    func point(_ px: CGFloat, _ py: CGFloat) -> NSPoint { NSPoint(x: x(px), y: y(py)) }

    NSColor(calibratedRed: 0.961, green: 0.953, blue: 0.918, alpha: 1).setFill()
    NSRect(x: 0, y: 0, width: size, height: size).fill()

    func stroke(_ path: NSBezierPath, width: CGFloat = 44, color: NSColor = .black) {
        path.lineCapStyle = .round
        path.lineJoinStyle = .round
        path.lineWidth = max(1, width * scale)
        color.setStroke()
        path.stroke()
    }

    func fill(_ path: NSBezierPath, color: NSColor) {
        color.setFill()
        path.fill()
    }

    let black = NSColor(calibratedWhite: 0.02, alpha: 1)
    let orange = NSColor(calibratedRed: 0.941, green: 0.29, blue: 0.122, alpha: 1)

    let back = NSBezierPath()
    back.move(to: point(319, 618))
    back.curve(to: point(267, 493), controlPoint1: point(286, 585), controlPoint2: point(267, 539))
    back.curve(to: point(455, 305), controlPoint1: point(267, 389), controlPoint2: point(351, 305))
    back.curve(to: point(628, 417), controlPoint1: point(532, 305), controlPoint2: point(599, 351))
    stroke(back, color: black)

    let body = NSBezierPath()
    body.move(to: point(608, 414))
    body.curve(to: point(747, 544), controlPoint1: point(675, 423), controlPoint2: point(732, 475))
    body.curve(to: point(661, 655), controlPoint1: point(760, 603), controlPoint2: point(721, 655))
    body.line(to: point(406, 655))
    body.curve(to: point(319, 618), controlPoint1: point(371, 655), controlPoint2: point(340, 642))
    stroke(body, color: black)

    let spines = NSBezierPath()
    spines.move(to: point(364, 337))
    spines.line(to: point(395, 389))
    spines.line(to: point(433, 325))
    spines.line(to: point(471, 389))
    spines.line(to: point(509, 325))
    spines.line(to: point(546, 389))
    spines.line(to: point(579, 343))
    stroke(spines, width: 38, color: black)

    let ear = NSBezierPath()
    ear.move(to: point(635, 482))
    ear.curve(to: point(686, 480), controlPoint1: point(649, 469), controlPoint2: point(670, 467))
    stroke(ear, width: 34, color: black)

    let eye = NSBezierPath(ovalIn: NSRect(x: x(574), y: y(515), width: x(32), height: x(32)))
    fill(eye, color: black)

    let nose = NSBezierPath()
    nose.move(to: point(690, 548))
    nose.curve(to: point(747, 520), controlPoint1: point(712, 548), controlPoint2: point(733, 537))
    stroke(nose, width: 38, color: black)

    for (fromX, fromY, toX, toY) in [(383, 531, 541, 531), (384, 591, 512, 591)] as [(CGFloat, CGFloat, CGFloat, CGFloat)] {
        let line = NSBezierPath()
        line.move(to: point(fromX, fromY))
        line.line(to: point(toX, toY))
        stroke(line, width: 34, color: black)
    }

    let pencil = NSBezierPath()
    pencil.move(to: point(295, 545))
    pencil.curve(to: point(229, 622), controlPoint1: point(261, 561), controlPoint2: point(238, 587))
    stroke(pencil, width: 34, color: black)

    func sparkle(cx: CGFloat, cy: CGFloat, r: CGFloat, outlined: Bool) {
        let path = NSBezierPath()
        path.move(to: point(cx, cy - r))
        path.line(to: point(cx + r * 0.45, cy - r * 0.45))
        path.line(to: point(cx + r, cy))
        path.line(to: point(cx + r * 0.45, cy + r * 0.45))
        path.line(to: point(cx, cy + r))
        path.line(to: point(cx - r * 0.45, cy + r * 0.45))
        path.line(to: point(cx - r, cy))
        path.line(to: point(cx - r * 0.45, cy - r * 0.45))
        path.close()
        if outlined {
            stroke(path, width: 28, color: orange)
        } else {
            fill(path, color: orange)
        }
    }

    sparkle(cx: 770, cy: 351, r: 48, outlined: true)
    sparkle(cx: 637, cy: 277, r: 36, outlined: false)
    sparkle(cx: 781, cy: 708, r: 48, outlined: false)

    NSGraphicsContext.restoreGraphicsState()

    guard let cgImage = rep.cgImage else {
        throw NSError(domain: "IconGenerator", code: 1, userInfo: [NSLocalizedDescriptionKey: "Could not create icon image"])
    }

    guard let destination = CGImageDestinationCreateWithURL(destination as CFURL, UTType.png.identifier as CFString, 1, nil) else {
        throw NSError(domain: "IconGenerator", code: 2, userInfo: [NSLocalizedDescriptionKey: "Could not create PNG destination"])
    }
    CGImageDestinationAddImage(destination, cgImage, nil)
    guard CGImageDestinationFinalize(destination) else {
        throw NSError(domain: "IconGenerator", code: 3, userInfo: [NSLocalizedDescriptionKey: "Could not write PNG"])
    }
}

let specs: [(idiom: String, points: String, scale: String, pixels: Int)] = [
    ("iphone", "20x20", "2x", 40), ("iphone", "20x20", "3x", 60),
    ("iphone", "29x29", "2x", 58), ("iphone", "29x29", "3x", 87),
    ("iphone", "40x40", "2x", 80), ("iphone", "40x40", "3x", 120),
    ("iphone", "60x60", "2x", 120), ("iphone", "60x60", "3x", 180),
    ("ipad", "20x20", "1x", 20), ("ipad", "20x20", "2x", 40),
    ("ipad", "29x29", "1x", 29), ("ipad", "29x29", "2x", 58),
    ("ipad", "40x40", "1x", 40), ("ipad", "40x40", "2x", 80),
    ("ipad", "76x76", "1x", 76), ("ipad", "76x76", "2x", 152),
    ("ipad", "83.5x83.5", "2x", 167),
    ("ios-marketing", "1024x1024", "1x", 1024),
    ("mac", "16x16", "1x", 16), ("mac", "16x16", "2x", 32),
    ("mac", "32x32", "1x", 32), ("mac", "32x32", "2x", 64),
    ("mac", "128x128", "1x", 128), ("mac", "128x128", "2x", 256),
    ("mac", "256x256", "1x", 256), ("mac", "256x256", "2x", 512),
    ("mac", "512x512", "1x", 512), ("mac", "512x512", "2x", 1024),
]

var images: [IconImage] = []
for spec in specs {
    let fileName = "icon-\(spec.idiom)-\(spec.points.replacingOccurrences(of: ".", with: "_"))@\(spec.scale).png"
    try drawIcon(size: spec.pixels, destination: iconSet.appendingPathComponent(fileName))
    images.append(IconImage(idiom: spec.idiom, size: spec.points, scale: spec.scale, filename: fileName))
}

try drawIcon(size: 1024, destination: root.appendingPathComponent("Sources/SailyCMS/App/AppIconSource.png"))

struct Contents: Encodable {
    let images: [IconImage]
    let info: [String: String]
}

let contents = Contents(images: images, info: ["author": "xcode", "version": "1"])
let encoder = JSONEncoder()
encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
try encoder.encode(contents).write(to: iconSet.appendingPathComponent("Contents.json"))
