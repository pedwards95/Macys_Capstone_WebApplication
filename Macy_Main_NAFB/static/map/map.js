//     transform: rotate(-37.7deg);

let baseURL;
let imageHeight;
let imageWidth;
// base realworld coordinates for the store
const MAXLONGITUDE = -96.80824263154483;
const MINLONGITUDE = -96.80976957791401;
const MAXLATITUDE = 33.101326552499955;
const MINLATITUDE = 33.10008519974966;
const DOTS=[];

//initialization function
async function INIT() {
    //backup to fix jquery cdn sometimes not working
    if (typeof jQuery == 'undefined') {
        document.write(unescape(`%3Cscript src='https://code.jquery.com/jquery-3.6.0.min.js' 
        integrity='sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=' 
        crossorigin='anonymous'%3E%3C/script%3E`));
    }

    //fetch the config file and set it to a global variable
    window.CONFIG = await $.getJSON("../static/config.json");

    //fetch destination metadata from search results
    let destinationData = $('#my-data').data();

    //set url and minor configurations
    if(CONFIG["MODE"] == "DEVELOPMENT") {
        baseURL = "http://127.0.0.1:5000/";
        $("body").on("click",findCursor);
        placeDots();
        if(destinationData) {
            setupDemoPanel();
        }   
    }
    else if (CONFIG["MODE"] == "PRODUCTION") {
        baseURL = "https://macymain-pde.azurewebsites.net/";
        if(destinationData) {
            setupDemoPanel();
        } 
    }

    // find where the user is, and set it to location
    let location = await findPerson()

    // put the person where they are standing in the store. If you are not in the store, it puts you in the demo spot.
    placePerson(location.demo);

    // render screen, finding how the image is interacting with your screen/device
    calculateImage();

    // calculate the percentage of long and lat that you are currently at. This will be used later closely with percentage of image
    let yourLongPercent = ((location.longitude-MINLONGITUDE)  / (MAXLONGITUDE-MINLONGITUDE))*100
    let yourLatPercent = ((location.latitude-MINLATITUDE)  / (MAXLATITUDE-MINLATITUDE))*100
    log(`Your Latitude Percentage: ${yourLatPercent} ||| Your Longitude Percentage: ${yourLongPercent}`);
    log("Initialized");

    // gives ability to move the screen to look at other parts of the map
    $("body").on("keydown",shiftMap);

    // if there is a destination, draw a line to it
    if(destinationData) {
        mapMe(destinationData);
    }
}

// initialize
$("body").on("load",INIT());

// finds the height and width of the image in relation to your screen/device
function calculateImage() {
    const map = $('#macy-lower-map');
    imageHeight = map.height();
    imageWidth = map.width();
}

// function to find where you are located in real life. Uses a geolocation api.
async function findPerson() {
    log("Finding person...")
    let ip;
    let you;
    if(CONFIG["MODE"] == "DEVELOPMENT") {
        ip = (await axios.get("https://api.ipify.org/?format=json")).data.ip
        const KEY = "e472ca7e33be5dfac0941ac3676d26a0"
        you = (await axios.get(`http://api.ipstack.com/${ip}?access_key=${KEY}`)).data
    }
    else if(CONFIG["MODE"] == "PRODUCTION") {
        ip = $('#my-ip-data').data()[0];
        //this is for demo purposes. Azure wont accept http, and the api costs money for https
        you = {"longitude":1,"latitude":1}
    }
    log(` Your Long: ${you.longitude} vs MaxLong: ${MAXLONGITUDE} and MinLong: ${MINLONGITUDE} |||||| Your Lat ${you.latitude} vs MaxLat ${MAXLATITUDE} and MinLat ${MINLATITUDE}`)

    // if you are not within the bounds of the store, DEMO MODE
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

// places you either where you are standing in real life, or at the demo spot, in relation to the map.
// note: only does the demo spot right now
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

// basic logger that only outputs in development configuration
// can also be passed a prefix. Default is INFO
function log(msg,code="INFO") {
    if(CONFIG["MODE"] == "DEVELOPMENT") {
        console.log(`${code}: ${msg}`);
    }
}

// when you want to 'look around' this function moves everything accordingly.
// based on which arrow key is pressed.
// There is a max in each direction
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
    // not an error if none of the movement keys are pressed
    try{
        SHIFT[key]();
    }catch{};
}

// fires an event on click to get the percentages related to where you clicked.
// this event is only bound in development configuration
// coder helper function
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

// places dots at the bounds of all the zones, for easier viewing
// note: easIER ... not the best viewing experience
// only shows in development mode
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

// a function to check if the given percentages are valid for the pathing algorithm
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

//helper function for turning "top" css property into a percentage of the map 
function parseTopPercentage(Y) {
    const map = $('#macy-lower-map');
    return myParseInt(map,"height")*((Y)/100)+(map.offset().top);
}

//helper function for turning "left" css property into a percentage of the map 
function parseLeftPercentage(X) {
    const map = $('#macy-lower-map');
    return myParseInt(map,"width")*((X)/100)+(map.offset().left);
}

