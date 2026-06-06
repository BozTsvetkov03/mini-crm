import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import AddNoteForm from "./AddNoteForm";
import LoadingSpinner from "./LoadingSpinner";
import EditNoteModal from "./EditNoteModal";

function Notes({
  selectedCustomer,
  notes,
  loading,
  error,
  onNoteCreated,
  onNoteDeleted,
  onNoteUpdated,
}) {
  const [editingNote, setEditingNote] = useState(null);

  return (
    <>
      <AddNoteForm
        selectedCustomer={selectedCustomer}
        onNoteCreated={onNoteCreated}
      />

      {!selectedCustomer && (
        <div className="py-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">Select a customer to view notes.</p>
        </div>
      )}

      {selectedCustomer && loading && <LoadingSpinner />}

      {selectedCustomer && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 dark:bg-red-950/40 dark:border-red-900">
          <p className="text-red-700 font-medium dark:text-red-400">{error}</p>
        </div>
      )}

      {selectedCustomer && !loading && !error && !notes?.length && (
        <div className="py-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">No notes found for current customer.</p>
        </div>
      )}

      {selectedCustomer && !!notes?.length && (
        <ul className="space-y-3 mt-6">
          {notes.map((note) => (
            <li
              key={note.id}
              className="border border-gray-200 rounded-xl p-4 dark:border-gray-800"
            >
              <p className="text-gray-900 whitespace-pre-wrap wrap-break-word dark:text-gray-100">{note.content}</p>

              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date(note.updatedAt).toLocaleString()}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingNote(note)}
                    className="rounded-xl p-2 text-blue-600 transition hover:bg-blue-50 hover:cursor-pointer"
                    aria-label="Edit note"
                    title="Edit"
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    onClick={() => {
                      const confirmed = window.confirm("Delete this note?");
                      if (confirmed) onNoteDeleted(note.id);
                    }}
                    className="rounded-xl p-2 text-red-600 transition hover:bg-red-50 hover:cursor-pointer"
                    aria-label="Delete note"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <EditNoteModal
        note={editingNote}
        open={!!editingNote}
        onClose={() => setEditingNote(null)}
        onSave={onNoteUpdated}
      />
    </>
  );
}

export default Notes;
