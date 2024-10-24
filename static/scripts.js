// 预加载头像
const userAvatar = new Image();
userAvatar.src = "https://upload.wikimedia.org/wikipedia/commons/7/7c/User_font_awesome.svg";

const botAvatar = new Image();
botAvatar.src = "https://static.vecteezy.com/system/resources/previews/021/059/827/non_2x/chatgpt-logo-chat-gpt-icon-on-white-background-free-vector.jpg";

let isBotResponding = false;

function scrollToBottom() {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function formatMessage(message) {
    original = message;

    // 计算三个点的数量
    const dotCount = (message.match(/```/g) || []).length;

    // 如果是奇数个，则在消息后加上换行和三个点
    if (dotCount % 2 !== 0) {
        message += '\n```';
    }

    // 渲染代码块
    message = message.replace(/```(\w+)?([\s\S]*?)```/gim, (match, p1, p2) => {
        let codeContent = '';
        let startIndex = 0;
        while (p2[startIndex] == '\n') startIndex++;
        for (let i = startIndex; i < p2.length; i++) {
            const char = p2[i];
            switch (char) {
                case '<':
                    codeContent += '&lt;';
                    break;
                case '>':
                    codeContent += '&gt;';
                    break;
                case '#':
                    codeContent += '&#35;';
                    break;
                default:
                    codeContent += char;
            }
        }
        codeContent = codeContent.replace(/\s+$/g, '');
        return `<pre style="border: 1px solid #ccc; background-color: #f9f9f9; padding: 10px;"><code>${codeContent}</code></pre>`;
    });

    // 渲染行内代码
    message = message.replace(/`([^`]+)`/gim, (match, p1) => {
        let inlineCodeContent = '';
        for (let i = 0; i < p1.length; i++) {
            const char = p1[i];
            switch (char) {
                case '<':
                    inlineCodeContent += '&lt;';
                    break;
                case '>':
                    inlineCodeContent += '&gt;';
                    break;
                case '#':
                    inlineCodeContent += '&#35;';
                    break;
                default:
                    inlineCodeContent += char;
            }
        }
        return `<code style="border: 1px solid #ccc; background-color: #f9f9f9; padding: 2px 4px;">${inlineCodeContent}</code>`;
    });
    
    // 渲染链接
    message = message.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank">$1</a>');

    // 渲染分隔符
    message = message.replace(/^---$/gim, '<hr>');

    // 渲染标题
    message = message.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
    message = message.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
    message = message.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    message = message.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    message = message.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    message = message.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // 渲染粗体文本
    message = message.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

    // 渲染无序列表
    message = message.replace(/^\s*([-+*])\s+(.*)/gim, (match, p1, p2) => {
        const indentLevel = match.match(/^\s*/)[0].length / 2;
        return `<ul style="margin-left: ${indentLevel * 20}px;"><li>${p2}</li></ul>`;
    });

    // 合并连续的列表项为一个列表
    message = message.replace(/<\/ul>\s*<ul/gim, '</ul><ul');


    // 删除标题行后的任意多个空行
    message = message.replace(/(<h[1-6]>.*<\/h[1-6]>)\s*\n+/gim, '$1');

    //删除多余的空行
    message = message.replace(/\n{2,}/gim, '\n');

    console.log(message);
    answer = message.trim();
    message = original;
    return answer;
}

function saveMessages() {
    const chatMessages = [];
    document.querySelectorAll('.message').forEach(message => {
        chatMessages.push({
            role: message.classList.contains('user') ? 'user' : 'assistant',
            content: message.getAttribute('data-content')
        });
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
                simulateBotMessage(msg.content);
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

function simulateBotMessage(content) {
    const botMessage = document.createElement('div');
    botMessage.className = 'message bot';
    botMessage.setAttribute('data-content', content);
    botMessage.innerHTML = `<img src="${botAvatar.src}" alt="ChatGPT Logo"><div class="bubble"></div>`;
    document.getElementById('chat-messages').appendChild(botMessage);

    // First step: render the message content
    botMessage.querySelector('.bubble').innerHTML = formatMessage(content);

    // Second step: render the MathJax content
    MathJax.typesetPromise([botMessage.querySelector('.bubble')]).then(() => {
        // Scroll to bottom after rendering MathJax content
        scrollToBottom();
    });
}

function sendMessage(message = null, showUserBubble = true) {
    if (!message) {
        message = document.getElementById('message').value;
    }
    if (message.trim() === '') return;

    // 禁用发送按钮
    const sendButton = document.getElementById('send-button');
    sendButton.disabled = true;
    isBotResponding = true;

    if (showUserBubble) {
        // 显示用户消息
        const userMessage = document.createElement('div');
        userMessage.className = 'message user';
        userMessage.setAttribute('data-content', message);
        userMessage.innerHTML = `<div class="bubble">${formatMessage(message)}</div><img src="${userAvatar.src}" alt="User Avatar">`;
        document.getElementById('chat-messages').appendChild(userMessage);

        // 清空输入框
        document.getElementById('message').value = '';

        // 滚动到底部
        scrollToBottom();
    }

    const apiKey = document.getElementById('api-key').value;
    const baseUrl = document.getElementById('base-url').value;
    const chatLog = localStorage.getItem('chatMessages');
    const updatedChatLog = chatLog ? JSON.parse(chatLog) : [];
    updatedChatLog.push({ role: 'user', content: message });

    const uuid = getOrCreateUUID();
    fetch('/chat?user_id=' + uuid, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ api_key: apiKey, base_url: baseUrl, chat_log: JSON.stringify(updatedChatLog) })
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const eventSource = new EventSource('/chat?user_id=' + uuid);

        let botMessage = null;
        let contentBuffer = '';

        eventSource.onmessage = function (event) {
            const data = JSON.parse(event.data);
            if (!botMessage) {
                botMessage = document.createElement('div');
                botMessage.className = 'message bot';
                botMessage.setAttribute('data-content', '');
                botMessage.innerHTML = `<img src="${botAvatar.src}" alt="ChatGPT Logo"><div class="bubble"></div>`;
                document.getElementById('chat-messages').appendChild(botMessage);
            }
            contentBuffer += data.content;
            botMessage.setAttribute('data-content', contentBuffer);
            botMessage.querySelector('.bubble').innerHTML = formatMessage(contentBuffer);

            // 滚动到底部
            scrollToBottom();

            if (data.end) {
                // 渲染消息内容
                botMessage.querySelector('.bubble').innerHTML = formatMessage(contentBuffer);

                // 渲染数学公式
                MathJax.typesetPromise([botMessage.querySelector('.bubble')]).then(() => {
                    // 滚动到底部
                    scrollToBottom();
                });

                eventSource.close();
                saveMessages();
                isBotResponding = false;
                checkMessage(); // 重新检查消息输入框
            }
        };

        eventSource.onerror = function () {
            console.error('Error occurred while receiving stream.');
            eventSource.close();
            isBotResponding = false;
            checkMessage(); // 重新检查消息输入框
        };
    }).catch(error => {
        console.error('Fetch error:', error);
        isBotResponding = false;
        checkMessage(); // 重新检查消息输入框
    });

    // 检查消息输入框
    checkMessage();
    saveMessages();
}

function clearMemory(confirmClear = true) {
    if (confirmClear && !confirm("确定要清空记忆吗？")) {
        return;
    }

    // 清空屏幕上的消息
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';
    localStorage.removeItem('chatMessages');
}

function updateConfig() {
    const baseURL = document.getElementById('base-url').value;
    const apiKey = document.getElementById('api-key').value;

    // 保存到 cookies
    document.cookie = `base_url=${baseURL}; path=/; max-age=31536000`; // 1 year
    document.cookie = `api_key=${apiKey}; path=/; max-age=31536000`; // 1 year
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
    document.getElementById('settings-modal').style.display = "block";
    // 获取当前配置并填充到文本框
    const baseURL = getCookie('base_url');
    const apiKey = getCookie('api_key');
    document.getElementById('base-url').value = baseURL || '';
    document.getElementById('api-key').value = apiKey || '';
}

function closeSettings() {
    document.getElementById('settings-modal').style.display = "none";
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
        document.cookie = `uuid=${uuid}; path=/; max-age=31536000`; // 1 year
    }
    return uuid;
}

// 初始化时禁用发送按钮并加载消息记录
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        checkMessage();
        loadMessages();

        // 读取并应用API Key和Base URL
        const baseURL = getCookie('base_url');
        const apiKey = getCookie('api_key');
        if (baseURL) {
            document.getElementById('base-url').value = baseURL;
        }
        if (apiKey) {
            document.getElementById('api-key').value = apiKey;
        }
        scrollToBottom();
    }, 2000); // 延迟2000毫秒
});

// Close the modal when clicking outside of it
window.onclick = function (event) {
    const modal = document.getElementById('settings-modal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function importMessages() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const messages = JSON.parse(e.target.result);
                localStorage.setItem('chatMessages', JSON.stringify(messages));
                document.getElementById('chat-messages').innerHTML = '';
                loadMessages();
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

function exportMessages() {
    const messages = localStorage.getItem('chatMessages');
    if (messages) {
        const blob = new Blob([messages], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chatMessages.json';
        a.click();
        URL.revokeObjectURL(url);
    } else {
        alert('没有聊天记录可导出');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const baseURLInput = document.getElementById('base-url');
    const apiKeyInput = document.getElementById('api-key');
    const okButton = document.getElementById('ok-config-button');

    // 读取并应用 API Key 和 Base URL
    const baseURL = getCookie('base_url');
    const apiKey = getCookie('api_key');
    if (baseURL) {
        baseURLInput.value = baseURL;
    }
    if (apiKey) {
        apiKeyInput.value = apiKey;
    }

    // 设置初始值
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

    // 初始化按钮状态
    checkForChanges();

    okButton.addEventListener('click', function () {
        // 保存配置
        updateConfig();

        // 更新初始值
        initialBaseURL = baseURLInput.value;
        initialApiKey = apiKeyInput.value;

        // 禁用按钮
        okButton.disabled = true;
    });
});