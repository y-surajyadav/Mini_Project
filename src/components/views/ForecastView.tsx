import React, { useState, useEffect } from 'react';
import { Product, ModelExperiment } from '../../types/index.js';
import { ApiService } from '../../services/api.js';
import { 
  TrendingUp, 
  Calendar, 
  Sliders, 
  AlertCircle, 
  Info, 
  Cpu, 
  Package, 
  BarChart3,
  RefreshCw
} from 'lucide-react';

interface ForecastViewProps {
  products: Product[];
  models: ModelExperiment[];
  datasetValid: boolean;
}

export const ForecastView: React.FC<ForecastViewProps> = ({
  products,
  models,
  datasetValid
}) => {
  const [selectedSku, setSelectedSku] = useState(products[0]?.sku || 'FOODS_3_090_CA_3');
  const [horizon, setHorizon] = useState(28);
  const [loading, setLoading] = useState(false);
  const [forecastData, setForecastData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.getForecast(selectedSku, horizon);
      setForecastData(res.forecast);
    } catch (err: any) {
      setError(err.message || 'Forecast calculation failed');
      setForecastData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [selectedSku, horizon]);

  const activeProduct = products.find(p => p.sku === selectedSku);
  const prodModel = models.find(m => m.isProduction) || models[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Demand Forecast Explorer</h2>
              <p className="text-xs text-slate-400">Historical actuals aligned with multi-step model predictions</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Active Model: {prodModel ? prodModel.modelName.split(' ')[0] : 'None'}</span>
          </div>
        </div>
      </div>

      {/* Control Panel: SKU Selection & Horizon */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* SKU Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-indigo-400" />
            <span>Select Product / SKU</span>
          </label>
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

        {/* Horizon Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Forecast Horizon</span>
            </span>
            <span className="font-mono text-indigo-300 font-semibold">{horizon} Days</span>
          </div>
          <input
            type="range"
            min="7"
            max="28"
            step="7"
            value={horizon}
            onChange={(e) => setHorizon(parseInt(e.target.value, 10))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>7d (1 wk)</span>
            <span>14d (2 wks)</span>
            <span>21d (3 wks)</span>
            <span>28d (Standard M5)</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-end justify-end">
          <button
            onClick={fetchForecast}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Generating...' : 'Refresh Forecast'}</span>
          </button>
        </div>
      </div>

      {/* Missing Dataset Alert or Forecast Display */}
      {error ? (
        <div className="rounded-xl border border-amber-800/80 bg-amber-950/20 p-6 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="text-sm font-semibold text-amber-200">
            Demand Forecast Blocked by Dataset Policy
          </h3>
          <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
            {error}
          </p>
          <div className="text-[11px] font-mono text-slate-400">
            Place authentic M5 files (sales_train_validation.csv, calendar.csv, sell_prices.csv) in <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">./data</code>.
          </div>
        </div>
      ) : forecastData ? (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
              <span className="text-xs text-slate-400">Total Expected Demand ({horizon}d)</span>
              <div className="text-2xl font-bold font-mono text-indigo-300">
                {forecastData.summary?.totalExpectedDemand} <span className="text-xs text-slate-400 font-sans">units</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {forecastData.summary?.confidenceLevel}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
              <span className="text-xs text-slate-400">Average Daily Sales Rate</span>
              <div className="text-2xl font-bold font-mono text-slate-100">
                {forecastData.summary?.averageDailyDemand} <span className="text-xs text-slate-400 font-sans">units/day</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Expected consumption speed
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
              <span className="text-xs text-slate-400">Peak Daily Volume</span>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {forecastData.summary?.peakDaySales} <span className="text-xs text-slate-400 font-sans">units</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Weekend / promotional surge
              </div>
            </div>
          </div>

          {/* Forecast Chart Visualization */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                  <span>Timeline: Historical Sales (28d) vs 28-Day Model Forecast</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Solid bars indicate historical actuals; shaded line indicates model prediction with 95% confidence intervals.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-slate-600" />
                  <span className="text-slate-400">Actuals (M5)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-indigo-500" />
                  <span className="text-indigo-300">Forecast</span>
                </div>
              </div>
            </div>

            {/* Visual SVG Chart */}
            <div className="h-64 w-full pt-4">
              <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                {/* Horizontal reference grids */}
                <line x1="0" y1="50" x2="800" y2="50" stroke="#1f2937" strokeDasharray="3 3" />
                <line x1="0" y1="100" x2="800" y2="100" stroke="#1f2937" strokeDasharray="3 3" />
                <line x1="0" y1="150" x2="800" y2="150" stroke="#1f2937" strokeDasharray="3 3" />
                
                {/* Vertical split line separating historical and future */}
                <line x1="400" y1="10" x2="400" y2="190" stroke="#4f46e5" strokeWidth="1.5" strokeDasharray="4 4" />
                <text x="390" y="25" fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="monospace">Historical Split</text>
                <text x="410" y="25" fill="#818cf8" fontSize="10" textAnchor="start" fontFamily="monospace">Future Horizon →</text>

                {/* Historical Actuals Bars (first 400px) */}
                {forecastData.historicalTimeline?.map((pt: any, idx: number) => {
                  const x = 20 + idx * 13;
                  const height = Math.min(160, pt.actualSales * 15);
                  const y = 180 - height;
                  return (
                    <rect
                      key={`hist_${idx}`}
                      x={x}
                      y={y}
                      width="8"
                      height={height}
                      fill="#475569"
                      rx="1"
                    >
                      <title>{pt.date}: {pt.actualSales} units (Actual)</title>
                    </rect>
                  );
                })}

                {/* Forecast Timeline Line & Upper/Lower Bound Area (next 400px) */}
                {forecastData.forecastTimeline && (
                  <>
                    {/* Confidence Band Area */}
                    <polygon
                      points={
                        forecastData.forecastTimeline.map((pt: any, idx: number) => {
                          const x = 410 + idx * (370 / forecastData.forecastTimeline.length);
                          const y = 180 - Math.min(170, pt.upperBound * 15);
                          return `${x},${y}`;
                        }).join(' ') + ' ' +
                        [...forecastData.forecastTimeline].reverse().map((pt: any, idx: number) => {
                          const revIdx = forecastData.forecastTimeline.length - 1 - idx;
                          const x = 410 + revIdx * (370 / forecastData.forecastTimeline.length);
                          const y = 180 - Math.max(10, pt.lowerBound * 15);
                          return `${x},${y}`;
                        }).join(' ')
                      }
                      fill="#4f46e5"
                      fillOpacity="0.15"
                    />

                    {/* Forecast Main Line */}
                    <polyline
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth="2.5"
                      points={forecastData.forecastTimeline.map((pt: any, idx: number) => {
                        const x = 410 + idx * (370 / forecastData.forecastTimeline.length);
                        const y = 180 - Math.min(160, pt.forecastSales * 15);
                        return `${x},${y}`;
                      }).join(' ')}
                    />

                    {/* Forecast Points */}
                    {forecastData.forecastTimeline.map((pt: any, idx: number) => {
                      const x = 410 + idx * (370 / forecastData.forecastTimeline.length);
                      const y = 180 - Math.min(160, pt.forecastSales * 15);
                      return (
                        <circle
                          key={`fore_${idx}`}
                          cx={x}
                          cy={y}
                          r="3"
                          fill="#818cf8"
                          stroke="#030712"
                          strokeWidth="1.5"
                        >
                          <title>{pt.date}: {pt.forecastSales} units (95% CI: [{pt.lowerBound}, {pt.upperBound}])</title>
                        </circle>
                      );
                    })}
                  </>
                )}
              </svg>
            </div>

            <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800">
              <span>Day -28: 2016-03-28</span>
              <span>Chronological Cutoff: Day d_1913</span>
              <span>Day +{horizon}: 2016-05-22</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
