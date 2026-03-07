function getStepState(index, activeIndex) {
  if (index < activeIndex) return "done";
  if (index === activeIndex) return "active";
  return "pending";
}

export default function OcrProcessingStepper({ steps, activeIndex }) {
  return (
    <div className="mx-auto mt-6 w-full max-w-3xl">
      <div className="flex items-start">
        {steps.map((step, index) => {
          const state = getStepState(index, activeIndex);

          return (
            <div key={step} className="relative flex flex-1 flex-col items-center px-1">
              {index < steps.length - 1 ? (
                <div
                  className={[
                    "absolute left-1/2 top-5 h-0.5 w-full",
                    state === "done" ? "bg-emerald-500" : "bg-slate-200",
                  ].join(" ")}
                />
              ) : null}

              <span
                className={[
                  "relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-full",
                  state === "done" ? "bg-emerald-100 text-emerald-700" : "",
                  state === "active" ? "bg-blue-100 text-blue-700" : "",
                  state === "pending" ? "bg-slate-100 text-slate-500" : "",
                ].join(" ")}
              >
                {state === "done" ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : state === "active" ? (
                  <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
              </span>

              <p
                className={[
                  "mt-3 text-center text-xs font-medium",
                  state === "pending" ? "text-slate-500" : "text-slate-900",
                ].join(" ")}
              >
                {step}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
