import { getPasswordStrength } from "../../../utils/documentProtection";
import PasswordRequirementsChecklist from "./PasswordRequirementsChecklist";

export default function PasswordStrengthHint({ password, showChecklist = true }) {
  const strength = getPasswordStrength(password);
  const hasPassword = Boolean(String(password || "").length);

  if (!hasPassword && !showChecklist) return null;

  return (
    <div className="space-y-2">
      {hasPassword ? (
        <p className={`text-xs font-medium ${strength.color || "text-slate-500"}`}>
          Password strength: {strength.label}
        </p>
      ) : null}
      {showChecklist ? <PasswordRequirementsChecklist password={password} showWhenEmpty /> : null}
    </div>
  );
}
