'use strict';
/*
Module with helper functions
*/

export var unique = array => {
  return array.reduce((accum, current) => {
    if (accum.indexOf(current) < 0) {
      accum.push(current);
    }
    return accum;
  }, []);
};
