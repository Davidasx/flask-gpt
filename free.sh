cp -r /home/davidx/Desktop/free-chat/.git /tmp/backup.git
rm -rf /home/davidx/Desktop/free-chat
cp -r /home/davidx/Desktop/flask-gpt /home/davidx/Desktop/free-chat
rm -rf /home/davidx/Desktop/free-chat/.git
cp -r /tmp/backup.git /home/davidx/Desktop/free-chat/.git
rm -rf /tmp/backup.git
cd /home/davidx/Desktop/free-chat
rm README.md changelog.md free.sh installation.md TODO.md translate.py
rm -rf TODO