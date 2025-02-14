function sendMessage(message = null, showUserBubble = true, hidden = false, previous = '') {
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
    const storedModel = localStorage.getItem('model') || 'gpt-4o';
    const model = storedModel === 'custom' ? localStorage.getItem('custom-model') : storedModel;
    const tempStream = localStorage.getItem('stream') || 'true';

    // Extra features
    const search = localStorage.getItem('search') || 'false';
    const draw = localStorage.getItem('draw') || 'false';

    // Lock features
    const noSystem = localStorage.getItem('noSystem') || 'false';
    const noStream = localStorage.getItem('noStream') || 'false';

    const stream = tempStream === 'true' && noStream === 'false';
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

    let url = `/chat?user_id=${uuid}&api_key=${apiKey}&base_url=${baseUrl}&time=${userTime}&model=${model}&stream=${stream}&search=${search}&draw=${draw}&no_system=${noSystem}`;
    if (hidden) {
        url += '&hidden=true';
    }

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: message, previous: previous })
    }).then(response => {
        if (!response.ok) {
            handleFetchError(response.statusText);
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
                const avatarSrc = getModelAvatar(`assistant-${model}`);
                botMessage.innerHTML = `<img src="${avatarSrc}" alt="Bot Avatar"><div class="bubble"></div>`;
                document.getElementById('chat-messages').appendChild(botMessage);
            }
            contentBuffer += data.content;
            filteredContentBuffer = contentBuffer;
            if (contentBuffer.startsWith('@?!') || contentBuffer.startsWith('$#%')) {
                filteredContentBuffer = "";
            }
            botMessage.setAttribute('data-content', filteredContentBuffer);
            botMessage.querySelector('.bubble').innerHTML = formatMessage(filteredContentBuffer);

            // Scroll to bottom
            scrollToBottom();

            if (data.end) {
                // Render message content
                botMessage.querySelector('.bubble').innerHTML = formatMessage(filteredContentBuffer);

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
                        body: JSON.stringify({ prompt: prompt })
                    }).then(response => response.json()
                    ).then(data => {
                        if (data.status === 'error') {
                            failed_search = data.notice;
                            sendMessage(failed_search, false, true, prompt); // Send again as user, hidden=true
                            return;
                        }
                        const answer = data.answer;
                        sendMessage(answer, false, true, prompt); // Send again as user, hidden=true
                    }).catch(handleFetchError);
                } else if (contentBuffer.startsWith('$#%')) {
                    const prompt = contentBuffer;
                    botMessage.querySelector('.bubble').innerHTML = "Drawing...";

                    fetch('/draw', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ prompt: prompt })
                    }).then(response => response.json()
                    ).then(data => {
                        if (data.status === 'error') {
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
                            const failed_drawing = data.notice;
                            sendMessage(failed_drawing, false, true, prompt); // Send again as user, hidden=true
                            return;
                        }

                        const image = data.image;
                        maxWidth = Math.min(1024, window.innerWidth * 0.6);

                        imageHTML = `<img src="${image}" alt="Generated Image" style="width: 512px; height: 512px;">`;
                        botMessage.querySelector('.bubble').innerHTML
                            = `<img src="${image}" alt="Generated Image" style="width: ${maxWidth}px; height: ${maxWidth}px;">`;
                        scrollToBottom();
                        fetch(`/bot_message?user_id=${uuid}&model=${model}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ message: imageHTML + prompt })
                        }).then(response => {
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
                            return response.json();
                        }).then(data => {
                        }).catch(handleFetchError);
                    }).catch(handleFetchError);
                } else {
                    // Send message to /bot_message route
                    fetch(`/bot_message?user_id=${uuid}&model=${model}`, {
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

        userMessage = document.querySelector('.message.user:last-child');
        // Delete user message and fill message content into input box
        if (userMessage) {
            document.getElementById('chat-messages').removeChild(userMessage);
            document.getElementById('message').value = userMessage.getAttribute('data-content');
            document.getElementById('send-button').disabled = false;

            alertMessage = document.createElement('div');
            alertMessage.className = 'message alert';
            alertMessage.innerHTML = `<div class="bubble" data-i18n="error-message">`+translate('error-message')+`</div>`;
            document.getElementById('chat-messages').appendChild(alertMessage);
            scrollToBottom();

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
            }).catch(error => {
                console.error('Fetch error:', error);
            });
        }
    }

    // Recheck message input box
    checkMessage();
    saveMessages();
}