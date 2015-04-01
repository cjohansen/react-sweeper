var createGame = require('./src/game').createGame;
var revealTile = require('./src/game').revealTile;
var isGameOver = require('./src/game').isGameOver;
var createUI = require('./src/ui').createUI;
var EventEmitter = require('events').EventEmitter;
var List = require('immutable').List;

var channel = new EventEmitter();
var renderMinesweeper = createUI(channel);
var game = createGame({cols: 16, rows: 16, mines: 48});
var history = List([game]);

function render() {
  renderMinesweeper(game, document.getElementById('board'));
}

channel.on('undo', function () {
  if (history.size > 1) {
    history = history.pop();
    game = history.last();
    render();
  }
});

channel.on('reveal', function (tile) {
  if (isGameOver(game)) { return; }

  var newGame = revealTile(game, tile);

  if (newGame !== game) {
    history = history.push(newGame);
    game = newGame;
  }

  render();

  if (isGameOver(game)) {
    // Wait for the final render to complete before alerting the user
    setTimeout(function () { alert('GAME OVER!'); }, 50);
  }
});

if (/bench/.test(window.location.href)) {
  console.time('Reveal all non-mine tiles');
  render();
  game.get('tiles').forEach(function (tile) {
    if (!tile.get('isMine')) {
      channel.emit('reveal', tile.get('id'));
    }
  });
  console.timeEnd('Reveal all non-mine tiles');
} else {
  render();
}
