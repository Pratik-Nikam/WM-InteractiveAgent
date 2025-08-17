# WM Interactive Avatar

A custom interactive avatar system for wealth management, built without HeyGen dependencies.

## Features

- 💬 Real-time voice and text chat
- 🧠 Local LLM integration (Ollama)
- 📚 Customizable knowledge base
- 🎯 Wealth management specific persona
- 🎮 Easy configuration management

## Prerequisites

1. **Python 3.8+**
2. **Node.js 16+**
3. **Ollama** installed and running locally
4. **Your preferred LLM model** (e.g., llama2, mistral, etc.)

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env with your settings
# - Set your preferred Ollama model
# - Configure other settings as needed

# Run the backend
python run.py
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Add Your Avatar Image

1. Place your avatar image in `frontend/public/assets/avatar.jpeg`
2. The image should be a professional headshot (head and shoulders)
3. Recommended size: 400x400 pixels or larger

### 4. Configure Ollama

1. Install Ollama: https://ollama.ai/
2. Pull your preferred model:
   ```bash
   ollama pull llama2
   # or
   ollama pull mistral
   # or any other model you prefer
   ```
3. Update the model name in `backend/.env`

## Configuration

### Backend Configuration (`backend/.env`)

```env
# Ollama Settings
OLLAMA_MODEL=llama2          # Your preferred model
OLLAMA_MAX_TOKENS=1000       # Maximum response length
OLLAMA_TEMPERATURE=0.7       # Response creativity (0.0-1.0)

# Audio Settings
USE_LOCAL_TTS=true          # Use browser TTS (free)
ELEVENLABS_API_KEY=         # Optional: for better TTS quality

# Avatar Settings
AVATAR_NAME=Wealth Manager
```

### Knowledge Base Customization

Edit the files in `backend/knowledge_base/` to customize:

- **Personas**: `personas/wealth_advisor.json`
- **Rules**: `rules/conversation_rules.json`
- **Prompts**: `prompts/greeting_prompts.json`

## Usage

1. Start the backend: `python run.py`
2. Start the frontend: `npm run dev`
3. Open http://localhost:5173
4. Click "Start Voice Chat" or type messages
5. The avatar will respond using your configured LLM

## Architecture

```
Frontend (React + Vite)
├── Real-time WebSocket communication
├── Web Speech API for TTS
├── Voice recording capabilities
└── Responsive UI

Backend (FastAPI)
├── WebSocket endpoints
├── Ollama integration
├── Knowledge base management
└── Audio processing

Knowledge Base
├── Personas (wealth advisor profiles)
├── Rules (conversation guidelines)
├── Prompts (greetings, responses)
└── Database (financial data)
```

## Customization

### Adding New Avatars

1. Add avatar image to `frontend/public/assets/`
2. Update `AvatarVideo.tsx` to use the new image
3. Customize persona in knowledge base

### Modifying LLM Behavior

1. Edit `backend/app/services/ollama_service.py`
2. Modify the system prompt
3. Adjust temperature and token settings

### Adding New Knowledge

1. Add files to `backend/knowledge_base/`
2. Update `KnowledgeBaseService` to load new data
3. Modify context retrieval logic

## Troubleshooting

### Common Issues

1. **Ollama not responding**
   - Check if Ollama is running: `ollama list`
   - Verify model is installed: `ollama pull your-model`

2. **WebSocket connection failed**
   - Ensure backend is running on port 8000
   - Check firewall settings

3. **Audio not working**
   - Check browser permissions for microphone
   - Try different browser (Chrome recommended)

### Logs

- Backend logs: Check terminal running `python run.py`
- Frontend logs: Check browser developer console

## Next Steps

1. **Lip-sync Implementation**: Integrate SadTalker or similar AI
2. **Enhanced Audio**: Add ElevenLabs TTS for better quality
3. **Voice Recognition**: Implement Whisper STT
4. **Avatar Animation**: Add more dynamic expressions
5. **Knowledge Base**: Expand with more financial data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Complete Setup Instructions

Now you have a complete custom interactive avatar system! Here's what to do:

### 1. **Set up the project structure**
All the files are now created in your `WM-InteractiveAvatar` folder.

### 2. **Install Ollama**
```bash
# Download and install from https://ollama.ai/
# Then pull a model:
ollama pull llama2
```

### 3. **Start the backend**
```bash
cd WM-InteractiveAvatar/backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
python run.py
```

### 4. **Start the frontend**
```bash
cd WM-InteractiveAvatar/frontend
npm install
npm run dev
```

### 5. **Add your avatar image**
Place your professional headshot in `frontend/public/assets/avatar.jpeg`

### 6. **Configure settings**
Edit `backend/.env` to set your preferred Ollama model and other settings.

The system is now ready to use! The avatar will:
- Use your professional headshot
- Respond with wealth management expertise
- Support both voice and text chat
- Use your local LLM via Ollama
- Have a customizable knowledge base

Would you like me to help you with any specific part of the setup or explain any component in more detail? 