## Current Version:

[![](https://img.shields.io/badge/Dev-3.3.2-blue)](https://github.com/Davidasx/flask-gpt/tree/dev)
[![](https://img.shields.io/badge/Main-3.2.4.4-red)](https://github.com/Davidasx/flask-gpt/tree/main)

## Update Log (only after 3.1.0):

### 3.3.2

#### [![](https://img.shields.io/badge/Dev-20241228-blue)](https://github.com/Davidasx/flask-gpt)

Used `cloudscraper` to bypass 16 image hosting's CloudFlare shield.

### 3.3.1

#### [![](https://img.shields.io/badge/Dev-20241225-blue)](https://github.com/Davidasx/flask-gpt/tree/b450562)

Merry Christmas!

Fixed image display. Now the image adapts to 60% of the window width and 1024px(the original size) at max.

Made the AI able to "remember" what it drew before by adding the drawing prompt it created itself to the message list.

Used 16 image hosting instead of your database to store images.

### 3.3.0

#### [![](https://img.shields.io/badge/Dev-20241224-blue)](https://github.com/Davidasx/flask-gpt/tree/cb19227)

This is an revolutionary release.

Now has the ability to call CloudFlare AI's FLUX-schnell model to create images. The chatbot will aotumatically generate a image description and feed it to FLUX. The image will be generated in a few seconds and displayed in the message container.

Please set environment variables `CLOUDFLARE_API_KEY` and `CLOUDFLARE_USER_ID` to use this feature. Learn more about CloudFlare AI's FLUX model usage [here](https://developers.cloudflare.com/workers-ai/models/flux-1-schnell/).

Enjoy!

### 3.2.5.5

#### [![](https://img.shields.io/badge/Dev-20241223-blue)](https://github.com/Davidasx/flask-gpt/tree/4e47dfe)

Emergency fix. Sorry for the inconvenience.

The program will crash after the first message because the role of the bot has been modified to "assistant-[MODEL]" and the API will refuse such a request. Fixed now. Sorry.

### 3.2.5.4

#### [![](https://img.shields.io/badge/Dev-20241218-blue)](https://github.com/Davidasx/flask-gpt/tree/b71fb46)

Completed TODO 003.

Added Google Gemini logo.

Now the bot avatar in the chat will change according to the model you selected. You can also select different models and you will see different bot avatars in the chat playground.

TODO Completed: [#003](TODO/003.md) Support different logos for different models.

### 3.2.5.3

#### [![](https://img.shields.io/badge/Dev-20241214-blue)](https://github.com/Davidasx/flask-gpt/tree/f69aa30)

Partially completed TODO 003 by adding logos on model select list.

Supported logos:
- OpenAI
- Anthropic
- Meta
- Mistral
- Qwen
- Others (use a robot emoji)

Made the disable system prompt function more extensible. Mainly used for the experimental models in free-chat that mix system prompts with user prompts.

TODO Partially Completed: [#003](TODO/003.md) Support different logos for different models.

### 3.2.5.2

#### [![](https://img.shields.io/badge/Dev-20241214-blue)](https://github.com/Davidasx/flask-gpt/tree/669b1ab)

Fixed o1 models by removing system prompts. (They currently don't support those.)

TODO: [#003](TODO/003.md) Support different logos for different models.

### 3.2.5.1

#### [![](https://img.shields.io/badge/Dev-20241211-blue)](https://github.com/Davidasx/flask-gpt/tree/6651631)

Enabled caching of choices `stream` and `search`.

### 3.2.5

#### [![](https://img.shields.io/badge/Dev-20241211-blue)](https://github.com/Davidasx/flask-gpt/tree/49958ee)

Enabled stream and search toggle. Save tokens if you don't want the search feature.

Now you don't have to add the "-stream" tag after a model name if you want streaming response. The toggle does everything for you.

Nice. Just one day before class presentation.

TODO Completed: [#001](TODO/001.md) Manage system prompts in the frontend, not the backend.

### 3.2.4.7

#### [![](https://img.shields.io/badge/Dev/Main-20241209-purple)](https://github.com/Davidasx/flask-gpt/tree/8b1e0c5)

Fixed fatal error of streaming with non-ascii characters.

Current AI models always return an empty object in the front and I stopped listening once after receiving a None object... I'm so stupid.

### 3.2.4.6

#### [![](https://img.shields.io/badge/Dev/Main-20241110-purple)](https://github.com/Davidasx/flask-gpt/tree/2f53140)

Added IP lookup in logs to prevent attacks.

### 3.2.4.5

#### [![](https://img.shields.io/badge/Dev/Main-20241109-purple)](https://github.com/Davidasx/flask-gpt/tree/6c304ec)

Added three more languages.

TODO Completed: [#002](TODO/002.md) Add more languages.

### 3.2.4.4

#### [![](https://img.shields.io/badge/Dev/Main-20241109-purple)](https://github.com/Davidasx/flask-gpt/tree/d530756)

Improved i18n support.

Now it can read your browser language and set the page language accordingly.

TODO: [#002](TODO/002.md) Add more languages.

### 3.2.4.3

#### [![](https://img.shields.io/badge/Dev-20241107-blue)](https://github.com/Davidasx/flask-gpt/tree/690e7b9)

Minor fixes.

Improvements to the filesystem structure.

Updated sender button.

### 3.2.4.2

#### [![](https://img.shields.io/badge/Dev-20241107-blue)](https://github.com/Davidasx/flask-gpt/tree/2bb5039)

New feature: add custom models to the settings.

### 3.2.4.1

#### [![](https://img.shields.io/badge/Dev-20241105-blue)](https://github.com/Davidasx/flask-gpt/tree/79013d8)

New feature: manage system prompts flexibly.

TODO: [#001](TODO/001.md) Manage system prompts in the frontend, not the backend.

### 3.2.4

#### [![](https://img.shields.io/badge/Dev-20241102-blue)](https://github.com/Davidasx/flask-gpt/tree/a6f11c7)

New feature: change models manually.

Made settings model stay exactly in the middle.

### 3.2.3

#### [![](https://img.shields.io/badge/Dev/Main-20241028-purple)](https://github.com/Davidasx/flask-gpt/tree/c0bea4f)

Merged with main branch. Tested OK.

Fixed bug when searching. Previously, all searches will fail after a single failed search.

### 3.2.2

#### ![](https://img.shields.io/badge/Dev-20241028-blue)
Broke system prompts into separate files. You can edit them yourself to customize the chatbot.

### 3.2.1

#### ![](https://img.shields.io/badge/Dev-20241028-blue)

Improved language support and local time support.

Now the chatbot will tell you the local time, not the UTC time!

### 3.2.0

#### ![](https://img.shields.io/badge/Dev-20241028-blue)

Added multiple languages. Improved system prompt.

### 3.1.2

#### ![](https://img.shields.io/badge/Dev/Main-20241028-purple)

Fixed system message hiding bug. Fixed system prompt.

### 3.1.1

#### ![](https://img.shields.io/badge/Dev/Main-20241027-purple)

Added timedate support.

### 3.1.0

#### ![](https://img.shields.io/badge/Dev/Main-20241027-purple)

Fixes search feature. Now you can set `DUCK_PROXY` environment variable to use proxy for DuckDuckGo.

Set default language to English to allow for international users.

Will add more languages soon.