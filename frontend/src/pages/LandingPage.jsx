import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xl p-6 rounded-3xl bg-slate-900/95 border border-slate-700 shadow-xl">
        <div className="text-center">
          <div className="text-indigo-400 font-bold text-xs uppercase tracking-[0.24em]">AutoCare Labs</div>
          <h1 className="text-3xl md:text-4xl font-bold mt-4">Driver Drowsiness Detection</h1>
          <p className="mt-3 text-slate-300">Real-time monitoring using webcam and dual-input ML inference.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/login" className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-semibold">Get Started</Link>
            <Link to="/dashboard" className="px-5 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg">Dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
