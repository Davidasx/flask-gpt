import json
import os
import requests

# Azure Translate API Configuration
subscription_key = os.environ["AZURE_KEY"]
endpoint = 'https://api.cognitive.microsofttranslator.com/'
location = 'global'

path = '/translate?api-version=3.0'
params = '&to={target_language}'
constructed_url = endpoint + path

headers = {
    'Ocp-Apim-Subscription-Key': subscription_key,
    'Ocp-Apim-Subscription-Region': location,
    'Content-type': 'application/json',
    'X-ClientTraceId': 'random-string'
}

def translate_text(text, target_language):
    """
    Translates text to the target language using Azure Translate API.
    """
    params_final = params.format(target_language=target_language)
    request_body = [{
        'text': text
    }]
    try:
        response = requests.post(constructed_url + params_final, headers=headers, json=request_body)
        response.raise_for_status()
        return response.json()[0]['translations'][0]['text']
    except requests.exceptions.RequestException as e:
        print(f'Error: {e}')
        return None

def load_locales(file_path):
    """
    Loads the locales.json file.
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_locales(file_path, locales):
    """
    Saves the updated locales data back to locales.json.
    """
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(locales, f, ensure_ascii=False, indent=4)
    print(f'Saved to {file_path}')

def get_missing_translations(locales, base_language, target_languages):
    """
    Retrieves missing translation keys for each target language.
    """
    missing = {}
    base_texts = locales['translations'].get(base_language, {})
    for lang in target_languages:
        lang_translations = locales['translations'].get(lang, {})
        missing_keys = [key for key in base_texts if key not in lang_translations]
        if missing_keys:
            missing[lang] = missing_keys
    return missing

def get_modified_keys(locales, base_language, target_languages):
    """
    Retrieves keys where the base language text has been modified.
    """
    modified = {}
    base_texts = locales['translations'].get(base_language, {})
    for lang in target_languages:
        lang_translations = locales['translations'].get(lang, {})
        for key, text in base_texts.items():
            if key in lang_translations:
                # 比较基础语言文本与目标语言翻译是否一致（需存储原文以比较）
                # 这里假设有一个 'original_texts' 存储原文
                original_text = locales.get('original_texts', {}).get(key)
                if original_text and text != locales['original_texts'][key]:
                    modified.setdefault(lang, []).append(key)
    return modified

def get_deleted_keys(locales, base_language, target_languages):
    """
    Retrieves keys that have been deleted from the base language.
    """
    deleted = {}
    base_texts = locales['translations'].get(base_language, {})
    for lang in target_languages:
        lang_translations = locales['translations'].get(lang, {})
        deleted_keys = [key for key in lang_translations if key not in base_texts]
        if deleted_keys:
            deleted[lang] = deleted_keys
    return deleted

def create_zh_hk(locales):
    """
    Creates zh-hk translations based on zh-cn.
    """
    if 'zh-hk' not in locales['translations']:
        locales['translations']['zh-hk'] = {}
        print("Created 'zh-hk' based on 'zh-cn'.")
    zh_cn = locales['translations'].get('zh-cn', {})
    for key, text in zh_cn.items():
        if key not in locales['translations']['zh-hk']:
            translated_text = translate_text(text, 'zh-hk')
            if translated_text:
                locales['translations']['zh-hk'][key] = translated_text
                print(f'Translated "{key}" to zh-hk: {translated_text}')
            else:
                print(f'Failed to translate "{key}" to zh-hk')

def translate_entry(locales, base_language, target_languages, entry_key):
    """
    Translates a specific entry key across all target languages.
    """
    if entry_key not in locales['translations'].get(base_language, {}):
        print(f'Entry key "{entry_key}" not found in base language "{base_language}".')
        return

    base_text = locales['translations'][base_language][entry_key]
    for lang in target_languages:
        if lang == base_language:
            continue
        if lang not in locales['translations']:
            locales['translations'][lang] = {}
            print(f"Added new language: {lang}")
        translated_text = translate_text(base_text, lang)
        if translated_text:
            locales['translations'][lang][entry_key] = translated_text
            print(f'Translated "{entry_key}" to {lang}: {translated_text}')
        else:
            print(f'Failed to translate "{entry_key}" to {lang}')

def main():
    locales_path = 'static/locales.json'
    locales = load_locales(locales_path)

    base_language = 'en'
    target_languages = ['fr', 'de', 'es']

    if base_language not in locales['translations']:
        raise ValueError(f"Base language '{base_language}' not found in locales.json.")

    # Handle missing translations
    missing_translations = get_missing_translations(locales, base_language, target_languages)
    for lang, keys in missing_translations.items():
        if lang not in locales['translations']:
            locales['translations'][lang] = {}
            print(f"Added new language: {lang}")
        for key in keys:
            base_text = locales['translations'][base_language][key]
            translated_text = translate_text(base_text, lang)
            if translated_text:
                locales['translations'][lang][key] = translated_text
                print(f'Translated "{key}" to {lang}: {translated_text}')
            else:
                print(f'Failed to translate "{key}" to {lang}')

    # Handle deleted translations
    deleted_keys = get_deleted_keys(locales, base_language, target_languages)
    for lang, keys in deleted_keys.items():
        for key in keys:
            del locales['translations'][lang][key]
            print(f'Deleted "{key}" from {lang} translations.')

    # Handle modified translations if applicable
    # Implement comparison logic as needed

    # Create zh-hk based on zh-cn
    create_zh_hk(locales)

    # Save updated locales.json
    save_locales(locales_path, locales)

    # Uncomment the following lines to use the translate_entry function
    # entry_to_translate = 'welcome'
    # translate_entry(locales, base_language, target_languages, entry_to_translate)
    # save_locales(locales_path, locales)

if __name__ == '__main__':
    main()