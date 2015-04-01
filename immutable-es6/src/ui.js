/*global React*/
import {partition} from './util';
const {render, createClass, createFactory} = React;
const {div, button} = React.DOM;

// A little wrapper around React to avoid the slightly clunky factory wrapper
// around the component as well as the reliance on `this` to access props. The
// wrqpper defines a component as simply a render function.
function createComponent(render) {
  var component = createFactory(createClass({
    shouldComponentUpdate(newProps, newState) {
      // Simplified, this app only uses props
      return newProps.data !== this.props.data;
    },

    render() {
      return render.call(this, this.props.data);
    }
  }));

  return (data) => {
    return component({data: data});
  };
}

export function createUI(channel) {
  const Tile = createComponent((tile) => {
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

  const Row = createComponent((tiles) => {
    return div({className: 'row'}, tiles.map(Tile).toJS());
  });

  const Board = createComponent((game) => {
    return div({
      className: 'board'
    }, partition(game.get('cols'), game.get('tiles')).map(Row).toJS());
  });

  const UndoButton = createComponent(() => {
    return button({
      onClick: channel.emit.bind(channel, 'undo')
    }, 'Undo');
  });

  const Game = createComponent((game) => {
    return div({}, [Board(game), UndoButton()]);
  });

  return (data, container) => {
    render(Game(data), container);
  };
}
