from fastapi import APIRouter, HTTPException
from app.services.redis_service import redis_service
from app.graph.langgraph_workflow import LangGraphWorkflow
import json

router = APIRouter()
workflow = LangGraphWorkflow()

async def handle_chat_request(channel: str, data: dict, redis_svc):
    """Handle chat request from Redis"""
    try:
        if channel == "chat_request":
            question = data.get("question")
            request_id = data.get("requestId")
            session_id = data.get("sessionId")

            if not question:
                return

            # Run the LangGraph workflow
            result = workflow.run(question)

            # Prepare response
            response = {
                "requestId": request_id,
                "answer": result["answer"],
                "source_document": result["source_document"],
                "page_number": result["page_number"],
                "suggested_questions": result["suggested_questions"]
            }

            # Publish response back to Redis
            await redis_svc.publish("chat_response", response)
    except Exception as e:
        # Publish error response with expected fields
        error_response = {
            "requestId": data.get("requestId"),
            "answer": f"Error: {str(e)}",
            "source_document": None,
            "page_number": None,
            "suggested_questions": []
        }
        await redis_svc.publish("chat_response", error_response)
