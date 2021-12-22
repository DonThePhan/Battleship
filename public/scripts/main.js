const ROWS = 10;
const COLS = 10;
let curRow;
let curCol;

let carrier = { name: 'carrier', length: 5, text: 'CA', class: { ver: 'carrier-v', hor: 'carrier-h' } };
let battleship = { name: 'battleship', length: 4, text: 'B', class: { ver: 'battleship-v', hor: 'battleship-h' } };
let cruiser = { name: 'cruiser', length: 3, text: 'CR', class: { ver: 'cruiser-v', hor: 'cruiser-h' } };
let submarine = { name: 'submarine', length: 3, text: 'S', class: { ver: 'submarine-v', hor: 'submarine-h' } };
let destroyer = { name: 'destroyer', length: 2, text: 'D', class: { ver: 'destroyer-v', hor: 'destroyer-h' } };

let selectedShip = battleship;
let verOrHor = 'ver';

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
    ship: '',
    text: ''
  };
}

function assignShipToText() {
  loopYandX((y, x) => {
    let gridCell = grid[y][x];
    gridCell.text = gridCell.ship;
  });
}

function getCellFromOrientation(y, x, start, cellNum) {
  if (verOrHor === 'ver') {
    return grid[start + y + cellNum][x];
  } else {
    return grid[y][start + x + cellNum];
  }
}

function getDomCellFromOrientation(y, x, start, cellNum) {
  if (verOrHor === 'ver') {
    console.log('ver', y + start + cellNum, x);
    return domGrid.children().eq(y + start + cellNum).children().eq(x);
  } else {
    console.log('hor', y, x + start + cellNum);
    return domGrid.children().eq(y).children().eq(x + start + cellNum);
  }
}

function dropShipIntoGrid(y, x) {
  removeInstancesOfShip();
  let start = -Math.floor(selectedShip.length / 2);
  for (let cellNum = 0; cellNum < selectedShip.length; cellNum++) {
    let cell = getCellFromOrientation(y, x, start, cellNum);
    cell.ship = selectedShip.name;
  }

  assignShipToText();
  gridToDom();
}

function removeInstancesOfShip() {
  loopYandX((y, x) => {
    let gridCell = grid[y][x];
    gridCell.ship === selectedShip.name ? (gridCell.ship = '') : null;
  });
}

/** GRID - DOM INTERACTION ============================== */

function gridToDom() {
  loopYandX((y, x) => {
    let gridCell = grid[y][x];
    let gridDomCell = domGrid.children().eq(y).children().eq(x);

    gridDomCell.text(gridCell.ship);

    updateTextToShip();
  });
}

function updateTextToShip() {
  loopYandX((y, x) => {
    let domCell = domGrid.children().eq(y).children().eq(x);
    domCell.text(grid[y][x].text);
  });
}

/** DOM REPRESENTATION =================================== */
let domGrid = $('<div>').addClass('grid');

for (let y = 0; y < ROWS; y++) {
  domGrid.append(createDomRow(y));
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
    updateTextToShip();
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
  let start = -Math.floor(selectedShip.length / 2);

  let gridDomCell = getDomCellFromOrientation(y, x, 0, 0);
  // gridDomCell.text(selectedShip.name);
  gridDomCell.append(createShipImgElement());
}

function createShipImgElement() {
  let img = $('<img>').attr('src', `/images/${selectedShip.name}.png`).addClass(selectedShip.class[verOrHor]);
  return img;
}

/** HTML INTERACTION ===================================== */
$(document).ready(() => {
  let main = $('main');
  main.append(domGrid);
});
