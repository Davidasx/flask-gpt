from flask import Flask, send_from_directory, request, jsonify, Response
import os
from openai import OpenAI
import json
from duckduckgo_search import DDGS
import time
from werkzeug.middleware.proxy_fix import ProxyFix
from database import init_db, get_chat_log, save_chat_log, delete_chat_log, db, ChatLog
import logging
from logging_config import setup_logging

app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1)
init_db(app)

access_logger = setup_logging()

pre_prompt = []

def load_prompt(file_path):
    if file_path[0] == '#':
        return
    global pre_prompt
    with open(file_path, 'r', encoding='utf-8') as file:
        lines = file.readlines()
        content = ''.join(line.strip() for line in lines)
        pre_prompt.append({"role": "system", "content": content})

def load_all_prompts(directory):
    print("Loading prompts...")
    prompts_file = os.path.join(directory, 'prompts.json')
    print(prompts_file)
    if not os.path.isfile(prompts_file):
        return

    with open(prompts_file, 'r', encoding='utf-8') as file:
        prompts_data = json.load(file)

    for prompt in prompts_data.get('prompts', []):
        if prompt.get('enabled', False):
            print("Loaded prompt " + prompt['name'])
            file_path = os.path.join(directory, prompt['file'])
            if os.path.isfile(file_path):
                load_prompt(file_path)

load_all_prompts('prompts')

class ChatBot:
    def __init__(self, api_key, base_url, model, messages, stream):
        self.client = OpenAI(api_key=api_key, base_url=base_url)
        self.model = model
        self.messages = messages
        self.stream = stream

    def reply(self):
        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=self.messages,
                stream=self.stream
            )
        except:
            return None
        return completion

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/chat', methods=['POST', 'GET'])
def chat():
    user_id = request.args.get('user_id')
    api_key = request.args.get('api_key')
    base_url = request.args.get('base_url')
    hidden = request.args.get('hidden', 'false').lower() == 'true'
    time_param = request.args.get('time')
    model = request.args.get('model')
    stream = False
    if len(model) > 7 and model[-7:] == "-stream":
        model = model[:-7]
        stream = True
    if request.method == 'POST':
        data = request.get_json()
        message = data.get('message')
        
        if not user_id:
            return jsonify({'status': 'error', 'message': 'Missing user_id'}), 400
        
        if not api_key or not base_url:
            return jsonify({'status': 'error', 'message': 'Missing required parameters'}), 400

        chat_log_entry = get_chat_log(user_id)
        if not chat_log_entry:
            chat_log_entry = ChatLog(user_id=user_id, chat_log=json.dumps([]))
        
        chat_log = json.loads(chat_log_entry.chat_log)
        
        chat_log.append({'role': 'user', 'content': message})
        
        save_chat_log(user_id, chat_log)
        
        return jsonify({'status': 'success', 'message': 'Message sent to bot'}), 200

    elif request.method == 'GET':
        chat_log_entry = get_chat_log(user_id)
        
        if not chat_log_entry:
            return jsonify({'status': 'error', 'message': 'No chat log found for user'}), 404

        chat_log = json.loads(chat_log_entry.chat_log)

        if "HTTP_PROXY" in os.environ:
            os.environ["ALL_PROXY"] = os.environ["HTTPS_PROXY"]
            os.environ["all_proxy"] = os.environ["https_proxy"]
        
        order = [0, 1]
        if time_param:
            timedate = f"{time_param[:4]}-{time_param[4:6]}-{time_param[6:8]} {time_param[8:10]}:{time_param[10:12]}"
        else:
            timedate = time.strftime("%Y-%m-%d %H:%M")
        timeprompt = {"role":"system","content":"The current datetime is "
            + timedate + ". Use this information as if you can access the real "
            "datetime. Note that as the time can change, always use the time in "
            "this message as the current time. Do not use the time from any other "
            "messages because they can be outdated."}
        full_log = pre_prompt + [timeprompt] + chat_log
        bot = ChatBot(stream=stream, api_key=api_key, base_url=base_url, model=model, messages=full_log)
        if hidden:
            original_chat_log = chat_log[:-1]
            save_chat_log(user_id, original_chat_log)
        completion = bot.reply()
        if completion is None:
            return jsonify({'status': 'error', 'message': 'Bot response error'}), 404
        def generate():
            if stream:
                for chunk in completion:
                    if not chunk.choices:
                        continue
                    if chunk.choices[0].delta.content is None:
                        break
                    yield f"data: {json.dumps({'content': str(chunk.choices[0].delta.content), 'end': False})}\n\n"
                yield f"data: {json.dumps({'content': '', 'end': True})}\n\n"
            else:
                yield f"data: {json.dumps({'content': str(completion.choices[0].message.content), 'end': False})}\n\n"
                yield f"data: {json.dumps({'content': '', 'end': True})}\n\n"
        return Response(generate(), content_type='text/event-stream')

