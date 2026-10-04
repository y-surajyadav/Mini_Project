import React, { useState } from 'react';
import { ReorderRecommendation, StockoutAlert, UserRole } from '../../types/index.js';
import { ApiService } from '../../services/api.js';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  ShieldAlert, 
  Calculator, 
  DollarSign, 
  ArrowRight,
  Sparkles,
  ClipboardCheck
} from 'lucide-react';

interface RecommendationsViewProps {
  recommendations: ReorderRecommendation[];
  alerts: StockoutAlert[];
  onRefresh: () => void;
  userRole?: UserRole;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  recommendations,
  alerts,
  onRefresh,
  userRole
}) => {
  const [selectedRec, setSelectedRec] = useState<ReorderRecommendation | null>(null);
  const [managerNotes, setManagerNotes] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'approved_by_manager' | 'rejected'>('approved_by_manager');
  const [submitting, setSubmitting] = useState(false);

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRec) return;
    setSubmitting(true);

    try {
      await ApiService.reviewRecommendation(selectedRec.id, {
        reviewStatus,
        managerNotes
      });
      setSelectedRec(null);
      setManagerNotes('');
      onRefresh();
    } catch (err: any) {
      alert(`Review error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Inventory Optimization & Advisory Reorders</h2>
              <p className="text-xs text-slate-400">Decision-support inventory position formulas and human-in-the-loop review</p>
            </div>
          </div>
        </div>

        <div className="text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400">
          Decision Support Mode: Human Sign-Off Required
        </div>
      </div>

      {/* Advisory Formula Card */}
      <div className="rounded-xl border border-indigo-900/50 bg-indigo-950/20 p-5 space-y-3">
        <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs">
          <Calculator className="w-4 h-4 text-indigo-400" />
          <span>Operational Reorder Point & Inventory Position Formulas</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60">
            <div className="text-[10px] text-slate-400">1. Lead Time Demand</div>
            <div className="text-slate-200 mt-1 font-semibold">ELTD = Σ(Forecasts)</div>
            <div className="text-[10px] text-slate-500 font-sans mt-0.5">Sum over supplier lead time</div>
          </div>

          <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60">
            <div className="text-[10px] text-slate-400">2. Reorder Point (ROP)</div>
            <div className="text-slate-200 mt-1 font-semibold">ROP = ELTD + SafetyStock</div>
            <div className="text-[10px] text-slate-500 font-sans mt-0.5">Inventory replenishment trigger</div>
          </div>

          <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60">
            <div className="text-[10px] text-slate-400">3. Inventory Position (IP)</div>
            <div className="text-slate-200 mt-1 font-semibold">IP = OnHand + Inbound - Committed</div>
            <div className="text-[10px] text-slate-500 font-sans mt-0.5">Net effective stock level</div>
          </div>

          <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60">
            <div className="text-[10px] text-slate-400">4. Final Order Quantity</div>
            <div className="text-indigo-300 mt-1 font-semibold">ceil(max(ROP-IP, MOQ)/Pack)*Pack</div>
            <div className="text-[10px] text-slate-500 font-sans mt-0.5">Adjusted for vendor constraints</div>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 pt-1 border-t border-indigo-900/40">
          Notice: Under academic guidelines, the system <strong>never automatically places vendor orders</strong>. All suggestions remain advisory.
        </div>
      </div>

      {/* Recommendations Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono">
                <th className="py-3 px-4">Product SKU</th>
                <th className="py-3 px-3">Supplier (MOQ / Pack)</th>
                <th className="py-3 px-3 text-right">Inv Position (IP)</th>
                <th className="py-3 px-3 text-right">Reorder Pt (ROP)</th>
                <th className="py-3 px-3 text-right">Base Need</th>
                <th className="py-3 px-3 text-right">Recommended Qty</th>
                <th className="py-3 px-3 text-right">Est Cost ($)</th>
                <th className="py-3 px-3 text-center">Risk Level</th>
                <th className="py-3 px-3 text-center">Review Status</th>
                <th className="py-3 px-4 text-center">Manager Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recommendations.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <div className="font-mono text-slate-100 font-medium">{rec.sku}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[200px]">{rec.productName}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-slate-300 truncate max-w-[150px]">{rec.supplierName}</div>
                    <div className="text-[10px] font-mono text-slate-500">MOQ: {rec.supplierMoq} • Pack: {rec.supplierPackSize}</div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-200 font-semibold">
                    {rec.inventoryPosition}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-400">
                    {rec.reorderPoint}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-400">
                    {rec.suggestedBaseOrderQty}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-indigo-300 font-bold">
                    {rec.recommendedFinalOrderQty > 0 ? (
                      <span>{rec.recommendedFinalOrderQty} units</span>
                    ) : (
                      <span className="text-slate-500 font-normal">None</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-200 font-medium">
                    ${rec.estimatedCost.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      rec.stockoutRiskLevel === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                      rec.stockoutRiskLevel === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      rec.stockoutRiskLevel === 'MODERATE' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {rec.stockoutRiskLevel}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded capitalize ${
                      rec.reviewStatus === 'approved_by_manager' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800' :
                      rec.reviewStatus === 'rejected' ? 'bg-rose-950/60 text-rose-300 border border-rose-800' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {rec.reviewStatus.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => {
                        setSelectedRec(rec);
                        setReviewStatus('approved_by_manager');
                        setManagerNotes(rec.managerNotes || '');
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition"
                    >
                      Sign Off
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sign-off Review Modal */}
      {selectedRec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-indigo-400" />
              <span>Manager Reorder Sign-Off & Verification</span>
            </h3>

            <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Item:</span>
                <span className="font-mono text-slate-200">{selectedRec.sku} ({selectedRec.productName})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Calculated Advisory Order:</span>
                <span className="font-mono text-indigo-300 font-bold">{selectedRec.recommendedFinalOrderQty} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated Cost:</span>
                <span className="font-mono text-slate-200 font-semibold">${selectedRec.estimatedCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Risk Assessment:</span>
                <span className="font-mono text-rose-300">{selectedRec.riskNarrative}</span>
              </div>
            </div>

            <form onSubmit={handleReview} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-medium">Review Action</label>
                <div className="grid grid-cols-2 gap-3 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setReviewStatus('approved_by_manager')}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition ${
                      reviewStatus === 'approved_by_manager'
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Authorize Advisory Batch</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewStatus('rejected')}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition ${
                      reviewStatus === 'rejected'
                        ? 'border-rose-500 bg-rose-950/40 text-rose-200'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Reject / Hold Batch</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium">Manager Review Notes & Sign-off</label>
                <textarea
                  value={managerNotes}
                  onChange={(e) => setManagerNotes(e.target.value)}
                  rows={2}
                  className="w-full mt-1.5 p-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-100"
                  placeholder="e.g. Verified lead time with supplier; approved for procurement batch."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedRec(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium disabled:opacity-50"
                >
                  {submitting ? 'Saving Sign-off...' : 'Commit Sign-off'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
