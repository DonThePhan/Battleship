const ROWS = 10;
const COLS = 10;
let curRow;
let curCol;

let gameOn = true;
let player1Turn = true;
let gameMode = 'computer';

let playerGrid;
let $playerGrid;

let pcGrid;
let $pcGrid;

const ships = {
  carrier: { name: 'carrier', length: 5, text: 'CA', class: { ver: 'carrier-v', hor: 'carrier-h' } },
  battleship: { name: 'battleship', length: 4, text: 'B', class: { ver: 'battleship-v', hor: 'battleship-h' } },
  cruiser: { name: 'cruiser', length: 3, text: 'CR', class: { ver: 'cruiser-v', hor: 'cruiser-h' } },
  submarine: { name: 'submarine', length: 3, text: 'S', class: { ver: 'submarine-v', hor: 'submarine-h' } },
  destroyer: { name: 'destroyer', length: 2, text: 'D', class: { ver: 'destroyer-v', hor: 'destroyer-h' } }
};

let selectedShip = ships.carrier;
let verOrHor = 'hor';

/** HELPER FUNCTIONS */

function loopYandX(callback) {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      callback(y, x);
    }
  }
}

/** GRID REPRESENTATION ========================================================== */

function createGrid() {
  let grid = [];
  for (let y = 0; y < ROWS; y++) {
    let row = [];
    for (let x = 0; x < COLS; x++) {
      row.push(createCell());
    }
    grid.push(row);
  }
  return grid;
}

function createCell() {
  return {
    ship: undefined,
    verOrHor: undefined,
    image: false,
    hit: false,
    miss: false
  };
}

function getCell(grid, y, x, start = 0, cellNum = 0) {
  if (verOrHor === 'ver') {
    return grid[start + y + cellNum][x];
  } else {
    return grid[y][start + x + cellNum];
  }
}

function dropShipIntoGrid(grid, $grid, y, x, ship) {
  removeInstancesOfShip(grid, ship);
  let start = -Math.floor(ship.length / 2);
  for (let cellNum = 0; cellNum < ship.length; cellNum++) {
    let cell = getCell(grid, y, x, start, cellNum);
    cell.ship = ship;
    cell.verOrHor = verOrHor;

    if (start + cellNum === 0) {
      cell.image = true;
    }
  }

  refreshDomCellImages(grid, $grid);
}

function removeInstancesOfShip(grid, ship) {
  loopYandX((y, x) => {
    let gridCell = grid[y][x];
    if (gridCell.ship) {
      if (gridCell.ship.name === ship.name) {
        gridCell.ship = undefined;
        gridCell.image = false;
      }
    }
  });
}

/** GRID-DOM INTERACTION ============================== */

function refreshDomCellImages(grid, $grid) {
  loopYandX((y, x) => {
    let cell = grid[y][x];
    let domCell = getDomCell($grid, y, x);
    domCell.empty();
    if (cell.ship && cell.image) {
      domCell.append(createShipImgElement(cell.ship, cell.verOrHor));
    }
  });
}

/** DOM REPRESENTATION =================================== */
function createDomGrid(grid) {
  let $grid = $('<div>').addClass('grid');
  for (let y = 0; y < ROWS; y++) {
    $grid.append(createDomRow(grid, $grid, y));
  }
  return $grid;
}
function createDomRow(grid, $grid, y) {
  let row = $('<div>').addClass('row');
  for (let x = 0; x < COLS; x++) {
    row.append(createDomCell(grid, $grid, y, x));
  }
  row.on('mouseenter', function() {
    curRow = $(this).index();
  });
  return row;
}

function createDomCell(grid, $grid, y, x) {
  let cell = $('<div>').addClass('cell');
  cell.attr('data-row', y);
  cell.attr('data-col', x);

  cell.on('click', function() {
    let y = Number($(this).attr('data-row'));
    let x = Number($(this).attr('data-col'));
    dropShipIntoGrid(grid, $grid, y, x, selectedShip);
  });

  cell.on('mouseenter', function() {
    let y = Number($(this).attr('data-row'));
    let x = Number($(this).attr('data-col'));

    if (positionValid($grid, y, x, selectedShip)) {
      projectShip($grid, y, x, selectedShip);
    }
  });

  cell.on('mouseleave', function() {
    refreshDomCellImages(grid, $grid);
  });

  return cell;
}

