from typing import Dict, Any, List
import statistics

async def rule_engine_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Apply business rules to generate recommendation signals
    """
    products = state.get("products", [])
    variants = state.get("variants", [])
    product_sales = state.get("product_sales", {})
    category_sales = state.get("category_sales", {})
    median_stock = state.get("median_stock", 0)
    
    recommendations = []
    
    # Rule 1: SLOW MOVING PRODUCT
    # IF total_sales_last_30_days < 5 AND stock > 20 → recommend bundle
    for product in products:
        product_id = product['id']
        sales = product_sales.get(product_id, 0)
        
        # Calculate total stock for this product across all variants
        product_variants = [v for v in variants if v['productId'] == product_id]
        total_stock = sum(v['stock'] for v in product_variants)
        
        if sales < 5 and total_stock > 20:
            recommendations.append({
                "product_id": product_id,
                "type": "slow_moving",
                "reason": f"Sales {sales} in last 30 days, stock {total_stock}",
                "action": "bundle_with_fast_moving"
            })
    
    # Rule 2: CATEGORY DECLINE
    # IF total_sales(category) down 30% vs previous 30 days → recommend campaign
    # For simplicity, we'll assume we only have current 30-day data
    # In a real implementation, you'd compare with previous period
    for product in products:
        category_id = product['categoryId']
        current_sales = category_sales.get(category_id, 0)
        
        # This is a simplified check - in reality you'd need previous period data
        # For demo purposes, we'll flag categories with low sales
        if current_sales < 10:  # Arbitrary threshold for demo
            recommendations.append({
                "category_id": category_id,
                "type": "category_decline",
                "reason": f"Category sales {current_sales} in last 30 days",
                "action": "recommend_campaign"
            })
    
    # Rule 3: OVERSTOCK
    # IF stock > 3 × median_stock_of_store → recommend clearance_sale
    if median_stock > 0:
        for product in products:
            product_id = product['id']
            product_variants = [v for v in variants if v['productId'] == product_id]
            total_stock = sum(v['stock'] for v in product_variants)
            
            if total_stock > 3 * median_stock:
                recommendations.append({
                    "product_id": product_id,
                    "type": "overstock",
                    "reason": f"Stock {total_stock} exceeds 3x median stock {median_stock}",
                    "action": "clearance_sale"
                })
    
    return {
        "recommendations": recommendations
    }