var editor = (function() {
  'use strict';
  var canvas = '#photo-canvas';
  return {
    vintage: function() {
      return Caman(canvas, function() {
        this.vintage().render();
      });
    },
    lomo: function() {
      return Caman(canvas, function() {
        this.lomo().render();
      });
    },
    glowingSun: function() {
      return Caman(canvas, function() {
        this.glowingSun().render();
      });
    },
    nostalgia: function() {
      return Caman(canvas, function() {
        this.nostalgia().render();
      });
    },
    reset: function() {
      return Caman(canvas, function() {
        this.revert();
      });
    }
  };
})();

//
//Caman("#image", function () {
//   this.hue(90).render();
// });
