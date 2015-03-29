"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var unique = function (array) {
  return array.reduce(function (accum, current) {
    if (accum.indexOf(current) < 0) {
      accum.push(current);
    }
    return accum;
  }, []);
};
exports.unique = unique;
