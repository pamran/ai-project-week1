from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import os
from dotenv import load_dotenv
from services.deepseek_service import DeepSeekService
from services.openai_service import OpenAIService
from models.conversation import ConversationManager

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize conversation manager
conversation_manager = ConversationManager(socketio)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"})

@app.route('/api/health', methods=['GET'])
def api_health():
    return jsonify({"status": "ok"})

@socketio.on('connect')
def handle_connect():
    print(f'Client connected: {request.sid}')
    emit('connected', {'message': 'Connected to server'})

@socketio.on('disconnect')
def handle_disconnect():
    print(f'Client disconnected: {request.sid}')

@socketio.on('conversation:start')
def handle_conversation_start(data):
    try:
        topic = data.get('topic')
        starting_llm = data.get('startingLLM')
        llm1_config = data.get('llm1Config')
        llm2_config = data.get('llm2Config')
        
        conversation_manager.start_conversation(
            topic, starting_llm, llm1_config, llm2_config
        )
        
        emit('conversation:started', {
            'topic': topic,
            'startingLLM': starting_llm,
            'history': conversation_manager.get_history()
        })
    except Exception as e:
        emit('error', {'message': str(e)})

@socketio.on('message:send')
def handle_message_send(data):
    try:
        llm_id = data.get('llmId')
        message = data.get('message')
        
        conversation_manager.send_message(llm_id, message)
    except Exception as e:
        emit('error', {'message': str(e)})

@socketio.on('conversation:reset')
def handle_conversation_reset():
    conversation_manager.reset()
    socketio.emit('conversation:reset')

@socketio.on('conversation:pause')
def handle_conversation_pause():
    conversation_manager.pause()
    socketio.emit('conversation:paused')

@socketio.on('conversation:resume')
def handle_conversation_resume():
    conversation_manager.resume()
    socketio.emit('conversation:resumed')

@socketio.on('conversation:getState')
def handle_get_state():
    emit('conversation:state', {
        'isActive': conversation_manager.get_is_active(),
        'isPaused': conversation_manager.get_is_paused(),
        'currentTurn': conversation_manager.get_current_turn(),
        'history': conversation_manager.get_history(),
        'topic': conversation_manager.get_topic()
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 3000))
    socketio.run(app, host='0.0.0.0', port=port, debug=True, allow_unsafe_werkzeug=True)

