from typing import List, Dict, Any
from datetime import datetime, timedelta
from app.core.database import get_supabase_client
from supabase import Client

class StockMovementRepository:
    def __init__(self):
        self.client: Client = get_supabase_client()

    async def get_stock_movements_for_products(
        self, 
        product_ids: List[str], 
        days: int = 30
    ) -> List[Dict[str, Any]]:
        """Get stock movements for specific products in the last N days"""
        start_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        try:
            response = (
                self.client.table('StockMovement')
                .select('productId, quantity, type, createdAt')
                .in_('productId', product_ids)
                .gte('createdAt', start_date)
                .execute()
            )
            return response.data
        except Exception as e:
            print(f"Error fetching stock movements: {e}")
            return []