import { useMemo, useState } from "react";
import { ArrowDownUp, LayoutGrid, List, Search, SlidersHorizontal } from "lucide-react";
import Popover from "./Popover";
import { DOCUMENT_TYPE_FILTER_OPTIONS } from "../../constants/documents";

function IconButton({ active = false, label, onClick, children }) {
  return (
    <button
      type="button"
      className={[
        "inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-colors",
        active
          ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/40 dark:bg-blue-500/15 dark:text-blue-300"
          : "border-border bg-card text-muted hover:bg-surface",
      ].join(" ")}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function MenuButton({ label, icon: Icon, open, onToggle, children }) {
  return (
    <div className="relative">
      <button
        type="button"
        className={[
          "inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-colors",
          open
            ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/40 dark:bg-blue-500/15 dark:text-blue-300"
            : "border-border bg-card text-muted hover:bg-surface",
        ].join(" ")}
        aria-label={label}
        onClick={onToggle}
      >
        <Icon size={18} />
      </button>
      <Popover open={open} onClose={() => onToggle?.(false)} className="right-0 top-11">
        {children}
      </Popover>
    </div>
  );
}

function MenuItem({ active, label, onClick }) {
  return (
    <button
      type="button"
      className={[
        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
        active ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" : "text-text hover:bg-surface",
      ].join(" ")}
      onClick={onClick}
      role="menuitem"
    >
      <span className="truncate">{label}</span>
      {active ? <span className="text-xs font-semibold">✓</span> : null}
    </button>
  );
}

export default function DocumentsToolbar({
  query,
  onQueryChange,
  filterType,
  onFilterTypeChange,
  sortKey,
  onSortKeyChange,
  viewMode,
  onViewModeChange,
  hideSort = false,
  hideFilter = false,
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const filterOptions = useMemo(() => DOCUMENT_TYPE_FILTER_OPTIONS, []);

  const sortOptions = useMemo(
    () => [
      { key: "name_asc", label: "Name (A–Z)" },
      { key: "name_desc", label: "Name (Z–A)" },
      { key: "updated_desc", label: "Date Modified" },
      { key: "size_desc", label: "Size" },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => onQueryChange?.(e.target.value)}
          placeholder="Search..."
          className="h-11 w-full rounded-2xl border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-500 dark:focus:ring-blue-500/25"
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        {!hideFilter ? (
          <MenuButton
            label="Filter"
            icon={SlidersHorizontal}
            open={filterOpen}
            onToggle={(v) => setFilterOpen(typeof v === "boolean" ? v : !filterOpen)}
          >
            <div className="max-h-72 overflow-y-auto py-1">
              {filterOptions.map((o) => (
                <MenuItem
                  key={o.key}
                  label={o.label}
                  active={filterType === o.key}
                  onClick={() => {
                    onFilterTypeChange?.(o.key);
                    setFilterOpen(false);
                  }}
                />
              ))}
            </div>
          </MenuButton>
        ) : null}

        {!hideSort ? (
          <MenuButton
            label="Sort"
            icon={ArrowDownUp}
            open={sortOpen}
            onToggle={(v) => setSortOpen(typeof v === "boolean" ? v : !sortOpen)}
          >
            <div className="py-1">
              {sortOptions.map((o) => (
                <MenuItem
                  key={o.key}
                  label={o.label}
                  active={sortKey === o.key}
                  onClick={() => {
                    onSortKeyChange?.(o.key);
                    setSortOpen(false);
                  }}
                />
              ))}
            </div>
          </MenuButton>
        ) : null}

        <div className="ml-1 flex items-center gap-2">
          <IconButton
            label="Grid view"
            active={viewMode === "grid"}
            onClick={() => onViewModeChange?.("grid")}
          >
            <LayoutGrid size={18} />
          </IconButton>
          <IconButton
            label="List view"
            active={viewMode === "list"}
            onClick={() => onViewModeChange?.("list")}
          >
            <List size={18} />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

