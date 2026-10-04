import React, { useState } from 'react';
import { ModelExperiment, UserRole } from '../../types/index.js';
import { ApiService } from '../../services/api.js';
import { 
  GitCompare, 
  Cpu, 
  CheckCircle, 
  Play, 
  Award, 
  Clock, 
  Activity, 
  AlertTriangle,
  Info,
  ShieldCheck
} from 'lucide-react';

interface ModelsViewProps {
  models: ModelExperiment[];
  onRefreshModels: () => void;
  userRole?: UserRole;
  datasetValid: boolean;
}

export const ModelsView: React.FC<ModelsViewProps> = ({
  models,
  onRefreshModels,
  userRole,
  datasetValid
}) => {
  const [selectedForPromotion, setSelectedForPromotion] = useState<ModelExperiment | null>(null);
  const [rationale, setRationale] = useState('');
  const [promoting, setPromoting] = useState(false);
  const [training, setTraining] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForPromotion) return;
    setPromoting(true);
    setActionMessage(null);

    try {
      const res = await ApiService.selectProductionModel(
        selectedForPromotion.modelId,
        rationale || 'Selected based on lowest empirical validation WAPE and robust feature attribution.'
      );
      setActionMessage(res.message);
      setSelectedForPromotion(null);
      setRationale('');
      onRefreshModels();
    } catch (err: any) {
      setActionMessage(`Promotion error: ${err.message}`);
    } finally {
      setPromoting(false);
    }
  };

  const handleRunTraining = async () => {
    setTraining(true);
    setActionMessage(null);
    try {
      const res = await ApiService.submitTrainingJob({
        models: ['linear_regression', 'arima', 'prophet', 'xgboost', 'lightgbm', 'catboost'],
        horizon: 28,
        sampleRatio: 0.1
      });
      setActionMessage(res.job.message);
      onRefreshModels();
    } catch (err: any) {
      setActionMessage(`Training blocked: ${err.message}`);
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">6-Candidate Demand Forecasting Benchmark</h2>
              <p className="text-xs text-slate-400">Chronological validation evidence and production model governance</p>
            </div>
          </div>
        </div>

        {userRole === 'admin' && (
          <button
            onClick={handleRunTraining}
            disabled={training}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-sm disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{training ? 'Evaluating Candidates...' : 'Run 6-Model Benchmark Job'}</span>
          </button>
        )}
      </div>

      {actionMessage && (
        <div className="p-3 rounded-lg border border-slate-800 bg-slate-900 text-xs text-slate-200">
          {actionMessage}
        </div>
      )}

      {/* Model Selection Governance Note */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300 space-y-1.5">
        <div className="flex items-center gap-2 font-semibold text-slate-100">
          <Info className="w-4 h-4 text-indigo-400" />
          <span>Evaluation Protocol & Anti-Leakage Methodology</span>
        </div>
        <p className="leading-relaxed text-slate-400">
          Each algorithm is evaluated using chronological splitting (Train: <code className="text-slate-300 font-mono">d_1..d_1885</code>, Val: <code className="text-slate-300 font-mono">d_1886..d_1913</code> [28-day horizon]). Future sales and test sets are never leaked into feature transformers. Models are evaluated using real MAE, RMSE, WAPE (Weighted Absolute Percentage Error), and R².
        </p>
      </div>

      {/* Benchmark Comparison Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono">
                <th className="py-3 px-4">Candidate Model</th>
                <th className="py-3 px-3">Algorithm Class</th>
                <th className="py-3 px-3 text-right">WAPE (%)</th>
                <th className="py-3 px-3 text-right">MAE</th>
                <th className="py-3 px-3 text-right">RMSE</th>
                <th className="py-3 px-3 text-right">R² Score</th>
                <th className="py-3 px-3 text-right">Train Time</th>
                <th className="py-3 px-3 text-right">Latency</th>
                <th className="py-3 px-4 text-center">Status / Production</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {models.map((model) => (
                <tr 
                  key={model.modelId} 
                  className={`hover:bg-slate-800/40 transition ${
                    model.isProduction ? 'bg-emerald-950/20' : ''
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-100 flex items-center gap-2">
                      <span>{model.modelName}</span>
                      {model.isProduction && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                          PRODUCTION
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Horizon: {model.splitInfo.horizon} days • {model.featureCount} features
                    </div>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-300">
                    {model.algorithm}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-semibold text-slate-100">
                    {model.wape ? `${model.wape}%` : '-'}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono text-slate-300">
                    {model.mae || '-'}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono text-slate-300">
                    {model.rmse || '-'}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono text-indigo-300 font-medium">
                    {model.r2 || '-'}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono text-slate-400">
                    {model.trainingTimeSeconds ? `${model.trainingTimeSeconds}s` : '-'}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono text-slate-400">
                    {model.inferenceLatencyMs ? `${model.inferenceLatencyMs}ms` : '-'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {model.isProduction ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Active Model</span>
                      </span>
                    ) : userRole === 'admin' ? (
                      <button
                        onClick={() => setSelectedForPromotion(model)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition"
                      >
                        Promote
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-mono">Evaluated</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Promotion Rationale Modal */}
      {selectedForPromotion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-indigo-400">
              <Award className="w-5 h-5" />
              <h3 className="text-base font-semibold text-slate-100">
                Promote Model to Production
              </h3>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              Designate <strong className="text-slate-100">{selectedForPromotion.modelName}</strong> as the system-wide active engine for demand forecasting and inventory reorder calculations.
            </p>

            <form onSubmit={handlePromote} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Academic & Operational Selection Rationale (Required)
                </label>
                <textarea
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  required
                  rows={3}
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-700 bg-slate-950 text-slate-100 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Achieved lowest empirical WAPE (27.56%) on chronological validation split with sub-millisecond inference latency."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedForPromotion(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={promoting}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition disabled:opacity-50"
                >
                  {promoting ? 'Promoting...' : 'Confirm Production Designation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
