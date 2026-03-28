import SwiftUI

struct ContentView: View {
    @State private var selectedTab: Int = 0
    @State private var activeMiniApp: MiniAppType? = nil

    var body: some View {
        ZStack {
            // Main vintage Apple desktop
            VintageAppleDesktop()
                .overlay(alignment: .bottom) {
                    VintageAppleTabBar(selectedTab: $selectedTab) { tab in
                        activeMiniApp = tab.miniAppType
                    }
                }

            // Mini App Overlay
            if let miniApp = activeMiniApp {
                MiniAppContainer(miniApp: miniApp) {
                    activeMiniApp = nil
                }
                .transition(.move(edge: .bottom))
            }
        }
        .preferredColorScheme(.light)
    }
}

#Preview {
    ContentView()
}
