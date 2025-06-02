
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

let currentHash = null;

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

const BASE_BOX_SPEED = 200;
const SPEED_UP_COEFFICIENT = 4;

const MAX_BOX_COUNT = 10;
const SPAWN_RATE = 200; //in milliseconds
const SPAWN_CHANCE = 33; //in percents

const ZONE_WIDTH = 350;
let RIGHT_ZONE_COORD = document.body.clientWidth - ZONE_WIDTH;

const START_GAME_TIME = 120;
const DELAY_GAME_TIME = 3;

let CENTER_X = document.body.clientWidth / 2;

let dragObject = null;
let score = 0;
let remainingTime = 0;

let scoreCounter = null;
let scoreBox = null;
let timeCounter = null;
let counterToStart = null;
let textFullBox = null;
let textEmptyBox = null;
let timeIsUpScreen = null;

let resultScoreText = null;
let resultTryText = null;
let resultScreenStartGameButton = null;
let resultScreenQR = null;
let resultScreenHint = null;
let resultScreenArrow = null;

let secondToStart = DELAY_GAME_TIME;

let currentBoxCount = 0;

let lastGameLoopTick = Date.now();

let gameLoopId = null;

window.onresize = function(event) {
    RIGHT_ZONE_COORD = document.body.clientWidth - ZONE_WIDTH;
    CENTER_X = document.body.clientWidth / 2;
};

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
    if ( currentBoxCount >= MAX_BOX_COUNT )
    {
        setTimeout(trySpawnBox, SPAWN_RATE);
        return;
    }

    if ( getRandomInt( 0, 100 ) < SPAWN_CHANCE )
    {
        currentBoxCount += 1;

        let boxContainer = document.createElement('div');
        boxContainer.classList.add("boxBase");

        let degree = getRandomInt( -90, 90 );

        if ( getRandomInt( 0, 100 ) < 50 )
        {
            boxContainer.classList.add("boxEmptyContainer");

            let boxElement = document.createElement('div');
            boxElement.classList.add("boxEmpty");
            boxElement.style.transform = "rotate(" + degree + "deg)";
            boxContainer.append(boxElement);
        }
        else
        {
            boxContainer.classList.add("boxFullContainer");

            let boxElement = document.createElement('div');

            fullBoxCountRandType = getRandomInt( 0, 100 );

            if ( fullBoxCountRandType < 23 )
            {
                boxElement.classList.add("boxOzon");

            }
            else if ( fullBoxCountRandType < 45 )
            {
                boxElement.classList.add("boxWild");

            }
            else if ( fullBoxCountRandType < 67 )
            {
                boxElement.classList.add("boxFruit");

            }
            else if ( fullBoxCountRandType < 89 )
            {
                boxElement.classList.add("boxVeg");

            }
            else
            {
                boxElement.classList.add("boxCat");
                boxContainer.classList.add("catContainer");
            }

            boxElement.style.transform = "rotate(" + degree + "deg)";
            boxContainer.append(boxElement);
        }

        boxContainer.style.left = CENTER_X + ( getRandomInt( -1, 1 ) * BOX_WIDTH ) - BOX_WIDTH_HALF + 'px';
        boxContainer.style.top = '-400px';

        boxContainer.ondragstart = () => false;

        boxContainer.onpointerdown = function( e ) {

            dragObject = boxContainer;

            boxContainer.setPointerCapture( e.pointerId )

            boxContainer.onpointermove = function( e ) {
                boxContainer.style.left = ( e.clientX - BOX_WIDTH_HALF ) + 'px';
                boxContainer.style.top = ( e.clientY - BOX_HEIGHT_HALF ) + 'px';
            }
        }

        boxContainer.onpointerup = function( e ) {

            boxContainer.onpointermove = null;
            dragObject = null;
        }

        document.body.append(boxContainer);
    }

    setTimeout(trySpawnBox, SPAWN_RATE);
}

function moveBoxes( dt ) {

    let toDelete = []

    const collection = document.getElementsByClassName("boxBase");

    if ( collection.length == 0 ) return;

    for ( let i = 0; i < collection.length; i++ ) {
        let currentBox = collection[i];

        if ( currentBox == dragObject ) continue;


        let clientRect = currentBox.getBoundingClientRect();
        let currentY = clientRect.top;

        let currentSpeed = BASE_BOX_SPEED * ( SPEED_UP_COEFFICIENT - (SPEED_UP_COEFFICIENT - 1) * remainingTime / START_GAME_TIME );

        let newY = currentY + currentSpeed * dt / 1000;

        if ( newY > ( document.body.clientHeight + 150 ) )
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
            if ( currentBox.classList.contains('boxEmptyContainer') )
            {
                score += 5;
            }
            else
            {
                score = Math.max(0, score - 5);
            }
        }
        else if ( (currentX + BOX_WIDTH) > RIGHT_ZONE_COORD )
        {
            toDelete.push(currentBox)
            if ( currentBox.classList.contains('boxFullContainer') )
            {
                score += currentBox.classList.contains('catContainer') ? 15 : 5;
            }
            else
            {
                score = Math.max(0, score - 5);
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
        stopGameLoop();
        return;
    }

    let currentTick = Date.now();
    let dt = currentTick - lastGameLoopTick;
    lastGameLoopTick = currentTick;

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
        scoreCounter.style.opacity = 0.4;

        document.body.append(scoreCounter);
    }

    if ( scoreBox == null )
    {
        scoreBox = document.createElement('div');

        scoreBox.classList.add("scoreBox");
        scoreBox.classList.add("noselect");
        scoreBox.style.opacity = 0.4;

        document.body.append(scoreBox);
    }

    if ( timeCounter == null )
    {
        timeCounter = document.createElement('div');

        timeCounter.classList.add("timeCounter");
        timeCounter.classList.add("noselect");
        timeCounter.textContent = secToMinSecFormat( remainingTime );
        timeCounter.style.opacity = 0.4;

        document.body.append(timeCounter);
    }

    if ( textFullBox == null )
    {
        textFullBox = document.createElement('div');

        textFullBox.classList.add("textFullBox");
        textFullBox.classList.add("noselect");
        textFullBox.textContent = 'ПОЛНЫЕ';

        document.body.append(textFullBox);
    }

    if ( textEmptyBox == null )
    {
        textEmptyBox = document.createElement('div');

        textEmptyBox.classList.add("textEmptyBox");
        textEmptyBox.classList.add("noselect");
        textEmptyBox.textContent = 'ПУСТЫЕ';

        document.body.append(textEmptyBox);
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

        scoreCounter.style.opacity = 1.0;
        scoreBox.style.opacity = 1.0;
        timeCounter.style.opacity = 1.0;

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
        trySpawnBox();
    }
}

