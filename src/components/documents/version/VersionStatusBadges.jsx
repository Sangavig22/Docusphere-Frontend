const BADGE_STYLES = {
  latest: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  current: "bg-blue-50 text-blue-700 ring-blue-100",
  restored: "bg-amber-50 text-amber-700 ring-amber-100",
  protected: "bg-violet-50 text-violet-700 ring-violet-100",
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
