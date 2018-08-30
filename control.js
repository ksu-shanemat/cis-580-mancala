// ------------------ Constants ----------------------- //

const PlayerNumbers = {
    LEFT: 0,
    RIGHT: 1
}

const PlayerNames = ["left", "right"];

const PlayerSides = ["upper", "lower"];

const PlayerColors = ["red", "blue"];

const BorderSizes = {
    NORMAL: "1px",
    HIGHLIGHT: "2px"
}

const GameStates = {
    RESPONSIVE: 0,
    COMPUTING: 1,
    FINISHED: 2
}

const pebblePlacementLowerBound = 0.10;

const pebblePlacementUpperBound = 0.75;

const initialPebbleCount = 4;

const pitsInRow = 6;

const placingDelay = 500;

const playerPits = createPlayerPits();

// ------------------ Variables ------------------------ //

var activePlayer = PlayerNumbers.LEFT;

var currentState = GameStates.RESPONSIVE;

var pitContent = createPitContentMatrix();

// ------------------ Executable ----------------------- //

prepareBoard();
attachHandlers();

// ------------------ Turn changing -------------------- //

function changeTurn() {
    setActivePlayerPitsBorderSize( BorderSizes.NORMAL );

    changeActivePlayer();

    updateTurnIndicator();
    setActivePlayerPitsBorderSize( BorderSizes.HIGHLIGHT );
}

function updateTurnIndicator() {
    document.getElementById( "turn_indicator" )
        .innerHTML = "Turn: <span class='mini_pebble " + PlayerColors[activePlayer] + "'></span> player";
}

function setActivePlayerPitsBorderSize(borderSize) {
    playerPits[activePlayer].forEach( element => {
        element.setAttribute( "style", "border-width: " + borderSize + ";" );
    });
}

function changeActivePlayer() {
    activePlayer = ( activePlayer + 1 ) % 2;
}

// ------------------ Pebble translocation -------------- //

function movePebble(fromRowIndex, fromColumnIndex, toRowIndex, toColumnIndex) {
    var pebble = takePebbleOutOfPit( fromRowIndex, fromColumnIndex );
    updatePebbleCount( fromRowIndex, fromColumnIndex );

    putPebbleToPit( pebble, toRowIndex, toColumnIndex );
    updatePebbleCount( toRowIndex, toColumnIndex );

    updateScore();
    updatePebbleSum();
}

function putPebbleToPit(pebble, pitRowIndex, pitColumnIndex) {
    pitContent[pitRowIndex][pitColumnIndex] += 1;

    var pebbleSpace = getPebbleSpace( pitRowIndex, pitColumnIndex );

    var style = "background-color: " + pebble.style.backgroundColor + ";";
    style += " " + getPebbleOffsetStyle( pebbleSpace, pebble );

    pebble.setAttribute( "style", style );
    pebbleSpace.appendChild( pebble );
}

function takePebbleOutOfPit(pitRowIndex, pitColumnIndex) {
    pitContent[pitRowIndex][pitColumnIndex] -= 1;

    var pebble = getPebbleSpace( pitRowIndex, pitColumnIndex ).lastChild;
    getPebbleSpace( pitRowIndex, pitColumnIndex ).removeChild( pebble );

    return pebble;
}

// ------------------ Pebble placement ------------------ //

function addPebbleToPit(pitRowIndex, pitColumnIndex) {

    var pebbleSpace = getPebbleSpace( pitRowIndex, pitColumnIndex );

    var pebble = createPebble();
    var style = getPebbleOffsetStyle( pebbleSpace, pebble );
    style += " " + getPebbleColorStyle();

    pebble.setAttribute( "style", style );

    pebbleSpace.appendChild( pebble );

    pitContent[pitRowIndex][pitColumnIndex]++;
}

function createPebble() {
    var pebble = document.createElement( "div" );
    pebble.classList.add( "pebble" );

    return pebble;
}

