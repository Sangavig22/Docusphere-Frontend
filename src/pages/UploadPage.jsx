import { useNavigate } from "react-router-dom";
import DocumentUploadSection from "../components/upload/DocumentUploadSection";

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

  return (
    <div className="mx-auto flex min-w-0 w-full max-w-[1100px] flex-1 flex-col gap-6 sm:gap-7">
      <DocumentUploadSection
        variant="default"
        title="Upload Files"
        subtitle="Supported formats: PDF, DOC, XLS, PPT, PNG, JPG"
        onUploadComplete={async (file) => {
          try {
            await tryUploadToBackend([file]);
          } catch (err) {
            console.error("Upload failed:", err);
          } finally {
            navigate("/documents");
          }
        }}
      />
    </div>
  );
}
