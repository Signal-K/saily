import SwiftUI

/// Root navigation: article list -> editor, similar to Prosaic's
/// dashboard -> editor screen flow.
struct ContentView: View {
    @ObservedObject var client: SailyCMSClient
    @State private var selection: ArticleSummary?
    @State private var showSettings = false
    @AppStorage("saily.cms.baseURL") private var baseURLString: String = ""
    @AppStorage("saily.cms.bearerToken") private var bearerToken: String = ""

    var body: some View {
        NavigationSplitView {
            ArticleListView(client: client, selection: $selection)
        } detail: {
            if let selection {
                EditorView(article: selection, client: client)
            } else {
                ContentUnavailableView(
                    "Select an article",
                    systemImage: "doc.text",
                    description: Text("Choose an article from the list to start writing.")
                )
            }
        }
        .prosaicThemed()
        .toolbar {
            ToolbarItem {
                Button {
                    showSettings = true
                } label: {
                    Label("Settings", systemImage: "gearshape")
                }
            }
        }
        .sheet(isPresented: $showSettings) {
            SettingsView(client: client)
                .frame(minWidth: 360, minHeight: 220)
        }
        .onAppear(perform: applyStoredConnection)
        .onChange(of: baseURLString) { _, _ in applyStoredConnection() }
        .onChange(of: bearerToken) { _, _ in applyStoredConnection() }
    }

    private func applyStoredConnection() {
        if let url = URL(string: baseURLString), !baseURLString.isEmpty {
            client.baseURL = url
        }
        client.bearerToken = bearerToken
    }
}
