let baseURL;

// creates the item search form and binds it to the event, sending it on the the application
async function INIT() {
    window.CONFIG = await $.getJSON("static/config.json");
    $("#macy_search_form").on("submit",itemSearch.bind(this));
    if(CONFIG["MODE"] == "DEVELOPMENT") {
        baseURL = "http://127.0.0.1:5000/";
    }
    else if (CONFIG["MODE"] == "PRODUCTION") {
        baseURL = "https://macymain-pde.azurewebsites.net/";
    }
}

// runs initialization code
INIT();


// item search form event
function itemSearch(evt) {
    evt.preventDefault();
    const searchingContent = $("#searching-content")
    searchingContent.css("display","inline");
    const text = $('#macy-search-bar').val().split(" ");
    let searchText;
    if (!filterWord(text[0])) searchText = text[0];
    // auto searches for clothes if nothing is input
    else searchText = "clothes";
    // breaks up the search terms
    for(let q=1;q<text.length;q++) {
        if (filterWord(text[q])) continue;
        searchText = searchText + `,${text[q]}`;
    }
    // forwards to application
    window.location.replace(`${baseURL}search?terms=${searchText}&sort=none`);
}

// filters filler words based on config
function filterWord(word) {
    let filteredWords = window.CONFIG["fWORDS"];
    if (filteredWords[`${word.toLowerCase()}`]) return true;
    return false;
}











