import { ArrowRight } from "lucide-react";

/**
 * A banner showing a preview of the merge operation:
 * which teams are being merged and the combined stats.
 */
export default function MergePreviewBanner({ source, target, combinedMembersCount }) {
  if (!source || !target) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-4">
      <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
        <ArrowRight size={20} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-blue-900">
          Merging <span className="font-bold">{source.name ?? source.teamName}</span> + <span className="font-bold">{target.name ?? target.teamName}</span>
        </p>
        <p className="text-xs text-blue-600">
          {combinedMembersCount} unique members · {(source.documentCount ?? 0) + (target.documentCount ?? 0)} total documents
        </p>
      </div>
    </div>
  );
}
