from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from app.core.database import get_supabase_client
from supabase import Client

class ProductRepository:
    def __init__(self):
        self.client: Client = get_supabase_client()

    async def get_products_with_variants(self, store_id: str) -> List[Dict[str, Any]]:
        """Get all products with their variants for a specific store"""
        try:
            response = (
                self.client.table('Product')
                .select('id, name, categoryId, status, variants(id, stock, price, costPrice)')
                .eq('storeId', store_id)
                .eq('status', 'active')
                .execute()
            )
            return response.data
        except Exception as e:
            print(f"Error fetching products: {e}")
            return []

    async def get_sales_last_n_days(self, product_id: str, days: int = 30) -> int:
        """Get total sales for a product in the last N days"""
        start_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        try:
            response = (
                self.client.table('StockMovement')
                .select('quantity')
                .eq('productId', product_id)
                .eq('type', 'SALE')
                .gte('createdAt', start_date)
                .execute()
            )
            
            total_sales = sum(item['quantity'] for item in response.data)
            return total_sales
        except Exception as e:
            print(f"Error fetching sales for product {product_id}: {e}")
            return 0

    async def get_category_sales_last_n_days(self, category_id: str, days: int = 30) -> int:
        """Get total sales for a category in the last N days"""
        start_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        try:
            response = (
                self.client.table('Product')
                .select('id, variants!inner(stockMovements!inner(quantity))')
                .eq('categoryId', category_id)
                .eq('variants.stockMovements.type', 'SALE')
                .gte('variants.stockMovements.createdAt', start_date)
                .execute()
            )
            
            total_sales = 0
            for product in response.data:
                for variant in product.get('variants', []):
                    for movement in variant.get('stockMovements', []):
                        total_sales += movement['quantity']
            
            return total_sales
        except Exception as e:
            print(f"Error fetching category sales: {e}")
            return 0

    async def get_store_median_stock(self, store_id: str) -> float:
        """Get median stock level for a store"""
        try:
            response = (
                self.client.table('Product')
                .select('variants(stock)')
                .eq('storeId', store_id)
                .execute()
            )
            
            all_stocks = []
            for product in response.data:
                for variant in product.get('variants', []):
                    all_stocks.append(variant['stock'])
            
            if not all_stocks:
                return 0
            
            sorted_stocks = sorted(all_stocks)
            n = len(sorted_stocks)
            if n % 2 == 0:
                return (sorted_stocks[n//2 - 1] + sorted_stocks[n//2]) / 2
            else:
                return sorted_stocks[n//2]
        except Exception as e:
            print(f"Error calculating median stock: {e}")
            return 0