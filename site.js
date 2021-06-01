function makeBoard(size) {

  $('#newBoard').children().remove();

  var $cell = {},
    $gameBoard = {};
  for (let r = 1; r <= size; r++) {
    for (let c = 1; c <= size; c++) {
      let classes = ['game-cell', 'box' + size, 'r' + r, 'c' + c].join(' ');
      $cell = $('<div/>').addClass(classes);
      if (r === c) {
        $cell.addClass('d1');
      }
      if (r === size + 1 - c) {
        $cell.addClass('d2');
      }
      if (r === size) {
        $cell.addClass('rLast');
      }
      if (c === size) {
        $cell.addClass('cLast');
      }
      $cell.append($('<span/>'));
      $cell.children('span').html('&nbsp;');
      $('#newBoard').append($($cell));
    }
  }
}

function makeWinArray(size) {
  winArray = [
    [],
    [],
    [],
    []
  ];
  for (let i = 0; i < (2 * size + 2); i++) {
    winArray[0][i] = 0;
    winArray[1][i] = 0;

    winArray[2][i] = (i < size) ? `r${i + 1}` : `c${i - size + 1}`;
    winArray[3][i] = (i < size) ? 'winRow' : 'winCol';
  }
  winArray[2][2 * size] = 'd1';
  winArray[2][2 * size + 1] = 'd2';
  winArray[3][2 * size] = 'winDiag1';
  winArray[3][2 * size + 1] = 'winDiag2';

  console.log(winArray);
}

function makeMoveArr(cell) {
  let classes = $(cell)[0].classList;

  let possArrWins = [];
  for (let i = 0; i < (size * 2 + 2); i++) {
    possArrWins.push(0);
  }
  possArrWins[parseInt(classes[2][1]) - 1] = 1;
  possArrWins[size + parseInt(classes[3][1]) - 1] = 1;
  if (classes.length > 4 && classes[4][0] == 'd') {
    possArrWins[size * 2 + parseInt(classes[4][1]) - 1] = 1;
  }
  if (classes.length > 5 && classes[5][0] == 'd') {
    possArrWins[size * 2 + parseInt(classes[5][1]) - 1] = 1;
  }
  
  moves.push(possArrWins);
  console.log(moves);

  return possArrWins;
}

function updateWinArray(player, cellArrWins) {
  let index = 0;
  let maxWins = 0;
  for (var i = 0; i < winArray[0].length; i++) {
    maxWins = incTest(player, cellArrWins, i);
    if (maxWins === size) {
      index = i;
      gameOver = true;
      console.log(`maxWins: ${maxWins} index: ${index}`);
      $(`.${winArray[2][index]}`).addClass(winArray[3][index]);
    };
  }


  console.log(`${symbols[0]}: [${winArray[0]}]`);
  console.log(`${symbols[1]}: [${winArray[1]}]`);

  isWinPossible();
}

function incTest(player, cellArr, index) {
  return winArray[player][index] += cellArr[index];
}

function decTest(player, cellArr, index) {
  return winArray[player][index] -= cellArr[index];
}

function undoLastMove(player, lastMove) {

  var cellRow = "",
    cellCol = "";

  for (let i = 0; i < lastMove.length; i++) {
    decTest(player, lastMove, i);
    if (lastMove[i] == 1) {
      if (i < size) {
        cellRow = `r${i+1}`
      };
      if (i < 2 * size) {
        cellCol = `c${i-size+1}`
      };
    }
  }
  console.log(`lastMove at ${cellRow} ${cellCol}`);

  let $cells = $('.game-cell ');
  for (let i = 0; i < $cells.length; i++) {
    $($cells[i])
      .removeClass('winRow winCol winDiag1 winDiag2');
    if ($($cells[i]).hasClass(cellRow) && $($cells[i]).hasClass(cellCol)) {
      $($cells[i]).removeClass('marked').children('span').html('&nbsp;');
    }
  }
  moves.length = moves.length - 1;
  gameOver = false;
  console.log(symbols[turn % 2] + ': ' + moves[turn]);
  showOutcome(symbols[turn % 2], 'Következik')
  isWinPossible();
}

function isWinPossible() {
  let winPoss = [],
    winPossTest = false;
  for (let i = 0; i < winArray[0].length; i++) {
    winPoss.push(!((winArray[0][i] > 0) && (winArray[1][i] > 0)));
    winPossTest = winPossTest || winPoss[winPoss.length - 1];
  }
  console.log(`winPoss: [${winPoss}]? ${winPossTest}`);

  if (!winPossTest) {
    $('#info').text('Döntetlen');
  }
}

function showOutcome(symbol, message) {
  $('#info').text(message);
  $('#big-symbol').text(symbol);
}

var size = 3;
var symbols = ['', ''];
var winArray = [];
var turn = 0,
  moves = [];
var gameOver = false,
  winPossible = true;

$(document).on('click', '.game-cell', function (e) {

  if (!$(this).hasClass('marked') && !gameOver) {
    $(this).addClass('marked').children('span').text(symbols[turn % 2]);
    updateWinArray(turn % 2, makeMoveArr($(this)));
    if (gameOver) {
      showOutcome(symbols[turn % 2], 'Nyert!');
    } else if (turn === size * size - 1) {
      gameOver = true;
      showOutcome('Tie', 'Döntetlen');
    } else {
      turn++;
      $('#big-symbol').text(symbols[turn % 2]);
    }
  }
})

$('#setup').on('submit', function (e) {
  e.preventDefault();
  size = parseInt($('#boardSize').val());
  symbols[0] = $('#symbol0').val();
  symbols[1] = $('#symbol1').val();
  if (symbols[0] !== symbols[1]) {
    makeBoard(size);
    makeWinArray(size);
    gameOver = false;
    turn = 0, moves = [];
    $('#big-symbol').text(symbols[turn % 2]).parent('div');
    $('#info').text('Következik');
  } else {
    alert('Kérem használjon különböző szimbólumokat!');
  }
})

$(function () {
  $('#setup').trigger('submit');
});

$(document).on('click', '.prettydiv', function () {
  if (turn > 0) {
    if (!gameOver) { turn--; };
    console.log(moves[turn]);
    undoLastMove(turn % 2, moves[turn]);
  }
})