function getPebbleOffsetStyle(pebbleSpace, pebble) {
    var widthLowerBound = Math.max( pebblePlacementLowerBound * pebbleSpace.offsetWidth - pebble.offsetWidth, pebble.offsetWidth );
    var widthUpperBound = Math.min( pebblePlacementUpperBound * pebbleSpace.offsetWidth - pebble.offsetWidth, pebbleSpace.offsetWidth - pebble.offsetWidth );

    var heightLowerBound = Math.max( pebblePlacementLowerBound * pebbleSpace.offsetHeight - pebble.offsetHeight, pebble.offsetHeight );
    var heightUpperBound = Math.min( pebblePlacementUpperBound * pebbleSpace.offsetHeight - pebble.offsetHeight, pebbleSpace.offsetHeight - pebble.offsetHeight );

    var style = "position: absolute; ";
    style += "top: " + getRandomFromRange( heightLowerBound, heightUpperBound ) + "px; ";
    style += "left: " + getRandomFromRange( widthLowerBound, widthUpperBound ) + "px; ";

    return style;
}

function getPebbleColorStyle() {
    var red = generateRandomColorRange();
    var green = generateRandomColorRange();
    var blue = generateRandomColorRange();

   return "background-color: rgb(" + red + ", " + green  + ", " + blue + ");";
}

// ------------------ Rendering ------------------------- //

function updatePebbleCount(pitRowIndex, pitColumnIndex) {
    var pitId = getPitIdPrefix( pitRowIndex, pitColumnIndex ) + "_pebble_count";
    document.getElementById( pitId ).innerText = pitContent[pitRowIndex][pitColumnIndex];
}

function getPitIdPrefix(pitRowIndex, pitColumnIndex) {
    if( isPitScoring( pitColumnIndex ) ) {
        return PlayerNames[pitRowIndex] + "_score_pit";
    } else {
        return PlayerSides[pitRowIndex] + "_pit_" + pitColumnIndex;
    }
}

function isPitScoring(pitColumnIndex) {
    return pitColumnIndex === pitsInRow;
}

function updateScore() {
    document.getElementById( "score indicator" )
        .innerHTML = "Score: " +
            "<span class=\"mini_pebble red\"></span> " +
            computePlayerScore( 0 ) + " x " + computePlayerScore( 1 ) +
            " <span class=\"mini_pebble blue\"></span>";
}

function computePlayerScore(playerNumber) {
    return pitContent[playerNumber][pitsInRow];
}

function updatePebbleSum() {
    document.getElementById( "pebble_distribution" )
        .innerHTML = "Pebbles: " +
            "<span class=\"mini_pebble red\"></span> " +
            computePlayerPebbleSum( 0 ) + " x " + computePlayerPebbleSum( 1 ) +
            " <span class=\"mini_pebble blue\"></span>";
}

function computePlayerPebbleSum(playerNumber) {

    var sum = 0;
    for( var index = 0; index < pitsInRow; index++ ) {
        sum += pitContent[playerNumber][index];
    }

    return sum;
}

function highlightPit(pitRowIndex, pitColumnIndex, highlight) {
    var color = highlight ? PlayerColors[activePlayer] : "white";

    var pitId = getPitIdPrefix( pitRowIndex, pitColumnIndex );
    document.getElementById( pitId ).style.backgroundColor = color;
}

function publishWinner() {
    var winnerAnnouncer = document.createElement( "div" );
    winnerAnnouncer.classList.add( "bold_text" );

    var announcement;
    if( pitContent[0][pitsInRow] === pitContent[1][pitsInRow] ) {
        announcement = "The match resulted in draw!";
    } else {
        winnerIndex = ( pitContent[0][pitsInRow] > pitContent[1][pitsInRow] ) ? 0 : 1;
        announcement = "The winner is <span class=\"mini_pebble " + PlayerColors[winnerIndex] + "\"></span> player";
    }

    winnerAnnouncer.innerHTML = announcement;
    document.getElementById( "game_results" ).appendChild( winnerAnnouncer );
}

function showPlayAgainButton() {
    var playAgainButton = document.createElement( "button" );
    playAgainButton.classList.add( "bold_text" );

    playAgainButton.innerHTML = "Play again?";
    playAgainButton.setAttribute( "background-color", "grey" );

    playAgainButton.onclick = function(event) {
        restartGame();
    }

    document.getElementById( "game_results" ).appendChild( playAgainButton );
}

