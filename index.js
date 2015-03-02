import {createGame, revealTile, isGameOver} from './src/game.js';
import {createUI} from './src/ui.js';
import {EventEmitter} from 'events';
import {List} from 'immutable';

const channel = new EventEmitter();
const renderMinesweeper = createUI(channel);
let game = createGame({cols: 16, rows: 16, mines: 48});
let history = List([game]);

function render() {
  renderMinesweeper(game, document.getElementById('board'));
}

channel.on('undo', () => {
  if (history.size > 1) {
    history = history.pop();
    game = history.last();
    render();
  }
});

channel.on('reveal', (tile) => {
  if (isGameOver(game)) { return; }

  const newGame = revealTile(game, tile);

  if (newGame !== game) {
    history = history.push(newGame);
    game = newGame;
  }

  render();

  if (isGameOver(game)) {
    // Wait for the final render to complete before alerting the user
    setTimeout(() => { alert('GAME OVER!'); }, 50);
  }
});

render();
