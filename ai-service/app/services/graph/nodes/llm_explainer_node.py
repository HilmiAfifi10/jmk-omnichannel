import os
from typing import Dict, Any, List
from openai import AsyncOpenAI
from app.core.config import settings

async def llm_explainer_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Use LLM to explain recommendations in natural language
    """
    recommendations = state.get("recommendations", [])
    
    if not recommendations:
        return {
            "summary": "No specific recommendations at this time. Your store performance looks good!",
            "recommendations": []
        }
    
    # Prepare the prompt for the LLM
    prompt = f"""
    You are a sales recommendation expert. Based on the following raw signals from our sales analysis system, 
    please provide a clear, actionable summary and detailed recommendations for the seller.

    Raw signals:
    {recommendations}

    Please provide:
    1. A brief summary of the key findings
    2. Detailed recommendations in natural language
    3. Actionable steps the seller can take

    Format your response as a summary and a list of recommendations with explanations.
    """
    
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    
    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert sales advisor providing actionable recommendations to sellers based on data analysis."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        llm_output = response.choices[0].message.content
        
        # For now, we'll return the raw LLM output as summary
        # In a real implementation, you might want to parse this into structured data
        return {
            "summary": llm_output,
            "recommendations": recommendations
        }
        
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        # Fallback response if LLM fails
        return {
            "summary": "Analysis complete. Please review the recommendations below.",
            "recommendations": recommendations
        }