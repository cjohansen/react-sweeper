var fromJS = require('immutable').fromJS;
var List = require('immutable').List;
var Map = require('immutable').Map;

function partition(size, coll) {
  var res = [];
  for (var i = 0, l = coll.size || coll.length; i < l; i += size) {
    res.push(coll.slice(i, i + size));
  }
  return fromJS(res);
}

function identity(v) {
  return v;
}

function prop(n) {
  return function (object) {
    return object instanceof Map ? object.get(n) : object[n];
  };
}

function keep(list, pred) {
  return list.map(pred).filter(identity);
}

function repeat(n, val) {
  var res = [];
  while (n--) {
    res.push(val);
  }
  return List(res);
}

function shuffle(list) {
  return list.sort(function () { return Math.random() - 0.5; });
}

module.exports = {
  partition: partition,
  identity: identity,
  prop: prop,
  keep: keep,
  repeat: repeat,
  shuffle: shuffle
};
