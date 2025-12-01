// Configuration
const SOCKET_URL = 'http://localhost:3000';

// State
let socket = null;
let conversationState = {
    isActive: false,
    isPaused: false,
    currentTurn: null,
    history: [],
    topic: null
};

let llm1Config = {
    provider: 'deepseek',
    apiKey: '',
    model: 'deepseek/deepseek-chat',  // OpenRouter format
    temperature: 0.7,
    maxTokens: 1000,
    systemPrompt: 'You are a helpful AI assistant.'
};

let llm2Config = {
    provider: 'openai',
    apiKey: '',
    model: 'openai/gpt-3.5-turbo',  // OpenRouter format
    temperature: 0.7,
    maxTokens: 1000,
    systemPrompt: 'You are a helpful AI assistant.'
};

let thinking = { llm1: false, llm2: false };

// Initialize Socket.io connection
function initSocket() {
    socket = io(SOCKET_URL);

    socket.on('connect', () => {
        console.log('Connected to server');
        hideError();
        socket.emit('conversation:getState');
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });

    socket.on('conversation:started', (data) => {
        conversationState.isActive = true;
        conversationState.isPaused = false;
        conversationState.currentTurn = data.startingLLM;
        conversationState.history = data.history;
        conversationState.topic = data.topic;
        updateUI();
        hideError();
    });

    socket.on('message:sent', (data) => {
        // Update conversation state
        conversationState.history = data.history;
        conversationState.currentTurn = data.currentTurn;
        thinking[data.userMessage.llmId] = false;
        thinking[data.assistantMessage.llmId] = false;
        updateUI();
        hideError();
        // Note: Auto-continuation is handled on the backend
    });

    socket.on('message:thinking', (data) => {
        thinking[data.llmId] = true;
        updateUI();
    });

    socket.on('conversation:reset', () => {
        conversationState = {
            isActive: false,
            isPaused: false,
            currentTurn: null,
            history: [],
            topic: null
        };
        thinking = { llm1: false, llm2: false };
        updateUI();
        hideError();
    });

    socket.on('conversation:paused', () => {
        conversationState.isPaused = true;
        updateUI();
    });

    socket.on('conversation:resumed', () => {
        conversationState.isPaused = false;
        updateUI();
    });

    socket.on('conversation:state', (data) => {
        conversationState = {
            isActive: data.isActive,
            isPaused: data.isPaused,
            currentTurn: data.currentTurn,
            history: data.history || [],
            topic: data.topic
        };
        updateUI();
    });

    socket.on('error', (data) => {
        showError(data.message || 'An error occurred');
        thinking = { llm1: false, llm2: false };
        updateUI();
    });
}

// Configuration functions
function toggleConfig(llmId) {
    const config = document.getElementById(`${llmId}-config`);
    const icon = document.getElementById(`${llmId}-icon`);
    const isVisible = config.style.display !== 'none';

    config.style.display = isVisible ? 'none' : 'block';
    icon.textContent = isVisible ? '▶' : '▼';
}

function updateConfig(llmId, key, value) {
        // Auto-fix model names for OpenRouter format
        if (key === 'model' && value) {
            const provider = llmId === 'llm1' ? llm1Config.provider : llm2Config.provider;
            
            // If model doesn't have provider prefix, add it
            if (!value.includes('/')) {
                if (provider === 'deepseek') {
                    if (value.startsWith('deepseek-')) {
                        value = `deepseek/${value}`;
                    } else if (value === 'deepseek-chat' || value === 'chat') {
                        value = 'deepseek/deepseek-chat';
                    } else {
                        value = `deepseek/${value}`;
                    }
                } else if (provider === 'openai') {
                    if (value.startsWith('gpt-')) {
                        value = `openai/${value}`;
                    } else if (value.includes('gpt') || value.includes('turbo')) {
                        value = `openai/${value}`;
                    } else {
                        value = `openai/${value}`;
                    }
                }
                
                // Update the input field with corrected value
                const modelInput = document.getElementById(`${llmId}-model`);
                if (modelInput && modelInput.value !== value) {
                    modelInput.value = value;
                }
            }
        }
    
    const config = llmId === 'llm1' ? llm1Config : llm2Config;
    config[key] = value;

    // Update provider badge
    if (key === 'provider') {
        const badge = document.getElementById(`${llmId}-provider-badge`);
        badge.textContent = value;
    }
}

