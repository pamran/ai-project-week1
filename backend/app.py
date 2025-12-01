from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import os
import logging
from dotenv import load_dotenv
from services.deepseek_service import DeepSeekService
from services.openai_service import OpenAIService
from models.conversation import ConversationManager
from utils.logger import setup_logger

load_dotenv()

# Setup logging
logger = setup_logger('dual_llm_app', logging.INFO)
logger.info("="*60)
logger.info("Starting Dual LLM Conversation System")
logger.info("="*60)

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", logger=True, engineio_logger=True)

# Initialize conversation manager
conversation_manager = ConversationManager(socketio, logger)

@app.route('/health', methods=['GET'])
def health_check():
    logger.debug(f"Health check requested from {request.remote_addr}")
    return jsonify({"status": "ok"})

@app.route('/api/health', methods=['GET'])
def api_health():
    logger.debug(f"API health check requested from {request.remote_addr}")
    return jsonify({"status": "ok"})

@socketio.on('connect')
def handle_connect():
    logger.info(f"Client connected: {request.sid} from {request.remote_addr}")
    emit('connected', {'message': 'Connected to server'})

@socketio.on('disconnect')
def handle_disconnect():
    logger.info(f"Client disconnected: {request.sid}")

@socketio.on('conversation:start')
def handle_conversation_start(data):
    try:
        topic = data.get('topic')
        starting_llm = data.get('startingLLM')
        llm1_config = data.get('llm1Config')
        llm2_config = data.get('llm2Config')
        
        logger.info(f"Starting conversation - Topic: '{topic}', Starting LLM: {starting_llm}")
        logger.debug(f"LLM1 Config - Provider: {llm1_config.get('provider')}, Model: {llm1_config.get('model')}")
        logger.debug(f"LLM2 Config - Provider: {llm2_config.get('provider')}, Model: {llm2_config.get('model')}")
        
        conversation_manager.start_conversation(
            topic, starting_llm, llm1_config, llm2_config
        )
        
        logger.info(f"Conversation started successfully - Topic: '{topic}'")
        
        emit('conversation:started', {
            'topic': topic,
            'startingLLM': starting_llm,
            'history': conversation_manager.get_history()
        })
    except Exception as e:
        logger.error(f"Failed to start conversation: {str(e)}", exc_info=True)
        emit('error', {'message': str(e)})

@socketio.on('message:send')
def handle_message_send(data):
    try:
        llm_id = data.get('llmId')
        message = data.get('message')
        
        logger.info(f"Message received from {llm_id} - Length: {len(message)} chars")
        logger.debug(f"Message content: {message[:100]}..." if len(message) > 100 else f"Message content: {message}")
        
        conversation_manager.send_message(llm_id, message)
        
        logger.info(f"Message processed successfully for {llm_id}")
    except Exception as e:
        logger.error(f"Failed to send message from {llm_id}: {str(e)}", exc_info=True)
        emit('error', {'message': str(e)})

@socketio.on('conversation:reset')
def handle_conversation_reset():
    logger.info("Conversation reset requested")
    conversation_manager.reset()
    socketio.emit('conversation:reset')
    logger.info("Conversation reset completed")

@socketio.on('conversation:pause')
def handle_conversation_pause():
    logger.info("Conversation pause requested")
    conversation_manager.pause()
    socketio.emit('conversation:paused')
    logger.info("Conversation paused")

@socketio.on('conversation:resume')
def handle_conversation_resume():
    logger.info("Conversation resume requested")
    conversation_manager.resume()
    socketio.emit('conversation:resumed')
    logger.info("Conversation resumed")

@socketio.on('conversation:getState')
def handle_get_state():
    logger.debug("Conversation state requested")
    emit('conversation:state', {
        'isActive': conversation_manager.get_is_active(),
        'isPaused': conversation_manager.get_is_paused(),
        'currentTurn': conversation_manager.get_current_turn(),
        'history': conversation_manager.get_history(),
        'topic': conversation_manager.get_topic()
    })

if __name__ == '__main__':
    import logging
    port = int(os.getenv('PORT', 3000))
    logger.info(f"Starting server on port {port}")
    logger.info(f"Environment: {'Development' if os.getenv('FLASK_ENV') == 'development' else 'Production'}")
    socketio.run(app, host='0.0.0.0', port=port, debug=True, allow_unsafe_werkzeug=True)

