export default function ControlPanel({ running, onStart, onStop }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-3 flex gap-2">
      <button onClick={onStart} className="px-4 py-2 bg-indigo-500 rounded-lg hover:bg-indigo-600 text-white font-semibold" disabled={running}>
        Start
      </button>
      <button onClick={onStop} className="px-4 py-2 bg-rose-500 rounded-lg hover:bg-rose-600 text-white font-semibold" disabled={!running}>
        Stop
      </button>
    </div>
  );
}
