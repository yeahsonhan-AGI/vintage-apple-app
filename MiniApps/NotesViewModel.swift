import Foundation
import SwiftUI

// MARK: - Notes View Model
class NotesViewModel: ObservableObject {
    @Published var notes: [Note] = []
    @Published var isEditing = false
    @Published var editingNote: Note?

    private let storage = NotesStorage()

    init() {
        loadNotes()
    }

    // MARK: - Load Notes
    private func loadNotes() {
        notes = storage.loadNotes()
    }

    // MARK: - Create New Note
    func createNewNote() {
        editingNote = nil
        isEditing = true
    }

    // MARK: - Edit Note
    func editNote(_ note: Note) {
        editingNote = note
        isEditing = true
    }

    // MARK: - Save Note
    func saveNote(title: String, content: String) {
        var updatedNotes = notes

        if let existingNote = editingNote {
            // Update existing note
            if let index = updatedNotes.firstIndex(where: { $0.id == existingNote.id }) {
                updatedNotes[index].title = title
                updatedNotes[index].content = content
                updatedNotes[index].updatedAt = Date()
            }
        } else {
            // Create new note
            var newNote = Note()
            newNote.title = title
            newNote.content = content
            updatedNotes.insert(newNote, at: 0)
        }

        notes = updatedNotes.sorted { $0.updatedAt > $1.updatedAt }
        storage.saveNotes(notes)
        isEditing = false
        editingNote = nil
    }

    // MARK: - Cancel Edit
    func cancelEdit() {
        isEditing = false
        editingNote = nil
    }

    // MARK: - Delete Note
    func deleteNote(_ note: Note) {
        notes.removeAll { $0.id == note.id }
        storage.saveNotes(notes)
    }
}