function updateTemperature(llmId, value) {
    updateConfig(llmId, 'temperature', parseFloat(value));
    document.getElementById(`${llmId}-temp-value`).textContent = value;
}

// Conversation functions
function showStartDialog() {
    document.getElementById('start-dialog-overlay').style.display = 'flex';
}

function closeStartDialog() {
    document.getElementById('start-dialog-overlay').style.display = 'none';
    document.getElementById('topic-input').value = '';
}

function startConversation() {
    const topic = document.getElementById('topic-input').value.trim();
    const startingLLM = document.getElementById('starting-llm').value;

    if (!topic) {
        showError('Please enter a conversation topic');
        return;
    }

    if (!llm1Config.apiKey || !llm2Config.apiKey) {
        showError('Please configure API keys for both LLMs');
        return;
    }

    if (!socket || !socket.connected) {
        showError('Not connected to server');
        return;
    }

    socket.emit('conversation:start', {
        topic,
        startingLLM,
        llm1Config,
        llm2Config
    });

    closeStartDialog();
}

function sendMessage(llmId) {
    const input = document.getElementById(`${llmId}-input`);
    const message = input.value.trim();

    if (!message) return;

    if (!socket || !socket.connected) {
        showError('Not connected to server');
        return;
    }

    socket.emit('message:send', { llmId, message });
    input.value = '';
}

function pauseConversation() {
    if (socket) {
        socket.emit('conversation:pause');
    }
}

function resumeConversation() {
    if (socket) {
        socket.emit('conversation:resume');
    }
}

function resetConversation() {
    if (confirm('Are you sure you want to reset the conversation?')) {
        if (socket) {
            socket.emit('conversation:reset');
        }
    }
}

// UI Update functions
function updateUI() {
    // Update topic display
    const topicDisplay = document.getElementById('topic-display');
    const topicText = document.getElementById('topic-text');
    if (conversationState.topic) {
        topicDisplay.style.display = 'block';
        topicText.textContent = conversationState.topic;
    } else {
        topicDisplay.style.display = 'none';
    }

    // Update control buttons
    const startSection = document.getElementById('start-section');
    const controlSection = document.getElementById('control-section');
    const pauseBtn = document.getElementById('pause-btn');
    const resumeBtn = document.getElementById('resume-btn');

    if (conversationState.isActive) {
        startSection.style.display = 'none';
        controlSection.style.display = 'flex';

        if (conversationState.isPaused) {
            pauseBtn.style.display = 'none';
            resumeBtn.style.display = 'inline-block';
        } else {
            pauseBtn.style.display = 'inline-block';
            resumeBtn.style.display = 'none';
        }
    } else {
        startSection.style.display = 'block';
        controlSection.style.display = 'none';
    }

    // Update panels
    updatePanel('llm1');
    updatePanel('llm2');
}

