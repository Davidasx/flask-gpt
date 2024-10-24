from flask import Flask, send_from_directory, request, jsonify, Response
import os
from openai import OpenAI
import json

app = Flask(__name__)

# Global dictionary to store user data
user_data = {}

class ChatBot:
    def __init__(self, api_key, base_url, model, nick, messages):
        self.client = OpenAI(api_key=api_key, base_url=base_url)
        self.model = model
        self.nick = nick
        self.messages = messages

    def reply(self):
        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=self.messages,
                stream=True  # Enable streaming output
            )
        except:
            return None
        return completion

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/chat', methods=['POST', 'GET'])
def chat():
    if request.method == 'POST':
        user_message = request.json.get('message')
        data = request.get_json()
        user_id = data.get('user_id')
        api_key = data.get('api_key')
        base_url = data.get('base_url')
        chat_log_string = data.get('chat_log')
        chat_log = json.loads(chat_log_string) if chat_log_string else []
        
        if not user_id:
            return jsonify({'status': 'error', 'message': 'Missing user_id'}), 400
        
        if not api_key or not base_url:
            return jsonify({'status': 'error', 'message': 'Missing required parameters'}), 400

        user_data[user_id] = {
            'api_key': api_key,
            'base_url': base_url,
            'chat_log': chat_log
        }
        return jsonify({'status': 'Message received'})

    elif request.method == 'GET':
        user_id = request.args.get('user_id')
        user_info = user_data[user_id]
        api_key = user_info['api_key']
        base_url = user_info['base_url']
        chat_log = user_info['chat_log']

        if "HTTP_PROXY" in os.environ:
            os.environ["ALL_PROXY"] = os.environ["HTTPS_PROXY"]
            os.environ["all_proxy"] = os.environ["https_proxy"]
        
        models = ["gpt-4o", "gpt-4"]
        nicks = ["ChatGPT-4o", "ChatGPT-4"]
        order = [0, 1]
        bots = []

        for i in range(len(order)):
            bots.append(ChatBot(api_key=api_key, base_url=base_url, model=models[order[i]], nick=nicks[order[i]], messages=chat_log))

        def generate():
            bot_reply = ""
            while 1:
                for bot in bots:
                    completion = bot.reply()
                    if completion is not None:
                        for chunk in completion:
                            if not chunk.choices:
                                continue
                            if chunk.choices[0].delta.content is None:
                                break
                            bot_reply += str(chunk.choices[0].delta.content)
                            yield f"data: {json.dumps({'content': str(chunk.choices[0].delta.content), 'end': False})}\n\n"
                        yield f"data: {json.dumps({'content': '', 'end': True})}\n\n"
                        break
                if bot_reply != "":
                    break

        return Response(generate(), content_type='text/event-stream')

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)