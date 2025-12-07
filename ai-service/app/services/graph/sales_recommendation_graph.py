from typing import Dict, Any
from langgraph.graph import StateGraph
from app.services.graph.nodes.fetch_node import fetch_product_data_node
from app.services.graph.nodes.rule_engine_node import rule_engine_node
from app.services.graph.nodes.llm_explainer_node import llm_explainer_node

# Define the state structure
class State:
    def __init__(self):
        self.store_id: str = ""
        self.products: list = []
        self.variants: list = []
        self.stock_movements: list = []
        self.product_sales: dict = {}
        self.category_sales: dict = {}
        self.median_stock: float = 0
        self.recommendations: list = []

def create_sales_recommendation_graph():
    """Create the LangGraph for sales recommendations"""
    workflow = StateGraph(State)
    
    # Add nodes
    workflow.add_node("fetch_data", fetch_product_data_node)
    workflow.add_node("rule_engine", rule_engine_node)
    workflow.add_node("llm_explainer", llm_explainer_node)
    
    # Define edges
    workflow.add_edge("fetch_data", "rule_engine")
    workflow.add_edge("rule_engine", "llm_explainer")
    
    # Set entry and end points
    workflow.set_entry_point("fetch_data")
    workflow.set_finish_point("llm_explainer")
    
    return workflow.compile()

async def run_sales_recommendation(store_id: str) -> Dict[str, Any]:
    """
    Run the sales recommendation graph for a specific store
    """
    graph = create_sales_recommendation_graph()
    
    initial_state = {
        "store_id": store_id,
        "products": [],
        "variants": [],
        "stock_movements": [],
        "product_sales": {},
        "category_sales": {},
        "median_stock": 0,
        "recommendations": []
    }
    
    result = await graph.ainvoke(initial_state)
    
    return {
        "summary": result.get("summary", ""),
        "recommendations": result.get("recommendations", [])
    }