function getDomCell($grid, y, x, start = 0, cellNum = 0) {
  if (verOrHor === 'ver') {
    return $grid.children().eq(y + start + cellNum).children().eq(x);
  } else {
    return $grid.children().eq(y).children().eq(x + start + cellNum);
  }
}

function positionValid(y, x, ship) {
  let start = -Math.floor(ship.length / 2);
  for (let l = 0; l < ship.length; l++) {
    if (verOrHor === 'hor') {
      let position = start + x + l;
      if (position < 0 || position >= ROWS) {
        return false;
      }
    } else {
      let position = start + y + l;
      if (position < 0 || position >= COLS) {
        return false;
      }
    }
  }
  return true;
}

function projectShip($grid, y, x, ship) {
  let gridDomCell = getDomCell($grid, y, x);
  gridDomCell.append(createShipImgElement(ship, verOrHor));
}

function createShipImgElement(ship, verOrHor) {
  let img = $('<img>').attr('src', `/images/${ship.name}.png`).addClass(ship.class[verOrHor]);
  return img;
}

/** PHASE 1: LAY DOWN PIECES ============================= */
// Create GRIDs
playerGrid = createGrid();
$playerGrid = createDomGrid(playerGrid);

let playingPieces = $('.playing-pieces').children();
for (let piece of playingPieces) {
  $(piece).on('click', function() {
    selectedShip = Object.entries(ships).find(([ ship, shipInfo ]) => {
      return $(piece).hasClass(shipInfo.name);
    })[1];
  });
}

$('.rotate').on('click', function() {
  if (verOrHor === 'ver') {
    verOrHor = 'hor';
  } else {
    verOrHor = 'ver';
  }
});

$('.start').on('click', function() {
  $('.playing-pieces-container').hide();

  startGameMode();
});

/** PHASE 2: GAME MODE =================================== */

function startGameMode() {
  if (gameMode === 'computer') {
    initiateComputerMode();
  }
}

function initiateComputerMode() {
  pcGrid = createGrid();
  $pcGrid = createDomGrid(pcGrid);

  // TODO Un-hardcode ships
  dropShipIntoGrid(pcGrid, $pcGrid, 0, 2, ships.carrier);
  dropShipIntoGrid(pcGrid, $pcGrid, 1, 2, ships.battleship);
  dropShipIntoGrid(pcGrid, $pcGrid, 2, 2, ships.cruiser);
  dropShipIntoGrid(pcGrid, $pcGrid, 3, 2, ships.submarine);
  dropShipIntoGrid(pcGrid, $pcGrid, 4, 2, ships.destroyer);

  $('main').append($pcGrid);
  gameStart();
}

/** PHASE 3: GAME PLAY =================================== */

function createImg(fileName, _class) {
  let $fire = $('<img>').attr('src', `/images/${fileName}`).addClass(_class);
  return $fire;
}

function clearCellsEvents() {
  let cells = $('.cell');
  for (cell of cells) {
    $(cell).off();
  }
}

function playerActionPending() {
  clearCellsEvents();
  let cells = $('.cell');
  for (cell of cells) {
    $(cell).on('click', function() {
      // $(this).append(createImg('fire.gif', 'fire'));
      $(this).append(createImg('explosion1.gif', /* TODO create explosion class*/ 'fire'));

      player1Turn = !player1Turn;
      gameStart();
    });
  }
}

function gameStart() {
  if (player1Turn) {
    playerActionPending();
  } else {
  }
}

/** HTML INTERACTION ===================================== */
$(document).ready(() => {
  let main = $('main');
  main.prepend($playerGrid);
});
