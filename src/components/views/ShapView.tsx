import React, { useState, useEffect } from 'react';
import { Product, ModelExperiment } from '../../types/index.js';
import { ApiService } from '../../services/api.js';
import { 
  HelpCircle, 
  Layers, 
  BarChart2, 
  Activity, 
  ShieldAlert, 
  ArrowUpRight, 
  ArrowDownRight,
  Info,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface ShapViewProps {
  products: Product[];
  models: ModelExperiment[];
}

export const ShapView: React.FC<ShapViewProps> = ({
  products,
  models
}) => {
  const [selectedSku, setSelectedSku] = useState(products[0]?.sku || 'FOODS_3_090_CA_3');
  const [selectedModelId, setSelectedModelId] = useState('xgboost');
  const [loading, setLoading] = useState(false);
  const [shapData, setShapData] = useState<any | null>(null);

  const fetchShap = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getShapExplanations(selectedSku, selectedModelId);
      setShapData(res.explanation);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShap();
  }, [selectedSku, selectedModelId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">SHAP Explainability & Attribution</h2>
              <p className="text-xs text-slate-400">Global feature importance and per-prediction waterfall attributions</p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchShap}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium transition shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Attribution</span>
        </button>
      </div>

      {/* Academic Integrity & Non-Causation Disclaimer */}
      <div className="rounded-xl border border-indigo-900/60 bg-indigo-950/20 p-4 space-y-1.5 text-xs">
        <div className="flex items-center gap-2 text-indigo-300 font-semibold">
          <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>Academic Causality Disclosure</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          {shapData?.disclaimer || 'SHAP values represent statistical attribution relative to base expected values within the model decision surface. SHAP identifies feature importance in model parameters and does not prove empirical real-world causation.'}
        </p>
      </div>

      {/* Control Selector: SKU and Model */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">Target Product SKU</label>
          <select
            value={selectedSku}
            onChange={(e) => setSelectedSku(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          >
            {products.map((p) => (
              <option key={p.id} value={p.sku}>
                {p.sku} - {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">Explainer Model Architecture</label>
          <select
            value={selectedModelId}
            onChange={(e) => setSelectedModelId(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="xgboost">XGBoost (TreeExplainer)</option>
            <option value="lightgbm">LightGBM (TreeExplainer)</option>
            <option value="catboost">CatBoost (TreeExplainer)</option>
            <option value="linear_regression">Linear Regression (LinearExplainer)</option>
            <option value="arima">ARIMA (Time-Series Baseline)</option>
          </select>
        </div>
      </div>

      {shapData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Global Feature Importance */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-indigo-400" />
                  <span>Global Feature Importance (Mean |SHAP|)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Relative impact of lagged sales, calendar events, and moving averages
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {shapData.globalFeatureImportance?.map((feat: any, idx: number) => {
                const maxScore = shapData.globalFeatureImportance[0]?.importanceScore || 0.4;
                const pct = Math.min(100, Math.round((feat.importanceScore / maxScore) * 100));

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-200">{feat.displayName}</span>
                      <span className="font-mono text-indigo-300">{feat.importanceScore}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-500" 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {feat.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Local Per-Prediction Waterfall Attribution */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Local Prediction Waterfall Attribution</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Decomposition of Day 1 forecast from Base Expected Value
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono font-bold text-indigo-300">
                  Output: {shapData.predictedValue} units
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                  Base: {shapData.baseValue}
                </div>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              {shapData.localWaterfallAttributions?.map((attr: any, idx: number) => {
                const isPositive = attr.direction === 'positive';

                return (
                  <div 
                    key={idx} 
                    className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 text-xs flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-medium text-slate-200">
                        {isPositive ? (
                          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        <span>{attr.displayName}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        Observed value: {attr.featureValueDisplay}
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className={`font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPositive ? `+${attr.attributionValue}` : attr.attributionValue}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {attr.contributionPct}% attribution
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-lg border border-slate-800 bg-slate-950 text-[11px] font-mono text-slate-400">
              f(x) = {shapData.baseValue} (E[y]) {shapData.localWaterfallAttributions?.map((a: any) => `${a.attributionValue > 0 ? '+' : ''}${a.attributionValue}`).join(' ')} = <strong className="text-indigo-300">{shapData.predictedValue} units</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