//main function to map from 'you are here' to the destination
function mapMe(data){

    //finds destination percentages
    const destination = CONFIG.LOCATIONS[data.destination];
    const destX = parseLeftPercentage(destination.X);
    const destY = parseTopPercentage(destination.Y);

    //finds you
    const youAreHere = {};
    youAreHere.left = YOU.left;
    youAreHere.top = YOU.top;
    const map = $('#macy-lower-map')[0];

    //starts drawing
    let drawing=true;
    let c = document.getElementById("draw-here");
    let ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(youAreHere.left-map.offsetLeft, youAreHere.top-map.offsetTop);

    //Tries to draw until it reaches its destination, or at least gets within a certain distance,
    //it will keep checking for valid places to path
    //max of 500 attempts
    let count=0;
    let UP;
    let LEFT;
    while(drawing) {
        const {X,Y,up,left} = findNextPoint(youAreHere.left, youAreHere.top,destX,destY,UP,LEFT);
        UP=up;
        LEFT=left;
        if((Math.abs(destX-X))+(Math.abs(destY-Y)) < 180) {
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

//this function act as a 'get out of jail' for the pathing algorithm
//the idea is to find the nearest valid walkway so it can restart its pathing
//this is called if you start inside a section, or if something has gone haywire with the algorithm
//it gradually looks further and further out until it finds somewhere to go, or the goal itself
function findPath(myX,myY,destX,destY){
    log("FINDING PATHHHH!!!!!","DANGER")
    const map = $('#macy-lower-map')[0];
    let pathIncrement = 6;
    let tempX;
    let tempY;
    while(true){
        tempX = ((myX-map.offsetLeft)/(map.width))*100;
        tempY = ((myY-pathIncrement-map.offsetTop)/((map.height))*100);
        if(myY > destY){
            if(checkIfValidLocation(tempX,tempY)){
                return({"X":myX,"Y":myY-pathIncrement})
            }
            if((Math.abs(destX-tempX))+(Math.abs(destY-tempY)) < 260) return({"X":myX,"Y":myY-pathIncrement})
            tempX = ((myX-pathIncrement-map.offsetLeft)/(map.width))*100;
            if(checkIfValidLocation(tempX,tempY)){
                return({"X":myX-pathIncrement,"Y":myY-pathIncrement})
            }
            if((Math.abs(destX-tempX))+(Math.abs(destY-tempY)) < 260) return({"X":myX-pathIncrement,"Y":myY-pathIncrement})
            tempX = ((myX+pathIncrement-map.offsetLeft)/(map.width))*100;
            if(checkIfValidLocation(tempX,tempY)){
                return({"X":myX+pathIncrement,"Y":myY-pathIncrement})
            }
            if((Math.abs(destX-tempX))+(Math.abs(destY-tempY)) < 260) return({"X":myX+pathIncrement,"Y":myY-pathIncrement})
        }
        tempX = ((myX-map.offsetLeft)/(map.width))*100;
        tempY = ((myY+pathIncrement-map.offsetTop)/((map.height))*100);
        if(myY < destY){
            if(checkIfValidLocation(tempX,tempY)){
                return({"X":myX,"Y":myY+pathIncrement})
            }
            if((Math.abs(destX-tempX))+(Math.abs(destY-tempY)) < 260) return({"X":myX,"Y":myY+pathIncrement})
            tempX = ((myX-pathIncrement-map.offsetLeft)/(map.width))*100;
            if(checkIfValidLocation(tempX,tempY)){
                return({"X":myX-pathIncrement,"Y":myY+pathIncrement})
            }
            if((Math.abs(destX-tempX))+(Math.abs(destY-tempY)) < 260) return({"X":myX-pathIncrement,"Y":myY+pathIncrement})
            tempX = ((myX+pathIncrement-map.offsetLeft)/(map.width))*100;
            if(checkIfValidLocation(tempX,tempY)){
                return({"X":myX+pathIncrement,"Y":myY+pathIncrement})
            }
            if((Math.abs(destX-tempX))+(Math.abs(destY-tempY)) < 260) return({"X":myX+pathIncrement,"Y":myY+pathIncrement})
        } 
        pathIncrement += 2;
    }
}

//the following code is... to be entirely fair... hard to follow
//this function is the pathing algorithm
function findNextPoint(myX,myY,destX,destY,up=null,left=null) {

    //allowed lets it go opposite the way it should be going.
    //for example: left if the goal is to the right, or up if the goal is below
    // this helps get around obstacles
    let allowed = false;

    //increment is how far the algorithm looks for each chunk of path
    const INCREMENT = 20;

    let found = false;

    //while found is false, so in this case until it returns. It will never not return.
    while(!found) {
        let changed=false;

        //set the map
        const map = $('#macy-lower-map')[0];

        //each of the following is intentionally not an 'else' and has if statements inside that catch but do nothing
        //this is intended behavior to attempt a cleaner and smoother path

        //pathing to the left
        if((myX > destX && !changed || (allowed && !changed)) && left !== false){
            let tempX = ((myX-INCREMENT-map.offsetLeft)/(map.width))*100;
            let tempY = ((myY-map.offsetTop)/((map.height))*100);
            if (!checkIfValidLocation(tempX,((myY-(INCREMENT/3)-map.offsetTop)/((map.height))*100))) {
                //nop
            }
            else if (!checkIfValidLocation(tempX,((myY+(INCREMENT/3)-map.offsetTop)/((map.height))*100))) {
                //nop
            }
            else if (checkIfValidLocation(tempX,tempY)) {
                myX=myX-(INCREMENT/2);
                changed=true;
                up=null;
                left=true;
            }
        }

        //pathing to the right
        if(((myX < destX && !changed) || (allowed && !changed)) && left !== true){
            let tempX = ((myX+INCREMENT-map.offsetLeft)/(map.width))*100;
            let tempY = ((myY-map.offsetTop)/((map.height))*100);
            if (!checkIfValidLocation(tempX,((myY-(INCREMENT/3)-map.offsetTop)/((map.height))*100))) {
                //nop
            }
            else if (!checkIfValidLocation(tempX,((myY+(INCREMENT/3)-map.offsetTop)/((map.height))*100))) {
                //nop
            }
            else if (checkIfValidLocation(tempX,tempY)) {
                myX=myX+(INCREMENT/2);
                changed=true;
                up=null;
                left=false;
            }
        }

        //pathing up
        if(((myY > destY && !changed) || (allowed && !changed) || (up===true))  && up !== false){
            let tempX = ((myX-map.offsetLeft)/(map.width))*100;
            let tempY = ((myY-INCREMENT-map.offsetTop)/((map.height))*100);
            if (!checkIfValidLocation(((myX-(INCREMENT/3)-map.offsetLeft)/((map.width))*100),tempY)) {
                //nop
            }
            else if (!checkIfValidLocation(((myX+(INCREMENT/3)-map.offsetLeft)/((map.width))*100),tempY)) {
                //nop
            }
            else if (checkIfValidLocation(tempX,tempY)) {
                myY=myY-(INCREMENT/2);
                changed=true;
                up=true;
                left=null;
            }
        }

        //pathing down
        if(((myY < destY && !changed) || (allowed && !changed) || (up===false)) && up !== true){
            let tempX = ((myX-map.offsetLeft)/(map.width))*100;
            let tempY = ((myY+INCREMENT-map.offsetTop)/((map.height))*100);
            if (!checkIfValidLocation(((myX-(INCREMENT/3)-map.offsetLeft)/((map.width))*100),tempY)) {
                //nop
            }
            else if (!checkIfValidLocation(((myX+(INCREMENT/3)-map.offsetLeft)/((map.width))*100),tempY)) {
                //nop
            }
            else if (checkIfValidLocation(tempX,tempY)) {
                myY=myY+(INCREMENT/2);
                changed=true;
                up=false;
                left=null;
            }
        }

        //if it found a valid spot, return it so it can be drawn
        if(changed){
            allowed=false;
            return {"X":myX,"Y":myY,up,left};
        }

        //if it didn't find a valid spot, allow it to go the wrong way
        else{
            if(!allowed){
                allowed=true;
            }
            // if it reaches here, it is stuck and cant path in any direction
            // this will return a path to the nearest valid spot
            else{
                return findPath(myX,myY,destX,destY);
            }
        }
    }
}

// attempt at diagonal pathing.
// looks much cleaner, but creates way more problems and loops

// if((myX > destX && myY > destY && !changed) || (allowed && !changed)){
//     let tempX = ((myX-INCREMENT-map.offsetLeft)/(map.width))*100;
//     let tempY = ((myY-INCREMENT-map.offsetTop)/((map.height))*100);
//     if (checkIfValidLocation(tempX,tempY)) {
//         myX=myX-(INCREMENT/2);
//         myY=myY-(INCREMENT/2);
//         changed=true;
//         up=null;
//         left=null;
//     }
// }
// if((myX < destX && myY < destY && !changed) || (allowed && !changed)){
//     let tempX = ((myX+INCREMENT-map.offsetLeft)/(map.width))*100;
//     let tempY = ((myY+INCREMENT-map.offsetTop)/((map.height))*100);
//     if (checkIfValidLocation(tempX,tempY)) {
//         myX=myX+(INCREMENT/2);
//         myY=myY+(INCREMENT/2);
//         changed=true;
//         up=null;
//         left=null;
//     }
// }


// creates the elements when in demo mode
// binds the functionality to the buttons as well
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

// function to move the 'you are here'
// based on percentages an internal "top" and "left"
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

//helper function to turning the css string returned from top and left into an integer
function myParseInt(object,direction) {
    return parseInt((object.css(`${direction}`)).substring(0,(object.css(`${direction}`)).length-2));
}

//function to move everything so that the 'you are here' marker is centered
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