import React, { useState } from 'react';
import { ApiService } from '../../services/api.js';
import { User } from '../../types/index.js';
import { X, Lock, User as UserIcon, Shield, ShieldCheck } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User, token: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('AdminPassword123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await ApiService.login({ username, password });
      if (res.success) {
        ApiService.setToken(res.token);
        onLoginSuccess(res.user, res.token);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setAdminDemo = () => {
    setUsername('admin');
    setPassword('AdminPassword123!');
    setError(null);
  };

  const setManagerDemo = () => {
    setUsername('manager');
    setPassword('ManagerPassword123!');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Warehouse Access Sign In</h2>
              <p className="text-xs text-slate-400">Authenticate with role-based credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Demo Switchers */}
        <div className="space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Quick 1-Click Role Testing
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={setAdminDemo}
              className={`p-2.5 rounded-lg border text-left transition ${
                username === 'admin'
                  ? 'border-indigo-500 bg-indigo-950/40 text-indigo-200'
                  : 'border-slate-800 bg-slate-950 hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Full authority (Models, Users, Paths)
              </div>
            </button>

            <button
              type="button"
              onClick={setManagerDemo}
              className={`p-2.5 rounded-lg border text-left transition ${
                username === 'manager'
                  ? 'border-indigo-500 bg-indigo-950/40 text-indigo-200'
                  : 'border-slate-800 bg-slate-950 hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <Shield className="w-3.5 h-3.5" />
                <span>Warehouse Mgr</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Stock movements & reorders review
              </div>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg border border-rose-800/80 bg-rose-950/40 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Username</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-950 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="Enter username"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-950 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Decision Support System'}
          </button>
        </form>
      </div>
    </div>
  );
};
