function setModel(model) {
    localStorage.setItem('model', model)
}

document.addEventListener('DOMContentLoaded', () => {
    const savedModel = localStorage.getItem('model') || 'gpt-4o-stream';
    document.getElementById('model-select').value = savedModel;
    setModel(savedModel);
});