import math
from typing import Dict, Any, List

def calculate_inventory_reorder_recommendation(
    daily_forecasts: List[float],
    on_hand_stock: float,
    safety_stock: float,
    supplier_lead_time_days: int,
    confirmed_inbound: float = 0.0,
    committed_demand: float = 0.0,
    supplier_moq: int = 1,
    supplier_pack_size: int = 1
) -> Dict[str, Any]:
    lead_time = max(1, int(supplier_lead_time_days))
    
    forecast_window = daily_forecasts[:lead_time]
    if len(forecast_window) < lead_time and daily_forecasts:
        mean_val = sum(daily_forecasts) / len(daily_forecasts)
        expected_lead_time_demand = sum(forecast_window) + mean_val * (lead_time - len(forecast_window))
    else:
        expected_lead_time_demand = sum(forecast_window) if forecast_window else 0.0
        
    expected_lead_time_demand = round(float(expected_lead_time_demand), 2)
    reorder_point = round(float(expected_lead_time_demand + safety_stock), 2)
    inventory_position = round(float(on_hand_stock + confirmed_inbound - committed_demand), 2)
    base_order_qty = max(0.0, float(reorder_point - inventory_position))
    
    moq = max(1, int(supplier_moq))
    pack_size = max(1, int(supplier_pack_size))
    
    if base_order_qty > 0:
        constrained_qty = max(base_order_qty, float(moq))
        rounded_order_qty = int(math.ceil(constrained_qty / pack_size) * pack_size)
    else:
        rounded_order_qty = 0
        
    avg_daily_demand = (sum(daily_forecasts) / len(daily_forecasts)) if daily_forecasts else 1.0
    days_of_supply = round(inventory_position / max(0.1, avg_daily_demand), 1) if inventory_position > 0 else 0.0
    
    if inventory_position <= 0 or days_of_supply < (lead_time * 0.5):
        risk_level = "CRITICAL"
        risk_color = "red"
        risk_narrative = f"Immediate stockout imminent! Current inventory position ({inventory_position}) provides only {days_of_supply} days of supply vs {lead_time} days supplier lead time."
    elif inventory_position < reorder_point:
        risk_level = "HIGH"
        risk_color = "amber"
        risk_narrative = f"Inventory position ({inventory_position}) has breached reorder point ({reorder_point}). Order placement recommended to prevent disruption."
    elif inventory_position < (reorder_point * 1.25):
        risk_level = "MODERATE"
        risk_color = "yellow"
        risk_narrative = f"Stock level ({inventory_position}) approaching reorder threshold ({reorder_point}). Maintain active monitoring."
    else:
        risk_level = "HEALTHY"
        risk_color = "emerald"
        risk_narrative = f"Stock level ({inventory_position}) is healthy with approximately {days_of_supply} days of supply."
        
    return {
        "expected_lead_time_demand": expected_lead_time_demand,
        "reorder_point": reorder_point,
        "inventory_position": inventory_position,
        "suggested_base_order_qty": round(base_order_qty, 2),
        "recommended_final_order_qty": rounded_order_qty,
        "supplier_moq": moq,
        "supplier_pack_size": pack_size,
        "supplier_lead_time_days": lead_time,
        "days_of_supply": days_of_supply,
        "stockout_risk_level": risk_level,
        "risk_color": risk_color,
        "risk_narrative": risk_narrative,
        "calculation_formula": "ROP = ExpectedLeadTimeDemand + SafetyStock; IP = OnHand + Inbound - Committed; FinalQty = ceil(max(ROP - IP, MOQ) / PackSize) * PackSize",
        "advisory_disclaimer": "This is an academic decision-support calculation. Purchase orders must be reviewed and authorized by human management; orders are never placed automatically."
    }
