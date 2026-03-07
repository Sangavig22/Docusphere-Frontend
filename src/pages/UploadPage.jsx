import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DocumentUploadSection from "../components/upload/DocumentUploadSection";
import { useDocumentsStore } from "../hooks/useDocumentsStore";

async function tryUploadToBackend(files) {
  const form = new FormData();
  for (const f of files) form.append("files", f);

  const res = await fetch("/api/documents/upload", { method: "POST", body: form });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);

  const data = await res.json();
  const docs = Array.isArray(data) ? data : Array.isArray(data?.documents) ? data.documents : null;
  if (!docs) throw new Error("Unexpected upload response");
  return docs;
}

export default function UploadPage() {
  const navigate = useNavigate();
  const { addDocuments } = useDocumentsStore();
  const [busy, setBusy] = useState(false);

  async function handleFilesSelected(e) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setBusy(true);

    try {
     
      const backendDocs = await tryUploadToBackend(files);
      addDocuments(backendDocs);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setBusy(false);
      e.target.value = "";
      navigate("/documents");
    }
  }

  return (
    <div className="mx-auto flex min-w-0 w-full max-w-3xl flex-1 flex-col gap-5 sm:gap-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm w-full min-w-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">Quick upload</h2>
            <p className="mt-1 text-sm text-slate-600">Select one or more files to add to My Documents.</p>
          </div>
          <label className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 cursor-pointer shrink-0">
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFilesSelected}
              disabled={busy}
            />
            {busy ? "Uploading..." : "Choose files"}
          </label>
        </div>
      </div>

      <DocumentUploadSection
        variant="default"
        title="Upload Files"
        subtitle="Supported formats: PDF, DOC, XLS, PPT, PNG, JPG"
        onUploadComplete={(file) => {
          addDocuments(file);
          navigate("/documents");
        }}
      />
    </div>
  );
}
