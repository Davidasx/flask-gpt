from flask_sqlalchemy import SQLAlchemy
import os
import json

db = SQLAlchemy()

class ChatLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), nullable=False, unique=True)
    chat_log = db.Column(db.Text, nullable=False)

def init_db(app):
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ["SQL_LINK"]
    db.init_app(app)
    with app.app_context():
        db.create_all()

def get_chat_log(user_id):
    return ChatLog.query.filter_by(user_id=user_id).first()

def save_chat_log(user_id, chat_log):
    chat_log_entry = get_chat_log(user_id)
    if not chat_log_entry:
        chat_log_entry = ChatLog(user_id=user_id, chat_log=json.dumps([]))
    chat_log_entry.chat_log = json.dumps(chat_log)
    db.session.add(chat_log_entry)
    db.session.commit()

def delete_chat_log(user_id):
    num_rows_deleted = db.session.query(ChatLog).filter_by(user_id=user_id).delete()
    db.session.commit()
    return num_rows_deleted