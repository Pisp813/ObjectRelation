import openai
from typing import List, Dict, Any
from app.services.database import DatabaseService
from app.schemas.schemas import SearchResult, SearchResponse, ChatResponse
from app.models.models import ObjectType
import json
import uuid
from datetime import datetime


class AIService:
    def __init__(self, api_key: str):
        self.client = openai.OpenAI(api_key=api_key)

    async def search_objects(self, query: str, db_service: DatabaseService) -> SearchResponse:
        """AI-powered semantic search across objects"""
        # Get all objects for search
        all_objects = db_service.get_objects()
        
        # Use AI to analyze the query and find relevant objects
        prompt = f"""
        Analyze this search query: "{query}"
        
        Available objects:
        {json.dumps([{
            'id': str(obj.id),
            'name': obj.name,
            'description': obj.description,
            'type': obj.type,
            'attributes': obj.attributes
        } for obj in all_objects], indent=2)}
        
        Find the most relevant objects based on the query. Consider object names, descriptions, attributes, and content.
        Return your response as JSON in this format:
        {{
          "results": [
            {{
              "object_id": "string",
              "relevance": number_between_0_and_1,
              "reasoning": "string_explanation"
            }}
          ],
          "query_analysis": "string_explanation_of_what_user_is_looking_for"
        }}
        """

        response = self.client.chat.completions.create(
            model="gpt-5",
            messages=[
                {
                    "role": "system",
                    "content": "You are an intelligent search assistant that helps find relevant objects based on user queries. Respond with JSON only."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            response_format={"type": "json_object"}
        )

        ai_response = json.loads(response.choices[0].message.content or '{}')
        
        # Map AI results to full objects
        search_results = []
        for result in ai_response.get('results', []):
            object_match = next((obj for obj in all_objects if str(obj.id) == result['object_id']), None)
            if object_match:
                search_results.append(SearchResult(
                    object=object_match,
                    relevance=result['relevance'],
                    reasoning=result['reasoning']
                ))

        return SearchResponse(
            results=search_results,
            query=query,
            reasoning=ai_response.get('query_analysis', 'No analysis provided')
        )

    async def chat_with_context(self, message: str, session_id: str, db_service: DatabaseService) -> ChatResponse:
        """AI chat with object context awareness"""
        # Get or create chat session
        try:
            session_uuid = uuid.UUID(session_id)
            session = db_service.get_chat_session(session_uuid)
        except ValueError:
            session = None

        if not session:
            # Create new session
            from app.schemas.schemas import ChatSessionCreate
            session = db_service.create_chat_session(ChatSessionCreate())

        # Get context from objects
        all_objects = db_service.get_objects()
        
        context_prompt = f"""
        You are an AI assistant for an Object Design System. Help users with questions about objects, their relationships, and hierarchies.
        
        Available objects:
        {json.dumps([{
            'id': str(obj.id),
            'name': obj.name,
            'description': obj.description,
            'type': obj.type,
            'attributes': obj.attributes
        } for obj in all_objects], indent=2)}
        
        Previous conversation:
        {json.dumps(session.messages, indent=2)}
        
        Current user message: "{message}"
        
        Provide a helpful response about the objects or system. If the user is asking about specific objects, reference them by name and provide details.
        """

        response = self.client.chat.completions.create(
            model="gpt-5",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful AI assistant for an Object Design System. Provide clear, informative responses about objects, their properties, relationships, and hierarchies."
                },
                {
                    "role": "user",
                    "content": context_prompt
                }
            ]
        )

        assistant_message = response.choices[0].message.content or "I couldn't generate a response."

        # Update session with new messages
        from app.schemas.schemas import ChatMessage, ChatSessionCreate
        
        current_messages = session.messages if isinstance(session.messages, list) else []
        
        updated_messages = current_messages + [
            ChatMessage(
                id=f"{uuid.uuid4()}-{datetime.utcnow().timestamp()}-user",
                role="user",
                content=message,
                timestamp=datetime.utcnow()
            ),
            ChatMessage(
                id=f"{uuid.uuid4()}-{datetime.utcnow().timestamp()}-assistant",
                role="assistant",
                content=assistant_message,
                timestamp=datetime.utcnow()
            )
        ]

        db_service.update_chat_session(session.id, ChatSessionCreate(messages=updated_messages))

        return ChatResponse(
            message=assistant_message,
            sessionId=str(session.id)
        )
