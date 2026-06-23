import SwiftUI

/// Minimal connection settings: Saily backend URL and bearer token.
/// The token is obtained via the shared-auth login flow elsewhere in the
/// Saily app; this view just stores it for the CMS client.
struct SettingsView: View {
    @ObservedObject var client: SailyCMSClient
    @AppStorage("saily.cms.baseURL") private var baseURLString: String = ""
    @AppStorage("saily.cms.bearerToken") private var bearerToken: String = ""

    var body: some View {
        Form {
            Section("Saily Backend") {
                TextField("Base URL", text: $baseURLString, prompt: Text("https://api.saily.example"))
                #if os(iOS)
                    .textInputAutocapitalization(.never)
                    .keyboardType(.URL)
                #endif
                SecureField("Access Token", text: $bearerToken)
            }
        }
        .formStyle(.grouped)
        .onChange(of: baseURLString) { _, newValue in apply(baseURLString: newValue) }
        .onChange(of: bearerToken) { _, newValue in client.bearerToken = newValue }
        .onAppear {
            apply(baseURLString: baseURLString)
            client.bearerToken = bearerToken
        }
    }

    private func apply(baseURLString: String) {
        if let url = URL(string: baseURLString), !baseURLString.isEmpty {
            client.baseURL = url
        }
    }
}
