function setStream(value) {
    localStorage.setItem('stream', value.toString());
}
function setSearch(value) {
    localStorage.setItem('search', value.toString());
}

function setNoSystem(value,auto) {
    localStorage.setItem('noSystem', value.toString());
    if (!auto) {
        localStorage.setItem('previousNoSystemState', value.toString());
    }

    const searchCheckbox = document.getElementById('search-enabled');

    if (value) {
        searchCheckbox.disabled = true;
        searchCheckbox.parentElement.style.opacity = '0.5';
    } else {
        searchCheckbox.disabled = false;
        searchCheckbox.parentElement.style.opacity = '1';
    }
}

function setNoStream(value) {
    localStorage.setItem('noStream', value.toString());

    const streamCheckbox = document.getElementById('stream-enabled');

    if (value) {
        streamCheckbox.disabled = true;
        streamCheckbox.parentElement.style.opacity = '0.5';
    } else {
        streamCheckbox.disabled = false;
        streamCheckbox.parentElement.style.opacity = '1';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const streamCheck = document.getElementById('stream-enabled');
        const savedStream = localStorage.getItem('stream') || 'true';
        streamCheck.checked = savedStream === 'true';
        setStream(streamCheck.checked);

        const searchCheck = document.getElementById('search-enabled');
        const savedSearch = localStorage.getItem('search') || 'false';
        searchCheck.checked = savedSearch === 'true';
        setSearch(searchCheck.checked);

        const noSystemCheck = document.getElementById('no-system');
        const savedNoSystem = localStorage.getItem('noSystem') || 'false';
        noSystemCheck.checked = savedNoSystem === 'true';
        setNoSystem(noSystemCheck.checked,true);

        const savedNoStream = localStorage.getItem('noStream') || 'false';
        setNoStream(savedNoSystem === 'true');
    }, 2000);
});