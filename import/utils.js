'use strict';
Object.defineProperty(exports, '__esModule', {
  value: true
});
/*
Module with helper functions
*/

var unique = function unique(array) {
  return array.reduce(function (accum, current) {
    if (accum.indexOf(current) < 0) {
      accum.push(current);
    }
    return accum;
  }, []);
};
exports.unique = unique;
