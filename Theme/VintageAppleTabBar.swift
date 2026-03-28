import SwiftUI

struct VintageAppleTabBar: View {
    @Binding var selectedTab: Int
    let onTabSelected: (TabItem) -> Void

    var body: some View {
        HStack(spacing: 0) {
            ForEach(TabItem.allCases, id: \.self) { tab in
                Button {
                    selectedTab = tab.rawValue
                    onTabSelected(tab)
                } label: {
                    VStack(spacing: 4) {
                        ZStack {
                            // Classic button background
                            RoundedRectangle(cornerRadius: 8)
                                .fill(VintageAppleColors.platinum)
                                .shadow(color: .black.opacity(0.3), radius: 2, x: 0, y: 1)

                            RoundedRectangle(cornerRadius: 8)
                                .stroke(VintageAppleColors.darkGray, lineWidth: 1)

                            // Icon
                            Image(systemName: tab.icon)
                                .font(.system(size: 24, weight: .medium))
                                .foregroundStyle(tab.color)
                        }
                        .frame(width: 56, height: 56)

                        Text(tab.name)
                            .font(.system(size: 10, weight: .medium))
                            .foregroundStyle(.white)
                            .shadow(color: .black.opacity(0.5), radius: 1)
                    }
                }
                .frame(maxWidth: .infinity)
            }
        }
        .padding(.horizontal, 16)
        .padding(.bottom, 8)
        .background(
            // Classic dock background
            RoundedRectangle(cornerRadius: 14)
                .fill(.ultraThinMaterial)
                .shadow(color: .black.opacity(0.4), radius: 8, y: 2)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(.white.opacity(0.3), lineWidth: 1)
        )
        .padding(.horizontal, 12)
        .padding(.bottom, 8)
    }
}

enum TabItem: Int, CaseIterable {
    case notes = 0
    case calculator = 1
    case calendar = 2
    case settings = 3

    var name: String {
        switch self {
        case .notes: return "Notes"
        case .calculator: return "Calc"
        case .calendar: return "Calendar"
        case .settings: return "Settings"
        }
    }

    var icon: String {
        switch self {
        case .notes: return "note.text"
        case .calculator: return "calculator"
        case .calendar: return "calendar"
        case .settings: return "gearshape"
        }
    }

    var color: Color {
        switch self {
        case .notes: return VintageAppleColors.yellow
        case .calculator: return VintageAppleColors.blueberry
        case .calendar: return VintageAppleColors.strawberry
        case .settings: return VintageAppleColors.darkGray
        }
    }

    var miniAppType: MiniAppType {
        switch self {
        case .notes: return .notes
        case .calculator: return .calculator
        case .calendar: return .calendar
        case .settings: return .settings
        }
    }
}

extension VintageAppleColors {
    static let yellow = Color(red: 1.0, green: 0.85, blue: 0.3)
}
