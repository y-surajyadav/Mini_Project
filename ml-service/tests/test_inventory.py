import pytest
from app.inventory.reorder_engine import calculate_inventory_reorder_recommendation

def test_reorder_calculation_exact_formulas():
    # 5-day lead time with daily forecast of 10 units/day
    daily_forecasts = [10.0, 10.0, 10.0, 10.0, 10.0, 15.0, 20.0]
    on_hand = 30.0
    safety_stock = 25.0
    lead_time = 5
    confirmed_inbound = 15.0
    committed_demand = 5.0
    moq = 50
    pack_size = 12

    result = calculate_inventory_reorder_recommendation(
        daily_forecasts=daily_forecasts,
        on_hand_stock=on_hand,
        safety_stock=safety_stock,
        supplier_lead_time_days=lead_time,
        confirmed_inbound=confirmed_inbound,
        committed_demand=committed_demand,
        supplier_moq=moq,
        supplier_pack_size=pack_size
    )

    # 1. ELTD = 10 * 5 = 50
    assert result["expected_lead_time_demand"] == 50.0

    # 2. ROP = ELTD + Safety = 50 + 25 = 75
    assert result["reorder_point"] == 75.0

    # 3. IP = OnHand (30) + Inbound (15) - Committed (5) = 40
    assert result["inventory_position"] == 40.0

    # 4. BaseOrder = max(0, ROP (75) - IP (40)) = 35
    assert result["suggested_base_order_qty"] == 35.0

    # 5. MOQ constraint: max(35, 50) = 50.
    # Pack size rounding: ceil(50 / 12) * 12 = 5 * 12 = 60 units.
    assert result["recommended_final_order_qty"] == 60

    # 6. Risk Level: IP (40) < ROP (75) => HIGH
    assert result["stockout_risk_level"] == "HIGH"
    assert "reorder point" in result["risk_narrative"].lower()

def test_healthy_inventory_no_reorder():
    daily_forecasts = [5.0, 5.0, 5.0]
    on_hand = 100.0
    safety_stock = 10.0
    lead_time = 3

    result = calculate_inventory_reorder_recommendation(
        daily_forecasts=daily_forecasts,
        on_hand_stock=on_hand,
        safety_stock=safety_stock,
        supplier_lead_time_days=lead_time
    )

    # ROP = (5 * 3) + 10 = 25. IP = 100.
    assert result["reorder_point"] == 25.0
    assert result["suggested_base_order_qty"] == 0.0
    assert result["recommended_final_order_qty"] == 0
    assert result["stockout_risk_level"] == "HEALTHY"
