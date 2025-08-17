import httpx
from typing import Optional, AsyncGenerator
from config.settings import settings
import json

class OllamaService:
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_MODEL
        self.max_tokens = settings.OLLAMA_MAX_TOKENS
        self.temperature = settings.OLLAMA_TEMPERATURE

    async def generate_response(
        self, 
        user_message: str, 
        context: Optional[str] = None
    ) -> str:
        """Generate response using Ollama"""
        
        # Build the prompt with context
        prompt = self._build_prompt(user_message, context)
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": self.temperature,
                        "num_predict": self.max_tokens
                    }
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("response", "I'm sorry, I couldn't generate a response.")
            else:
                return "I'm sorry, there was an error processing your request."

    async def generate_streaming_response(
        self, 
        user_message: str, 
        context: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """Generate streaming response using Ollama"""
        
        # Build the prompt with context
        prompt = self._build_prompt(user_message, context)
        
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": True,
                    "options": {
                        "temperature": self.temperature,
                        "num_predict": self.max_tokens
                    }
                }
            ) as response:
                if response.status_code == 200:
                    async for line in response.aiter_lines():
                        if line.strip():
                            try:
                                data = json.loads(line)
                                if "response" in data:
                                    yield data["response"]
                            except json.JSONDecodeError:
                                continue
                else:
                    yield "I'm sorry, there was an error processing your request."

    def _build_prompt(self, user_message: str, context: Optional[str] = None) -> str:
        """Build the prompt with system context and user message"""
        
        system_prompt = """You are a professional wealth management advisor. You help clients with:
- Investment planning and portfolio management
- Retirement planning
- Tax optimization strategies
- Risk management
- Financial goal setting

Always be professional, knowledgeable, and empathetic. Provide clear, actionable advice while considering the client's financial situation and goals."""

        if context:
            system_prompt += f"\n\nContext: {context}"
        
        return f"{system_prompt}\n\nUser: {user_message}\n\nAssistant:" 