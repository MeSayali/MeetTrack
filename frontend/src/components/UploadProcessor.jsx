const STEPS = [
  { id: 'upload',     label: 'Uploading audio file' },
  { id: 'transcribe', label: 'Transcribing speech to text' },
  { id: 'analyze',    label: 'Analyzing entities & tasks' },
];

function StepIcon({ status, index }) {
  if (status === 'done')
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-900/40 text-emerald-400 text-xs font-bold">
        ✓
      </div>
    );
  if (status === 'active')
    return (
      <div className="h-6 w-6 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
    );
  return (
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-slate-400 text-xs">
      {index + 1}
    </div>
  );
}

function StepTracker({ currentStep }) {
  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-900/60 p-5 shadow-sm divide-y divide-slate-700/60">
      {STEPS.map((step, i) => {
        const status = i < currentStep ? 'done' : i === currentStep ? 'active' : 'pending';
        return (
          <div key={step.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <StepIcon status={status} index={i} />
            <span className={`flex-1 text-sm ${
              status === 'pending' ? 'text-slate-500' :
              status === 'active'  ? 'text-slate-100' : 'text-slate-400'
            }`}>
              {step.label}
            </span>
            {status === 'active'  && <span className="text-xs text-violet-400 font-medium">In progress…</span>}
            {status === 'done'    && <span className="text-xs text-emerald-400 font-medium">Done</span>}
            {status === 'pending' && <span className="text-xs text-slate-600">Waiting</span>}
          </div>
        );
      })}
    </div>
  );
}

function SkeletonCard({ rows = 3, type = 'tasks' }) {
  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-900/60 p-5 shadow-sm">
      <div className="h-3 w-28 rounded bg-slate-700 animate-pulse mb-4" />
      {type === 'entities' ? (
        <div className="flex flex-wrap gap-2">
          {[72, 96, 60, 84, 64].map((w, i) => (
            <div key={i} className="h-6 rounded-full bg-slate-700 animate-pulse" style={{ width: w }} />
          ))}
        </div>
      ) : (
        Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 mb-3 last:mb-0">
            <div className="h-4 w-4 rounded bg-slate-700 animate-pulse flex-shrink-0" />
            <div className="h-3 rounded bg-slate-700 animate-pulse flex-1" style={{ width: `${[100, 70, 55][i]}%` }} />
            <div className="h-3 w-16 rounded bg-slate-700 animate-pulse" />
          </div>
        ))
      )}
    </div>
  );
}

export function UploadProcessor({ step }) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <p className="text-sm text-slate-400 font-medium">Processing your recording…</p>
      <StepTracker currentStep={step} />
    </div>
  );
}