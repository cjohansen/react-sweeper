import {partition, shuffle, repeat, keep, prop} from './util.js';

function initTiles(rows, cols, mines) {
  var tiles = shuffle(repeat(mines, function () { return {isMine: true}; }).
                      concat(repeat(rows * cols - mines, function () { return {}; })));
  tiles.forEach(function (tile, idx) { tile.id = idx; });
  return tiles;
}

function onWEdge(game, tile) {
  return tile % game.cols === 0;
}

function onEEdge(game, tile) {
  return tile % game.cols === game.cols - 1;
}

function idx(game, tile) {
  if (tile < 0) { return null; }
  return game.tiles[tile] ? tile : null;
}

function nw(game, tile) {
  return onWEdge(game, tile) ? null : idx(game, tile - game.cols - 1);
}

function n(game, tile) {
  return idx(game, tile - game.cols);
}

function ne(game, tile) {
  return onEEdge(game, tile) ? null : idx(game, tile - game.cols + 1);
}

function e(game, tile) {
  return onEEdge(game, tile) ? null : idx(game, tile + 1);
}

function se(game, tile) {
  return onEEdge(game, tile) ? null : idx(game, tile + game.cols + 1);
}

function s(game, tile) {
  return idx(game, tile + game.cols);
}

function sw(game, tile) {
  return onWEdge(game, tile) ? null : idx(game, tile + game.cols - 1);
}

function w(game, tile) {
  return onWEdge(game, tile) ? null : idx(game, tile - 1);
}

const directions = [nw, n, ne, e, se, s, sw, w];

function neighbours(game, tile) {
  return keep(directions, function (dir) {
    return game.tiles[dir(game, tile)];
  });
}

function getMineCount(game, tile) {
  return neighbours(game, tile).filter(prop('isMine')).length;
}

function isMine(game, tile) {
  return game.tiles[tile].isMine;
}

function isSafe(game) {
  const tiles = game.tiles;
  const mines = tiles.filter(prop('isMine'));
  return mines.filter(prop('isRevealed')) === 0 &&
    tiles.length - mines.length === tiles.filter(prop('isRevealed')).length;
}

export function isGameOver(game) {
  return isSafe(game) || game.isDead;
}

function addThreatCount(game, tile) {
  game.tiles[tile].threatCount = getMineCount(game, tile);
}

function revealAdjacentSafeTiles(game, tile) {
  if (isMine(game, tile)) { return; }
  addThreatCount(game, tile);
  game.tiles[tile].isRevealed = true;

  if (game.tiles[tile].threatCount === 0) {
    keep(directions, function (dir) {
      return dir(game, tile);
    }).forEach(function (pos) {
      if (!game.tiles[pos].isRevealed) {
        revealAdjacentSafeTiles(game, pos);
      }
    });
  }
}

function attemptWinning(game) {
  game.isSafe = isSafe(game);
}

function revealMine(tile) {
  tile.isRevealed = tile.isRevealed || tile.isMine;
}

function revealMines(game) {
  game.tiles.forEach(revealMine);
}

export function revealTile(game, tile) {
  if (game.tiles[tile]) {
    game.tiles[tile].isRevealed = true;
  }

  if (isMine(game, tile)) {
    game.isDead = true;
    revealMines(game);
  } else {
    revealAdjacentSafeTiles(game, tile);
    attemptWinning(game);
  }
}

export function createGame(options) {
  return {
    cols: options.cols,
    rows: options.rows,
    playingTime: 0,
    tiles: initTiles(options.rows, options.cols, options.mines)
  };
}
