let baseURL;

async function INIT() {
    window.CONFIG = await $.getJSON("static/config.json");
    $("#macy_search_form").on("submit",itemSearch.bind(this));
    if(CONFIG["MODE"] == "DEVELOPMENT") {
        baseURL = "http://127.0.0.1:5000/";
    }
    else if (CONFIG["MODE"] == "PRODUCTION") {
        // TODO
    }
}

INIT();

function itemSearch(evt) {
    evt.preventDefault();
    const text = $('#macy-search-bar').val().split(" ");
    let searchText;
    if (!filterWord(text[0])) searchText = text[0];
    else searchText = "clothes";
    for(let q=1;q<text.length;q++) {
        if (filterWord(text[q])) continue;
        searchText = searchText + `,${text[q]}`;
    }
    window.location.replace(`${baseURL}search?terms=${searchText}&sort=none`);
}

function filterWord(word) {
    let filteredWords = window.CONFIG["fWORDS"];
    if (filteredWords[`${word.toLowerCase()}`]) return true;
    return false;
}











