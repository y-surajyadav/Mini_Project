import React, { useState } from 'react';
import { Product, Supplier, UserRole } from '../../types/index.js';
import { ApiService } from '../../services/api.js';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle,
  Truck,
  DollarSign
} from 'lucide-react';

interface InventoryViewProps {
  products: Product[];
  suppliers: Supplier[];
  onRefreshProducts: () => void;
  userRole?: UserRole;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  suppliers,
  onRefreshProducts,
  userRole
}) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New product form state
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [cat, setCat] = useState<'FOODS' | 'HOBBIES' | 'HOUSEHOLD'>('FOODS');
  const [unit, setUnit] = useState('Unit');
  const [onHand, setOnHand] = useState(50);
  const [safety, setSafety] = useState(20);
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [unitCost, setUnitCost] = useState(2.5);
  const [sellingPrice, setSellingPrice] = useState(4.99);
  const [binLocation, setBinLocation] = useState('A-01-01');
  const [submitting, setSubmitting] = useState(false);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.sku.toLowerCase().includes(search.toLowerCase()) ||
                          p.binLocation.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === 'ALL' || p.category === category;
    return matchesSearch && matchesCat;
  });

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingProduct) {
        await ApiService.updateProduct(editingProduct.id, {
          name,
          safetyStock: safety,
          unitCost,
          sellingPrice,
          binLocation,
          supplierId
        });
      } else {
        await ApiService.createProduct({
          sku,
          name,
          category: cat,
          unit,
          onHandStock: onHand,
          safetyStock: safety,
          supplierId: supplierId || suppliers[0]?.id,
          unitCost,
          sellingPrice,
          binLocation
        });
      }
      setShowModal(false);
      setEditingProduct(null);
      onRefreshProducts();
    } catch (err: any) {
      alert(`Error saving product: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSafety(p.safetyStock);
    setUnitCost(p.unitCost);
    setSellingPrice(p.sellingPrice);
    setBinLocation(p.binLocation);
    setSupplierId(p.supplierId);
    setShowModal(true);
  };

  const openCreate = () => {
    setEditingProduct(null);
    setSku(`FOODS_3_${Math.floor(100 + Math.random() * 900)}_CA_3`);
    setName('');
    setCat('FOODS');
    setUnit('Bag');
    setOnHand(40);
    setSafety(25);
    setUnitCost(2.0);
    setSellingPrice(3.99);
    setBinLocation('A-02-01');
    setSupplierId(suppliers[0]?.id || '');
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Operational Product Master & Live Inventory</h2>
              <p className="text-xs text-slate-400">Separately maintained warehouse stock levels and replenishment rules</p>
            </div>
          </div>
        </div>

        {userRole === 'admin' && (
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Operational Product</span>
          </button>
        )}
      </div>

      {/* Synthetic Demonstration Notice Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-xs space-y-1.5 text-slate-300">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold">
          <ShieldAlert className="w-4 h-4" />
          <span>Operational Data Separation Notice</span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          The Walmart M5 dataset does not contain real-time physical bin locations, supplier purchase lead times, or safety stocks. These operational records are maintained in a separate ledger and labeled <strong className="text-indigo-300">SYNTHETIC DEMONSTRATION DATA</strong>. They are never mixed with historical training sales.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by SKU, name, bin..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Categories</option>
            <option value="FOODS">Foods</option>
            <option value="HOBBIES">Hobbies</option>
            <option value="HOUSEHOLD">Household</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono">
                <th className="py-3 px-4">SKU & Product Name</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-right">On-Hand</th>
                <th className="py-3 px-3 text-right">Safety Stock</th>
                <th className="py-3 px-3 text-right">Inbound</th>
                <th className="py-3 px-3 text-right">Committed</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Supplier</th>
                <th className="py-3 px-4 text-right">Cost / Price</th>
                {userRole === 'admin' && <th className="py-3 px-4 text-center">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.map((p) => {
                const supplier = suppliers.find(s => s.id === p.supplierId);
                const isLow = p.onHandStock < p.safetyStock;

                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-100 font-medium flex items-center gap-1.5">
                        <span>{p.sku}</span>
                        {p.isSyntheticDemo && (
                          <span className="text-[9px] font-mono px-1 rounded bg-slate-800 text-slate-400 border border-slate-700" title="Synthetic Demonstration Record">
                            DEMO
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[220px]">
                        {p.name}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      <span className={`font-semibold ${isLow ? 'text-rose-400' : 'text-slate-100'}`}>
                        {p.onHandStock}
                      </span>
                      <span className="text-[10px] text-slate-500 ml-1">{p.unit}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300">
                      {p.safetyStock}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-indigo-300">
                      +{p.confirmedInbound}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-amber-300">
                      -{p.committedDemand}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {p.binLocation}
                    </td>
                    <td className="py-3 px-3 text-slate-300 truncate max-w-[140px]">
                      {supplier?.name || p.supplierId}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      <div className="text-slate-100">${p.sellingPrice.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-500">Cost: ${p.unitCost.toFixed(2)}</div>
                    </td>
                    {userRole === 'admin' && (
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                          title="Edit Operational Parameters"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-100">
              {editingProduct ? `Edit ${editingProduct.sku}` : 'Add New Operational Product'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              {!editingProduct && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300">SKU Identifier</label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      required
                      className="w-full mt-1 p-2 rounded border border-slate-700 bg-slate-950 font-mono text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300">Category</label>
                    <select
                      value={cat}
                      onChange={(e: any) => setCat(e.target.value)}
                      className="w-full mt-1 p-2 rounded border border-slate-700 bg-slate-950 text-slate-100"
                    >
                      <option value="FOODS">FOODS</option>
                      <option value="HOBBIES">HOBBIES</option>
                      <option value="HOUSEHOLD">HOUSEHOLD</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="text-slate-300">Product Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full mt-1 p-2 rounded border border-slate-700 bg-slate-950 text-slate-100"
                  placeholder="e.g. Organic Honeycrisp Apples"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300">Safety Stock (Units)</label>
                  <input
                    type="number"
                    value={safety}
                    onChange={(e) => setSafety(Number(e.target.value))}
                    required
                    className="w-full mt-1 p-2 rounded border border-slate-700 bg-slate-950 font-mono text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-slate-300">Warehouse Bin</label>
                  <input
                    type="text"
                    value={binLocation}
                    onChange={(e) => setBinLocation(e.target.value)}
                    required
                    className="w-full mt-1 p-2 rounded border border-slate-700 bg-slate-950 font-mono text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300">Unit Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={unitCost}
                    onChange={(e) => setUnitCost(Number(e.target.value))}
                    required
                    className="w-full mt-1 p-2 rounded border border-slate-700 bg-slate-950 font-mono text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-slate-300">Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    required
                    className="w-full mt-1 p-2 rounded border border-slate-700 bg-slate-950 font-mono text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300">Associated Supplier</label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full mt-1 p-2 rounded border border-slate-700 bg-slate-950 text-slate-100"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code}) - {s.leadTimeDays}d lead time</option>
                  ))}
                </select>
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
                  {submitting ? 'Saving...' : 'Save Product Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
