import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-slate-800 border border-slate-700 p-6">
        <h1 className="text-2xl font-bold text-white">Login</h1>
        <p className="text-slate-300 mt-1 text-sm">Secure your drive monitoring.</p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input type="email" placeholder="Email" className="w-full rounded-xl border border-slate-600 p-2 bg-slate-900 text-white" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" className="w-full rounded-xl border border-slate-600 p-2 bg-slate-900 text-white" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="w-full py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold">Login</button>
        </form>
        <div className="mt-4 text-center text-slate-400 text-xs">Continue with</div>
        <div className="mt-2 flex justify-center gap-2">
          <button className="px-3 py-1 rounded-lg bg-slate-700">Google</button>
          <button className="px-3 py-1 rounded-lg bg-slate-700">Apple</button>
        </div>
      </div>
    </div>
  );
}
