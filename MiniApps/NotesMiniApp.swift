import SwiftUI

// MARK: - Notes Mini App
struct NotesMiniApp: View {
    @StateObject private var viewModel = NotesViewModel()

    var body: some View {
        VStack(spacing: 0) {
            // Notes list or editor
            if viewModel.isEditing {
                NoteEditorView(
                    note: viewModel.editingNote,
                    onSave: { title, content in
                        viewModel.saveNote(title: title, content: content)
                    },
                    onCancel: {
                        viewModel.cancelEdit()
                    }
                )
            } else {
                NotesListView(
                    notes: viewModel.notes,
                    onCreateNew: {
                        viewModel.createNewNote()
                    },
                    onSelectNote: { note in
                        viewModel.editNote(note)
                    },
                    onDeleteNote: { note in
                        viewModel.deleteNote(note)
                    }
                )
            }
        }
        .background(VintageAppleColors.white)
    }
}

// MARK: - Notes List View
struct NotesListView: View {
    let notes: [Note]
    let onCreateNew: () -> Void
    let onSelectNote: (Note) -> Void
    let onDeleteNote: (Note) -> Void

    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Text("All Notes")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundStyle(VintageAppleColors.darkGray)

                Spacer()

                Text("\(notes.count)")
                    .font(.system(size: 14))
                    .foregroundStyle(.secondary)
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
            .background(VintageAppleColors.lightGray)

            Divider()

            // Notes list
            if notes.isEmpty {
                VStack(spacing: 16) {
                    Spacer()
                    Image(systemName: "note.text")
                        .font(.system(size: 60))
                        .foregroundStyle(VintageAppleColors.classicGray.opacity(0.5))

                    Text("No Notes Yet")
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundStyle(VintageAppleColors.darkGray)

                    Text("Tap the + button to create your first note")
                        .font(.system(size: 14))
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 40)

                    Spacer()
                }
            } else {
                ScrollView {
                    LazyVStack(spacing: 0) {
                        ForEach(notes) { note in
                            NoteRowView(note: note)
                                .onTapGesture {
                                    onSelectNote(note)
                                }
                                .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                                    Button(role: .destructive) {
                                        onDeleteNote(note)
                                    } label: {
                                        Label("Delete", systemImage: "trash")
                                    }
                                }
                            }
                    }
                }
            }

            Divider()

            // Create button
            HStack {
                Spacer()

                Button {
                    onCreateNew()
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: "plus")
                        Text("New Note")
                    }
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 12)
                    .background(VintageAppleColors.classicBlue)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                    .shadow(color: .black.opacity(0.2), radius: 2, y: 1)
                }
                .padding(.vertical, 12)

                Spacer()
            }
            .background(VintageAppleColors.lightGray)
        }
    }
}

// MARK: - Note Row View
struct NoteRowView: View {
    let note: Note

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(note.title.isEmpty ? "Untitled" : note.title)
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(VintageAppleColors.darkGray)
                .lineLimit(1)

            Text(note.content.isEmpty ? "No additional text" : note.content)
                .font(.system(size: 14))
                .foregroundStyle(.secondary)
                .lineLimit(2)

            Text(note.dateFormatted)
                .font(.system(size: 11))
                .foregroundStyle(.tertiary)
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 14)
        .background(VintageAppleColors.white)
        .overlay(
            Rectangle()
                .fill(VintageAppleColors.classicGray.opacity(0.3))
                .frame(height: 1),
            alignment: .bottom
        )
    }
}

// MARK: - Note Editor View
struct NoteEditorView: View {
    let note: Note?
    let onSave: (String, String) -> Void
    let onCancel: () -> Void

    @State private var title: String
    @State private var content: String

    init(note: Note?, onSave: @escaping (String, String) -> Void, onCancel: @escaping () -> Void) {
        self.note = note
        self.onSave = onSave
        self.onCancel = onCancel
        _title = State(initialValue: note?.title ?? "")
        _content = State(initialValue: note?.content ?? "")
    }

    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Button {
                    onCancel()
                } label: {
                    HStack(spacing: 4) {
                        Image(systemName: "chevron.left")
                        Text("Back")
                    }
                    .font(.system(size: 14))
                    .foregroundStyle(VintageAppleColors.classicBlue)
                }

                Spacer()

                Button {
                    onSave(title, content)
                } label: {
                    Text("Save")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(title.isEmpty || content.isEmpty ? VintageAppleColors.classicGray : VintageAppleColors.classicBlue)
                        .clipShape(RoundedRectangle(cornerRadius: 6))
                }
                .disabled(title.isEmpty || content.isEmpty)
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
            .background(VintageAppleColors.lightGray)

            Divider()

            // Editor
            ScrollView {
                VStack(alignment: .leading, spacing: 12) {
                    TextField("Title", text: $title)
                        .font(.system(size: 24, weight: .bold))
                        .foregroundStyle(VintageAppleColors.darkGray)
                        .textFieldStyle(.plain)
                        .padding(.horizontal, 20)
                        .padding(.top, 20)

                    Divider()
                        .padding(.horizontal, 20)

                    TextEditor(text: $content)
                        .font(.system(size: 16))
                        .foregroundStyle(VintageAppleColors.darkGray)
                        .scrollContentBackground(.hidden)
                        .background(.clear)
                        .frame(minHeight: 300)
                        .padding(.horizontal, 16)
                }
                .padding(.bottom, 20)
            }
        }
    }
}

#Preview {
    NotesMiniApp()
}
