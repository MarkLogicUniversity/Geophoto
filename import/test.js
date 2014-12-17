var ExifImage = require('exif').ExifImage;
var file = '../data/photos/IMG_1191.jpg';

new ExifImage({ image: file}, function(error, exifData) {
  console.log(exifData);
  console.log(exifData.image.Make);
  console.log(exifData.image.Model);
  console.log(exifData.image.ModifyDate);
});
