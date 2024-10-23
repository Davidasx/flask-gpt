from flask import Flask, send_from_directory, request, jsonify, Response
import os
from openai import OpenAI
import json

app = Flask(__name__)
messages = []
api_key = ""
base_url = ""

class ChatBot:
    def __init__(self, api_key, base_url, model, nick):
        self.client = OpenAI(api_key=api_key, base_url=base_url)
        self.model = model
        self.nick = nick

    def reply(self):
        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
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
        print("User: " + user_message)
        messages.append({"role": "user", "content": user_message})
        return jsonify({'status': 'Message received'})

    elif request.method == 'GET':
        if "HTTP_PROXY" in os.environ:
            os.environ["ALL_PROXY"] = os.environ["HTTPS_PROXY"]
            os.environ["all_proxy"] = os.environ["https_proxy"]
        models = ["gpt-4o", "gpt-4"]
        nicks = ["ChatGPT-4o", "ChatGPT-4"]
        order = [0, 1]
        bots = []
        print(base_url+"*"+api_key)
        for i in range(len(order)):
            bots.append(ChatBot(api_key=api_key, base_url=base_url, model=models[order[i]], nick=nicks[order[i]]))

        def generate():
            bot_reply = ""
            print("Bot: ",end='')
            while 1:
                for bot in bots:
                    completion = bot.reply()
                    if completion is not None:
                        for chunk in completion:
                            if not chunk.choices:
                                continue
                            if chunk.choices[0].delta.content is None:
                                break
                            print(str(chunk.choices[0].delta.content),end='')
                            bot_reply+=str(chunk.choices[0].delta.content)
                            yield f"data: {json.dumps({'content': str(chunk.choices[0].delta.content), 'end': False})}\n\n"
                        yield f"data: {json.dumps({'content': '', 'end': True})}\n\n"
                        print("\n")
                        break
                if bot_reply != "":
                    break
            messages.append({"role": "assistant", "content": bot_reply})

        return Response(generate(), content_type='text/event-stream')

@app.route('/clear', methods=['POST'])
def clear():
    messages.clear()
    print("Memory Cleared")
    return jsonify({"status": "success", "message": "Memory Cleared"})

@app.route('/config', methods=['POST', 'GET'])
def config():
    global api_key, base_url
    if request.method == 'POST':
        data = request.json
        api_key = data.get('api_key', api_key)
        base_url = data.get('base_url', base_url)
        return jsonify({"status": "success", "message": "Configuration updated"})
    elif request.method == 'GET':
        return jsonify({"api_key": api_key, "base_url": base_url})

@app.route('/import', methods=['POST'])
def import_chat():
    try:
        messages.clear()
        chat_log = request.json.get('chat_log')
        if not chat_log:
            return jsonify({"status": "error", "message": "No chat log provided"}), 400
        for message in chat_log:
            if 'role' in message and 'content' in message:
                messages.append(message)
            else:
                return jsonify({"status": "error", "message": "Invalid chat log format"}), 400
        
        return jsonify({"status": "success", "message": "Chat log imported successfully"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)