function clearNode(nodeId) {
    var node = document.getElementById( nodeId );

    while ( node.firstChild ) {
        node.removeChild( node.firstChild );
    }
}

function prepareBoard() {
    changeTurn();
    placeInitialPebbles();

    updateScore();
    updatePebbleSum();
}

// ------------------ Initialization -------------------- //

function createPlayerPits() {
    var pitMap = [];

    pitMap.push( getPlayerPits( PlayerNames[PlayerNumbers.LEFT], PlayerSides[[PlayerNumbers.LEFT]] ) );
    pitMap.push( getPlayerPits( PlayerNames[PlayerNumbers.RIGHT], PlayerSides[[PlayerNumbers.RIGHT]] ) );

    return pitMap;
}

function getPlayerPits(playerName, playerSide) {
    var pits = [];

    for( var i = 0; i < pitsInRow; i++ ) {
        pits.push( document.getElementById( playerSide + "_pit_" + i) );
    }

    pits.push( document.getElementById( playerName + "_score_pit" ) );

    return pits;
}

function getPebbleSpace(pitRowIndex, pitColumnIndex) {
    var pitId = getPitIdPrefix( pitRowIndex, pitColumnIndex ) + "_pebble_space";
    return document.getElementById( pitId );
}

function createPitContentMatrix() {

    pitContentMatrix = []
    for( var row = 0; row < 2; row++ ) {

        rowContent = [];
        for( var column = 0; column < pitsInRow + 1; column++ ) {
            rowContent.push( 0 );
        }

        pitContentMatrix.push( rowContent );
    }

    return pitContentMatrix;
}

function placeInitialPebbles() {
    for( var row = 0; row < 2; row++ ) {
        for( var column = 0; column < pitsInRow; column++ ) {
            for( var i = 0; i < initialPebbleCount; i++) {
                addPebbleToPit( row, column );
            }

            updatePebbleCount( row, column );
        }
    }
}

// ------------------ Event handling ------------------- //

function attachHandlers() {
    for( var row = 0; row < 2; row++ ) {
        for( var column = 0; column < pitsInRow; column++ ) {
            attachHandler( row, column );
        }
    }
}

function attachHandler(pitRowIndex, pitColumnIndex) {
    const rowIndex = pitRowIndex;
    const columnIndex = pitColumnIndex;

    playerPits[rowIndex][columnIndex]
        .addEventListener('click', function(event) {
            event.preventDefault();

            if( pitContent[rowIndex][columnIndex]
                && activePlayer === rowIndex
                && currentState === GameStates.RESPONSIVE ) {

                currentState = GameStates.COMPUTING;
                playPit( rowIndex, columnIndex );
            }
    });
}

function playPit(pitRowIndex, pitColumnIndex) {

    var pebblesPut = 0;
    var remainingPebbles = pitContent[pitRowIndex][pitColumnIndex];

    var nextPit = [pitRowIndex, pitColumnIndex];

    while( remainingPebbles > 0 ) {
        nextPit = computeNextPit( pitRowIndex, nextPit[0], nextPit[1] );

        pebblesPut++;
        remainingPebbles--;

        setTimeout( movePebble.bind( this, pitRowIndex, pitColumnIndex, nextPit[0], nextPit[1] ), pebblesPut * placingDelay );
    }

    setTimeout( function() {
        if( shouldPerformStealMove( nextPit[0], nextPit[1] ) ) {
            performStealMove( nextPit[0], nextPit[1] );
            return;
        }

        if( !shouldPerformExtraTurn( nextPit[1] ) ) {
            changeTurn();
        }

        if( shouldEndGame() ) {
            currentState = GameStates.FINISHED;
            endGame();
        } else {
            currentState = GameStates.RESPONSIVE;
        }
    }, pebblesPut * placingDelay );
}

