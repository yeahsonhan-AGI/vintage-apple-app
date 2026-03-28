import SwiftUI

// MARK: - Placeholder Mini App
// Use this as a template for creating new mini apps
struct PlaceholderMiniApp: View {
    let title: String
    let icon: String
    let color: Color

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                Spacer()
                    .frame(height: 40)

                // Icon
                ZStack {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(color.opacity(0.2))
                        .frame(width: 100, height: 100)

                    Image(systemName: icon)
                        .font(.system(size: 50))
                        .foregroundStyle(color)
                }

                Text(title)
                    .font(.system(size: 24, weight: .bold))
                    .foregroundStyle(VintageAppleColors.darkGray)

                Text("Coming Soon")
                    .font(.system(size: 16))
                    .foregroundStyle(.secondary)

                Text("Add your functionality here")
                    .font(.system(size: 14))
                    .foregroundStyle(.tertiary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 40)

                Spacer()
            }
        }
        .background(VintageAppleColors.white)
    }
}

#Preview {
    PlaceholderMiniApp(
        title: "Calculator",
        icon: "calculator",
        color: .blueberry
    )
}
