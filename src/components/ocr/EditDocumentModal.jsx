import { useRef } from "react";

export default function EditDocumentModal({ open, document, onCancel, onSave }) {
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const tagsRef = useRef(null);

  if (!open) return null;

  function handleSave() {
    const title = titleRef.current?.value ?? "";
    const description = descriptionRef.current?.value ?? "";
    const tagsValue = tagsRef.current?.value ?? "";

    onSave({
      title,
      description,
      tags: tagsValue
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
  }


  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 px-4 py-6">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">Edit Document</h3>

        <div className="mt-5 grid gap-4">
          <label className="grid gap-1">
            <span className="text-sm font-medium text-slate-700">Document Title</span>
            <input
              ref={titleRef}
              defaultValue={document?.title ?? ""}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium text-slate-700">Description</span>
            <input
              ref={descriptionRef}
              defaultValue={document?.description ?? ""}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium text-slate-700">Tags</span>
            <input
              ref={tagsRef}
              defaultValue={Array.isArray(document?.tags) ? document.tags.join(", ") : ""}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
