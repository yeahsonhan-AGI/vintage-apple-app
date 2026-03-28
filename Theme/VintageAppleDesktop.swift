import SwiftUI

struct VintageAppleDesktop: View {
    var body: some View {
        ZStack {
            // Classic Mac desktop pattern
            LinearGradient(
                colors: [
                    Color(red: 0.2, green: 0.5, blue: 0.9),
                    Color(red: 0.4, green: 0.6, blue: 0.95)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            // Striped pattern overlay
            Canvas { context, size in
                for y in stride(from: 0, to: size.height, by: 4) {
                    let path = Path { path in
                        path.move(to: CGPoint(x: 0, y: y))
                        path.addLine(to: CGPoint(x: size.width, y: y))
                    }
                    context.stroke(path, with: .color(.white.opacity(0.1)), lineWidth: 2)
                }
            }
            .ignoresSafeArea()

            // Apple logo watermark
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    Image(systemName: "applelogo")
                        .font(.system(size: 80))
                        .foregroundStyle(.white.opacity(0.15))
                        .padding(40)
                }
            }
        }
    }
}

#Preview {
    VintageAppleDesktop()
}
