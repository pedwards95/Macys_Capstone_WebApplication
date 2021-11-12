let baseURL;

// creates the confirm item form, and sends it on the the application on submit
async function INIT() {
    window.CONFIG = await $.getJSON("static/config.json");
    $(".confirm_item_form").on("submit",itemConfirm.bind(this));
    if(CONFIG["MODE"] == "DEVELOPMENT") {
        baseURL = "http://127.0.0.1:5000/";
    }
    else if (CONFIG["MODE"] == "PRODUCTION") {
        baseURL = "https://macymain-pde.azurewebsites.net/";
    }
}

// runs initialization code
INIT();

// event to submit
function itemConfirm(evt) {
    evt.preventDefault();
    const section = evt.target.children[0].id;
    window.location.replace(`${baseURL}map/${section}`);
}