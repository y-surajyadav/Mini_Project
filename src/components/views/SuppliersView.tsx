import React, { useState } from 'react';
import { Supplier, UserRole } from '../../types/index.js';
import { ApiService } from '../../services/api.js';
import { 
  Truck, 
  Plus, 
  Mail, 
  Phone, 
  Clock, 
  Box, 
  CheckCircle2 
} from 'lucide-react';

interface SuppliersViewProps {
  suppliers: Supplier[];
  onRefreshSuppliers: () => void;
  userRole?: UserRole;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  suppliers,
  onRefreshSuppliers,
  userRole
}) => {
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [leadTime, setLeadTime] = useState(3);
  const [moq, setMoq] = useState(50);
  const [packSize, setPackSize] = useState(10);
  const [submitting, setSubmitting] = useState(false);

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await ApiService.createSupplier({
        code,
        name,
        contactEmail: email,
        contactPhone: phone,
        leadTimeDays: leadTime,
        moq,
        packSize
      });
      setShowModal(false);
      setCode('');
      setName('');
      setEmail('');
      setPhone('');
      onRefreshSuppliers();
    } catch (err: any) {
      alert(`Error creating supplier: ${err.message}`);
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
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Supplier Master Directory</h2>
              <p className="text-xs text-slate-400">Vendor replenishment parameters: Lead times, MOQ thresholds, and pack size rules</p>
            </div>
          </div>
        </div>

        {userRole === 'admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Supplier Profile</span>
          </button>
        )}
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map((s) => (
          <div key={s.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-semibold border border-slate-700">
                  {s.code}
                </span>
                <h3 className="text-sm font-semibold text-slate-100 mt-2">{s.name}</h3>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono pt-2 border-t border-slate-800">
              <div className="flex justify-between text-slate-400">
                <span>Procurement Lead Time:</span>
                <span className="text-slate-200 font-semibold">{s.leadTimeDays} Days</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Minimum Order Qty (MOQ):</span>
                <span className="text-slate-200 font-semibold">{s.moq} Units</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Pack Size Multiplier:</span>
                <span className="text-indigo-300 font-semibold">{s.packSize} Units/Pack</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{s.contactEmail}</span>
              </div>
              {s.contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{s.contactPhone}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Supplier Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-400" />
              <span>Create Supplier Profile</span>
            </h3>

            <form onSubmit={handleCreateSupplier} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300">Supplier Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    placeholder="e.g. SUP-WEST-05"
                    className="w-full mt-1 p-2 rounded border border-slate-700 bg-slate-950 font-mono text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-slate-300">Lead Time (Days)</label>
                  <input
                    type="number"
                    value={leadTime}
                    onChange={(e) => setLeadTime(Number(e.target.value))}
                    required
                    min={1}
                    className="w-full mt-1 p-2 rounded border border-slate-700 bg-slate-950 font-mono text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300">Supplier Organization Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Pacific Northwest Beverage Co."
                  className="w-full mt-1 p-2 rounded border border-slate-700 bg-slate-950 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300">Min Order Qty (MOQ)</label>
                  <input
                    type="number"
                    value={moq}
                    onChange={(e) => setMoq(Number(e.target.value))}
                    required
                    min={1}
                    className="w-full mt-1 p-2 rounded border border-slate-700 bg-slate-950 font-mono text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-slate-300">Pack Size Multiplier</label>
                  <input
                    type="number"
                    value={packSize}
                    onChange={(e) => setPackSize(Number(e.target.value))}
                    required
                    min={1}
                    className="w-full mt-1 p-2 rounded border border-slate-700 bg-slate-950 font-mono text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300">Contact Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="procurement@supplier.com"
                  className="w-full mt-1 p-2 rounded border border-slate-700 bg-slate-950 text-slate-100"
                />
              </div>

              <div>
                <label className="text-slate-300">Contact Phone (Optional)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1-555-010-4499"
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
                  {submitting ? 'Registering...' : 'Register Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
