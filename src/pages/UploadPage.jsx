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
    <div className="mx-auto flex min-w-0 w-full max-w-[1100px] flex-1 flex-col gap-6 sm:gap-7">
     

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
