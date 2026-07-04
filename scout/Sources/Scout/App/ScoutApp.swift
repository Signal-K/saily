import SwiftUI

@main
struct ScoutApp: App {
    @StateObject private var store = TopicStore()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(store)
                .preferredColorScheme(.dark)
        }
    }
}
