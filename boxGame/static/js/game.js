
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

const BOX_WIDTH = 240;
const BOX_HEIGHT = 128;
const BOX_WIDTH_HALF = 120;
const BOX_HEIGHT_HALF = 64;

const MAX_BOX_COUNT = 4;
const ZONE_WIDTH = 350;
const START_GAME_TIME = 120;
const DELAY_GAME_TIME = 3;

const CENTER_X = document.body.clientWidth / 2;

let dragObject = null;
let score = 0;
let remainingTime = 0;

let scoreCounter = null;
let scoreBox = null;
let timeCounter = null;
let counterToStart = null;

let secondToStart = DELAY_GAME_TIME;

let currentBoxCount = 0;
let boxSpeed = 150;

let isSpawnActive = false;
let lastGameLoopTick = Date.now();

let gameLoopId = null;

function getRandomInt( min, max )
{
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);

    return Math.floor( Math.random() * ( maxFloored - minCeiled + 1 ) + minCeiled );
}

function getScoreInStr()
{
    if ( score < 10 )
    {
        return '000' + score;
    }

    if ( score < 100 )
    {
        return '00' + score;
    }

    if ( score < 1000 )
    {
        return '0' + score;
    }

    return '' + score;
}

function secToMinSecFormat ( seconds )
{
    let mins = Math.floor(seconds / 60);
    let minsStr = '';

    if ( mins < 10 )
    {
        minsStr = '0' + mins;
    }
    else
    {
        minsStr = '' + mins;
    }

    let secs = Math.floor(seconds % 60);
    let secsStr = '';

    if ( secs < 10 )
    {
        secsStr = '0' + secs;
    }
    else
    {
        secsStr = '' + secs;
    }

    return minsStr + ':' + secsStr;
}

function trySpawnBox() {
    if ( !isSpawnActive ) return;

    if ( Math.floor( Math.random() * MAX_BOX_COUNT ) >= currentBoxCount )
    {
        let boxElement = document.createElement('div');
        boxElement.classList.add("boxBase");

        if ( Boolean( Math.round( Math.random() ) ) )
        {
            boxElement.classList.add("boxEmpty");
        }
        else
        {
            boxElement.classList.add("boxFull");
        }

        boxElement.style.left = CENTER_X + ( getRandomInt(-1, 1) * BOX_WIDTH ) - BOX_WIDTH_HALF + 'px';
        currentBoxCount += 1;

        boxElement.ondragstart = () => false;

        boxElement.onpointerdown = function( e ) {

            dragObject = boxElement;

            boxElement.setPointerCapture( e.pointerId )

            boxElement.onpointermove = function( e ) {
                boxElement.style.left = ( e.clientX - BOX_WIDTH_HALF ) + 'px';
                boxElement.style.top = ( e.clientY - BOX_HEIGHT_HALF ) + 'px';
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

        let currentY = currentBox.getBoundingClientRect().top;

        let newY = currentY + boxSpeed * dt / 1000;

        if ( (newY + BOX_HEIGHT) > document.body.clientHeight )
        {
            toDelete.push(currentBox);
        }

        currentBox.style.top = newY;
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
            if ( currentBox.classList.contains('boxEmpty') )
            {
                score += 5;
            }
        }
        else if ( (currentX + BOX_WIDTH) > (document.body.clientWidth - ZONE_WIDTH) )
        {
            toDelete.push(currentBox)
            if ( currentBox.classList.contains('boxFull') )
            {
                score += 5;
            }
        }
    }

    scoreCounter.textContent = getScoreInStr();

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

    let remainingTimeTemp = remainingTime - ( dt / 1000 );
    remainingTime = Math.max( 0, remainingTimeTemp );

    if ( remainingTime < 15.0 )
    {
        timeCounter.style.backgroundColor = '#F80000';
    }

    timeCounter.textContent = secToMinSecFormat( remainingTime );
}

function startGame()
{
    remainingTime = START_GAME_TIME;
    score = 0;

    deleteTutorialScreen();

    if ( scoreCounter == null )
    {
        scoreCounter = document.createElement('div');

        scoreCounter.classList.add("scoreCounter");
        scoreCounter.classList.add("noselect");
        scoreCounter.textContent = getScoreInStr();

        document.body.append(scoreCounter);
    }

    if ( scoreBox == null )
    {
        scoreBox = document.createElement('div');

        scoreBox.classList.add("scoreBox");
        scoreBox.classList.add("noselect");

        document.body.append(scoreBox);
    }

    if ( timeCounter == null )
    {
        timeCounter = document.createElement('div');

        timeCounter.classList.add("timeCounter");
        timeCounter.classList.add("noselect");
        timeCounter.textContent = secToMinSecFormat( remainingTime );

        document.body.append(timeCounter);
    }

    if ( counterToStart == null )
    {
        counterToStart = document.createElement('div');

        counterToStart.classList.add("counterToStart");
        counterToStart.classList.add("noselect");
        counterToStart.textContent = secondToStart;

        document.body.append(counterToStart);

        setTimeout(countTimeToStartGame, 1000);
    }


}

function countTimeToStartGame() {
    secondToStart -= 1;

    if ( secondToStart == 0 )
    {
        counterToStart.remove()
        counterToStart = null;

        secondToStart = DELAY_GAME_TIME;

        startGameLoop();
    }
    else
    {
        counterToStart.textContent = secondToStart;
        setTimeout(countTimeToStartGame, 1000);
    }
}



function startGameLoop()
{
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

    if ( scoreCounter != null )
    {
        scoreCounter.remove();
        scoreCounter = null;
    }

    if ( scoreBox != null )
    {
        scoreBox.remove();
        scoreBox = null;
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
