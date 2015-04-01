function partition(size, coll) {
  var res = [];
  for (var i = 0, l = coll.size || coll.length; i < l; i += size) {
    res.push(coll.slice(i, i + size));
  }
  return res;
}

function identity(v) {
  return v;
}

function prop(n) {
  return function (object) {
    return object[n];
  };
}

function keep(list, pred) {
  return list.map(pred).filter(identity);
}

function repeat(n, val) {
  const res = [];
  while (n--) {
    res.push(typeof val === 'function' ? val() : val);
  }
  return res;
}

function shuffle(list) {
  return list.sort(function () { return Math.random() - 0.5; });
}

export {partition, identity, prop, keep, repeat, shuffle};
