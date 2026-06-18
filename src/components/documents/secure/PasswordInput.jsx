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
  autoComplete = "current-password",
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
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
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
          autoComplete={autoComplete}
          placeholder="Password"
          className={[
            "w-full rounded-xl border bg-white px-3 py-2.5 pr-10 text-sm text-slate-900 outline-none transition-colors",
            "placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
            error ? "border-rose-300" : "border-slate-300",
            disabled ? "cursor-not-allowed opacity-60" : "",
          ].join(" ")}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={visible ? "Hide password" : "Show password"}
          disabled={disabled}
          onClick={() => setVisible((prev) => !prev)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error ? <p className="mt-1.5 text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
