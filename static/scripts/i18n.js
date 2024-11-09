async function loadTranslations() {
    const response = await fetch('/static/locales.json');
    const data = await response.json();
    return data;
}

function translatePage(translations, lang) {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        } else {
            element.textContent = key;
        }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        if (translations[lang] && translations[lang][key]) {
            element.setAttribute('title', translations[lang][key]);
        } else {
            element.setAttribute('title', key);
        }
    });

    const messageElement = document.getElementById('message');
    if (messageElement) {
        if (translations[lang] && translations[lang]['input']) {
            messageElement.placeholder = translations[lang]['input'];
        } else {
            messageElement.placeholder = 'Enter your message';
        }
    }

    const customModelName = document.getElementById('custom-model-name');
    if (customModelName) {
        if (translations[lang] && translations[lang]['model-name']) {
            customModelName.placeholder = translations[lang]['model-name'];
        } else {
            customModelName.placeholder = 'Model Name';
        }
    }
}

function translate(key) {
    const lang = (localStorage.getItem('language') || 'en').toLowerCase();
    const allTranslations = JSON.parse(localStorage.getItem('allTranslations')) || {};
    return allTranslations[lang][key] || key;
}

async function setLanguage(lang) {
    const allTranslations = JSON.parse(localStorage.getItem('allTranslations')) || {};
    translatePage(allTranslations, lang.toLowerCase());
    localStorage.setItem('language', lang.toLowerCase());
}

document.addEventListener('DOMContentLoaded', async () => {
    let savedLanguage = (localStorage.getItem('language') || navigator.language || 'en').toLowerCase();
    const storedVersion = localStorage.getItem('translations_version');
    const data = await loadTranslations();
    const currentVersion = data.version;
    const allTranslations = data.translations;

    if (!allTranslations[savedLanguage]) {
        savedLanguage = 'en';
    }

    if (storedVersion !== currentVersion) {
        localStorage.setItem('allTranslations', JSON.stringify(allTranslations));
        localStorage.setItem('translations_version', currentVersion);
    }

    translatePage(allTranslations, savedLanguage);
    const translations = JSON.parse(localStorage.getItem('allTranslations')) || allTranslations;
    document.getElementById('language-select').value = savedLanguage;
    await setLanguage(savedLanguage, translations);
});