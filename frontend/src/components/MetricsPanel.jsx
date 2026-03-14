export default function MetricsPanel({ metrics }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-3">
      <div className="mb-2 text-slate-300 text-xs uppercase">Live Metrics</div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-slate-900 p-2 rounded-lg border border-slate-700">
          <div className="text-slate-400">EAR</div>
          <div className="text-white font-semibold">{metrics.ear ?? '--'}</div>
        </div>
        <div className="bg-slate-900 p-2 rounded-lg border border-slate-700">
          <div className="text-slate-400">MAR</div>
          <div className="text-white font-semibold">{metrics.mar ?? '--'}</div>
        </div>
        <div className="bg-slate-900 p-2 rounded-lg border border-slate-700">
          <div className="text-slate-400">PERCLOS</div>
          <div className="text-white font-semibold">{metrics.perclos ?? '--'}</div>
        </div>
        <div className="bg-slate-900 p-2 rounded-lg border border-slate-700">
          <div className="text-slate-400">Confidence</div>
          <div className="text-white font-semibold">{metrics.confidence ?? '--'}</div>
        </div>
      </div>
    </div>
  );
}
