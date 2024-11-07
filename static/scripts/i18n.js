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
}

function translate(key) {
    const lang = localStorage.getItem('language') || 'en';
    const allTranslations = JSON.parse(localStorage.getItem('allTranslations')) || {};
    return allTranslations[lang][key] || key;
}

async function setLanguage(lang) {
    const allTranslations = JSON.parse(localStorage.getItem('allTranslations')) || {};
    translatePage(allTranslations, lang);
    localStorage.setItem('language', lang);
}

document.addEventListener('DOMContentLoaded', async () => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    const storedVersion = localStorage.getItem('translations_version');
    const data = await loadTranslations();
    const currentVersion = data.version;
    const allTranslations = data.translations;

    if (storedVersion !== currentVersion) {
        localStorage.setItem('allTranslations', JSON.stringify(allTranslations));
        localStorage.setItem('translations_version', currentVersion);
    }

    translatePage(allTranslations, savedLanguage);
    const translations = JSON.parse(localStorage.getItem('allTranslations')) || allTranslations;
    document.getElementById('language-select').value = savedLanguage;
    await setLanguage(savedLanguage, translations);
});