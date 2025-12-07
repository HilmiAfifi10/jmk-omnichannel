# app/main.py
from fastapi import FastAPI
from app.routers import ai
from app.core.config import settings
import uvicorn

app = FastAPI(
    title="Sales Recommendation AI Agent",
    description="AI-driven sales recommendations for omnichannel SaaS",
    version="1.0.0"
)

# Include routers
app.include_router(ai.router)

@app.get("/")
async def root():
    return {
        "message": "Sales Recommendation AI Agent API",
        "version": "1.0.0",
        "endpoints": [
            "/ai/recommendation?store_id=...",
            "/ai/health"
        ]
    }

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )