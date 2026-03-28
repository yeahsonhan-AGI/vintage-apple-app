import Foundation

// MARK: - Note Model
struct Note: Identifiable, Codable {
    let id: UUID
    var title: String
    var content: String
    var createdAt: Date
    var updatedAt: Date

    init(id: UUID = UUID(), title: String = "", content: String = "") {
        self.id = id
        self.title = title
        self.content = content
        self.createdAt = Date()
        self.updatedAt = Date()
    }

    var dateFormatted: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: updatedAt)
    }
}

// MARK: - Notes Storage
class NotesStorage {
    private let userDefaults = UserDefaults.standard
    private let notesKey = "vintage_apple_notes"

    func loadNotes() -> [Note] {
        guard let data = userDefaults.data(forKey: notesKey),
              let notes = try? JSONDecoder().decode([Note].self, from: data) else {
            return []
        }
        return notes.sorted { $0.updatedAt > $1.updatedAt }
    }

    func saveNotes(_ notes: [Note]) {
        if let data = try? JSONEncoder().encode(notes) {
            userDefaults.set(data, forKey: notesKey)
        }
    }
}
