function sendMessage(message = null, showUserBubble = true, hidden = false) {
    if (!message) {
        message = document.getElementById('message').value;
    }
    if (message.trim() === '') return;

    // Disable send button
    const sendButton = document.getElementById('send-button');
    sendButton.disabled = true;
    isBotResponding = true;

    let userMessage = null;

    if (showUserBubble) {
        // Display user message
        userMessage = document.createElement('div');
        userMessage.className = 'message user';
        userMessage.setAttribute('data-content', message);
        userMessage.innerHTML = `<div class="bubble">${formatMessage(message)}</div><img src="${userAvatar.src}" alt="User Avatar">`;
        document.getElementById('chat-messages').appendChild(userMessage);

        // Clear input box
        document.getElementById('message').value = '';

        // Scroll to bottom
        scrollToBottom();
    }

    const apiKey = document.getElementById('api-key').value;
    const baseUrl = document.getElementById('base-url').value;
    const chatLog = localStorage.getItem('chatMessages');
    const updatedChatLog = chatLog ? JSON.parse(chatLog) : [];
    const storedModel = localStorage.getItem('model') || 'gpt-4o-stream';
    const model = storedModel === 'custom' ? localStorage.getItem('custom-model') : storedModel;
    updatedChatLog.push({ role: 'user', content: message });

    const uuid = getOrCreateUUID();

    // Get current user time in YYYYMMDDHHmm format
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const userTime = `${year}${month}${day}${hours}${minutes}`;
    
    let url = `/chat?user_id=${uuid}&api_key=${apiKey}&base_url=${baseUrl}&time=${userTime}&model=${model}`;
    if (hidden) {
        url += '&hidden=true';
    }

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: message })
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const eventSource = new EventSource(url);

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

            // Scroll to bottom
            scrollToBottom();

            if (data.end) {
                // Render message content
                botMessage.querySelector('.bubble').innerHTML = formatMessage(contentBuffer);

                // Render math formulas
                MathJax.typesetPromise([botMessage.querySelector('.bubble')]).then(() => {
                    // Scroll to bottom
                    scrollToBottom();
                });

                eventSource.close();
                saveMessages();
                isBotResponding = false;
                checkMessage(); // Recheck message input box

                // Check if bot message starts with @?!
                if (contentBuffer.startsWith('@?!')) {
                    const prompt = contentBuffer;

                    // Delete the last bot message
                    const chatMessages = document.getElementById('chat-messages');
                    const lastBotMessage = chatMessages.querySelector('.message.bot:last-child');
                    if (lastBotMessage) {
                        chatMessages.removeChild(lastBotMessage);
                    }

                    // Remove the last message from localStorage
                    const chatLog = JSON.parse(localStorage.getItem('chatMessages')) || [];
                    if (chatLog.length > 0) {
                        chatLog.pop();
                        localStorage.setItem('chatMessages', JSON.stringify(chatLog));
                    }

                    fetch('/search_chat', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ message: message, prompt: prompt })
                    }).then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    }).then(data => {
                        const answer = data.answer;
                        sendMessage(answer, false, true); // Send again as user, hidden=true
                    }).catch(handleFetchError);
                } else {
                    // Send message to /bot_message route
                    fetch(`/bot_message?user_id=${uuid}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ message: contentBuffer })
                    }).then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    }).then(data => {
                        console.log('Message sent to /bot:', data);
                    }).catch(handleFetchError);
                }
            }
        };

        eventSource.onerror = function () {
            console.error('Error occurred while receiving stream.');
            eventSource.close();
            handleFetchError();
        };
    }).catch(handleFetchError);

    function handleFetchError(error) {
        console.error('Fetch error:', error);
        isBotResponding = false;
        checkMessage(); // Recheck message input box

        // Delete user message and fill message content into input box
        if (userMessage) {
            document.getElementById('chat-messages').removeChild(userMessage);
            document.getElementById('message').value = message;
            document.getElementById('send-button').disabled = false;

            fetch(`/delete_message?user_id=${uuid}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            }).then(data => {
                console.log('Message deleted:', data);
            }).catch(error => {
                console.error('Fetch error:', error);
            });
        }
    }

    // Recheck message input box
    checkMessage();
    saveMessages();
}