import React, { useState, useEffect } from 'react';
import { AuditLog, UserRole } from '../../types/index.js';
import { ApiService } from '../../services/api.js';
import { 
  FileText, 
  Download, 
  ShieldCheck, 
  Clock, 
  Search, 
  Filter,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

interface AuditViewProps {
  userRole?: UserRole;
}

export const AuditView: React.FC<AuditViewProps> = ({ userRole }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filterAction, setFilterAction] = useState('ALL');
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getAuditLogs(filterAction !== 'ALL' ? filterAction : undefined);
      setLogs(res.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === 'admin') {
      fetchLogs();
    }
  }, [filterAction, userRole]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Audit Trail & Operational Report Exports</h2>
              <p className="text-xs text-slate-400">Security audit logs and verified CSV operational reports</p>
            </div>
          </div>
        </div>
      </div>

      {/* CSV Export Center */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <Download className="w-4 h-4 text-indigo-400" />
          <span>Operational CSV Report Exports</span>
        </h3>
        <p className="text-xs text-slate-400">
          Export verified decision-support records for warehouse audits, vendor procurement, and academic analysis.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Export 1: Inventory */}
          <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/60 flex flex-col justify-between space-y-3">
            <div>
              <div className="text-xs font-semibold text-slate-200">Product Inventory Master</div>
              <div className="text-[11px] text-slate-400 mt-1">Catalog SKUs, live stock, safety buffer, locations</div>
            </div>
            <a
              href={ApiService.getExportUrl('inventory')}
              download
              className="py-1.5 px-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium text-center transition flex items-center justify-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </a>
          </div>

          {/* Export 2: Ledger Movements */}
          <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/60 flex flex-col justify-between space-y-3">
            <div>
              <div className="text-xs font-semibold text-slate-200">Stock Movements Ledger</div>
              <div className="text-[11px] text-slate-400 mt-1">Immutable stock-in, dispatch, and adjustment audit</div>
            </div>
            <a
              href={ApiService.getExportUrl('movements')}
              download
              className="py-1.5 px-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium text-center transition flex items-center justify-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </a>
          </div>

          {/* Export 3: Recommendations */}
          <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/60 flex flex-col justify-between space-y-3">
            <div>
              <div className="text-xs font-semibold text-slate-200">Reorder Recommendations</div>
              <div className="text-[11px] text-slate-400 mt-1">Advisory orders, ROP, IP, supplier MOQ constraints</div>
            </div>
            <a
              href={ApiService.getExportUrl('recommendations')}
              download
              className="py-1.5 px-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium text-center transition flex items-center justify-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </a>
          </div>

          {/* Export 4: Model Benchmarks */}
          <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/60 flex flex-col justify-between space-y-3">
            <div>
              <div className="text-xs font-semibold text-slate-200">ML Model Benchmarks</div>
              <div className="text-[11px] text-slate-400 mt-1">Empirical MAE, RMSE, WAPE, R² and latency metrics</div>
            </div>
            <a
              href={ApiService.getExportUrl('model_benchmarks')}
              download
              className="py-1.5 px-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium text-center transition flex items-center justify-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </a>
          </div>
        </div>
      </div>

      {/* Admin Audit Trail */}
      {userRole === 'admin' ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Administrative System Audit Logs</span>
              </h3>
              <p className="text-xs text-slate-400">
                Tracking user logins, production model designations, parameter edits, and dataset configuration
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="px-2.5 py-1 text-xs rounded border border-slate-700 bg-slate-950 text-slate-200 font-mono"
              >
                <option value="ALL">All Actions</option>
                <option value="USER_LOGIN">USER_LOGIN</option>
                <option value="SELECT_PRODUCTION_MODEL">SELECT_PRODUCTION_MODEL</option>
                <option value="INVENTORY_MOVEMENT">INVENTORY_MOVEMENT</option>
                <option value="CREATE_PRODUCT">CREATE_PRODUCT</option>
                <option value="CONFIGURE_DATASET_PATH">CONFIGURE_DATASET_PATH</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Operator</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Entity</th>
                  <th className="py-2.5 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-slate-200">
                      {log.username}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-indigo-300">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {log.entity} {log.entityId ? `(${log.entityId})` : ''}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px] truncate max-w-xs">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-xs text-slate-400 text-center">
          Administrative audit logging view is restricted to System Administrators.
        </div>
      )}
    </div>
  );
};