@app.route('/clear_memory', methods=['POST'])
def clear_memory():
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'status': 'error', 'message': 'User ID is required'}), 400

        num_rows_deleted = delete_chat_log(user_id)
        return jsonify({'status': 'success', 'message': f'{num_rows_deleted} records deleted for user {user_id}'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/bot_message', methods=['POST'])
def bot():
    try:
        user_id = request.args.get('user_id')
        data = request.get_json()
        message = data.get('message')
        
        if not user_id:
            return jsonify({'status': 'error', 'message': 'Missing user_id'}), 400
        
        chat_log_entry = get_chat_log(user_id)
        if not chat_log_entry:
            return jsonify({'status': 'error', 'message': 'No chat log found for user'}), 404
        
        chat_log = json.loads(chat_log_entry.chat_log)
        chat_log.append({'role': 'assistant', 'content': message})
        
        save_chat_log(user_id, chat_log)
        
        return jsonify({'status': 'success', 'message': 'Bot message saved'}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/sync_messages', methods=['GET'])
def sync_messages():
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'status': 'error', 'message': 'Missing user_id'}), 400

        chat_log_entry = get_chat_log(user_id)
        if not chat_log_entry:
            return jsonify({'status': 'error', 'message': 'No chat log found for user'}), 404

        chat_log = json.loads(chat_log_entry.chat_log)
        return jsonify({'status': 'success', 'messages': chat_log}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/delete_message', methods=['POST'])
def delete_message():
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'status': 'error', 'message': 'Missing user_id'}), 400

        chat_log_entry = get_chat_log(user_id)
        if not chat_log_entry:
            return jsonify({'status': 'error', 'message': 'No chat log found for user'}), 404

        chat_log = json.loads(chat_log_entry.chat_log)
        if not chat_log:
            return jsonify({'status': 'error', 'message': 'Chat log is empty'}), 400

        chat_log.pop()  # Remove the last message
        save_chat_log(user_id, chat_log)

        return jsonify({'status': 'success', 'message': 'Last message deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/validate_uuid', methods=['GET'])
def validate_uuid():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'status': 'error', 'message': 'Missing user_id'}), 400

    chat_log_entry = get_chat_log(user_id)
    if chat_log_entry:
        return jsonify({'status': 'success', 'message': 'UUID is valid'}), 200
    else:
        return jsonify({'status': 'error', 'message': 'UUID not found'}), 404

@app.route('/search_chat', methods=['POST'])
def search_chat():
    data = request.get_json()
    
    if not data or 'message' not in data or 'prompt' not in data:
        return jsonify({'status': 'error', 'message': 'Missing Data'}), 400
    
    prompts = data.get('prompt')
    prompts = prompts.split('\n')
    prompts = [prompt[4:] for prompt in prompts]
    
    concats = []
    for i in range(0, len(prompts)):
        prompt = prompts[i]
        if "DUCK_PROXY" in os.environ:
            duck = DDGS(proxy=os.environ["DUCK_PROXY"])
        else:
            duck = DDGS()
        results = duck.text(prompt, max_results=10)
        bodies = [result['body'] for result in results]
        titles = [result['title'] for result in results]
        concat = ''.join(f"{id} -- {title}:{body}\n\n" for id, title, body in zip(range(1, len(bodies)+1), titles, bodies))
        concat = "Search query " + prompt + ":\n\n" + concat
        concats.append(concat)
    
    full = '\n\n'.join(concats)
    full_escaped = full.replace('"', '\\"')
    
    answer = (
        "This is a system message sent in the user's name. "
        "The user's last message requires internet search. "
        "The system has searched and got the following results. "
        "Answer the user's message with the searched information: "
        f"{full_escaped} Please do not reply to this message "
        "but to the previous message by the user. Reply in the"
        "user's language."
    )
    
    return jsonify({'status': 'success','answer': answer}), 200

@app.after_request
def log_request(response):
    ip = request.remote_addr
    method = request.method
    path = request.path
    status = response.status_code
    access_logger.info('', extra={
        'ip': ip,
        'method': method,
        'path': path,
        'status': status
    })
    return response

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=7788)