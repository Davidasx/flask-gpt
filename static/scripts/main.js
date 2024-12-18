// Preload avatars
const userAvatar = new Image();
userAvatar.src = "static/images/user.svg";

let isBotResponding = false;

function scrollToBottom() {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function saveMessages() {
    const chatMessages = [];
    const storedModel = localStorage.getItem('model');
    const modelName = storedModel === 'custom' ?
        localStorage.getItem('custom-model') :
        storedModel;

    document.querySelectorAll('.message').forEach(message => {
        if (message.classList.contains('user')) {
            chatMessages.push({
                role: 'user',
                content: message.getAttribute('data-content')
            });
        } else {
            chatMessages.push({
                role: `assistant-${modelName}`,
                content: message.getAttribute('data-content')
            });
        }
    });
    localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
}

function loadMessages() {
    const chatMessages = JSON.parse(localStorage.getItem('chatMessages'));
    if (chatMessages) {
        chatMessages.forEach(msg => {
            if (msg.role === 'user') {
                simulateUserMessage(msg.content);
            } else {
                simulateBotMessage(msg.content, msg.role);
            }
        });

        scrollToBottom();
    }
}

function simulateUserMessage(content) {
    const userMessage = document.createElement('div');
    userMessage.className = 'message user';
    userMessage.setAttribute('data-content', content);
    userMessage.innerHTML = `<div class="bubble">${formatMessage(content)}</div><img src="${userAvatar.src}" alt="User Avatar">`;
    document.getElementById('chat-messages').appendChild(userMessage);
}

function getModelAvatar(role) {
    if (!role.startsWith('assistant-')) {
        return 'static/images/openai.svg';
    }
    const modelName = role.substring(10).toLowerCase();

    if (modelName.includes('gpt') || modelName.includes('o1')) {
        return 'static/images/openai.svg';
    } else if (modelName.includes('claude')) {
        return 'static/images/anthropic.svg';
    } else if (modelName.includes('gemini')) {
        return 'static/images/gemini.svg';
    } else if (modelName.includes('llama')) {
        return 'static/images/meta.svg';
    } else if (modelName.includes('grok')) {
        return 'static/images/xai.svg';
    } else if (modelName.includes('mistral') || modelName.includes('mixtral')) {
        return 'static/images/mistral.svg';
    } else if (modelName.includes('qwen')) {
        return 'static/images/qwen.svg';
    } else {
        return 'static/images/robot.svg';
    }
}

function simulateBotMessage(content, role=null) {
    const botMessage = document.createElement('div');
    botMessage.className = 'message bot';
    botMessage.setAttribute('data-content', content);

    if (!role) {
        const storedModel = localStorage.getItem('model');
        const modelName = storedModel === 'custom' ?
            localStorage.getItem('custom-model') :
            storedModel;
        role = `assistant-${modelName}`;
    }

    const avatarSrc = getModelAvatar(role);
    botMessage.innerHTML = `<img src="${avatarSrc}" alt="Bot Avatar"><div class="bubble"></div>`;
    document.getElementById('chat-messages').appendChild(botMessage);

    // First step: render the message content
    botMessage.querySelector('.bubble').innerHTML = formatMessage(content);

    // Second step: render the MathJax content
    MathJax.typesetPromise([botMessage.querySelector('.bubble')]).then(() => {
        // Scroll to bottom after rendering MathJax content
        scrollToBottom();
    });
}

function clearMemory(user_id, confirmClear = true) {
    if (confirmClear && !confirm(translate("memory-clear"))) {
        return;
    }

    uuid = getOrCreateUUID();
    // Call the backend /clear_memory route
    fetch('/clear_memory?user_id=' + uuid, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Clear messages on the screen
                const chatMessages = document.getElementById('chat-messages');
                chatMessages.innerHTML = '';
                localStorage.removeItem('chatMessages');
            } else {
                console.error('Error:', data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function updateConfig() {
    const baseURL = document.getElementById('base-url').value;
    const apiKey = document.getElementById('api-key').value;

    // Save to cookies
    document.cookie = `base_url=${baseURL}; path=/; max-age=31536000`; // 10 year
    document.cookie = `api_key=${apiKey}; path=/; max-age=31536000`; // 10 year
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function checkEnter(event) {
    if (event.key === 'Enter' && !isBotResponding) {
        sendMessage();
    }
}

function checkMessage() {
    const message = document.getElementById('message').value;
    const sendButton = document.getElementById('send-button');
    sendButton.disabled = message.trim() === '' || isBotResponding;
}

function openSettings() {
    const modal = document.getElementById('settings-modal');
    modal.classList.add('show');
    modal.style.removeProperty('display');
    // Get current configuration and fill in the text boxes
    const baseURL = getCookie('base_url');
    const apiKey = getCookie('api_key');
    const uuid = getCookie('uuid');
    document.getElementById('base-url').value = baseURL || '';
    document.getElementById('api-key').value = apiKey || '';
    document.getElementById('uuid').value = uuid || '';
}

function closeSettings() {
    const modal = document.getElementById('settings-modal');
    modal.classList.remove('show');
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function getOrCreateUUID() {
    let uuid = getCookie('uuid');
    if (!uuid) {
        uuid = generateUUID();
        document.cookie = `uuid=${uuid}; path=/; max-age=315360000`; // 10 year
    }
    return uuid;
}

// Define the function to sync messages
function syncMessages() {
    const uuid = getOrCreateUUID();
    fetch(`/sync_messages?user_id=${uuid}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                localStorage.setItem('chatMessages', JSON.stringify(data.messages));
                document.getElementById('chat-messages').innerHTML = '';
                loadMessages();
            } else {
                console.error('Error:', data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Load message history on initialization
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        checkMessage();
        syncMessages(); // Call the sync messages function

        // Read and apply API Key and Base URL
        const baseURL = getCookie('base_url');
        const apiKey = getCookie('api_key');
        if (baseURL) {
            document.getElementById('base-url').value = baseURL;
        }
        if (apiKey) {
            document.getElementById('api-key').value = apiKey;
        }

        // Get or generate UUID and fill in the uuid text box
        const uuid = getOrCreateUUID();
        document.getElementById('uuid').value = uuid;

        scrollToBottom();
    }, 2000); // Delay 2000 milliseconds
});

// Close the modal when clicking outside of it
window.onclick = function (event) {
    const modal = document.getElementById('settings-modal');
    if (event.target == modal) {
        closeSettings();
    }
}


document.addEventListener('DOMContentLoaded', function () {
    const baseURLInput = document.getElementById('base-url');
    const apiKeyInput = document.getElementById('api-key');
    const okButton = document.getElementById('ok-config-button');

    // Read and apply API Key and Base URL
    const baseURL = getCookie('base_url');
    const apiKey = getCookie('api_key');
    if (baseURL) {
        baseURLInput.value = baseURL;
    }
    if (apiKey) {
        apiKeyInput.value = apiKey;
    }

    // Set initial values
    let initialBaseURL = baseURLInput.value;
    let initialApiKey = apiKeyInput.value;

    function checkForChanges() {
        if (baseURLInput.value === initialBaseURL && apiKeyInput.value === initialApiKey) {
            okButton.disabled = true;
        } else {
            okButton.disabled = false;
        }
    }

    baseURLInput.addEventListener('input', checkForChanges);
    apiKeyInput.addEventListener('input', checkForChanges);

    // Initialize button state
    checkForChanges();

    okButton.addEventListener('click', function () {
        // Save configuration
        updateConfig();

        // Update initial values
        initialBaseURL = baseURLInput.value;
        initialApiKey = apiKeyInput.value;

        // Disable button
        okButton.disabled = true;
    });
});

document.getElementById('sync-button').addEventListener('click', () => {
    const newUUID = document.getElementById('uuid').value;

    // UUID validity check
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(newUUID)) {
        // Call the backend /validate_uuid route to check UUID existence
        fetch(`/validate_uuid?user_id=${newUUID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // Update UUID cookie value
                    document.cookie = `uuid=${newUUID}; path=/; max-age=315360000`; // 10 year

                    // Clear messages on the screen
                    const chatMessages = document.getElementById('chat-messages');
                    chatMessages.innerHTML = '';

                    // Reload messages
                    syncMessages();
                } else {
                    alert(translate('uuid-not-found'));
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert(translate('unknown-error'));
            });
    } else {
        alert(translate('invalid-uuid'));
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Disable send and settings buttons initially
    const sendButton = document.getElementById('send-button');
    const settingsButton = document.getElementById('settings-button');
    sendButton.disabled = true;
    settingsButton.disabled = true;

    // Enable buttons after 2 seconds
    setTimeout(() => {
        settingsButton.disabled = false;
    }, 2000);
});