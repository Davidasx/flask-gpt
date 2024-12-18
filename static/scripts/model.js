function setModel(value) {
    if (value === 'custom') {
        document.getElementById('custom-model-name').style.display = 'inline';
    }
    else {
        document.getElementById('custom-model-name').style.display = 'none';
    }
    localStorage.setItem('model', value);
    updateIcon();
}


function updateIcon() {
    const storedModel = localStorage.getItem('model') || 'gpt-4o';
    const modelName = storedModel === 'custom' ? localStorage.getItem('custom-model') : storedModel;
    const iconSpan = document.getElementById('model-icon');

    if (modelName.includes('gpt') || modelName.includes('o1')) {
        iconSpan.className = 'model-icon icon-openai';
    }
    else if (modelName.includes('claude')) {
        iconSpan.className = 'model-icon icon-anthropic';
    }
    else if (modelName.includes('gemini')) {
        iconSpan.className = 'model-icon icon-gemini';
    }
    else if (modelName.includes('llama')) {
        iconSpan.className = 'model-icon icon-meta';
    }
    else if (modelName.includes('grok')) {
        iconSpan.className = 'model-icon icon-xai';
    }
    else if (modelName.includes('mistral') || modelName.includes('mixtral')) {
        iconSpan.className = 'model-icon icon-mistral';
    }
    else if (modelName.includes('qwen')) {
        iconSpan.className = 'model-icon icon-qwen';
    }
    else {
        iconSpan.className = 'model-icon icon-misc';
    }

}

function handleModelChange(value) {
    setModel(value);

    const modelSelect = document.getElementById('model-select');
    const customInput = document.getElementById('custom-model-name');
    const iconSpan = document.getElementById('model-icon');

    const selectedOption = modelSelect.options[modelSelect.selectedIndex];
    const autoNoSystem = selectedOption?.getAttribute('data-auto-no-system') ?? false;
    const autoNoStream = selectedOption?.getAttribute('data-auto-no-stream') ?? false;
    const noSystemCheckbox = document.getElementById('no-system');

    if (autoNoSystem) {
        noSystemCheckbox.checked = true;
        noSystemCheckbox.disabled = true;
        setNoSystem(true,true);
    }
    else {
        noSystemCheckbox.checked = localStorage.getItem('previousNoSystemState') === 'true';
        noSystemCheckbox.disabled = false;
        setNoSystem(localStorage.getItem('previousNoSystemState') === 'true',true);
    }

    if (autoNoStream) {
        setNoStream(true);
    }
    else {
        setNoStream(false);
    }

    if (value === 'custom') {
        customInput.style.display = 'block';
    }
    else {
        customInput.style.display = 'none';
    }

    updateIcon();
}

function updateCustomModel(value) {
    const modelName = value.toLowerCase().trim();
    const modelSelect = document.getElementById('model-select');
    const translatedCustom = translate('custom');
    const customOption = modelSelect.querySelector('option[value="custom"]');

    localStorage.setItem('custom-model', modelName)

    customOption.textContent = modelName ? `${translatedCustom}(${modelName})` : translatedCustom;

    updateIcon();
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const modelSelect = document.getElementById('model-select');
        const savedModel = localStorage.getItem('model') || 'gpt-4o';
        updateIcon()
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
        updateCustomModel(customName);
        handleModelChange(savedModel);
    }, 2000);
});