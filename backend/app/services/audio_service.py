import os
import tempfile
from typing import Optional
from config.settings import settings
import httpx
import base64

class AudioService:
    def __init__(self):
        self.elevenlabs_api_key = settings.ELEVENLABS_API_KEY
        self.use_local_tts = settings.USE_LOCAL_TTS

    async def text_to_speech(self, text: str, voice_id: str = "21m00Tcm4TlvDq8ikWAM") -> Optional[bytes]:
        """Convert text to speech using ElevenLabs or local TTS"""
        
        if not self.use_local_tts and self.elevenlabs_api_key:
            return await self._elevenlabs_tts(text, voice_id)
        else:
            return None  # Use browser TTS

    async def _elevenlabs_tts(self, text: str, voice_id: str) -> Optional[bytes]:
        """Convert text to speech using ElevenLabs API"""
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
                    headers={
                        "Accept": "audio/mpeg",
                        "Content-Type": "application/json",
                        "xi-api-key": self.elevenlabs_api_key
                    },
                    json={
                        "text": text,
                        "model_id": "eleven_monolingual_v1",
                        "voice_settings": {
                            "stability": 0.5,
                            "similarity_boost": 0.5
                        }
                    }
                )
                
                if response.status_code == 200:
                    return response.content
                else:
                    print(f"ElevenLabs TTS error: {response.text}")
                    return None
                    
        except Exception as e:
            print(f"Error in ElevenLabs TTS: {e}")
            return None

    async def speech_to_text(self, audio_data: bytes) -> Optional[str]:
        """Convert speech to text using Whisper"""
        # TODO: Implement Whisper STT
        pass 