function performStealMove(currentRowIndex, currentColumnIndex) {

    var targetRowIndex = (currentRowIndex + 1) % 2;
    var targetColumnIndex = currentColumnIndex;

    var finalRowIndex = currentRowIndex;
    var finalColumnIndex = pitsInRow;

    highlightPit( currentRowIndex, currentColumnIndex, true );
    highlightPit( targetRowIndex, targetColumnIndex, true );

    var remainingPebbles = pitContent[targetRowIndex][targetColumnIndex];

    var pebblesPut = 0;
    while( remainingPebbles > 0 ) {

        pebblesPut++;
        remainingPebbles--;

        setTimeout( movePebble.bind( this, targetRowIndex, targetColumnIndex, finalRowIndex, finalColumnIndex ), pebblesPut * placingDelay );
    }

    pebblesPut++;
    setTimeout( movePebble.bind( this, currentRowIndex, currentColumnIndex, finalRowIndex, finalColumnIndex ), pebblesPut * placingDelay );
    setTimeout( function() {
        highlightPit( currentRowIndex, currentColumnIndex, false );
        highlightPit( targetRowIndex, targetColumnIndex, false );

        if( shouldEndGame() ) {
            currentState = GameStates.FINISHED;
            endGame();
        } else {
            currentState = GameStates.RESPONSIVE;
            changeTurn();
        }
    }, pebblesPut * placingDelay );

}

function endGame() {
    moveRemainingPebbles();
    publishWinner();
    showPlayAgainButton();
}

function restartGame() {
    activePlayer = PlayerNumbers.LEFT;
    currentState = GameStates.RESPONSIVE;

    clearNode( "left_score_pit" );
    clearNode( "right_score_pit" );
    clearNode( "game_results" );

    pitContent = createPitContentMatrix();

    prepareBoard();
}

function moveRemainingPebbles() {
    for( var row = 0; row < 2; row++ ) {
        for( var column = 0; column < pitsInRow; column++ ) {

            var remainingPebbles = pitContent[row][column];
            for( var i = 0; i < remainingPebbles; i++ ) {
                movePebble( row, column, row, pitsInRow );
            }
        }
    }
}

function computeNextPit(startingRowIndex, currentRowIndex, currentColumnIndex) {

    var nextColumnIndex;
    var nextRowIndex = currentRowIndex;

    if( currentRowIndex === 0 ) {

        nextColumnIndex = currentColumnIndex - 1;
        if( nextColumnIndex === pitsInRow - 1 ) {
            nextColumnIndex = 0;
            nextRowIndex = 1;
        }

        if( nextColumnIndex === -1 ) {
            if( startingRowIndex === currentRowIndex ) {
                nextColumnIndex = pitsInRow;
            } else {
                nextColumnIndex = 0;
                nextRowIndex = 1;
            }
        }

    } else {

        nextColumnIndex = currentColumnIndex + 1;
        if( nextColumnIndex === pitsInRow + 1 ) {
            nextColumnIndex = pitsInRow - 1;
            nextRowIndex = 0;
        }

        if( nextColumnIndex === pitsInRow ) {
            if( startingRowIndex !== currentRowIndex ) {
                nextColumnIndex = pitsInRow - 1;
                nextRowIndex = 0;
            }
        }
    }

    return [nextRowIndex, nextColumnIndex];
}

function shouldPerformExtraTurn(currentColumnIndex) {
    return currentColumnIndex === pitsInRow;
}

function shouldPerformStealMove(currentRowIndex, currentColumnIndex) {
    var oppositeRowIndex = (currentRowIndex + 1) % 2;

    return currentRowIndex == activePlayer
            && pitContent[currentRowIndex][currentColumnIndex] === 1
            && pitContent[oppositeRowIndex][currentColumnIndex] !== 0
            && currentColumnIndex !== pitsInRow;
}

function shouldEndGame() {
    return computePlayerPebbleSum( 0 ) === 0 || computePlayerPebbleSum( 1 ) === 0;
}

// ----------------------------------------------------- //

function getRandomFromRange(min, max) {
    return Math.random() * (max - min) + min;
}

function generateRandomColorRange() {
    return Math.floor( Math.random() * 256 );
}