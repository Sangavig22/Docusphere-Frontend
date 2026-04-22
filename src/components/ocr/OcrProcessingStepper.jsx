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
                    "absolute left-1/2 top-6 h-0.5 w-full",
                    state === "done" ? "bg-emerald-500" : "bg-slate-200",
                  ].join(" ")}
                />
              ) : null}

              <span
                className={[
                  "relative z-10 inline-flex h-12 w-12 items-center justify-center rounded-full border-2",
                  state === "done" ? "border-emerald-500 bg-emerald-100 text-emerald-600" : "",
                  state === "active" ? "border-blue-500 bg-blue-50 text-blue-600" : "",
                  state === "pending" ? "border-slate-200 bg-slate-50 text-slate-400" : "",
                ].join(" ")}
              >
                {state === "done" ? (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : state === "active" ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                ) : (
                  <span className="text-sm font-bold">{index + 1}</span>
                )}
              </span>

              <p
                className={[
                  "mt-4 text-center text-sm font-semibold md:text-base",
                  state === "pending" ? "text-slate-400" : "text-slate-800",
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
