import {createGame, revealTile, isGameOver} from './src/game.js';
import {createUI} from './src/ui.js';
import {EventEmitter} from 'events';
import {List} from 'immutable';

const channel = new EventEmitter();
const renderMinesweeper = createUI(channel);
let game = createGame({cols: 16, rows: 16, mines: 48});

function render() {
  renderMinesweeper(game, document.getElementById('board'));
}

channel.on('reveal', (tile) => {
  if (isGameOver(game)) { return; }
  revealTile(game, tile);
  render();

  if (isGameOver(game)) {
    // Wait for the final render to complete before alerting the user
    setTimeout(() => { alert('GAME OVER!'); }, 50);
  }
});

if (/bench/.test(window.location.href)) {
  console.time('Reveal all non-mine tiles');
  render();
  game.tiles.forEach(function (tile) {
    if (!tile.isMine) {
      channel.emit('reveal', tile.id);
    }
  });
  console.timeEnd('Reveal all non-mine tiles');
} else {
  render();
}
