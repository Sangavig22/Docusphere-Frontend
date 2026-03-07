import { useEffect, useState } from "react";

export default function EditDocumentModal({ open, document, onCancel, onSave }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    tags: "",
    extractedText: "",
    summary: "",
  });

  useEffect(() => {
    if (!open || !document) return;
    setForm({
      title: document.title || "",
      description: document.description || "",
      tags: Array.isArray(document.tags) ? document.tags.join(", ") : "",
      extractedText: document.extractedText || "",
      summary: document.summary || "",
    });
  }, [open, document]);

  if (!open) return null;

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    onSave({
      title: form.title,
      description: form.description,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      extractedText: form.extractedText,
      summary: form.summary,
    });
  }

  function refreshExtractedText() {
    updateField("extractedText", document?.extractedText || form.extractedText);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 px-4 py-6">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">Edit Document</h3>

        <div className="mt-5 grid gap-4">
          <label className="grid gap-1">
            <span className="text-sm font-medium text-slate-700">Document Title</span>
            <input
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium text-slate-700">Description</span>
            <input
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium text-slate-700">Tags / Category</span>
            <input
              value={form.tags}
              onChange={(e) => updateField("tags", e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <div className="grid gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Extracted OCR Text</span>
              <button
                type="button"
                onClick={refreshExtractedText}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Refresh
              </button>
            </div>
            <textarea
              value={form.extractedText}
              onChange={(e) => updateField("extractedText", e.target.value)}
              rows={8}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <label className="grid gap-1">
            <span className="text-sm font-medium text-slate-700">AI Summary</span>
            <textarea
              value={form.summary}
              onChange={(e) => updateField("summary", e.target.value)}
              rows={4}
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
