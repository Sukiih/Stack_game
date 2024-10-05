const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
const score = document.getElementById('score');

const MODES = {
    FALL: 'fall',
    BOUNCE: 'bounce', //pieza de lado a lado
    GAMEOVER: 'gameover'
}

//CONSTANTS

const INITIAL_BOX_WIDTH = 200; // ancho inicial de las cajas
const INITIAL_BOX_Y = 600; // posicion inicial de la caja

const BOX_HEIGHT = 50; // altura de las cajas
const INITIAL_Y_SPEED = 5; // velocidad de caida
const INITIAL_X_SPEED = 2; // velocidad lateral de la caja

//STATE

let boxes = [];
let debris = {x: 0, y: 0, width: 0};
let scrollCounter, cameraY, current, mode, xSpeed, ySpeed;


//colores al azar para las cajas
function createStepColor (step) {
    if (step === 0) return 'white'

    const red = Math.floor(Math.random() * 255)
    const green = Math.floor(Math.random() * 255)
    const blue = Math.floor(Math.random() * 255)

    return `rgb(${red}, ${green}, ${blue})`
}

function updateCamera(){
    if (scrollCounter > 0){
        cameraY++
        scrollCounter--
    }
}


//inicializamos el juego
function initializeGameState() {
    boxes = [{
        x: (canvas.width / 2) - (INITIAL_BOX_WIDTH / 2), // para que la caja quede totalmente centrada
        y: 200,
        width: INITIAL_BOX_WIDTH,
        color: 'white'
    }];

    //caja actual
    debris = {x: 0, y: 0, width: 0};
    current = 1;
    mode = MODES.BOUNCE
    xSpeed = INITIAL_X_SPEED
    ySpeed = INITIAL_Y_SPEED
    scrollCounter = 0
    cameraY = 0

    createNewBox()

}

//inicia el juego
function restart() {
    initializeGameState();
    draw();
}

//dibujamos
function draw() {
    if (mode === MODES.GAMEOVER) return
    drawBackground() 
    drawBoxes()
    drawDebris()


    //movimiento
    if (mode === MODES.BOUNCE) {
        moveAndDetectCollision()
    }else if (mode === MODES.FALL) {
        updateFallMode()
    }
    

    debris.y -= ySpeed
    //camara
    updateCamera()

    //llamando constantemente a draw para reflejar los cambios en el juego
    window.requestAnimationFrame(draw);
}

function drawBackground() {
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawDebris() {
    const { x, y, width, color } = debris
    const newY = INITIAL_BOX_Y - y + cameraY

    context.fillStyle = color
    context.fillRect(x, newY, width, BOX_HEIGHT)

    
}

//dibujar las cajas
function drawBoxes() {
    boxes.forEach((box) => {
        const { x, y, width, color } = box
        const newY = INITIAL_BOX_Y - y + cameraY   

        context.fillStyle = color
        context.fillRect(x, newY, width, BOX_HEIGHT)
    })
}

//creamos cajas
function createNewBox() {
    boxes[current] = ({
        x: (canvas.width / 2) - (INITIAL_BOX_WIDTH / 2),
        y: (current + 10) * BOX_HEIGHT,
        width: boxes[current - 1].width,
        color: createStepColor(current)
    })
}

function createNewDebris(difference){
    const currentBox = boxes[current]
    const previousBox = boxes[current - 1]

    const debrisX = currentBox.x > previousBox.x
    ? currentBox.x + currentBox.width
    : currentBox.x

    debris = {
        x: debrisX,
        y: currentBox.y,
        width: difference,
        color: currentBox.color
    }
}


function updateFallMode() {
    const currentBox = boxes[current]
    currentBox.y -= ySpeed

    //detectamos donde esta la caja inicial/anterior
    const positionPreviousBox = boxes[current - 1].y + BOX_HEIGHT

    if (currentBox.y === positionPreviousBox) {
       handleBoxLanding()
    }
}

    function adjustCurrentBox(difference) {
        const currentBox = boxes[current]
        const previousBox = boxes[current - 1]

        if (currentBox.x > previousBox.x) {
            currentBox.width -= difference
        }else {
            currentBox.width += difference
            currentBox.x = previousBox.x
        }
}

//Visibilidad GameOver
    function gameOver() {
        mode = MODES.GAMEOVER

        context.fillStyle = 'rgba(255, 0, 0, 0.3)'
        context.fillRect(0, 0, canvas.width, canvas.height)

        context.font = '40px Impact'
        context.fillStyle = 'white'
        context.textBaseline = 'middle'
        context.textAlign = 'center'
        context.fillText('Game Over', canvas.width / 2, canvas.height / 2)
    }

    function handleBoxLanding() {
        const currentBox = boxes[current]
        const previousBox = boxes[current - 1]

        const difference = currentBox.x - previousBox.x

        if (Math.abs(difference) >= currentBox.width) {
            gameOver()
            return
        }

        adjustCurrentBox(difference)

        createNewDebris(difference)

        //incrementamos la velocidad. Si xspeed es mayor a 0 aumentamos o decrementamos en 1
        xSpeed += xSpeed > 0 ? 1 : -1
        current++
        scrollCounter = BOX_HEIGHT
        mode = MODES.BOUNCE

        score.innerHTML = `Score: ${current - 1}`

        createNewBox()
    }


    function moveAndDetectCollision() {
        const currentBox = boxes[current]
        currentBox.x += xSpeed

        const isMovingRight = xSpeed > 0
        const isMovingLeft = xSpeed < 0

        const hasHitRightSide = 
            currentBox.x + currentBox.width >= canvas.width

        const hasHitLeftSide =
            currentBox.x <= 0

        if(
            (isMovingRight && hasHitRightSide) ||
            (isMovingLeft && hasHitLeftSide)
        ){
            xSpeed = -xSpeed
        }
}

    //tecla espacio para que las cajas bajen
    document.addEventListener('keydown', (event) => {
        if(event.key === ' ' && mode === MODES.BOUNCE) {
            mode = MODES.FALL
        } else if(event.key === ' ' && mode === MODES.GAMEOVER) {
            restart()
        }
    })

    canvas.onpointerdown = () => {
        if(mode === MODES.GAMEOVER) {
            restart()
        } else if(mode === MODES.BOUNCE) {
            mode = MODES.FALL
    }
}
restart();
