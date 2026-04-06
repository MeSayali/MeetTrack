import { CalendarPlus, FileText, Mail, SquareCheckBig } from "lucide-react";

const buttons = [
  { label: "Send Email", icon: Mail },
  { label: "Create Meeting", icon: CalendarPlus },
  { label: "Generate Doc", icon: FileText },
  { label: "Create Task", icon: SquareCheckBig },
];

export default function ActionItemCard({ item }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-slate-900">{item.task}</h4>
          <p className="text-sm text-slate-500">Owner: {item.owner}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{item.status}</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {buttons.map((button) => {
          const Icon = button.icon;
          return (
            <button key={button.label} className="flex items-center justify-center gap-1 rounded-lg bg-violet-50 px-2 py-2 text-xs text-violet-700">
              <Icon className="h-3.5 w-3.5" /> {button.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
