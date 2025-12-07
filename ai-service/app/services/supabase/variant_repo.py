from typing import List, Dict, Any
from app.core.database import get_supabase_client
from supabase import Client

class VariantRepository:
    def __init__(self):
        self.client: Client = get_supabase_client()

    async def get_variants_by_product_ids(self, product_ids: List[str]) -> List[Dict[str, Any]]:
        """Get variants for specific product IDs"""
        try:
            response = (
                self.client.table('ProductVariant')
                .select('id, productId, stock, price, costPrice')
                .in_('productId', product_ids)
                .execute()
            )
            return response.data
        except Exception as e:
            print(f"Error fetching variants: {e}")
            return []