import React from 'react';
import { 
  Product, 
  StockoutAlert, 
  ReorderRecommendation, 
  ModelExperiment,
  InventoryMovement,
  DatasetValidationReport
} from '../../types/index.js';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  Cpu, 
  Database, 
  ArrowUpRight, 
  Clock,
  Sparkles,
  ArrowRight,
  GitCompare
} from 'lucide-react';
import { TabType } from '../layout/Sidebar.js';

interface DashboardViewProps {
  products: Product[];
  alerts: StockoutAlert[];
  recommendations: ReorderRecommendation[];
  models: ModelExperiment[];
  movements: InventoryMovement[];
  datasetReport: DatasetValidationReport | null;
  onNavigate: (tab: TabType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  alerts,
  recommendations,
  models,
  movements,
  datasetReport,
  onNavigate
}) => {
  const prodModel = models.find(m => m.isProduction) || models[0];
  const criticalAlerts = alerts.filter(a => a.riskLevel === 'CRITICAL');
  const highAlerts = alerts.filter(a => a.riskLevel === 'HIGH');
  const totalStockUnits = products.reduce((acc, p) => acc + p.onHandStock, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner if M5 dataset is missing */}
      {datasetReport && !datasetReport.isValid && (
        <div className="rounded-xl border border-amber-800/80 bg-amber-950/30 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-amber-200 text-sm">
                  Action Required: Walmart M5 Dataset Verification
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-900/60 text-amber-300 border border-amber-700">
                  Integrity Guard
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Authentic Walmart M5 CSV files are missing in <code className="font-mono text-amber-300 bg-black/40 px-1 py-0.5 rounded">{datasetReport.datasetDir}</code>. 
                Under strict project rules, model training and live forecasting are blocked until developer supplies files.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('dataset')}
            className="shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-sm"
          >
            <span>Review Diagnostic Checklist</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Products */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Cataloged SKUs</span>
            <Package className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100 font-mono">{products.length}</span>
            <span className="text-xs text-slate-400">active products</span>
          </div>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
            <span>Total Units On-Hand</span>
            <span className="font-mono text-slate-200 font-semibold">{totalStockUnits.toLocaleString()}</span>
          </div>
        </div>

        {/* Card 2: Stockout Risks */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Stockout Risk Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-400 font-mono">{alerts.length}</span>
            <span className="text-xs text-slate-400">
              ({criticalAlerts.length} critical, {highAlerts.length} high)
            </span>
          </div>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
            <span>Action Required</span>
            <button 
              onClick={() => onNavigate('recommendations')} 
              className="text-rose-400 hover:text-rose-300 font-medium flex items-center gap-0.5"
            >
              Review Reorders <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 3: Production Model */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Production Forecasting Engine</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-emerald-300 truncate font-mono">
              {prodModel ? prodModel.modelName.split(' ')[0] : 'None'}
            </span>
            <span className="text-[11px] text-emerald-400 font-mono">
              {prodModel?.wape ? `${prodModel.wape}% WAPE` : ''}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
            <span>Empirical R² Score</span>
            <span className="font-mono text-slate-200">{prodModel?.r2 || 'N/A'}</span>
          </div>
        </div>

        {/* Card 4: Advisory Reorder Value */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Pending Reorders</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-300 font-mono">
              ${recommendations.reduce((sum, r) => sum + r.estimatedCost, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
            <span>Advisory Batches</span>
            <span className="font-mono text-slate-200">{recommendations.length} items</span>
          </div>
        </div>
      </div>

      {/* Main Content Split: Stockout Alerts & Model Benchmarks Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: High Priority Stockout Risk Alerts */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Operational Stockout Vulnerabilities</span>
              </h3>
              <p className="text-xs text-slate-400">
                Products where current inventory position breaches calculated reorder threshold
              </p>
            </div>
            <button
              onClick={() => onNavigate('recommendations')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              <span>View All Recommendations</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="pb-2.5">SKU & Item Name</th>
                  <th className="pb-2.5 text-center">Risk Level</th>
                  <th className="pb-2.5 text-right">Inv Position</th>
                  <th className="pb-2.5 text-right">Reorder Pt</th>
                  <th className="pb-2.5 text-right">Days of Supply</th>
                  <th className="pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {alerts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      All cataloged inventory levels are healthy.
                    </td>
                  </tr>
                ) : (
                  alerts.slice(0, 4).map((alert) => (
                    <tr key={alert.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3">
                        <div className="font-mono text-slate-200 font-medium">{alert.sku}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                          {alert.productName}
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                          alert.riskLevel === 'CRITICAL' 
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {alert.riskLevel}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono text-slate-300">
                        {alert.inventoryPosition}
                      </td>
                      <td className="py-3 text-right font-mono text-slate-400">
                        {alert.reorderPoint}
                      </td>
                      <td className="py-3 text-right font-mono font-semibold text-rose-300">
                        {alert.daysOfSupply}d
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => onNavigate('recommendations')}
                          className="px-2.5 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 rounded-lg border border-slate-800/60 bg-slate-950/60 text-[11px] text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300">Formula Breakdown: </span>
            <span>
              ExpectedLeadTimeDemand = <code className="text-slate-200">Σ(Daily Forecasts)</code> over supplier lead time • 
              ReorderPoint = <code className="text-slate-200">ELTD + SafetyStock</code> • 
              InventoryPosition = <code className="text-slate-200">OnHand + ConfirmedInbound - CommittedDemand</code>.
            </span>
          </div>
        </div>

        {/* Right 1 Col: Model Benchmarks & Status */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <GitCompare className="w-4 h-4 text-indigo-400" />
                  <span>Forecasting Candidates</span>
                </h3>
                <p className="text-xs text-slate-400">6 models evaluated on chronological validation</p>
              </div>
            </div>

            <div className="space-y-2">
              {models.slice(0, 5).map((m) => (
                <div 
                  key={m.modelId} 
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                    m.isProduction 
                      ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200' 
                      : 'border-slate-800 bg-slate-950/60 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-medium flex items-center gap-1.5">
                      <span>{m.modelName.split('(')[0]}</span>
                      {m.isProduction && (
                        <span className="text-[9px] font-mono px-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          PROD
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {m.algorithm}
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="font-semibold text-slate-200">{m.wape ? `${m.wape}%` : 'N/A'}</div>
                    <div className="text-[10px] text-slate-500">WAPE</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('models')}
            className="w-full py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition text-center"
          >
            Review 6-Model Benchmark Comparison →
          </button>
        </div>
      </div>

      {/* Recent Inventory Ledger Audit Movements */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Recent Operational Stock Movements (Immutable Ledger)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Audit trail of warehouse stock-in, dispatch, adjustments, and returns
            </p>
          </div>
          <button
            onClick={() => onNavigate('movements')}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
          >
            <span>Full Ledger</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {movements.slice(0, 4).map((m) => (
            <div key={m.id} className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase ${
                  m.movementType === 'stock_in' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  m.movementType === 'stock_out' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                  m.movementType === 'adjustment' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {m.movementType.replace('_', ' ')}
                </span>
                <span className="font-mono font-semibold text-slate-200">
                  {m.quantity > 0 ? `+${m.quantity}` : m.quantity} units
                </span>
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                Ref: <span className="font-mono text-slate-300">{m.referenceNumber}</span>
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {m.reason}
              </div>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-900 flex justify-between">
                <span>{m.userName}</span>
                <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
