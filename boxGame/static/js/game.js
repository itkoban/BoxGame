
// Block scroll and zoom
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

let startGameButton = null;
let startScreen = null;

let tutorialBoxRight = null;
let tutorialBoxLeft = null;
let tutorialTextRight = null;
let tutorialTextLeft = null;
let tutorialArrowRight = null;
let tutorialArrowLeft = null;
let tutorialStartButton = null;
let tutorialText = null;
let tutorialScreen = null;

const BOX_WIDTH = 100;
const MAX_BOX_COUNT = 4;
const ZONE_WIDTH = 150;
const START_GAME_TIME = 120;

let dragObject = null;
let score = 0;
let remainingTime = 0;

let redBoxZone = null;
let greenBoxZone = null;
let scoreCounter = null;
let timeCounter = null;

let currentBoxCount = 0;
let boxSpeed = 150;

let isSpawnActive = false;
let lastGameLoopTick = Date.now();

let gameLoopId = null;

function trySpawnBox() {
    if ( !isSpawnActive ) return;

    if ( Math.floor( Math.random() * MAX_BOX_COUNT ) >= currentBoxCount )
    {
        let boxElement = document.createElement('div');
        boxElement.classList.add("boxBase");
        boxElement.classList.add("draggable");

        if ( Boolean( Math.round( Math.random() ) ) )
        {
            boxElement.classList.add("boxRed");
        }
        else
        {
            boxElement.classList.add("boxGreen");
        }

        boxElement.style.left = ( document.body.clientWidth / 3 + ( ZONE_WIDTH * currentBoxCount ) ) + 'px';
        currentBoxCount += 1;

        boxElement.ondragstart = () => false;

        boxElement.onpointerdown = function( e ) {

            dragObject = boxElement;

            boxElement.setPointerCapture( e.pointerId )

            boxElement.onpointermove = function( e ) {
                boxElement.style.left = ( e.clientX - 50 ) + 'px';
                boxElement.style.top = ( e.clientY - 25 ) + 'px';
            }
        }

        boxElement.onpointerup = function( e ) {

            boxElement.onpointermove = null;
            dragObject = null;
        }

        document.body.append(boxElement);
    }

    isSpawnActive = false;
}

