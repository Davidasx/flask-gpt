async function loadLanguage(lang) {
    const response = await fetch(`/static/locales/${lang}.json`);
    const translations = await response.json();
    localStorage.setItem(`translations_${lang}`, JSON.stringify(translations));
    localStorage.setItem(`translations_version_${lang}`, translations.version);
    return translations;
}

function translatePage(translations) {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = translations[key];
    });
    const messageElement = document.getElementById('message');
    if (messageElement) {
        messageElement.placeholder = translations['input'];
    }
}

async function setLanguage(lang) {
    const response = await fetch(`/static/locales/${lang}.json`);
    const latestTranslations = await response.json();
    const latestVersion = latestTranslations.version;

    let storedTranslations = JSON.parse(localStorage.getItem(`translations_${lang}`));
    const storedVersion = localStorage.getItem(`translations_version_${lang}`);

    if (!storedTranslations || storedVersion !== latestVersion) {
        storedTranslations = await loadLanguage(lang);
    }

    translatePage(storedTranslations);
    localStorage.setItem('language', lang);
}

// Automatically load the user's last selected language
document.addEventListener('DOMContentLoaded', () => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    document.getElementById('language-select').value = savedLanguage;
    setLanguage(savedLanguage);
});

// Translation function
function translate(key) {
    const lang = localStorage.getItem('language') || 'en';
    const translations = JSON.parse(localStorage.getItem(`translations_${lang}`)) || {};
    return translations[key] || key;
}