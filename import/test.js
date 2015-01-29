var ExifImage  = require('exif-makernote-fix').ExifImage;
new ExifImage({ image: '../data/photos/IMG_9446.JPG'}, function(error, exifData) {
  console.log(exifData);
});
