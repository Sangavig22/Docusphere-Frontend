import { Lock } from "lucide-react";
import { isDocumentProtected } from "../../../utils/documentProtection";

/**
 * Small lock on the file-type icon only. No blur, border, or "Protected" label.
 */
export default function DocumentProtectedBadge({ doc, className = "" }) {
  if (!isDocumentProtected(doc)) return null;

  return (
    <span
      className={[
        "absolute -bottom-0.5 -right-0.5 inline-flex h-[17px] w-[17px] items-center justify-center rounded-full",
        "bg-card text-muted shadow-sm ring-1 ring-border ring-offset-1 ring-offset-card dark:ring-offset-card",
        className,
      ].join(" ")}
      title="Password protected"
      aria-label="Password protected"
    >
      <Lock size={9} strokeWidth={2.25} className="opacity-90" />
    </span>
  );
}
