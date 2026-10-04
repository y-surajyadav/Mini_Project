import React, { useState } from 'react';
import { DatasetValidationReport, UserRole } from '../../types/index.js';
import { ApiService } from '../../services/api.js';
import { 
  Database, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  FolderCheck, 
  FileSpreadsheet, 
  HelpCircle,
  FileCheck,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface DatasetViewProps {
  report: DatasetValidationReport | null;
  onRefreshReport: () => void;
  userRole?: UserRole;
}

export const DatasetView: React.FC<DatasetViewProps> = ({
  report,
  onRefreshReport,
  userRole
}) => {
  const [customPath, setCustomPath] = useState(report?.datasetDir || './data');
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleUpdatePath = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setFeedback(null);
    try {
      const res = await ApiService.configureDatasetPath(customPath);
      setFeedback(`Path updated and verified. Status: ${res.report.isValid ? 'VALID' : 'FILES MISSING'}`);
      onRefreshReport();
    } catch (err: any) {
      setFeedback(`Error updating path: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const files = report?.files;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Walmart M5 Dataset Protocol & Validation</h2>
              <p className="text-xs text-slate-400">Strict academic dataset integrity guard and join verification</p>
            </div>
          </div>
        </div>

        <button
          onClick={onRefreshReport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium transition shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Re-validate Dataset</span>
        </button>
      </div>

      {/* Dataset Policy Notice Card */}
      <div className="rounded-xl border border-indigo-900/50 bg-indigo-950/20 p-4 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-indigo-300 font-semibold">
          <ShieldAlert className="w-4 h-4" />
          <span>Strict Non-Substitution & Zero-Fake Sales Policy</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          The <strong>only permitted source of historical sales</strong> for training, model comparison, forecasting experiments, and academic metrics is the developer-supplied Walmart M5 Forecasting dataset. Synthetic sales data and external substitutes are strictly forbidden. If required files are absent, model training and forecasting are blocked with clear remediation diagnostics.
        </p>
      </div>

      {/* Path Configuration Form (Admin Only or Readonly) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <FolderCheck className="w-4 h-4 text-indigo-400" />
          <span>Dataset Directory Resolution (DATASET_DIR)</span>
        </h3>
        
        <form onSubmit={handleUpdatePath} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex-1 w-full relative">
            <input
              type="text"
              value={customPath}
              onChange={(e) => setCustomPath(e.target.value)}
              disabled={userRole !== 'admin' || updating}
              className="w-full px-3.5 py-2 text-xs font-mono rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-60"
              placeholder="./data or /absolute/path/to/data"
            />
          </div>
          {userRole === 'admin' ? (
            <button
              type="submit"
              disabled={updating}
              className="py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition disabled:opacity-50 shrink-0"
            >
              {updating ? 'Validating...' : 'Update & Re-scan'}
            </button>
          ) : (
            <span className="text-[11px] text-slate-500 italic">
              (Path configuration restricted to Admin role)
            </span>
          )}
        </form>

        {feedback && (
          <div className="text-xs p-2.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300">
            {feedback}
          </div>
        )}
      </div>

      {/* Required Files Validation Checklist */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
            <span>M5 Required Files Checklist & Schema Verification</span>
          </h3>
          <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold ${
            report?.isValid 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}>
            {report?.isValid ? 'ALL FILES VERIFIED' : 'FILES MISSING OR INVALID'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* File 1: sales_train_validation.csv */}
          <div className={`p-4 rounded-xl border text-xs space-y-2.5 ${
            files?.salesTrainValidation.exists 
              ? 'border-emerald-800/80 bg-emerald-950/20' 
              : 'border-slate-800 bg-slate-950/60'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {files?.salesTrainValidation.exists ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400" />
                )}
                <span className="font-mono font-semibold text-slate-200">sales_train_validation.csv</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                Primary Training
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Contains 30,490 series with daily unit sales from <code className="text-slate-300">d_1</code> to <code className="text-slate-300">d_1913</code>.
            </p>
            <div className="pt-2 border-t border-slate-800/80 font-mono text-[10px] text-slate-400 space-y-1">
              <div>Status: {files?.salesTrainValidation.exists ? 'Present on filesystem' : 'Missing in configured directory'}</div>
              {files?.salesTrainValidation.sizeFormatted && <div>Size: {files.salesTrainValidation.sizeFormatted}</div>}
              {files?.salesTrainValidation.columnCount && <div>Columns: {files.salesTrainValidation.columnCount} (Headers verified)</div>}
              {files?.salesTrainValidation.errorMessage && <div className="text-rose-400">{files.salesTrainValidation.errorMessage}</div>}
            </div>
          </div>

          {/* File 2: calendar.csv */}
          <div className={`p-4 rounded-xl border text-xs space-y-2.5 ${
            files?.calendar.exists 
              ? 'border-emerald-800/80 bg-emerald-950/20' 
              : 'border-slate-800 bg-slate-950/60'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {files?.calendar.exists ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400" />
                )}
                <span className="font-mono font-semibold text-slate-200">calendar.csv</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                Calendar & Events
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Contains 1,969 dates, weekday indices, cultural/promotional events, and SNAP flags.
            </p>
            <div className="pt-2 border-t border-slate-800/80 font-mono text-[10px] text-slate-400 space-y-1">
              <div>Status: {files?.calendar.exists ? 'Present on filesystem' : 'Missing in configured directory'}</div>
              {files?.calendar.sizeFormatted && <div>Size: {files.calendar.sizeFormatted}</div>}
              {files?.calendar.columnCount && <div>Columns: {files.calendar.columnCount} (Headers verified)</div>}
              {files?.calendar.errorMessage && <div className="text-rose-400">{files.calendar.errorMessage}</div>}
            </div>
          </div>

          {/* File 3: sell_prices.csv */}
          <div className={`p-4 rounded-xl border text-xs space-y-2.5 ${
            files?.sellPrices.exists 
              ? 'border-emerald-800/80 bg-emerald-950/20' 
              : 'border-slate-800 bg-slate-950/60'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {files?.sellPrices.exists ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400" />
                )}
                <span className="font-mono font-semibold text-slate-200">sell_prices.csv</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                Weekly Pricing
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Historical weekly item selling prices per store keyed by <code className="text-slate-300">wm_yr_wk</code>.
            </p>
            <div className="pt-2 border-t border-slate-800/80 font-mono text-[10px] text-slate-400 space-y-1">
              <div>Status: {files?.sellPrices.exists ? 'Present on filesystem' : 'Missing in configured directory'}</div>
              {files?.sellPrices.sizeFormatted && <div>Size: {files.sellPrices.sizeFormatted}</div>}
              {files?.sellPrices.errorMessage && <div className="text-rose-400">{files.sellPrices.errorMessage}</div>}
            </div>
          </div>

          {/* File 4: sales_train_evaluation.csv */}
          <div className={`p-4 rounded-xl border text-xs space-y-2.5 ${
            files?.salesTrainEvaluation.exists 
              ? 'border-emerald-800/80 bg-emerald-950/20' 
              : 'border-slate-800 bg-slate-950/60'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {files?.salesTrainEvaluation.exists ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[9px] text-slate-500 font-mono">
                    opt
                  </div>
                )}
                <span className="font-mono font-semibold text-slate-200">sales_train_evaluation.csv</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                Optional Eval
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Optional file extending daily sales through day <code className="text-slate-300">d_1941</code> for held-out evaluation.
            </p>
            <div className="pt-2 border-t border-slate-800/80 font-mono text-[10px] text-slate-400 space-y-1">
              <div>Status: {files?.salesTrainEvaluation.exists ? 'Present on filesystem' : 'Not present (Optional)'}</div>
              {files?.salesTrainEvaluation.sizeFormatted && <div>Size: {files.salesTrainEvaluation.sizeFormatted}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostics & Remediation Guide */}
      {report && report.remediationSteps.length > 0 && (
        <div className="rounded-xl border border-amber-800/80 bg-amber-950/20 p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-300 text-sm font-semibold">
            <AlertTriangle className="w-4 h-4" />
            <span>Remediation Procedures to Enable Training & Forecasting</span>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
            {report.remediationSteps.map((step, idx) => (
              <li key={idx} className="leading-relaxed">
                {step}
              </li>
            ))}
          </ol>
          <div className="text-[11px] font-mono text-amber-400 pt-1">
            Expected directory: <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-200">{report.datasetDir}</code>
          </div>
        </div>
      )}
    </div>
  );
};
