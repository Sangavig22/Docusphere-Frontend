import { Users, Upload, UserPlus } from "lucide-react";

export default function TeamHeader({ team, members, onUpload, onAdd, canAddMembers = true }) {
  return (
    <div className="bg-white rounded-xl ring-1 ring-slate-100 shadow-sm p-6">
      
      {/* MAIN ROW */}
      <div className="flex items-center justify-between">
        
        {/* LEFT SIDE */}
        <div className="flex items-center gap-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Users size={24} />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {team?.name || "teamName"}
            </h2>
            <p className="text-sm text-slate-500">
              {members.length || team?.memberCount || 0} members · {team?.documentCount || 0} docs
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">
          {typeof onUpload === "function" && (
            <button
              onClick={onUpload}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition"
            >
              <Upload size={16} />
              Upload
            </button>
          )}

          {canAddMembers && (
            <button onClick={onAdd} className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition">
              <UserPlus size={16} />
              + Add Users
            </button>
          )}
        </div>

      </div>
    </div>
  );
}