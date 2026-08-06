import { Users, Upload, UserPlus } from "lucide-react";

export default function TeamHeader({ team, members, documentCount, onUpload, onAdd, canAddMembers = true }) {
  const resolvedDocumentCount = documentCount ?? team?.documentCount ?? 0;

  return (
    <div className="rounded-xl bg-card p-6 shadow-sm ring-1 ring-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
            <Users size={24} />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-text">
              {team?.name || "teamName"}
            </h2>
            <p className="text-sm text-muted">
              {members.length || team?.memberCount || 0} members · {resolvedDocumentCount} docs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {typeof onUpload === "function" && (
            <button
              onClick={onUpload}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2 text-sm font-medium text-text shadow-sm transition hover:bg-slate-50 dark:hover:bg-white/5"
            >
              <Upload size={16} />
              Upload
            </button>
          )}

          {canAddMembers && (
            <button
              onClick={onAdd}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
            >
              <UserPlus size={16} />
              + Add Users
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
