export default function StatusIndicator({ drowsy }) {
  const primaryClass = drowsy ? 'bg-red-500 text-white' : 'bg-emerald-500 text-slate-900';
  const text = drowsy ? 'Drowsy Alert' : 'Driver Awake';
  return (
    <div className="p-3 rounded-xl border border-slate-600 flex items-center justify-between">
      <div>
        <p className="text-xs uppercase text-slate-400">Status</p>
        <p className="text-lg font-semibold">{text}</p>
      </div>
      <div className={`rounded-full px-3 py-2 text-sm font-bold ${primaryClass}`}>{drowsy ? '⚠️' : '✅'}</div>
    </div>
  );
}
