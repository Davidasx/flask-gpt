# flask-gpt

![code size](https://img.shields.io/github/languages/code-size/Davidasx/flask-gpt)

![last commit](https://img.shields.io/github/last-commit/Davidasx/flask-gpt)

ChatGPT Web UI implemented with Flask, HTML, Javascript and CSS.

Fill in your own API to use.

## Installation

See [installation.md](installation.md) for installation instructions.

## Features

- Chat with GPT and every model that supports OpenAI-style API.
- Let the model search online for information with DuckDuckGo.
- Generate images with FLUX.

## Implementation

Frontend: HTML, CSS, and Javascript to receive user messages and send them to the backend.

Backend: Python Flask to receive messages from the frontend and call the API.

Search: Free DuckDuckGo search API to search for information. You can set `DUCK_PROXY` environment variable to use a proxy for DuckDuckGo.

Draw: Free CloudFlare Workers AI FLUX-schnell model to generate images. You can set `CLOUDFLARE_API_KEY` and `CLOUDFLARE_USER_ID` environment variables to use the CloudFlare Workers AI.

All chat data is stored in an SQL database, with UUIDs stored in cookies.

We will not use your data for any purpose other than to provide the service. The SQL database will never be viewed by anyone other than the program.

The log of the python program will hide all personal information. The only thing that will be shown in the log is the web requests.

## Branches

[Main branch](https://github.com/Davidasx/flask-gpt/tree/main): Latest tested stable version, with the most stable features and good experience.

[Dev branch](https://github.com/Davidasx/flask-gpt/tree/dev): Latest features, may be unstable. Several features may be incomplete.

## Demo site (low performance, Dev branch)

[https://chat.davidx.us.kg/](https://chat.davidx.us.kg/)
