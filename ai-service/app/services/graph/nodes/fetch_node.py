from typing import Dict, Any, List
from app.services.supabase.product_repo import ProductRepository
from app.services.supabase.variant_repo import VariantRepository
from app.services.supabase.stock_repo import StockMovementRepository

async def fetch_product_data_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Fetch all product data needed for the recommendation engine
    """
    store_id = state.get("store_id")
    
    product_repo = ProductRepository()
    variant_repo = VariantRepository()
    stock_repo = StockMovementRepository()
    
    # Fetch all products with variants
    products = await product_repo.get_products_with_variants(store_id)
    
    # Extract product IDs for further queries
    product_ids = [product['id'] for product in products]
    
    # Get additional data
    variants = await variant_repo.get_variants_by_product_ids(product_ids)
    stock_movements = await stock_repo.get_stock_movements_for_products(product_ids)
    
    # Calculate sales data
    product_sales = {}
    for product in products:
        sales = await product_repo.get_sales_last_n_days(product['id'])
        product_sales[product['id']] = sales
    
    # Calculate category sales
    category_sales = {}
    for product in products:
        if product['categoryId'] not in category_sales:
            category_sales[product['categoryId']] = await product_repo.get_category_sales_last_n_days(
                product['categoryId']
            )
    
    # Calculate median stock for the store
    median_stock = await product_repo.get_store_median_stock(store_id)
    
    return {
        "products": products,
        "variants": variants,
        "stock_movements": stock_movements,
        "product_sales": product_sales,
        "category_sales": category_sales,
        "median_stock": median_stock
    }