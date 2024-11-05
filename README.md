# flask-gpt

ChatGPT Web UI implemented with Flask, HTML, Javascript and CSS.

Fill in your own API to use.

## Installation

See [installation.md](installation.md) for installation instructions.

## Implementation

Frontend: HTML, CSS, and Javascript to receive user messages and send them to the backend.

Backend: Python Flask to receive messages from the frontend and call the API.

Search: Free DuckDuckGo search API to search for information. You can set `DUCK_PROXY` environment variable to use a proxy for DuckDuckGo.

All chat data is stored in an SQL database, with UUIDs stored in cookies.

We will not use your data for any purpose other than to provide the service. The SQL database will never be viewed by anyone other than the program.

The log of the python program will hide all personal information. The only thing that will be shown in the log is the web requests.

## Branches

[Main branch](https://github.com/Davidasx/flask-gpt/tree/main): Latest tested stable version, with the most stable features and good experience.

[Dev branch](https://github.com/Davidasx/flask-gpt/tree/dev): Latest features, may be unstable. Several features may be incomplete.

## Demo site (low performance, Dev branch)

[http://chat.davidx.us.kg/](http://chat.davidx.us.kg/)