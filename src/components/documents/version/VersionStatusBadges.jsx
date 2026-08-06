const BADGE_STYLES = {
  latest: "bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400 dark:ring-emerald-500/25",
  current: "bg-blue-50 text-blue-700 ring-blue-100 dark:bg-blue-500/15 dark:text-blue-400 dark:ring-blue-500/25",
  restored: "bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-500/15 dark:text-amber-400 dark:ring-amber-500/25",
  protected: "bg-violet-50 text-violet-700 ring-violet-100 dark:bg-violet-500/15 dark:text-violet-400 dark:ring-violet-500/25",
};

function Badge({ label, tone }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1",
        BADGE_STYLES[tone],
      ].join(" ")}
    >
      {label}
    </span>
  );
}

export default function VersionStatusBadges({ version, compact = false }) {
  if (!version) return null;

  const badges = [];
  if (version.isLatest) badges.push({ key: "latest", label: "Latest", tone: "latest" });
  if (version.isCurrent) badges.push({ key: "current", label: compact ? "Current" : "Current Active Version", tone: "current" });
  if (version.isRestored) badges.push({ key: "restored", label: "Restored", tone: "restored" });
  if (version.isProtected) badges.push({ key: "protected", label: "Protected", tone: "protected" });

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {badges.map((badge) => (
        <Badge key={badge.key} label={badge.label} tone={badge.tone} />
      ))}
    </div>
  );
}