function stopGameLoop()
{
    remainingTime = 0;

    if ( gameLoopId != null )
    {
        clearInterval(gameLoopId);
        gameLoopId = null;
    }

    clearBoxes();

    scoreCounter.style.opacity = 0.4;
    scoreBox.style.opacity = 0.4;
    timeCounter.style.opacity = 0.4;

    if ( timeIsUpScreen == null )
    {
        timeIsUpScreen = document.createElement('div');

        timeIsUpScreen.classList.add("timeIsUpScreen");
        timeIsUpScreen.classList.add("noselect");

        let timeIsUpText = document.createElement('div');
        timeIsUpText.classList.add("timeIsUpText");
        timeIsUpText.classList.add("noselect");
        timeIsUpText.textContent = 'ВРЕМЯ ВЫШЛО';

        timeIsUpScreen.append(timeIsUpText);

        document.body.append(timeIsUpScreen);
    }

    setTimeout(stopGame, 3000);
}

function clearBoxes()
{
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
}

function stopGame()
{

    remainingTime = 0;

    clearBoxes();

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

    if ( textFullBox != null )
    {
        textFullBox.remove();
        textFullBox = null;
    }

    if ( textEmptyBox != null )
    {
        textEmptyBox.remove();
        textEmptyBox = null;
    }

    if ( timeIsUpScreen != null )
    {
        timeIsUpScreen.remove();
        timeIsUpScreen = null;
    }

    initResultScreen();
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
    fetch(window.location.href + 'getCode')
        .then(response => response.json())
        .then(function(data) {
            currentHash = data['hash'];
    });

    document.body.style.backgroundColor = '#6337F3';

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

function moveToStartScreen()
{
    deleteResultScreen();
    initStartScreen();
}

function initResultScreen()
{
    document.body.style.backgroundColor = '#FFFFFF';

    if ( resultTryText == null )
    {
        resultTryText = document.createElement('div');

        resultTryText.classList.add("resultTryText");
        resultTryText.classList.add("noselect");
        resultTryText.textContent = 'Хорошая попытка! Ваш результат:';

        document.body.append(resultTryText);
    }

    if ( resultScoreText == null )
    {
        resultScoreText = document.createElement('div');

        resultScoreText.classList.add("resultScoreText");
        resultScoreText.classList.add("noselect");
        resultScoreText.textContent = getScoreInStr();

        document.body.append(resultScoreText);
    }

    if ( resultScreenStartGameButton == null )
    {
        resultScreenStartGameButton = document.createElement('button');
        resultScreenStartGameButton.classList.add("resultScreenStartGameButton");
        resultScreenStartGameButton.textContent = 'СЫГРАТЬ ЕЩЕ!';
        resultScreenStartGameButton.onclick = moveToStartScreen;

        document.body.append(resultScreenStartGameButton);
    }

    if ( resultScreenQR == null )
    {
        resultScreenQR = document.createElement('div');
        resultScreenQR.classList.add("resultScreenQR");

        let qrcode = new QRCode(resultScreenQR, {
             text: document.URL + "register?score=" + score + "&hash=" + currentHash,
             width: 456,
             height: 456,
             colorDark : "#000000",
             colorLight : "#ffffff",
             correctLevel : QRCode.CorrectLevel.H
        });

        document.body.append(resultScreenQR);
    }

    if ( resultScreenHint == null )
    {
        resultScreenHint = document.createElement('div');
        resultScreenHint.classList.add("resultScreenHint");

        resultScreenHint.innerHTML = 'Для <span style="color: #6337F3; font-weight: 720;">сохранения результата</span><br/>и <span style="color: #6337F3; font-weight: 720;">получения призов</span><br/>заполните форму'

        document.body.append(resultScreenHint);
    }

    if ( resultScreenArrow == null )
    {
        resultScreenArrow = document.createElement('div');
        resultScreenArrow.classList.add("resultScreenArrow");

        document.body.append(resultScreenArrow);
    }
}

function deleteResultScreen()
{
    resultScoreText.remove();
    resultScoreText = null;

    resultTryText.remove();
    resultTryText = null;

    resultScreenStartGameButton.remove();
    resultScreenStartGameButton = null;

    resultScreenQR.remove();
    resultScreenQR = null;

    resultScreenHint.remove();
    resultScreenHint = null;

    resultScreenArrow.remove();
    resultScreenArrow = null;
}

initStartScreen();