function moveBoxes( dt ) {

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

function onGameTick()
{
    if ( remainingTime <= 0 )
    {
        stopGame();
        return;
    }

    let currentTick = Date.now();
    let dt = currentTick - lastGameLoopTick;
    lastGameLoopTick = currentTick;

    if ( !isSpawnActive && currentBoxCount != MAX_BOX_COUNT )
    {
        setTimeout(trySpawnBox, 1000);
        isSpawnActive = true;
    }

    checkZones(dt)
    moveBoxes(dt);

    remainingTime -= dt / 1000;
    timeCounter.innerHTML = remainingTime;
}

function startGame()
{
    remainingTime = START_GAME_TIME;

    deleteTutorialScreen();

    if ( redBoxZone == null )
    {
        redBoxZone = document.createElement('div');

        redBoxZone.classList.add("redBoxZone");
        redBoxZone.classList.add("droppable");
        redBoxZone.classList.add("noselect");
        redBoxZone.style.width = ZONE_WIDTH + 'px';
        redBoxZone.style.height = document.body.clientHeight + 'px';

        document.body.append(redBoxZone);
    }

    if ( greenBoxZone == null )
    {
        greenBoxZone = document.createElement('div');

        greenBoxZone.classList.add("greenBoxZone");
        greenBoxZone.classList.add("droppable");
        greenBoxZone.classList.add("noselect");
        greenBoxZone.style.width = ZONE_WIDTH + 'px';
        greenBoxZone.style.height = document.body.clientHeight + 'px';
        greenBoxZone.style.left = (document.body.clientWidth - ZONE_WIDTH) + 'px';

        document.body.append(greenBoxZone);
    }

    if ( scoreCounter == null )
    {
        scoreCounter = document.createElement('div');

        scoreCounter.classList.add("score");
        scoreCounter.classList.add("noselect");
        scoreCounter.style.position = 'absolute';
        scoreCounter.style.left = (document.body.clientWidth / 2) + 'px';
        scoreCounter.innerHTML = 'Score is: 0';

        document.body.append(scoreCounter);
    }

    if ( timeCounter == null )
    {
        timeCounter = document.createElement('div');

        timeCounter.classList.add("score");
        timeCounter.classList.add("noselect");
        timeCounter.style.position = 'absolute';
        timeCounter.style.left = (document.body.clientWidth - 200) + 'px';
        timeCounter.innerHTML = remainingTime;

        document.body.append(timeCounter);
    }

    //start game loop
    if ( gameLoopId == null )
    {
        lastGameLoopTick = Date.now();
        gameLoopId = setInterval(onGameTick, 16);
    }
}

function stopGame()
{

    remainingTime = 0;

    const collection = document.getElementsByClassName("boxBase");
    let boxCountToDelete = collection.length;

    for ( let i = boxCountToDelete - 1; i >= 0; i-- )
    {
        let currentBox = collection[i];
        currentBox.remove();
    }

    dragObject = null;

    if ( dragObject != null )
    {
        dragObject.remove();
        dragObject = null;
    }

    isSpawnActive = false;
    currentBoxCount = 0;

    if ( redBoxZone != null )
    {
        redBoxZone.remove();
        redBoxZone = null;
    }

    if ( greenBoxZone != null )
    {
        greenBoxZone.remove();
        greenBoxZone = null;
    }

    if ( scoreCounter != null )
    {
        scoreCounter.remove();
        scoreCounter = null;
    }

    if ( timeCounter != null )
    {
        timeCounter.remove();
        timeCounter = null;
    }

    if ( gameLoopId != null )
    {
        clearInterval(gameLoopId);
        gameLoopId = null;
    }

    initStartScreen();
}

function deleteStartScreen()
{
    startGameButton.remove();
    startGameButton = null;

    startScreen.remove();
    startScreen = null;
}

function initStartScreen()
{
    if ( startScreen == null )
    {
        startScreen = document.createElement('div');
        startScreen.classList.add("startScreen");

        document.body.append(startScreen);

        if ( startGameButton == null )
        {
            startGameButton = document.createElement('button');
            startGameButton.classList.add("startButton");
            startGameButton.textContent = 'Начать игру';
            startGameButton.onclick = moveToTutorial;

            startScreen.append(startGameButton);
        }
    }
}

function moveToTutorial()
{
    deleteStartScreen();
    initTutorialScreen();
}

function deleteTutorialScreen()
{
    tutorialBoxRight.remove();
    tutorialBoxRight = null;

    tutorialBoxLeft.remove();
    tutorialBoxLeft = null;

    tutorialTextRight.remove();
    tutorialTextRight = null;

    tutorialTextLeft.remove();
    tutorialTextLeft = null;

    tutorialArrowRight.remove();
    tutorialArrowRight = null;

    tutorialArrowLeft.remove();
    tutorialArrowLeft = null;

    tutorialStartButton.remove();
    tutorialStartButton = null;

    tutorialText.remove();
    tutorialText = null;

    tutorialScreen.remove();
    tutorialScreen = null;
}

function initTutorialScreen()
{
    if ( tutorialScreen == null )
    {
        tutorialScreen = document.createElement('div');
        tutorialScreen.classList.add("tutorialScreen");

        document.body.append(tutorialScreen);

        if ( tutorialText == null )
        {
            tutorialText = document.createElement('div');
            tutorialText.classList.add("tutorialText");
            tutorialText.textContent = 'Наберите как можно больше очков за 2 минуты, сортируя коробки на пустые и полные';

            tutorialScreen.append(tutorialText);
        }

        if ( tutorialStartButton == null )
        {
            tutorialStartButton = document.createElement('button');
            tutorialStartButton.classList.add("tutorialStartButton");
            tutorialStartButton.textContent = 'СТАРТ!';
            tutorialStartButton.onclick = startGame;

            tutorialScreen.append(tutorialStartButton);
        }

        if ( tutorialArrowLeft == null )
        {
            tutorialArrowLeft = document.createElement('div');
            tutorialArrowLeft.classList.add("tutorialArrowLeft");

            tutorialScreen.append(tutorialArrowLeft);
        }

        if ( tutorialArrowRight == null )
        {
            tutorialArrowRight = document.createElement('div');
            tutorialArrowRight.classList.add("tutorialArrowRight");

            tutorialScreen.append(tutorialArrowRight);
        }

         if ( tutorialTextLeft == null )
        {
            tutorialTextLeft = document.createElement('div');
            tutorialTextLeft.classList.add("tutorialTextLeft");
            tutorialTextLeft.textContent = 'пустые коробки';

            tutorialScreen.append(tutorialTextLeft);
        }

        if ( tutorialTextRight == null )
        {
            tutorialTextRight = document.createElement('div');
            tutorialTextRight.classList.add("tutorialTextRight");
            tutorialTextRight.textContent = 'полные коробки';

            tutorialScreen.append(tutorialTextRight);
        }

        if ( tutorialBoxLeft == null )
        {
            tutorialBoxLeft = document.createElement('div');
            tutorialBoxLeft.classList.add("tutorialBoxLeft");

            tutorialScreen.append(tutorialBoxLeft);
        }

        if ( tutorialBoxRight == null )
        {
            tutorialBoxRight = document.createElement('div');
            tutorialBoxRight.classList.add("tutorialBoxRight");

            tutorialScreen.append(tutorialBoxRight);
        }
    }
}

initStartScreen();
