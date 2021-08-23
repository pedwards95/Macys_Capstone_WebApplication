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
        document.write(unescape(`%3Cscript src='https://code.jquery.com/jquery-3.6.0.min.js' 
        integrity='sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=' 
        crossorigin='anonymous'%3E%3C/script%3E`));
    }
    window.CONFIG = await $.getJSON("../static/config.json");
    let destinationData = $('#my-data').data();
    if(CONFIG["MODE"] == "DEVELOPMENT") {
        baseURL = "http://127.0.0.1:5000/";
        $("body").on("click",findCursor);
        //placeDots();
        if(destinationData) {
            setupDemoPanel();
        }
        
    }
    else if (CONFIG["MODE"] == "PRODUCTION") {
        // TODO
    }
    let location = await findPerson()
    placePerson(location.demo);
    calculateImage();
    // centerScreen();
    let yourLongPercent = ((location.longitude-MINLONGITUDE)  / (MAXLONGITUDE-MINLONGITUDE))*100
    let yourLatPercent = ((location.latitude-MINLATITUDE)  / (MAXLATITUDE-MINLATITUDE))*100
    log(`Your Latitude Percentage: ${yourLatPercent} ||| Your Longitude Percentage: ${yourLongPercent}`);
    log("Initialized");
    $("body").on("keydown",shiftMap);
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
        you.css({top:`${top-40}px`,left:`${left-40}px`});
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
    const top = myParseInt(map,"top");
    const left = myParseInt(map,"left");

    const you = $('#you');
    const youTop = myParseInt(you,"top");
    const youLeft = myParseInt(you,"left");
    
    const navigator = $('#draw-here');

    const SHIFT = {
        "ArrowUp" : () => {
            if(top>500) {
                return;
            }
            map.css({top: `${top+MOVE_SCALE}px`})
            navigator.css({top: `${top+MOVE_SCALE}px`})
            you.css({top: `${youTop+MOVE_SCALE}px`})
            YOU.top=YOU.top+MOVE_SCALE;
            if(CONFIG["MODE"] == "DEVELOPMENT") {
                for(dot of DOTS) {
                    const dotTop = myParseInt(dot,"top");
                    dot.css({top: `${dotTop+MOVE_SCALE}px`})
                }
            }
        },
        "ArrowDown" : () => {
            if(top<-1100) {
                return;
            }
            map.css({top: `${top-MOVE_SCALE}px`})
            navigator.css({top: `${top-MOVE_SCALE}px`})
            you.css({top: `${youTop-MOVE_SCALE}px`})
            YOU.top=YOU.top-MOVE_SCALE;
            if(CONFIG["MODE"] == "DEVELOPMENT") {
                for(dot of DOTS) {
                    const dotTop = myParseInt(dot,"top");
                    dot.css({top: `${dotTop-MOVE_SCALE}px`})
                }
            }
        },
        "ArrowLeft" : () => {
            if(left>700) {
                return;
            }
            map.css({left: `${left+MOVE_SCALE}px`})
            navigator.css({left: `${left+MOVE_SCALE}px`})
            you.css({left: `${youLeft+MOVE_SCALE}px`})
            YOU.left=YOU.left+MOVE_SCALE;
            if(CONFIG["MODE"] == "DEVELOPMENT") {
                for(dot of DOTS) {
                    const dotLeft = myParseInt(dot,"left");
                    dot.css({left: `${dotLeft+MOVE_SCALE}px`})
                }
            }
        },
        "ArrowRight" : () => {
            if(left<-1900) {
                return;
            }
            map.css({left: `${left-MOVE_SCALE}px`})
            navigator.css({left: `${left-MOVE_SCALE}px`})
            you.css({left: `${youLeft-MOVE_SCALE}px`})
            YOU.left=YOU.left-MOVE_SCALE;
            if(CONFIG["MODE"] == "DEVELOPMENT") {
                for(dot of DOTS) {
                    const dotLeft = myParseInt(dot,"left")
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
    const map = $('#macy-lower-map')[0];
    let myX = ((evt.pageX-map.offsetLeft)/(map.width))*100;
    let myY = ((evt.pageY-map.offsetTop)/((map.height))*100);
    log(`ON CLICK: x: ${evt.pageX-map.offsetLeft}, Click y: ${evt.pageY-map.offsetTop}`);
    log(`ON CLICK: Image X percentage: ${myX} || Image Y percentage: ${myY}`);
    if(checkIfValidLocation(myX,myY)) {
        log("VALID") 
    }else{
        log("INVALID");
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
    return myParseInt(map,"height")*((Y)/100)+(map.offset().top);
}

function parseLeftPercentage(X) {
    const map = $('#macy-lower-map');
    return myParseInt(map,"width")*((X)/100)+(map.offset().left);
}

function mapMe(data){

    const destination = CONFIG.LOCATIONS[data.destination];
    const destX = parseLeftPercentage(destination.X);
    const destY = parseTopPercentage(destination.Y);

    const youAreHere = {};
    youAreHere.left = YOU.left;
    youAreHere.top = YOU.top;
    const map = $('#macy-lower-map')[0];

    let drawing=true;
    var c = document.getElementById("draw-here");
    var ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.beginPath();
    ctx.moveTo(youAreHere.left-map.offsetLeft, youAreHere.top-map.offsetTop);

    let count=0;
    while(drawing) {
        const {X,Y} = findNextPoint(youAreHere.left, youAreHere.top,destX,destY);
        if((Math.abs(destX-X))+(Math.abs(destY-Y)) < 200) {
            ctx.lineTo(X-map.offsetLeft, Y-map.offsetTop);
            ctx.stroke();
            ctx.lineTo(destX-map.offsetLeft, destY-map.offsetTop);
            ctx.stroke();
            drawing=false;
        } else {
            ctx.lineTo(X-map.offsetLeft, Y-map.offsetTop);
            ctx.stroke();
            youAreHere.left = X; 
            youAreHere.top = Y; 
            count++;
            if(count >= 500){
                drawing=false;
            }
            
        }

    }
    log(`Current Draw Count: ${count}`)

}

function findNextPoint(myX,myY,destX,destY) {
    allowed=false;
    const INCREMENT = 10;
    let found = false;
    while(!found) {
        let changed=false;
        const map = $('#macy-lower-map')[0];
        if(myX > destX || allowed){
            let tempX = ((myX-INCREMENT-map.offsetLeft)/(map.width))*100;
            let tempY = ((myY-map.offsetTop)/((map.height))*100);
            if (!checkIfValidLocation(tempX,((myY-10-map.offsetTop)/((map.height))*100))) {
                //nop
            }
            else if (!checkIfValidLocation(tempX,((myY+10-map.offsetTop)/((map.height))*100))) {
                //nop
            }
            else if (checkIfValidLocation(tempX,tempY)) {
                myX=myX-(INCREMENT/2);
                changed=true;
            }
        }
        if((myY > destY && !changed) || (allowed && !changed)){
            let tempX = ((myX-map.offsetLeft)/(map.width))*100;
            let tempY = ((myY-INCREMENT-map.offsetTop)/((map.height))*100);
            if (!checkIfValidLocation(((myX-5-map.offsetLeft)/((map.width))*100),tempY)) {
                //nop
            }
            else if (!checkIfValidLocation(((myX+5-map.offsetLeft)/((map.width))*100),tempY)) {
                //nop
            }
            else if (checkIfValidLocation(tempX,tempY)) {
                myY=myY-(INCREMENT/2);
                changed=true;
            }
        }
        if((myX < destX && !changed) || (allowed && !changed)){
            let tempX = ((myX+INCREMENT-map.offsetLeft)/(map.width))*100;
            let tempY = ((myY-map.offsetTop)/((map.height))*100);
            if (!checkIfValidLocation(tempX,((myY-10-map.offsetTop)/((map.height))*100))) {
                //nop
            }
            else if (!checkIfValidLocation(tempX,((myY+10-map.offsetTop)/((map.height))*100))) {
                //nop
            }
            else if (checkIfValidLocation(tempX,tempY)) {
                myX=myX+(INCREMENT/2);
                changed=true;
            }
        }
        if((myY < destY && !changed) || (allowed && !changed)){
            let tempX = ((myX-map.offsetLeft)/(map.width))*100;
            let tempY = ((myY+INCREMENT-map.offsetTop)/((map.height))*100);
            if (!checkIfValidLocation(((myX-10-map.offsetLeft)/((map.width))*100),tempY)) {
                //nop
            }
            else if (!checkIfValidLocation(((myX+10-map.offsetLeft)/((map.width))*100),tempY)) {
                //nop
            }
            else if (checkIfValidLocation(tempX,tempY)) {
                myY=myY+(INCREMENT/2);
                changed=true;
            }
        }
        if(changed){
            allowed=false;
            return {"X":myX,"Y":myY};
        }
        else{
            if(!allowed){
                allowed=true;
            }else{
                log("Something went wrong with the mapping!","ERROR");
                throw new Error();
            }
        }
    }
}


function setupDemoPanel() {
    panel = $(`
        <div id="demo-panel">
            <button id='demo-up'></button>
            <button id='demo-down'></button>
            <button id='demo-center'><i class="fas fa-circle"></i></button>
            <button id='demo-left'></button>
            <button id='demo-right'></button>
            <button id='demo-calculate'>Calculate Path</button>
        </div>
    `);
    title = $('<div id=demo-title>DEMO ONLY: <div>Move you are here</div></div>')
    $("#map_container").append(title);
    $("#map_container").append(panel);
    $("#demo-up").on("click",()=>{movePerson("up")})
    $("#demo-down").on("click",()=>{movePerson("down")})
    $("#demo-left").on("click",()=>{movePerson("left")})
    $("#demo-right").on("click",()=>{movePerson("right")})
    $("#demo-center").on("click",()=>{centerScreen()})
    $("#demo-calculate").on("click",()=>{ 
        let destinationData = $('#my-data').data();   
        if(destinationData) {
            mapMe(destinationData);
        } else {
            alert("No destination set!");
        }
    })
}

function movePerson(direction) {
    const {MOVE_SCALE} = CONFIG;
    const you = YOU.you;
    const youTop = myParseInt(you,"top");
    const youLeft = myParseInt(you,"left");
    const move = {
        "up" : ()=>{
            YOU.top=YOU.top-MOVE_SCALE*5;
            you.css({top: `${youTop-MOVE_SCALE*5}px`})
        },
        "down" : ()=>{
            YOU.top=YOU.top+MOVE_SCALE*5;
            you.css({top: `${youTop+MOVE_SCALE*5}px`})
        },
        "left" : ()=>{
            YOU.left=YOU.left-MOVE_SCALE*5;
            you.css({left: `${youLeft-MOVE_SCALE*5}px`})
        },
        "right" : ()=>{
            YOU.left=YOU.left+MOVE_SCALE*5;
            you.css({left: `${youLeft+MOVE_SCALE*5}px`})
        }
    };
    var c = document.getElementById("draw-here");
    var ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    move[direction]();
}

function myParseInt(object,direction) {
    return parseInt((object.css(`${direction}`)).substring(0,(object.css(`${direction}`)).length-2));
}

function centerScreen(){
    const map = $('#macy-lower-map');
    const top = myParseInt(map,"top");
    const left = myParseInt(map,"left");

    const you = $('#you');
    const youTop = myParseInt(you,"top");
    const youLeft = myParseInt(you,"left");
    
    const navigator = $('#draw-here');

    const targetX = window.innerWidth/2;
    const targetY = window.innerHeight/2;
    const xDif = targetX-youLeft;
    const yDif = targetY-youTop-0.5;

    console.log("xDif",xDif)
    console.log("yDif",yDif)

    map.css({left: `${left+xDif}px`})
    navigator.css({left: `${left+xDif}px`})
    you.css({left: `${youLeft+xDif}px`})
    YOU.left=YOU.left+xDif;

    map.css({top: `${top+yDif}px`})
    navigator.css({top: `${top+yDif}px`})
    you.css({top: `${youTop+yDif}px`})
    YOU.top=YOU.top+yDif;

    if(CONFIG["MODE"] == "DEVELOPMENT") {
        for(dot of DOTS) {
            const dotLeft = myParseInt(dot,"left")
            dot.css({left: `${dotLeft+xDif}px`})
            const dotTop = myParseInt(dot,"top")
            dot.css({top: `${dotTop+xDif}px`})
        }
    }


}