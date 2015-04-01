var List = require('immutable').List;
var Map = require('immutable').Map;
var fromJS = require('immutable').fromJS;
var partition = require('./util').partition;
var shuffle = require('./util').shuffle;
var repeat = require('./util').repeat;
var keep = require('./util').keep;
var prop = require('./util').prop;

function initTiles(rows, cols, mines) {
  return shuffle(repeat(mines, Map({isMine: true, isRevealed: false})).
                 concat(repeat(rows * cols - mines, Map({isRevealed: false})))).
    map(function (tile, idx) {
      return tile.set('id', idx);
    });
}

function onWEdge(game, tile) {
  return tile % game.get('cols') === 0;
}

function onEEdge(game, tile) {
  return tile % game.get('cols') === game.get('cols') - 1;
}

function idx(game, tile) {
  if (tile < 0) { return null; }
  return game.getIn(['tiles', tile]) ? tile : null;
}

function nw(game, tile) {
  return onWEdge(game, tile) ? null : idx(game, tile - game.get('cols') - 1);
}

function n(game, tile) {
  return idx(game, tile - game.get('cols'));
}

function ne(game, tile) {
  return onEEdge(game, tile) ? null : idx(game, tile - game.get('cols') + 1);
}

function e(game, tile) {
  return onEEdge(game, tile) ? null : idx(game, tile + 1);
}

function se(game, tile) {
  return onEEdge(game, tile) ? null : idx(game, tile + game.get('cols') + 1);
}

function s(game, tile) {
  return idx(game, tile + game.get('cols'));
}

function sw(game, tile) {
  return onWEdge(game, tile) ? null : idx(game, tile + game.get('cols') - 1);
}

function w(game, tile) {
  return onWEdge(game, tile) ? null : idx(game, tile - 1);
}

var directions = [nw, n, ne, e, se, s, sw, w];

function neighbours(game, tile) {
  return keep(directions, function (dir) {
    return game.getIn(['tiles', dir(game, tile)]);
  });
}

function getMineCount(game, tile) {
  var nbs = neighbours(game, tile);
  return nbs.filter(prop('isMine')).length;
}

function isMine(game, tile) {
  return game.getIn(['tiles', tile, 'isMine']);
}

function isSafe(game) {
  var tiles = game.get('tiles');
  var mines = tiles.filter(prop('isMine'));
  return mines.filter(prop('isRevealed')) === 0 &&
    tiles.length - mines.length === tiles.filter(prop('isRevealed')).length;
}

exports.isGameOver = function isGameOver(game) {
  return isSafe(game) || game.get('isDead');
};

function addThreatCount(game, tile) {
  return game.setIn(['tiles', tile, 'threatCount'], getMineCount(game, tile));
}

function revealAdjacentSafeTiles(game, tile) {
  if (isMine(game, tile)) {
    return game;
  }
  game = addThreatCount(game, tile).setIn(['tiles', tile, 'isRevealed'], true);
  if (game.getIn(['tiles', tile, 'threatCount']) === 0) {
    return keep(directions, function (dir) {
      return dir(game, tile);
    }).reduce(function (game, pos) {
      return !game.getIn(['tiles', pos, 'isRevealed']) ?
        revealAdjacentSafeTiles(game, pos) : game;
    }, game);
  }
  return game;
}

function attemptWinning(game) {
  return isSafe(game) ? game.set('isSafe', true) : game;
}

function revealMine(tile) {
  return tile.get('isMine') ? tile.set('isRevealed', true) : tile;
}

function revealMines(game) {
  return game.updateIn(['tiles'], function (tiles) {
    return tiles.map(revealMine);
  });
}

exports.revealTile = function revealTile(game, tile) {
  var updated = !game.getIn(['tiles', tile]) ?
          game : game.setIn(['tiles', tile, 'isRevealed'], true);
  return isMine(updated, tile) ?
    revealMines(updated.set('isDead', true)) :
    attemptWinning(revealAdjacentSafeTiles(updated, tile));
};

exports.createGame = function createGame(options) {
  return fromJS({
    cols: options.cols,
    rows: options.rows,
    playingTime: 0,
    tiles: initTiles(options.rows, options.cols, options.mines)
  });
};
