
document.addEventListener('mousedown', function(event){
  if (event.target.className.includes('noselect')) {
    event.preventDefault();
  }
}, false);

document.addEventListener('touchstart', function(event){
  if (event.target.className.includes('noselect')) {
    event.preventDefault();
  }
}, false);


let dragObject = null;

let score = 0;



const BOX_WIDTH = 100
const MAX_BOX_COUNT = 4
const ZONE_WIDTH = 150



let currentBoxCount = 0
let boxSpeed = 150

let isSpawnActive = false

let lastUpdate = Date.now();

let redBoxZone = document.createElement('div');
redBoxZone.classList.add("redBoxZone");
redBoxZone.classList.add("droppable");
redBoxZone.classList.add("noselect");
redBoxZone.style.width = ZONE_WIDTH + 'px';
redBoxZone.style.height = document.body.clientHeight + 'px';

document.body.append(redBoxZone);

let greenBoxZone = document.createElement('div');
greenBoxZone.classList.add("greenBoxZone");
greenBoxZone.classList.add("droppable");
greenBoxZone.classList.add("noselect");
greenBoxZone.style.width = ZONE_WIDTH + 'px';
greenBoxZone.style.height = document.body.clientHeight + 'px';
greenBoxZone.style.left = (document.body.clientWidth - ZONE_WIDTH) + 'px';

document.body.append(greenBoxZone);


let scoreCounter = document.createElement('div');
scoreCounter.classList.add("score");
scoreCounter.classList.add("noselect");
scoreCounter.style.position = 'absolute';
scoreCounter.style.left = (document.body.clientWidth / 2) + 'px';
scoreCounter.innerHTML = 'Score is: 0';

document.body.append(scoreCounter);


setInterval(onTimerTick, 16);

function trySpawnBox() {
    if ( Math.floor(Math.random() * MAX_BOX_COUNT) >= currentBoxCount)
    {
        let boxElement = document.createElement('div');
        boxElement.classList.add("boxBase");
        boxElement.classList.add("draggable");

        if (Boolean(Math.round(Math.random())))
        {
            boxElement.classList.add("boxRed");
        }
        else
        {
            boxElement.classList.add("boxGreen");
        }



        boxElement.style.left = (document.body.clientWidth / 3 + (ZONE_WIDTH * currentBoxCount)) + 'px';
        currentBoxCount += 1;

         boxElement.ontouchstart = function(e) {

            dragObject = boxElement;

            boxElement.ontouchmove = function(e) {
                boxElement.style.left = (e.pageX - 50) + 'px';
                boxElement.style.top = (e.pageY - 25) + 'px';
            }
        }
        boxElement.ontouchend = function(e) {

            boxElement.ontouchmove = null;
            dragObject = null;
        }

        boxElement.onmousedown = function(e) {

            dragObject = boxElement;

            boxElement.onmousemove = function(e) {
                boxElement.style.left = (e.pageX - 50) + 'px';
                boxElement.style.top = (e.pageY - 25) + 'px';
            }
        }
        boxElement.onmouseup = function(e) {

            boxElement.onmousemove = null;
            dragObject = null;
        }

        document.body.append(boxElement);
    }
    isSpawnActive = false;
}

function moveBoxes(dt) {

    let toDelete = []

    const collection = document.getElementsByClassName("boxBase");

    if ( collection.length == 0 ) return;

    for ( let i = 0; i < collection.length; i++ ) {
        let currentBox = collection[i];

        if ( currentBox == dragObject ) continue;

        let currentY = currentBox.getBoundingClientRect().top
        let newY = currentY + boxSpeed * dt / 1000;

        if ( (newY + 50) > document.body.clientHeight )
        {
            toDelete.push(currentBox)
        }

        currentBox.style.top = newY
    }

    for ( let i = 0; i < toDelete.length; i++ )
    {
        toDelete[i].remove();
        currentBoxCount -= 1;
    }
}

function checkZones( dt ) {

    let toDelete = []

    const collection = document.getElementsByClassName("boxBase");

    if ( collection.length == 0 ) return;

    for ( let i = 0; i < collection.length; i++ )
    {
        let currentBox = collection[i];

        let currentX = currentBox.getBoundingClientRect().left

        if ( currentX < ZONE_WIDTH )
        {
            toDelete.push(currentBox)
            if ( currentBox.classList.contains('boxRed') )
            {
                score += 5;
            }
        }
        else if ( (currentX + BOX_WIDTH) > (document.body.clientWidth - ZONE_WIDTH) )
        {
            toDelete.push(currentBox)
            if ( currentBox.classList.contains('boxGreen') )
            {
                score += 5;
            }
        }
    }

    document.getElementsByClassName("score")[0].innerHTML = 'Score is: ' + score;

    for ( let i = 0; i < toDelete.length; i++ )
    {
        let currentBox = toDelete[i];

        if ( currentBox == dragObject )
        {
            dragObject = null;
        }

        currentBox.remove();
        currentBoxCount -= 1;
    }
}

function onTimerTick() {
    var currentTime = Date.now();
    var dt = currentTime - lastUpdate;
    lastUpdate = currentTime;

    if (!isSpawnActive && currentBoxCount != MAX_BOX_COUNT)
    {
        setTimeout(trySpawnBox, 1000);
        isSpawnActive = true;
    }
    checkZones(dt)
    moveBoxes(dt);
}