function updatePanel(llmId) {
    const panel = document.getElementById(`${llmId}-panel`);
    const input = document.getElementById(`${llmId}-input`);
    const sendBtn = document.getElementById(`${llmId}-send`);
    const thinkingIndicator = document.getElementById(`${llmId}-thinking`);
    const turnIndicator = document.getElementById(`${llmId}-turn`);
    const pausedIndicator = document.getElementById(`${llmId}-paused`);

    // Update thinking indicator
    thinkingIndicator.style.display = thinking[llmId] ? 'inline-block' : 'none';

    // Update turn indicator
    const isMyTurn = conversationState.currentTurn === llmId && conversationState.isActive && !conversationState.isPaused;
    turnIndicator.style.display = isMyTurn ? 'inline-block' : 'none';

    // Update paused indicator
    pausedIndicator.style.display = conversationState.isPaused ? 'inline-block' : 'none';

    // Update active turn border
    if (isMyTurn) {
        panel.classList.add('active-turn');
    } else {
        panel.classList.remove('active-turn');
    }

    // Update input and send button
    const canSend = conversationState.isActive &&
        !conversationState.isPaused &&
        conversationState.currentTurn === llmId &&
        !thinking[llmId];

    input.disabled = !canSend;
    sendBtn.disabled = !canSend;

    if (!conversationState.isActive) {
        input.placeholder = 'Start a conversation to begin...';
    } else if (conversationState.currentTurn !== llmId) {
        const otherLLM = llmId === 'llm1' ? 'LLM 2' : 'LLM 1';
        input.placeholder = `Waiting for ${otherLLM}...`;
    } else if (conversationState.isPaused) {
        input.placeholder = 'Conversation is paused...';
    } else {
        input.placeholder = 'Type your message...';
    }

    // Update messages
    updateMessages(llmId);
}

function updateMessages(llmId) {
    const messagesContainer = document.getElementById(`${llmId}-messages`);
    const filteredHistory = conversationState.history.filter(
        msg => msg.llmId === llmId || msg.llmId === 'system'
    );

    if (filteredHistory.length === 0) {
        messagesContainer.innerHTML = '<p class="empty-message">No messages yet. Start the conversation to begin!</p>';
        return;
    }

    messagesContainer.innerHTML = filteredHistory.map(msg => {
        const isSystem = msg.llmId === 'system';
        const isOwnMessage = msg.llmId === llmId;
        const isUserMessage = msg.role === 'user';

        let messageClass = 'message';
        if (isSystem) messageClass += ' system';
        else if (isOwnMessage) messageClass += isUserMessage ? ' own user' : ' own assistant';
        else messageClass += isUserMessage ? ' other user' : ' other assistant';

        const roleText = isSystem ? 'System' :
            isUserMessage ? 'User' :
                `LLM ${msg.llmId === 'llm1' ? '1' : '2'}`;

        const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : '';

        let metaHTML = '';
        if (msg.model) {
            const tokens = msg.usage?.total_tokens || 'N/A';
            metaHTML = `<div class="message-meta">Model: ${msg.model} (Tokens: ${tokens})</div>`;
        }

        return `
            <div class="${messageClass}">
                <div class="message-header">
                    <span class="message-role">${roleText}</span>
                    ${time ? `<span class="message-time">${time}</span>` : ''}
                </div>
                <div class="message-content">${escapeHtml(msg.content)}</div>
                ${metaHTML}
            </div>
        `;
    }).join('');

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function toggleExpand(llmId) {
    const panel = document.getElementById(`${llmId}-panel`);
    const content = panel.querySelector('.panel-content');
    const btn = panel.querySelector('.expand-button');

    if (content.classList.contains('expanded')) {
        content.classList.remove('expanded');
        btn.textContent = 'Expand';
    } else {
        content.classList.add('expanded');
        btn.textContent = 'Collapse';
    }
}

// Error handling
function showError(message) {
    const banner = document.getElementById('error-banner');
    const errorMsg = document.getElementById('error-message');
    errorMsg.textContent = message;
    banner.style.display = 'flex';
}

function hideError() {
    document.getElementById('error-banner').style.display = 'none';
}

function closeError() {
    hideError();
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        const activeInput = document.activeElement;
        if (activeInput && activeInput.tagName === 'TEXTAREA' &&
            (activeInput.id === 'llm1-input' || activeInput.id === 'llm2-input')) {
            e.preventDefault();
            const llmId = activeInput.id.replace('-input', '');
            if (!activeInput.disabled) {
                sendMessage(llmId);
            }
        }
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initSocket();
    updateUI();
});

