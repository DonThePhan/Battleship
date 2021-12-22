const ROWS = 10;
const COLS = 10;
let curRow;
let curCol;

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
let grid = [];
for (let y = 0; y < ROWS; y++) {
  let row = [];
  for (let x = 0; x < COLS; x++) {
    row.push(createCell());
  }
  grid.push(row);
}
function createCell() {
  return {
    ship: undefined,
    text: '',
    verOrHor: undefined,
    image: false
  };
}

function assignShipToText() {
  loopYandX((y, x) => {
    let gridCell = grid[y][x];
    gridCell.text = gridCell.ship;
  });
}

function getCell(y, x, start = 0, cellNum = 0) {
  if (verOrHor === 'ver') {
    return grid[start + y + cellNum][x];
  } else {
    return grid[y][start + x + cellNum];
  }
}

function getDomCell(y, x, start = 0, cellNum = 0) {
  if (verOrHor === 'ver') {
    // console.log('ver', y + start + cellNum, x);
    return $domGrid.children().eq(y + start + cellNum).children().eq(x);
  } else {
    // console.log('hor', y, x + start + cellNum);
    return $domGrid.children().eq(y).children().eq(x + start + cellNum);
  }
}

function dropShipIntoGrid(y, x) {
  removeInstancesOfShip();
  let start = -Math.floor(selectedShip.length / 2);
  for (let cellNum = 0; cellNum < selectedShip.length; cellNum++) {
    let cell = getCell(y, x, start, cellNum);
    cell.ship = selectedShip;
    cell.verOrHor = verOrHor;

    if (start + cellNum === 0) {
      cell.image = true;
    }
  }

  refreshDomCellImages();
}

function removeInstancesOfShip() {
  loopYandX((y, x) => {
    let gridCell = grid[y][x];
    if (gridCell.ship) {
      if (gridCell.ship.name === selectedShip.name) {
        gridCell.ship = undefined;
        gridCell.image = false;
      }
    }
  });
}

/** GRID - DOM INTERACTION ============================== */

function gridToDom() {
  loopYandX((y, x) => {
    let gridCell = grid[y][x];
    let gridDomCell = $domGrid.children().eq(y).children().eq(x);
    gridDomCell.empty();

    gridDomCell.append(createShipImgElement(gridCell.ship, gridCell.verOrHor));

    // refreshDomCellImage();
  });
}

function refreshDomCellImages() {
  loopYandX((y, x) => {
    let domCell = getDomCell(y, x);
    domCell.empty();

    let gridCell = grid[y][x];

    if (gridCell.ship && gridCell.image) {
      domCell.append(createShipImgElement(gridCell.ship, gridCell.verOrHor));
    }
  });
}

/** DOM REPRESENTATION =================================== */
let $domGrid = $('<div>').addClass('grid');

for (let y = 0; y < ROWS; y++) {
  $domGrid.append(createDomRow(y));
}

function createDomRow(y) {
  let row = $('<div>').addClass('row');
  for (let x = 0; x < COLS; x++) {
    row.append(createDomCell(y, x));
  }
  row.on('mouseenter', function() {
    curRow = $(this).index();
  });
  return row;
}

function createDomCell(y, x) {
  let cell = $('<div>').addClass('cell');
  cell.attr('data-row', y);
  cell.attr('data-col', x);

  cell.on('click', function() {
    let y = Number($(this).attr('data-row'));
    let x = Number($(this).attr('data-col'));
    dropShipIntoGrid(y, x);
  });

  cell.on('mouseenter', function() {
    let y = Number($(this).attr('data-row'));
    let x = Number($(this).attr('data-col'));

    if (positionValid(y, x)) {
      projectShip(y, x);
    }
  });

  cell.on('mouseleave', function() {
    refreshDomCellImages();
  });

  return cell;
}

function positionValid(y, x) {
  let start = -Math.floor(selectedShip.length / 2);
  for (let l = 0; l < selectedShip.length; l++) {
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

function projectShip(y, x) {
  let gridDomCell = getDomCell(y, x);
  // gridDomCell.text(selectedShip.name);
  gridDomCell.append(createShipImgElement(selectedShip, verOrHor));
}

function createShipImgElement(ship, verOrHor) {
  let img = $('<img>').attr('src', `/images/${ship.name}.png`).addClass(ship.class[verOrHor]);
  return img;
}

/** SET PIECES =========================================== */
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

/** HTML INTERACTION ===================================== */
$(document).ready(() => {
  let main = $('main');
  main.prepend($domGrid);
});
