//     transform: rotate(-37.7deg);

let baseURL;
let imageHeight;
let imageWidth;
const MAXLONGITUDE = -96.80824263154483;
const MINLONGITUDE = -96.80976957791401;
const MAXLATITUDE = 33.101326552499955;
const MINLATITUDE = 33.10008519974966;
const DOTS=[];

async function INIT() {
    if (typeof jQuery == 'undefined') {
        document.write(unescape("%3Cscript src='https://code.jquery.com/jquery-3.6.0.min.js' integrity='sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=' crossorigin='anonymous'%3E%3C/script%3E"));
    }
    window.CONFIG = await $.getJSON("../static/config.json");
    if(CONFIG["MODE"] == "DEVELOPMENT") {
        baseURL = "http://127.0.0.1:5000/";
        placeDots();
    }
    else if (CONFIG["MODE"] == "PRODUCTION") {
        // TODO
    }
    let location = await findPerson()
    placePerson(location.demo);
    calculateImage();
    let yourLongPercent = ((location.longitude-MINLONGITUDE)  / (MAXLONGITUDE-MINLONGITUDE))*100
    let yourLatPercent = ((location.latitude-MINLATITUDE)  / (MAXLATITUDE-MINLATITUDE))*100
    log(`Your Latitude Percentage: ${yourLatPercent} ||| Your Longitude Percentage: ${yourLongPercent}`);
    log("Initialized");
    $("body").on("keydown",shiftMap);
    let destinationData = $('#my-data').data();
    if(destinationData) {
        mapMe(destinationData);
    }
}

$("body").on("load",INIT());

function calculateImage() {
    const map = $('#macy-lower-map');
    imageHeight = map.height();
    imageWidth = map.width();
}

async function findPerson() {
    log("Finding person...")
    const KEY = "e472ca7e33be5dfac0941ac3676d26a0"
    let ip = (await axios.get("https://api.ipify.org/?format=json")).data.ip
    let you = (await axios.get(`http://api.ipstack.com/${ip}?access_key=${KEY}`)).data
    log(` Your Long: ${you.longitude} vs MaxLong: ${MAXLONGITUDE} and MinLong: ${MINLONGITUDE} |||||| Your Lat ${you.latitude} vs MaxLat ${MAXLATITUDE} and MinLat ${MINLATITUDE}`)
    if(you.longitude > MAXLONGITUDE || you.longitude < MINLONGITUDE || you.latitude > MAXLATITUDE || you.latitude < MINLATITUDE) {
        log("Person out of bounds: DEMO MODE.")
        return {
            "longitude": -96.80889671492305,
            "latitude": 33.10074461153677,
            "demo":true
        }
    } else {
        log("Person in store: REAL MODE.")
        return {
            "longitude":you.longitude,
            "latitude":you.latitude,
            "demo":false
        }
    }
}

function placePerson(demo) {
    $('body').append("<img id='you'></img>")
    const you = $("#you")
    you.attr("src","../static/images/Map_Pin.png")
    if(demo) {
        const {DEMO_COORDS} = CONFIG;
        const left = parseLeftPercentage(DEMO_COORDS.X);
        const top = parseTopPercentage(DEMO_COORDS.Y);
        you.css({top:`${top-20}px`,left:`${left-20}px`});
        window.YOU ={left,top,you};
    }
}

function log(msg,code="INFO") {
    if(CONFIG["MODE"] == "DEVELOPMENT") {
        console.log(`${code}: ${msg}`);
    }
}

