/*global React*/
var partition = require('./util').partition;
var div = React.DOM.div;
var button = React.DOM.button;

// A little wrapper around React to avoid the slightly clunky factory wrapper
// around the component as well as the reliance on `this` to access props. The
// wrqpper defines a component as simply a render function.
function createComponent(render) {
  var component = React.createFactory(React.createClass({
    shouldComponentUpdate: function (newProps, newState) {
      // Simplified, this app only uses props
      return newProps.data !== this.props.data;
    },

    render: function() {
      return render.call(this, this.props.data);
    }
  }));

  return function (data) {
    return component({data: data});
  };
}

exports.createUI = function createUI(channel) {
  var Tile = createComponent(function (tile) {
    if (tile.get('isRevealed')) {
      return div({className: 'tile' + (tile.get('isMine') ? ' mine' : '')},
                 tile.get('threatCount') > 0 ? tile.get('threatCount') : '');
    }
    return div({
      className: 'tile',
      onClick: function () {
        channel.emit('reveal', tile.get('id'));
      }
    }, div({className: 'lid'}, ''));
  });

  var Row = createComponent(function (tiles) {
    return div({className: 'row'}, tiles.map(Tile).toJS());
  });

  var Board = createComponent(function (game) {
    return div({
      className: 'board'
    }, partition(game.get('cols'), game.get('tiles')).map(Row).toJS());
  });

  var UndoButton = createComponent(function () {
    return button({
      onClick: channel.emit.bind(channel, 'undo')
    }, 'Undo');
  });

  var Game = createComponent(function (game) {
    return div({}, [Board(game), UndoButton()]);
  });

  return function (data, container) {
    React.render(Game(data), container);
  };
}
