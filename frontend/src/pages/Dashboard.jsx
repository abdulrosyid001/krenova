import { useCallback, useState } from 'react';
import CameraView from '../components/CameraView';
import StatusIndicator from '../components/StatusIndicator';
import MetricsPanel from '../components/MetricsPanel';
import ControlPanel from '../components/ControlPanel';
import { predictFrame } from '../services/api';

export default function Dashboard() {
  const [running, setRunning] = useState(false);
  const [metrics, setMetrics] = useState({ ear: '--', mar: '--', perclos: '--', confidence: '--' });
  const [drowsy, setDrowsy] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleFrame = useCallback(async (imageData) => {
    if (!running || busy) return;
    setBusy(true);
    try {
      const response = await predictFrame(imageData);
      setMetrics({ ear: response.ear.toFixed(3), mar: response.mar.toFixed(3), perclos: response.perclos.toFixed(3), confidence: response.confidence.toFixed(3) });
      setDrowsy(response.drowsy);
    } catch (err) {
      setError('Failed to infer frame. Please ensure backend is running.');
    }
    setBusy(false);
  }, [running, busy]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 md:p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <header className="flex items-center justify-between p-3 bg-slate-900 rounded-2xl border border-slate-700">
          <div>
            <div className="text-xs uppercase text-slate-400">Driver Drowsiness Monitoring</div>
            <div className="text-xl font-bold">Real-time Dashboard</div>
          </div>
          <div className="text-right text-slate-300 text-xs">Backend: <span className="text-emerald-400">Online</span></div>
        </header>

        {error && <div className="p-2 bg-rose-500/20 border border-rose-500 rounded-lg text-rose-200">{error}</div>}

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <CameraView onFrame={handleFrame} running={running} setError={setError} />
          </div>
          <div className="space-y-3">
            <StatusIndicator drowsy={drowsy} />
            <MetricsPanel metrics={metrics} />
            <ControlPanel running={running} onStart={() => setRunning(true)} onStop={() => setRunning(false)} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-3 text-slate-300">
          <div className="text-xs uppercase text-slate-400">Notes</div>
          <ul className="list-disc pl-5 text-sm">
            <li>Webcam captures every 200ms and sends to backend for inference.</li>
            <li>Frame skipping is active while backend request is in progress.</li>
            <li>If no face is detected, drowsiness detection results are paused.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