function shiftMap({key}) {
    const {MOVE_SCALE} = CONFIG;
    const map = $('#macy-lower-map');
    const you = $('#you');
    const top = parseInt((map.css("top")).substring(0,(map.css("top")).length-2));
    const youTop = parseInt((you.css("top")).substring(0,(you.css("top")).length-2));
    const left = parseInt((map.css("left")).substring(0,(map.css("left")).length-2));
    const youLeft = parseInt((you.css("left")).substring(0,(you.css("left")).length-2));
    const navagator = $('#draw-here');
    const SHIFT = {
        "ArrowUp" : () => {
            if(top>500) {
                console.log("Too far!")
                return;
            }
            map.css({top: `${top+MOVE_SCALE}px`})
            navagator.css({top: `${top+MOVE_SCALE}px`})
            you.css({top: `${youTop+MOVE_SCALE}px`})
            if(CONFIG["MODE"] == "DEVELOPMENT") {
                for(dot of DOTS) {
                    const dotTop = parseInt((dot.css("top")).substring(0,(dot.css("top")).length-2));
                    dot.css({top: `${dotTop+MOVE_SCALE}px`})
                }
            }
        },
        "ArrowDown" : () => {
            if(top<-1100) {
                console.log("Too far!")
                return;
            }
            map.css({top: `${top-MOVE_SCALE}px`})
            navagator.css({top: `${top-MOVE_SCALE}px`})
            you.css({top: `${youTop-MOVE_SCALE}px`})
            if(CONFIG["MODE"] == "DEVELOPMENT") {
                for(dot of DOTS) {
                    const dotTop = parseInt((dot.css("top")).substring(0,(dot.css("top")).length-2));
                    dot.css({top: `${dotTop-MOVE_SCALE}px`})
                }
            }
        },
        "ArrowLeft" : () => {
            if(left>700) {
                console.log("Too far!")
                return;
            }
            map.css({left: `${left+MOVE_SCALE}px`})
            navagator.css({left: `${left+MOVE_SCALE}px`})
            you.css({left: `${youLeft+MOVE_SCALE}px`})
            if(CONFIG["MODE"] == "DEVELOPMENT") {
                for(dot of DOTS) {
                    const dotLeft = parseInt((dot.css("left")).substring(0,(dot.css("left")).length-2));
                    dot.css({left: `${dotLeft+MOVE_SCALE}px`})
                }
            }
        },
        "ArrowRight" : () => {
            if(left<-1900) {
                console.log("Too far!")
                return;
            }
            map.css({left: `${left-MOVE_SCALE}px`})
            navagator.css({left: `${left-MOVE_SCALE}px`})
            you.css({left: `${youLeft-MOVE_SCALE}px`})
            if(CONFIG["MODE"] == "DEVELOPMENT") {
                for(dot of DOTS) {
                    const dotLeft = parseInt((dot.css("left")).substring(0,(dot.css("left")).length-2));
                    dot.css({left: `${dotLeft-MOVE_SCALE}px`})
                }
            }
        }
    }
    try{
        SHIFT[key]();
    }catch{};
}

function findCursor(evt) {
    // let myX = ((evt.pageX-evt.target.offsetLeft)/(evt.target.width))*100;
    // let myY = ((evt.pageY-evt.target.offsetTop)/((evt.target.height))*100);
    const map = $('#macy-lower-map')[0];
    let myX = ((evt.pageX-map.offsetLeft)/(map.width))*100;
    let myY = ((evt.pageY-map.offsetTop)/((map.height))*100);
    log(`ON CLICK: x: ${evt.pageX}, Click y: ${evt.pageY}`);
    log(`ON CLICK: Image X percentage: ${myX} || Image Y percentage: ${myY}`);
    if(checkIfValidLocation(myX,myY)) {
        console.log("VALID") 
    }else{
        console.log("INVALID");
    }
}

function placeDots() {
    calculateImage();
    const {NO_GO} = CONFIG;
    for(area of NO_GO){
        let corners =[area.TR,area.TL,area.BR,area.BL];
        for(corner of corners) {
            const top = parseTopPercentage(corner.Y);
            const left = parseLeftPercentage(corner.X);
            let dot = $(`<span class='dot' style="top:${top}px; left:${left}px"></span>`)
            DOTS.push(dot);
            $("#map_container").append(dot);
        }
    }
}

function checkIfValidLocation(myX,myY) {
    //Note: Takes percentages
    const {NO_GO} = CONFIG;
    for(area of NO_GO){
        if(!(myX < area.TR.X || myX < area.BR.X)) {
            continue;
        }
        if(!(myX > area.TL.X || myX > area.BL.X)) {
            continue;
        }
        if(!(myY > area.TL.Y || myY > area.TR.Y)) {
            continue;
        }
        if(!(myY < area.BL.Y || myY < area.BR.Y)) {
            continue;
        }
        log("Invalid area!","WARNING")
        return false;
    }
    return true;
}

