function setModel(value) {
    if (value === 'custom') {
        document.getElementById('custom-model-name').style.display = 'inline';
    } else {
        document.getElementById('custom-model-name').style.display = 'none';
    }
    localStorage.setItem('model', value);
}

function updateCustomModel() {
    const customName = document.getElementById('custom-model-name').value.trim();
    const modelSelect = document.getElementById('model-select');
    const translatedCustom = translate('custom');
    const customOption = modelSelect.querySelector('option[value="custom"]');

    customOption.textContent = customName ? `${translatedCustom}(${customName})` : translatedCustom;
    localStorage.setItem('custom-model', customName);
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const modelSelect = document.getElementById('model-select');
        const savedModel = localStorage.getItem('model') || 'gpt-4o';
        modelSelect.value = savedModel;
        const customName = localStorage.getItem('custom-model') || '';
        if (customName != '') {
            document.getElementById('custom-model-name').value = customName;
        }
        if (savedModel === 'custom') {
            const customModelInput = document.getElementById('custom-model-name');
            customModelInput.value = customName;
            customModelInput.style.display = 'inline';
        } else {
            const customModelInput = document.getElementById('custom-model-name');
            customModelInput.style.display = 'none';
            const customOption = modelSelect.querySelector('option[value="custom"]');
            const translatedCustom = translate('custom');
            customOption.textContent = translatedCustom;
        }
        if (customName != '') {
            updateCustomModel();
        }
    }, 2000);
});