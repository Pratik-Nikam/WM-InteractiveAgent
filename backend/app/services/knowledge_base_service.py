import json
import os
from typing import Dict, List, Optional
from config.settings import settings

class KnowledgeBaseService:
    def __init__(self):
        self.kb_path = settings.KNOWLEDGE_BASE_PATH
        self._load_knowledge_base()

    def _load_knowledge_base(self):
        """Load knowledge base from files"""
        self.personas = self._load_json("personas/wealth_advisor.json")
        self.rules = self._load_json("rules/conversation_rules.json")
        self.prompts = self._load_json("prompts/greeting_prompts.json")

    def _load_json(self, file_path: str) -> Dict:
        """Load JSON file from knowledge base"""
        full_path = os.path.join(self.kb_path, file_path)
        try:
            with open(full_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {}

    def get_context(self, user_message: str) -> str:
        """Get relevant context for the user message"""
        # Simple keyword-based context retrieval
        # TODO: Implement more sophisticated context retrieval
        
        context_parts = []
        
        # Add persona information
        if self.personas:
            context_parts.append(f"Persona: {self.personas.get('description', '')}")
        
        # Add relevant rules
        if self.rules:
            context_parts.append(f"Rules: {self.rules.get('general', '')}")
        
        return " ".join(context_parts)

    def get_greeting(self) -> str:
        """Get appropriate greeting based on context"""
        if self.prompts and "greetings" in self.prompts:
            import random
            return random.choice(self.prompts["greetings"])
        return "Hello! I'm your wealth management advisor. How can I help you today?" 