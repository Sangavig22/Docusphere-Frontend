import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput({
  id = "document-password",
  label = "Enter password",
  value,
  onChange,
  error = "",
  disabled = false,
  autoFocus = false,
  onSubmit,
}) {
  const [visible, setVisible] = useState(false);

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      onSubmit?.();
    }
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-text">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          autoFocus={autoFocus}
          autoComplete="current-password"
          placeholder="Password"
          className={[
            "w-full rounded-xl border bg-card px-3 py-2.5 pr-10 text-sm text-text outline-none transition-colors",
            "placeholder:text-muted focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/25",
            error ? "border-rose-400 dark:border-rose-500/50" : "border-border",
            disabled ? "cursor-not-allowed opacity-60" : "",
          ].join(" ")}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={visible ? "Hide password" : "Show password"}
          disabled={disabled}
          onClick={() => setVisible((prev) => !prev)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted hover:bg-surface disabled:opacity-50"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error ? <p className="mt-1.5 text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}
    </div>
  );
}
