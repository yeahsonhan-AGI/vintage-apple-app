import SwiftUI

struct VintageAppleColors {
    // Classic Mac OS colors
    static let classicBlue = Color(red: 0.2, green: 0.4, blue: 0.8)
    static let classicGray = Color(red: 0.85, green: 0.85, blue: 0.87)
    static let darkGray = Color(red: 0.3, green: 0.3, blue: 0.32)
    static let lightGray = Color(red: 0.9, green: 0.9, blue: 0.92)
    static let white = Color.white
    static let platinum = Color(red: 0.93, green: 0.93, blue: 0.94)
    static let graphite = Color(red: 0.25, green: 0.25, blue: 0.27)

    // Accent colors
    static let strawberry = Color(red: 1.0, green: 0.4, blue: 0.4)
    static let blueberry = Color(red: 0.3, green: 0.5, blue: 1.0)
    static let lime = Color(red: 0.5, green: 0.9, blue: 0.3)
    static let tangerine = Color(red: 1.0, green: 0.6, blue: 0.2)
}

extension Color {
    static let vintageBlue = VintageAppleColors.classicBlue
    static let vintageGray = VintageAppleColors.classicGray
    static let platinum = VintageAppleColors.platinum
}
