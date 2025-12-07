from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any
from app.services.graph.sales_recommendation_graph import run_sales_recommendation

router = APIRouter(prefix="/ai", tags=["AI Recommendations"])

@router.post("/recommendation")
async def get_sales_recommendation(
    store_id: str = Query(..., description="Store ID to analyze")
) -> Dict[str, Any]:
    """
    Get sales recommendations for a specific store
    """
    try:
        if not store_id:
            raise HTTPException(status_code=400, detail="Store ID is required")
        
        result = await run_sales_recommendation(store_id)
        
        return {
            "success": True,
            "data": result
        }
        
    except Exception as e:
        print(f"Error generating recommendations: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error generating recommendations: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy", "service": "AI Sales Recommendation Agent"}