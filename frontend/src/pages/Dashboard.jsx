import { useCallback, useState, useEffect, useRef } from 'react';
import CameraView from '../components/CameraView';
import StatusIndicator from '../components/StatusIndicator';
import MetricsPanel from '../components/MetricsPanel';
import ControlPanel from '../components/ControlPanel';
import { predictFrame } from '../services/api';

// ==========================================
// ALARM SOUND — Web Audio API
// Tidak memerlukan file audio eksternal.
// Generate bunyi beep berulang langsung dari browser.
// ==========================================
function createAlarmSound(audioCtx) {
  const oscillator = audioCtx.createOscillator();
  const gainNode   = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.type      = 'square';
  oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
  gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);

  // Efek beep berulang: volume naik-turun setiap 0.5 detik
  const now = audioCtx.currentTime;
  for (let i = 0; i < 60; i++) {
    gainNode.gain.setValueAtTime(0.3, now + i * 0.5);
    gainNode.gain.setValueAtTime(0.0, now + i * 0.5 + 0.25);
  }

  oscillator.start(now);
  oscillator.stop(now + 60);

  return oscillator;
}

export default function Dashboard() {
  const [running, setRunning]                   = useState(false);
  const [metrics, setMetrics]                   = useState({ ear: '--', mar: '--', perclos: '--', confidence: '--' });
  const [drowsy, setDrowsy]                     = useState(false);
  const [error, setError]                       = useState('');
  const [busy, setBusy]                         = useState(false);

  // ==========================================
  // ALARM STATE
  // ==========================================
  const [triggerAlarm, setTriggerAlarm]         = useState(false);
  const [drowsyFrameCounter, setDrowsyFrameCounter] = useState(0);
  const audioCtxRef   = useRef(null);
  const oscillatorRef = useRef(null);

  // Buat AudioContext saat pertama kali user klik Start.
  // AudioContext harus dibuat setelah ada interaksi pengguna
  // agar tidak diblokir browser (autoplay policy).
  const initAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  };

  // Bunyikan atau hentikan alarm berdasarkan triggerAlarm
  useEffect(() => {
    if (triggerAlarm) {
      // Hentikan oscillator sebelumnya jika masih berjalan
      if (oscillatorRef.current) {
        try { oscillatorRef.current.stop(); } catch (_) {}
        oscillatorRef.current = null;
      }
      if (audioCtxRef.current) {
        oscillatorRef.current = createAlarmSound(audioCtxRef.current);
      }
    } else {
      if (oscillatorRef.current) {
        try { oscillatorRef.current.stop(); } catch (_) {}
        oscillatorRef.current = null;
      }
    }
  }, [triggerAlarm]);

  // Hentikan alarm dan reset counter saat deteksi dihentikan
  useEffect(() => {
    if (!running) {
      setTriggerAlarm(false);
      setDrowsyFrameCounter(0);
    }
  }, [running]);

  // Cleanup AudioContext saat komponen unmount
  useEffect(() => {
    return () => {
      if (oscillatorRef.current) {
        try { oscillatorRef.current.stop(); } catch (_) {}
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

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

  const handleStart = () => {
    initAudioContext();   // inisialisasi AudioContext setelah klik — aman dari autoplay policy
    setRunning(true);
  };

  const handleStop = () => {
    setRunning(false);
  };

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
            <ControlPanel running={running} onStart={handleStart} onStop={handleStop} />
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