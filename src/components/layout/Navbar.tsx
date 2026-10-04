import React from 'react';
import { User } from '../../types/index.js';
import { 
  Boxes, 
  Cpu, 
  Database, 
  ShieldCheck, 
  User as UserIcon, 
  LogOut, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  datasetValid: boolean;
  productionModelName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenLogin,
  onLogout,
  datasetValid,
  productionModelName
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-100 text-sm tracking-tight sm:text-base">
                SmartWarehouse <span className="text-indigo-400">XAI</span>
              </span>
              <span className="text-[10px] tracking-wider font-mono text-slate-400 uppercase bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                M5 Decision Support
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Explainable Demand Forecasting & Sustainable Inventory Optimization
            </p>
          </div>
        </div>

        {/* Right Info Badges & User Profile */}
        <div className="flex items-center gap-3">
          {/* Dataset Status */}
          <div 
            className={`hidden md:flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded border ${
              datasetValid 
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' 
                : 'bg-amber-950/40 border-amber-800/80 text-amber-300'
            }`}
            title={datasetValid ? 'Authentic Walmart M5 dataset verified' : 'M5 CSV files missing in /data'}
          >
            <Database className="w-3.5 h-3.5" />
            <span>M5 Data: {datasetValid ? 'Verified' : 'Missing in /data'}</span>
          </div>

          {/* Active Model */}
          <div 
            className="hidden lg:flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded border bg-indigo-950/40 border-indigo-800/80 text-indigo-300"
            title="Designated Production Forecasting Engine"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Prod: {productionModelName}</span>
          </div>

          {/* User Auth Info */}
          {user ? (
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-medium text-slate-200">{user.name}</div>
                <div className="text-[11px] text-slate-400 font-mono capitalize">
                  {user.role === 'admin' ? (
                    <span className="text-indigo-400 font-semibold flex items-center justify-end gap-1">
                      <ShieldCheck className="w-3 h-3" /> Admin
                    </span>
                  ) : (
                    'Warehouse Mgr'
                  )}
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg transition shadow-sm"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
