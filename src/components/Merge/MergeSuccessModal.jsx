import { Check } from "lucide-react";

/**
 * Success modal shown after a successful team merge.
 * Displays a confirmation message and a button to navigate back to team list.
 */
export default function MergeSuccessModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-slate-100 overflow-hidden">
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
            <Check size={32} strokeWidth={3} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Teams Merged!</h3>
          <p className="text-sm text-slate-500 mb-6">
            The teams have been successfully combined. You can now see the merged team in the management list.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            Go to Teams
          </button>
        </div>
      </div>
    </div>
  );
}
