import React from 'react';
import { 
  LayoutDashboard, 
  Database, 
  GitCompare, 
  TrendingUp, 
  HelpCircle, 
  Package, 
  ArrowLeftRight, 
  AlertCircle, 
  Truck, 
  FileText, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { UserRole } from '../../types/index.js';

export type TabType = 
  | 'dashboard' 
  | 'dataset' 
  | 'models' 
  | 'forecast' 
  | 'shap' 
  | 'inventory' 
  | 'movements' 
  | 'recommendations' 
  | 'suppliers' 
  | 'audit';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  userRole?: UserRole;
  alertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  userRole,
  alertCount
}) => {
  const navItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Executive Dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'warehouse_manager']
    },
    {
      id: 'dataset' as TabType,
      label: 'Walmart M5 Dataset',
      icon: Database,
      roles: ['admin', 'warehouse_manager'],
      badge: 'Mandatory'
    },
    {
      id: 'models' as TabType,
      label: '6-Model Comparison',
      icon: GitCompare,
      roles: ['admin', 'warehouse_manager'],
      badge: '6 Algs'
    },
    {
      id: 'forecast' as TabType,
      label: 'Demand Forecast Explorer',
      icon: TrendingUp,
      roles: ['admin', 'warehouse_manager']
    },
    {
      id: 'shap' as TabType,
      label: 'SHAP Explainability',
      icon: HelpCircle,
      roles: ['admin', 'warehouse_manager'],
      badge: 'XAI'
    },
    {
      id: 'inventory' as TabType,
      label: 'Product Master & Stock',
      icon: Package,
      roles: ['admin', 'warehouse_manager']
    },
    {
      id: 'movements' as TabType,
      label: 'Inventory Ledger',
      icon: ArrowLeftRight,
      roles: ['admin', 'warehouse_manager']
    },
    {
      id: 'recommendations' as TabType,
      label: 'Alerts & Reorders',
      icon: AlertCircle,
      roles: ['admin', 'warehouse_manager'],
      count: alertCount
    },
    {
      id: 'suppliers' as TabType,
      label: 'Supplier Directory',
      icon: Truck,
      roles: ['admin', 'warehouse_manager']
    },
    {
      id: 'audit' as TabType,
      label: 'Audit Logs & Reports',
      icon: FileText,
      roles: ['admin', 'warehouse_manager']
    }
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-950/60 p-3 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-57px)]">
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 px-3 mb-2 font-semibold">
            Core Modules
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isRestricted = userRole && !item.roles.includes(userRole);

              return (
                <button
                  key={item.id}
                  onClick={() => !isRestricted && onSelectTab(item.id)}
                  disabled={isRestricted}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : isRestricted
                      ? 'text-slate-600 cursor-not-allowed'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {item.count}
                    </span>
                  )}
                  {item.badge && !item.count && (
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Academic Project Context Card */}
        <div className="p-3 rounded-lg border border-slate-800/80 bg-slate-900/50 text-[11px] space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Academic Alignment</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Sustainable e-commerce inventory optimization aligned with UN SDG 9 (Industry & Innovation) & SDG 12 (Responsible Consumption).
          </p>
          <div className="pt-1 text-[10px] font-mono text-slate-400">
            Advisory decision-support only
          </div>
        </div>
      </div>

      <div className="text-[10px] font-mono text-slate-400 text-center py-2 border-t border-slate-900">
        B.Tech CSE Project • 2026
      </div>
    </aside>
  );
};
