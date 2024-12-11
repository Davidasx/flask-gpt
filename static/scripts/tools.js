function setStream(value) {
    localStorage.setItem('stream', value.toString());
}
function setSearch(value) {
    localStorage.setItem('search', value.toString());
}


document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const streamCheck = document.getElementById('stream-enabled');
        const savedStream = localStorage.getItem('stream') || 'true';
        streamCheck.checked = savedStream === 'true';
        localStorage.setItem('stream', savedStream);

        const searchCheck = document.getElementById('search-enabled');
        const savedSearch = localStorage.getItem('search') || 'false';
        searchCheck.checked = savedSearch === 'true';
        localStorage.setItem('search', savedSearch);
    }, 2000);
});