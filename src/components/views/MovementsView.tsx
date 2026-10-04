import React, { useState } from 'react';
import { InventoryMovement, Product, UserRole, MovementType } from '../../types/index.js';
import { ApiService } from '../../services/api.js';
import { 
  ArrowLeftRight, 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  RotateCcw, 
  SlidersHorizontal,
  Clock,
  Search,
  Filter
} from 'lucide-react';

interface MovementsViewProps {
  movements: InventoryMovement[];
  products: Product[];
  onRefreshMovements: () => void;
  userRole?: UserRole;
}

export const MovementsView: React.FC<MovementsViewProps> = ({
  movements,
  products,
  onRefreshMovements,
  userRole
}) => {
  const [filterType, setFilterType] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [productId, setProductId] = useState(products[0]?.id || '');
  const [movementType, setMovementType] = useState<MovementType>('stock_in');
  const [quantity, setQuantity] = useState(20);
  const [reference, setReference] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = movements.filter(m => {
    return filterType === 'ALL' || m.movementType === filterType;
  });

  const handleRecordMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await ApiService.recordMovement({
        productId,
        movementType,
        quantity,
        referenceNumber: reference,
        reason
      });
      setShowModal(false);
      setReference('');
      setReason('');
      onRefreshMovements();
    } catch (err: any) {
      setError(err.message || 'Movement recording failed');
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = () => {
    setError(null);
    setProductId(products[0]?.id || '');
    setMovementType('stock_in');
    setQuantity(20);
    setReference(`GRN-${Date.now().toString().slice(-6)}`);
    setReason('Inbound supplier shipment receipt');
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Operational Inventory Ledger</h2>
              <p className="text-xs text-slate-400">Immutable chronological audit trail of all warehouse stock events</p>
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Stock Movement</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 font-medium">Filter Movement Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="ALL">All Movements ({movements.length})</option>
            <option value="stock_in">Stock-In (Receipts)</option>
            <option value="stock_out">Stock-Out (Dispatches)</option>
            <option value="adjustment">Adjustments (Cycle Counts)</option>
            <option value="return">Returns (Customer / Vendor)</option>
          </select>
        </div>

        <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
          Auditability: Strict append-only ledger
        </div>
      </div>

      {/* Movements Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3">Movement Type</th>
                <th className="py-3 px-3">Product SKU</th>
                <th className="py-3 px-3 text-right">Quantity</th>
                <th className="py-3 px-3 text-right">Balance (Old → New)</th>
                <th className="py-3 px-3">Reference / Order #</th>
                <th className="py-3 px-3">Operational Reason</th>
                <th className="py-3 px-4">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((m) => {
                const prod = products.find(p => p.id === m.productId);

                return (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {new Date(m.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
                        m.movementType === 'stock_in' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        m.movementType === 'stock_out' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                        m.movementType === 'adjustment' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {m.movementType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-200">
                      {prod?.sku || m.productId}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold">
                      <span className={m.quantity >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {m.quantity >= 0 ? `+${m.quantity}` : m.quantity}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-400">
                      {m.previousStock} → <strong className="text-slate-200">{m.newStock}</strong>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {m.referenceNumber}
                    </td>
                    <td className="py-3 px-3 text-slate-400 max-w-[200px] truncate">
                      {m.reason}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-medium">
                      {m.userName}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Movement Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-indigo-400" />
              <span>Record Warehouse Inventory Movement</span>
            </h3>

            {error && (
              <div className="p-2.5 rounded border border-rose-800 bg-rose-950/40 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleRecordMovement} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300">Target Product</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full mt-1 p-2 rounded border border-slate-700 bg-slate-950 text-slate-200 font-mono"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.sku} - {p.name} (Stock: {p.onHandStock})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300">Movement Type</label>
                  <select
                    value={movementType}
                    onChange={(e: any) => setMovementType(e.target.value)}
                    className="w-full mt-1 p-2 rounded border border-slate-700 bg-slate-950 text-slate-200"
                  >
                    <option value="stock_in">Stock-In (Receipt)</option>
                    <option value="stock_out">Stock-Out (Dispatch)</option>
                    <option value="adjustment">Inventory Adjustment</option>
                    <option value="return">Return Receipt</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300">Quantity (Units)</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    required
                    className="w-full mt-1 p-2 rounded border border-slate-700 bg-slate-950 font-mono text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300">Reference Number (PO / SO / GRN)</label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  required
                  placeholder="e.g. GRN-2026-992"
                  className="w-full mt-1 p-2 rounded border border-slate-700 bg-slate-950 font-mono text-slate-100"
                />
              </div>

              <div>
                <label className="text-slate-300">Reason / Notes</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows={2}
                  placeholder="Operational justification for ledger audit trail"
                  className="w-full mt-1 p-2 rounded border border-slate-700 bg-slate-950 text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium disabled:opacity-50"
                >
                  {submitting ? 'Recording...' : 'Commit to Ledger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
