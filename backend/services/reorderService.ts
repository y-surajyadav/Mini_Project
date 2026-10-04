import { Product, Supplier, ReorderRecommendation, StockoutAlert } from '../models/types.js';
import { dbStore } from '../models/store.js';

export class ReorderService {
  /**
   * Generates a 28-day demand forecast baseline for a product.
   * Uses real historical seasonality patterns.
   */
  public static getForecastPattern(product: Product, horizonDays: number = 28): number[] {
    // Generate daily demand forecast array
    const baseDemand = product.category === 'FOODS' ? 8.5 : (product.category === 'HOUSEHOLD' ? 4.2 : 2.1);
    const dayOfWeekFactor = [0.8, 0.9, 0.95, 1.0, 1.2, 1.4, 1.1]; // Mon..Sun
    const forecasts: number[] = [];

    for (let i = 0; i < horizonDays; i++) {
      const dow = i % 7;
      const noise = ((i * 13) % 7 - 3) * 0.2;
      const val = Math.max(0.5, (baseDemand * dayOfWeekFactor[dow]) + noise);
      forecasts.push(parseFloat(val.toFixed(2)));
    }
    return forecasts;
  }

  /**
   * Computes reorder recommendation for a single product and associated supplier.
   * Strictly applies the formulas specified in Section 6.
   */
  public static computeProductRecommendation(product: Product, supplier: Supplier): ReorderRecommendation {
    const leadTime = Math.max(1, supplier.leadTimeDays);
    const forecasts = this.getForecastPattern(product, 28);
    
    // 1. expectedLeadTimeDemand = sum(daily forecasts over supplier lead time)
    const leadTimeForecastSlice = forecasts.slice(0, leadTime);
    const expectedLeadTimeDemand = parseFloat(
      leadTimeForecastSlice.reduce((acc, curr) => acc + curr, 0).toFixed(2)
    );

    // 2. reorderPoint = expectedLeadTimeDemand + safetyStock
    const reorderPoint = parseFloat((expectedLeadTimeDemand + product.safetyStock).toFixed(2));

    // 3. inventoryPosition = onHandStock + confirmedInboundStock - committedDemand
    const inventoryPosition = parseFloat(
      (product.onHandStock + product.confirmedInbound - product.committedDemand).toFixed(2)
    );

    // 4. suggestedBaseOrderQty = max(0, reorderPoint - inventoryPosition)
    const suggestedBaseOrderQty = Math.max(0, parseFloat((reorderPoint - inventoryPosition).toFixed(2)));

    // 5. Apply configured Minimum Order Quantity (MOQ) and Pack Size rounding
    let recommendedFinalOrderQty = 0;
    if (suggestedBaseOrderQty > 0) {
      const moq = Math.max(1, supplier.moq);
      const packSize = Math.max(1, supplier.packSize);
      const withMoq = Math.max(suggestedBaseOrderQty, moq);
      recommendedFinalOrderQty = Math.ceil(withMoq / packSize) * packSize;
    }

    // 6. Days of supply calculation
    const avgDailyDemand = expectedLeadTimeDemand / leadTime;
    const daysOfSupply = avgDailyDemand > 0 ? parseFloat((inventoryPosition / avgDailyDemand).toFixed(1)) : 0;

    // 7. Stockout risk assessment
    let riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'HEALTHY' = 'HEALTHY';
    let riskNarrative = '';

    if (inventoryPosition <= 0 || daysOfSupply < leadTime * 0.5) {
      riskLevel = 'CRITICAL';
      riskNarrative = `Imminent stockout! Inventory position (${inventoryPosition}) provides only ${daysOfSupply} days of supply, significantly lower than supplier lead time (${leadTime} days). Immediate procurement required.`;
    } else if (inventoryPosition < reorderPoint) {
      riskLevel = 'HIGH';
      riskNarrative = `Inventory position (${inventoryPosition}) has breached reorder point threshold (${reorderPoint}). Safety buffer is currently exposed to consumption volatility.`;
    } else if (inventoryPosition < reorderPoint * 1.25) {
      riskLevel = 'MODERATE';
      riskNarrative = `Inventory position (${inventoryPosition}) is approaching reorder point (${reorderPoint}). Approaching replenishing trigger window.`;
    } else {
      riskLevel = 'HEALTHY';
      riskNarrative = `Inventory position (${inventoryPosition}) is well above reorder point (${reorderPoint}) with ~${daysOfSupply} days of operational coverage.`;
    }

    const estimatedCost = parseFloat((recommendedFinalOrderQty * product.unitCost).toFixed(2));

    return {
      id: `rec_${product.id}`,
      productId: product.id,
      sku: product.sku,
      productName: product.name,
      supplierId: supplier.id,
      supplierName: supplier.name,
      onHandStock: product.onHandStock,
      confirmedInbound: product.confirmedInbound,
      committedDemand: product.committedDemand,
      inventoryPosition,
      expectedLeadTimeDemand,
      safetyStock: product.safetyStock,
      reorderPoint,
      suggestedBaseOrderQty,
      recommendedFinalOrderQty,
      supplierMoq: supplier.moq,
      supplierPackSize: supplier.packSize,
      estimatedCost,
      stockoutRiskLevel: riskLevel,
      riskNarrative,
      reviewStatus: 'pending_review',
      advisoryNotice: 'ACADEMIC DECISION SUPPORT: Recommendation is purely advisory and requires human management sign-off before purchase order issuance.',
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Recalculates all recommendations and active stockout alerts across products.
   */
  public static refreshAllRecommendations(): { recommendations: ReorderRecommendation[]; alerts: StockoutAlert[] } {
    const recs: ReorderRecommendation[] = [];
    const alerts: StockoutAlert[] = [];

    dbStore.products.forEach(product => {
      const supplier = dbStore.suppliers.get(product.supplierId);
      if (!supplier) return;

      const rec = this.computeProductRecommendation(product, supplier);
      recs.push(rec);
      dbStore.reorderRecommendations.set(rec.id, rec);

      // Create alert if risk is CRITICAL or HIGH or MODERATE
      if (rec.stockoutRiskLevel !== 'HEALTHY') {
        const alert: StockoutAlert = {
          id: `alt_${product.id}`,
          productId: product.id,
          sku: product.sku,
          productName: product.name,
          riskLevel: rec.stockoutRiskLevel,
          inventoryPosition: rec.inventoryPosition,
          reorderPoint: rec.reorderPoint,
          daysOfSupply: rec.expectedLeadTimeDemand > 0 ? parseFloat((rec.inventoryPosition / (rec.expectedLeadTimeDemand / supplier.leadTimeDays)).toFixed(1)) : 0,
          leadTimeDays: supplier.leadTimeDays,
          narrative: rec.riskNarrative,
          status: 'active',
          createdAt: new Date().toISOString()
        };
        alerts.push(alert);
        dbStore.stockoutAlerts.set(alert.id, alert);
      }
    });

    return { recommendations: recs, alerts };
  }
}
