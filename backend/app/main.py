from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import json
import asyncio
from typing import Dict, List

from app.services.ollama_service import OllamaService
from app.services.audio_service import AudioService
from app.services.knowledge_base_service import KnowledgeBaseService
from app.models.chat_models import ChatMessage, ChatResponse

app = FastAPI(title="WM Interactive Avatar API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for avatar assets
app.mount("/assets", StaticFiles(directory="assets"), name="assets")

# Services
ollama_service = OllamaService()
audio_service = AudioService()
kb_service = KnowledgeBaseService()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Handle different message types
            message_type = message_data.get("type", "text")
            
            if message_type == "text":
                # Process text message with streaming
                await process_text_message_streaming(message_data, websocket)
            elif message_type == "voice_start":
                # Handle voice chat start
                await manager.send_personal_message(
                    json.dumps({"type": "voice_started", "status": "listening"}),
                    websocket
                )
            elif message_type == "voice_stop":
                # Handle voice chat stop
                await manager.send_personal_message(
                    json.dumps({"type": "voice_stopped", "status": "stopped"}),
                    websocket
                )
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)

async def process_text_message_streaming(message_data: Dict, websocket: WebSocket):
    """Process text message and send streaming response"""
    
    try:
        user_message = message_data.get("message", "")
        
        # Check if this is an introduction request
        if user_message == "introduction_request":
            await send_avatar_introduction(websocket)
            return
        
        # Send user message to chat
        await manager.send_personal_message(
            json.dumps({
                "type": "user_message",
                "message": user_message,
                "timestamp": asyncio.get_event_loop().time()
            }),
            websocket
        )
        
        # Get context from knowledge base
        context = kb_service.get_context(user_message)
        
        # Start avatar response
        await manager.send_personal_message(
            json.dumps({
                "type": "avatar_start",
                "status": "talking"
            }),
            websocket
        )
        
        # Generate streaming response
        full_response = ""
        async for chunk in ollama_service.generate_streaming_response(
            user_message=user_message,
            context=context
        ):
            full_response += chunk
            # Send each chunk as it comes
            await manager.send_personal_message(
                json.dumps({
                    "type": "avatar_chunk",
                    "chunk": chunk,
                    "is_streaming": True
                }),
                websocket
            )
        
        # Send final avatar message
        await manager.send_personal_message(
            json.dumps({
                "type": "avatar_message",
                "message": full_response,
                "timestamp": asyncio.get_event_loop().time()
            }),
            websocket
        )
        
        # End avatar response
        await manager.send_personal_message(
            json.dumps({
                "type": "avatar_end",
                "status": "idle"
            }),
            websocket
        )
        
    except Exception as e:
        print(f"Error in process_text_message_streaming: {e}")
        # Send error message to client
        await manager.send_personal_message(
            json.dumps({
                "type": "avatar_message",
                "message": "I'm sorry, there was an error processing your request. Please try again.",
                "timestamp": asyncio.get_event_loop().time()
            }),
            websocket
        )
        await manager.send_personal_message(
            json.dumps({
                "type": "avatar_end",
                "status": "idle"
            }),
            websocket
        )

async def send_avatar_introduction(websocket: WebSocket):
    """Send avatar introduction message"""
    
    introduction_message = """Hey, my name is Max and I am a wealth management advisor. I can help you with onboarding tasks, KYC processes, investment planning, retirement strategies, and much more. How can I assist you today?"""
    
    # Start avatar response
    await manager.send_personal_message(
        json.dumps({
            "type": "avatar_start",
            "status": "talking"
        }),
        websocket
    )
    
    # Send introduction in chunks for streaming effect
    words = introduction_message.split()
    full_response = ""
    
    for i, word in enumerate(words):
        chunk = word + " "
        full_response += chunk
        
        # Send each word as a chunk
        await manager.send_personal_message(
            json.dumps({
                "type": "avatar_chunk",
                "chunk": chunk,
                "is_streaming": True
            }),
            websocket
        )
        
        # Small delay for natural streaming effect
        await asyncio.sleep(0.1)
    
    # Send final avatar message
    await manager.send_personal_message(
        json.dumps({
            "type": "avatar_message",
            "message": full_response.strip(),
            "timestamp": asyncio.get_event_loop().time()
        }),
        websocket
    )
    
    # End avatar response
    await manager.send_personal_message(
        json.dumps({
            "type": "avatar_end",
            "status": "idle"
        }),
        websocket
    )

@app.get("/")
async def root():
    return {"message": "WM Interactive Avatar API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 