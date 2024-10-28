## Install on your own server

Want to deploy it on your own server? Follow this guide to do this easily.

### Getting the source code

First, clone the repository:

```bash
git clone https://github.com/Davidasx/flask-gpt.git
cd flask-gpt
```

### Setting up the environment

Create a virtual environment and install the dependencies:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Running the program

Run the program:

```bash
python3 main.py
```

You can access the web ui at `http://localhost:7788`.

### Customizing the chatbot

#### Customizing the system prompts

You can customize system commands by writing files in the prompts directory. The system will automatically load them. No need to manually edit the code.

#### Environment variables

The following environment variables can be set:

- `DUCK_PROXY`: Set this to use a proxy for DuckDuckGo search.