function parseTopPercentage(Y) {
    const map = $('#macy-lower-map');
    return parseInt((map.css("height")).substring(0,(map.css("height")).length-2))*((Y)/100)+(map.offset().top);
}

function parseLeftPercentage(X) {
    const map = $('#macy-lower-map');
    return parseInt((map.css("width")).substring(0,(map.css("width")).length-2))*((X)/100)+(map.offset().left);
}

function mapMe(data){
    const destination = CONFIG.LOCATIONS[data.destination];
    const destX = parseLeftPercentage(destination.X);
    const destY = parseTopPercentage(destination.Y);

    const youAreHere = YOU;

    let drawing=true;
    var c = document.getElementById("draw-here");
    var ctx = c.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(youAreHere.left, youAreHere.top);

    let count=0;
    while(drawing) {
        const {X,Y} = findNextPoint(youAreHere.left, youAreHere.top,destX,destY);
        if((Math.abs(destX-X))+(Math.abs(destY-Y)) < 200) {
            ctx.lineTo(X, Y);
            ctx.stroke();
            ctx.lineTo(destX, destY);
            ctx.stroke();
            drawing=false;
        } else {
            ctx.lineTo(X, Y);
            ctx.stroke();
            youAreHere.left = X; 
            youAreHere.top = Y; 
            console.log("loop");
            count++;
            if(count >= 100){
                drawing=false;
            }
            
        }

    }
    console.log("Count: ",count)

}

function findNextPoint(myX,myY,destX,destY) {
    let found = false;
    while(!found) {
        let changed=false;
        const map = $('#macy-lower-map')[0];
        if(myX > destX){
            console.log("hit here 5");
            let tempX = ((myX-30-map.offsetLeft)/(map.width))*100;
            let tempY = ((myY-map.offsetTop)/((map.height))*100);
            if (!checkIfValidLocation(tempX,((myY-10-map.offsetTop)/((map.height))*100))) {
                console.log("hit here 6");
                //nop
            }
            else if (!checkIfValidLocation(tempX,((myY+10-map.offsetTop)/((map.height))*100))) {
                console.log("hit here 7");
                //nop
            }
            else if (checkIfValidLocation(tempX,tempY)) {
                console.log("hit here 2");
                myX=myX-15;
                changed=true;
            }
        }
        if(myX < destX && !changed){
            let tempX = ((myX+30-map.offsetLeft)/(map.width))*100;
            let tempY = ((myY-map.offsetTop)/((map.height))*100);
            if (!checkIfValidLocation(tempX,((myY-10-map.offsetTop)/((map.height))*100))) {
                //nop
            }
            else if (!checkIfValidLocation(tempX,((myY+10-map.offsetTop)/((map.height))*100))) {
                //nop
            }
            else if (checkIfValidLocation(tempX,tempY)) {
                myX=myX+15;
                changed=true;
            }
        }
        if(myY > destY && !changed){
            console.log("hit here 1");
            let tempX = ((myX-map.offsetLeft)/(map.width))*100;
            let tempY = ((myY-30-map.offsetTop)/((map.height))*100);
            if (!checkIfValidLocation(((myX-5-map.offsetLeft)/((map.width))*100),tempY)) {
                console.log("hit here 3");
                //nop
            }
            else if (!checkIfValidLocation(((myX+5-map.offsetLeft)/((map.width))*100),tempY)) {
                console.log("hit here 4");
                //nop
            }
            else if (checkIfValidLocation(tempX,tempY)) {
                myY=myY-15;
                changed=true;
            }
        }
        if(myY < destY && !changed){
            let tempX = ((myX-map.offsetLeft)/(map.width))*100;
            let tempY = ((myY+30-map.offsetTop)/((map.height))*100);
            if (!checkIfValidLocation(((myX-10-map.offsetLeft)/((map.width))*100),tempY)) {
                //nop
            }
            else if (!checkIfValidLocation(((myX+10-map.offsetLeft)/((map.width))*100),tempY)) {
                //nop
            }
            else if (checkIfValidLocation(tempX,tempY)) {
                myY=myY+15;
                changed=true;
            }
        }
        if(changed){
            console.log(myX,myY)
            return {"X":myX,"Y":myY};
        }
        else{
            return {"X":myX,"Y":myY};
        }
    }
}


$("body").on("click",findCursor);