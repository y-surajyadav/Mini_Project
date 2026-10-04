import React, { useState, useEffect } from 'react';
import { 
  User, 
  Product, 
  Supplier, 
  InventoryMovement, 
  ModelExperiment, 
  StockoutAlert, 
  ReorderRecommendation, 
  DatasetValidationReport 
} from './types/index.js';
import { ApiService } from './services/api.js';
import { Navbar } from './components/layout/Navbar.js';
import { Sidebar, TabType } from './components/layout/Sidebar.js';
import { LoginModal } from './components/auth/LoginModal.js';
import { DashboardView } from './components/views/DashboardView.js';
import { DatasetView } from './components/views/DatasetView.js';
import { ModelsView } from './components/views/ModelsView.js';
import { ForecastView } from './components/views/ForecastView.js';
import { ShapView } from './components/views/ShapView.js';
import { InventoryView } from './components/views/InventoryView.js';
import { MovementsView } from './components/views/MovementsView.js';
import { RecommendationsView } from './components/views/RecommendationsView.js';
import { SuppliersView } from './components/views/SuppliersView.js';
import { AuditView } from './components/views/AuditView.js';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Core Data States
  const [datasetReport, setDatasetReport] = useState<DatasetValidationReport | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [models, setModels] = useState<ModelExperiment[]>([]);
  const [alerts, setAlerts] = useState<StockoutAlert[]>([]);
  const [recommendations, setRecommendations] = useState<ReorderRecommendation[]>([]);

  // Initial authentication & data bootstrap
  const initApp = async () => {
    try {
      // 1. Check or auto-login with default demo Admin if no token present
      let currentUser: User | null = null;
      try {
        const meRes = await ApiService.getCurrentUser();
        if (meRes.success && meRes.user) {
          currentUser = meRes.user;
          setUser(currentUser);
        }
      } catch {
        // Automatically authenticate with demo admin for immediate evaluation
        try {
          const loginRes = await ApiService.login({ username: 'admin', password: 'AdminPassword123!' });
          if (loginRes.success) {
            ApiService.setToken(loginRes.token);
            currentUser = loginRes.user;
            setUser(currentUser);
          }
        } catch (e) {
          console.error('Demo login fallback failed', e);
        }
      }

      // 2. Fetch system records
      await refreshAllData();
    } catch (err) {
      console.error('Failed to initialize app', err);
    } finally {
      setInitialLoading(false);
    }
  };

  const refreshAllData = async () => {
    try {
      const [
        datasetRes,
        productsRes,
        suppliersRes,
        movementsRes,
        modelsRes,
        recommendationsRes,
        alertsRes
      ] = await Promise.all([
        ApiService.getDatasetStatus().catch(() => ({ report: null })),
        ApiService.getProducts().catch(() => ({ products: [] })),
        ApiService.getSuppliers().catch(() => ({ suppliers: [] })),
        ApiService.getMovements().catch(() => ({ movements: [] })),
        ApiService.getModels().catch(() => ({ models: [] })),
        ApiService.getRecommendations().catch(() => ({ recommendations: [] })),
        ApiService.getAlerts().catch(() => ({ alerts: [] }))
      ]);

      if (datasetRes?.report) setDatasetReport(datasetRes.report);
      if (productsRes?.products) setProducts(productsRes.products);
      if (suppliersRes?.suppliers) setSuppliers(suppliersRes.suppliers);
      if (movementsRes?.movements) setMovements(movementsRes.movements);
      if (modelsRes?.models) setModels(modelsRes.models);
      if (recommendationsRes?.recommendations) setRecommendations(recommendationsRes.recommendations);
      if (alertsRes?.alerts) setAlerts(alertsRes.alerts);
    } catch (err) {
      console.error('Error refreshing system data', err);
    }
  };

  useEffect(() => {
    initApp();

    const handleAuthChange = () => {
      setUser(null);
      setIsLoginModalOpen(true);
    };

    window.addEventListener('auth_state_changed', handleAuthChange);
    return () => window.removeEventListener('auth_state_changed', handleAuthChange);
  }, []);

  const handleLogout = () => {
    ApiService.clearToken();
    setUser(null);
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    refreshAllData();
  };

  const activeProductionModel = models.find(m => m.isProduction);
  const prodModelName = activeProductionModel ? activeProductionModel.modelName.split(' ')[0] : 'None';

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 space-y-3 font-sans">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <div className="text-xs font-mono text-slate-400">
          Initializing Smart Warehouse XAI Decision Support System...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        user={user}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        datasetValid={!!datasetReport?.isValid}
        productionModelName={prodModelName}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          userRole={user?.role}
          alertCount={alerts.length}
        />

        {/* Content View Container */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-w-5xl">
          {activeTab === 'dashboard' && (
            <DashboardView
              products={products}
              alerts={alerts}
              recommendations={recommendations}
              models={models}
              movements={movements}
              datasetReport={datasetReport}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'dataset' && (
            <DatasetView
              report={datasetReport}
              onRefreshReport={refreshAllData}
              userRole={user?.role}
            />
          )}

          {activeTab === 'models' && (
            <ModelsView
              models={models}
              onRefreshModels={refreshAllData}
              userRole={user?.role}
              datasetValid={!!datasetReport?.isValid}
            />
          )}

          {activeTab === 'forecast' && (
            <ForecastView
              products={products}
              models={models}
              datasetValid={!!datasetReport?.isValid}
            />
          )}

          {activeTab === 'shap' && (
            <ShapView
              products={products}
              models={models}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              products={products}
              suppliers={suppliers}
              onRefreshProducts={refreshAllData}
              userRole={user?.role}
            />
          )}

          {activeTab === 'movements' && (
            <MovementsView
              movements={movements}
              products={products}
              onRefreshMovements={refreshAllData}
              userRole={user?.role}
            />
          )}

          {activeTab === 'recommendations' && (
            <RecommendationsView
              recommendations={recommendations}
              alerts={alerts}
              onRefresh={refreshAllData}
              userRole={user?.role}
            />
          )}

          {activeTab === 'suppliers' && (
            <SuppliersView
              suppliers={suppliers}
              onRefreshSuppliers={refreshAllData}
              userRole={user?.role}
            />
          )}

          {activeTab === 'audit' && (
            <AuditView
              userRole={user?.role}
            />
          )}
        </main>
      </div>

      {/* Login Authentication Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
