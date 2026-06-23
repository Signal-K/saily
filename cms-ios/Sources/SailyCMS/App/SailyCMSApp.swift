import SwiftUI

@main
struct SailyCMSApp: App {
    @StateObject private var client = SailyCMSClient(
        baseURL: URL(string: "http://localhost:8092")!
    )

    var body: some Scene {
        WindowGroup {
            ContentView(client: client)
        }
        #if os(macOS)
        Settings {
            SettingsView(client: client)
        }
        #endif
    }
}
