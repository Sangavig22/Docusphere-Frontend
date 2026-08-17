import { Lock } from "lucide-react";
import { isDocumentProtected } from "../../../utils/documentProtection";

/**
 * Compact lock badge on the file-type icon.
 * Soft amber pill stays readable in light mode and muted in dark mode.
 */
export default function DocumentProtectedBadge({ doc, className = "" }) {
  if (!isDocumentProtected(doc)) return null;

  return (
    <span
      className={[
        "absolute -bottom-1 -right-1 inline-flex h-4 w-4 items-center justify-center rounded-full",
        "border border-amber-200/90 bg-amber-50 text-amber-700 shadow-sm",
        "dark:border-amber-400/30 dark:bg-amber-500/15 dark:text-amber-300",
        className,
      ].join(" ")}
      title="Password protected"
      aria-label="Password protected"
    >
      <Lock size={9} strokeWidth={2.4} />
    </span>
  );
}
