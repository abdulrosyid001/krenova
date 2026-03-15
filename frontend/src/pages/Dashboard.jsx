import { useCallback, useState, useEffect, useRef } from 'react';
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

  // ==========================================
  // ALARM STATE
  // ==========================================
  const [triggerAlarm, setTriggerAlarm] = useState(false);
  const [drowsyFrameCounter, setDrowsyFrameCounter] = useState(0);
  const audioRef = useRef(null);

  // Inisialisasi Audio saat komponen mount.
  // File alarm.mp3 diletakkan di folder /public.
  // loop=true agar alarm terus berbunyi selama kondisi mengantuk berlanjut.
  useEffect(() => {
    audioRef.current = new Audio('/alarm.mp3');
    audioRef.current.loop = true;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Bunyikan atau hentikan alarm berdasarkan triggerAlarm
  useEffect(() => {
    if (!audioRef.current) return;

    if (triggerAlarm) {
      audioRef.current.play().catch((err) => {
        // Browser memblokir autoplay sebelum ada interaksi pengguna.
        // Hal ini tidak akan terjadi karena user sudah klik tombol Start terlebih dahulu.
        console.warn('Alarm audio blocked by browser:', err);
      });
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [triggerAlarm]);

  // Hentikan alarm saat deteksi dihentikan
  useEffect(() => {
    if (!running) {
      setTriggerAlarm(false);
      setDrowsyFrameCounter(0);
    }
  }, [running]);

  const handleFrame = useCallback(async (imageData) => {
    if (!running || busy) return;
    setBusy(true);
    try {
      const response = await predictFrame(imageData);
      setMetrics({
        ear:        response.ear.toFixed(3),
        mar:        response.mar.toFixed(3),
        perclos:    response.perclos.toFixed(3),
        confidence: response.confidence.toFixed(3),
      });
      setDrowsy(response.drowsy);

      // Baca trigger_alarm dan drowsy_frame_counter dari response backend
      setTriggerAlarm(response.trigger_alarm);
      setDrowsyFrameCounter(response.drowsy_frame_counter);
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

        {/* Banner alarm — muncul saat trigger_alarm true */}
        {triggerAlarm && (
          <div className="p-3 bg-red-500/20 border border-red-500 rounded-xl text-red-200 font-semibold flex items-center gap-2 animate-pulse">
            <span>🔔</span>
            <span>ALARM — Pengemudi terdeteksi mengantuk selama {drowsyFrameCounter} frame berturut-turut!</span>
          </div>
        )}

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
            <li>Alarm sounds after 3 consecutive drowsy frames are detected.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}