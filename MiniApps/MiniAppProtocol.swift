import SwiftUI

// MARK: - Mini App Type Enum
enum MiniAppType: Identifiable {
    case notes
    case calculator
    case calendar
    case settings

    var id: String {
        switch self {
        case .notes: return "notes"
        case .calculator: return "calculator"
        case .calendar: return "calendar"
        case .settings: return "settings"
        }
    }

    var title: String {
        switch self {
        case .notes: return "Notes"
        case .calculator: return "Calculator"
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

    @ViewBuilder
    func makeView() -> some View {
        switch self {
        case .notes:
            NotesMiniApp()
        case .calculator:
            PlaceholderMiniApp(title: "Calculator", icon: "calculator", color: .blueberry)
        case .calendar:
            PlaceholderMiniApp(title: "Calendar", icon: "calendar", color: .strawberry)
        case .settings:
            PlaceholderMiniApp(title: "Settings", icon: "gearshape", color: .darkGray)
        }
    }
}

// MARK: - Mini App Protocol
protocol MiniApp: View {
    var title: String { get }
    var icon: String { get }
}

// MARK: - Mini App Container
struct MiniAppContainer: View {
    let miniApp: MiniAppType
    let onClose: () -> Void

    var body: some View {
        ZStack {
            // Background blur
            Color.black.opacity(0.4)
                .ignoresSafeArea()
                .onTapGesture {
                    onClose()
                }

            // Mini App Window
            VStack(spacing: 0) {
                // Title Bar
                MiniAppTitleBar(
                    title: miniApp.title,
                    icon: miniApp.icon,
                    onClose: onClose
                )

                // Content
                miniApp.makeView()
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(VintageAppleColors.lightGray)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .shadow(color: .black.opacity(0.5), radius: 20, x: 0, y: 10)
            .padding(20)
        }
        .ignoresSafeArea()
    }
}

// MARK: - Mini App Title Bar
struct MiniAppTitleBar: View {
    let title: String
    let icon: String
    let onClose: () -> Void

    var body: some View {
        HStack(spacing: 8) {
            // Window controls - left
            HStack(spacing: 6) {
                Circle()
                    .fill(VintageAppleColors.strawberry)
                    .frame(width: 12, height: 12)
                    .overlay(
                        Image(systemName: "xmark")
                            .font(.system(size: 7, weight: .bold))
                            .foregroundStyle(.white)
                    )
                    .onTapGesture {
                        onClose()
                    }

                Circle()
                    .fill(VintageAppleColors.yellow)
                    .frame(width: 12, height: 12)

                Circle()
                    .fill(.green)
                    .frame(width: 12, height: 12)
            }

            Spacer()

            // Title - center
            HStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.system(size: 12))
                Text(title)
                    .font(.system(size: 13, weight: .semibold))
            }
            .foregroundStyle(VintageAppleColors.darkGray)

            Spacer()

            // Spacer for balance
            HStack(spacing: 6) {
                Circle()
                    .fill(.clear)
                    .frame(width: 12, height: 12)
                Circle()
                    .fill(.clear)
                    .frame(width: 12, height: 12)
                Circle()
                    .fill(.clear)
                    .frame(width: 12, height: 12)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(
            LinearGradient(
                colors: [
                    VintageAppleColors.platinum,
                    VintageAppleColors.lightGray
                ],
                startPoint: .top,
                endPoint: .bottom
            )
        )
        .overlay(
            Rectangle()
                .fill(.black.opacity(0.1))
                .frame(height: 1),
            alignment: .bottom
        )
    }
}

#Preview {
    MiniAppContainer(miniApp: .notes) {}
}
