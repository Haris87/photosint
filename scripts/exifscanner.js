// Select the node that will be observed for mutations
const targetNode = document.getElementsByTagName('body')[0];

// Options for the observer (which mutations to observe)
const config = { attributes: true, childList: true, subtree: true };

// Create an observer instance linked to the callback function
const observer = new MutationObserver(mutationCallback);

observer.observe(targetNode, config);

function checkImages(nodes) {
  if (
    NodeList.prototype.isPrototypeOf(nodes) ||
    HTMLCollection.prototype.isPrototypeOf(nodes)
  ) {
    for (let image of nodes) {
      // extractAndShowExifData(image);
      // console.log(image.alt, image.src);
      // if (image.src == 'https://s.nbst.gr/files/1/2019/07/2170889-353x221.jpg') {
      //   console.log('GIANNAKOPOULOS');
      // }
      checkImage(image);

      // loading(image)
    }
  } else if (HTMLElement.prototype.isPrototypeOf(nodes)) {
    checkImage(nodes);
  }
}

function checkImage(image) {
  if (!image.complete) {
    image.addEventListener('load', function() {
      extractExifData(this);
      // extractAndShowExifData(this);
    });
  } else {
    extractExifData(image);
  }
}

function init() {
  setTimeout(function() {
    checkImages(document.querySelector('img:not(.exif_metadata)'));
  }, 1000);
}
init();

function extractExifData(image) {
  EXIF.getData(image, function() {
    var metadata = EXIF.getAllTags(image);

    // image.classList.add('exif_checked');

    if (isEmpty(metadata)) {
      image.classList.add('no_exif_metadata');
    } else {
      image.classList.add('exif_metadata');

      if (hasGPSMetadata(metadata)) {
        image.classList.add('gps_metadata');
      }

      image.onmouseenter = function(ev) {
        console.log(metadata);
      };
    }
  });
}

function extractAndShowExifData(image) {
  EXIF.getData(image, function() {
    var metadata = EXIF.getAllTags(image);

    var parent = !!image.parentNode ? image.parentNode : image;
    // image.classList.add('exif_checked');

    if (!isEmpty(metadata)) {
      parent.classList.add('show_exif_metadata');
      parent.setAttribute('data-exif', createMetadataSummary(metadata));

      if (hasGPSMetadata(metadata)) {
        parent.classList.add('show_gps_metadata');
        parent.setAttribute('data-gps', createGPSSummary(metadata));
      }

      // if (hasGPSMetadata(metadata)) {
      //   parent.classList.add('show_gps_metadata');
      // }

      image.onmouseenter = function(ev) {
        console.log(metadata);
      };
    }
  });
}

function createMetadataSummary(metadata) {
  var metaString = '';

  metaString += hasCameraMetadata(metadata)
    ? (metadata.Make || '' + ' ' + metadata.Model || '') + ', '
    : '';
  metaString += hasDateMetadata(metadata)
    ? (metadata.DateTime ||
        metadata.DateTimeDigitized ||
        metadata.DateTimeOriginal) + ', '
    : '';

  metaString += hasCopyrightMetadata(metadata) ? '© ' + metadata.Copyright : '';

  return metaString;
}

function createGPSSummary(metadata) {
  var metaStringArray = [];

  if (metadata.hasOwnProperty('GPSAltitude')) {
    metaStringArray.push('Alt: ' + metadata.GPSAltitude);
  }

  if (metadata.hasOwnProperty('GPSImgDirection')) {
    metaStringArray.push('Dir: ' + metadata.GPSImgDirection);
  }

  if (metadata.hasOwnProperty('GPSInfoIFDPointer')) {
    metaStringArray.push('ID pointer: ' + metadata.GPSInfoIFDPointer);
  }

  if (metadata.hasOwnProperty('GPSPosition')) {
    metaStringArray.push('Lat Long: ' + metadata.GPSPosition);
    metaString += metadata.GPSPosition;
  } else if (
    metadata.hasOwnProperty('GPSLatitude') &&
    metadata.hasOwnProperty('GPSLongitude')
  ) {
    metaStringArray.push(
      'Lat Long: ' + metadata.GPSLatitude + ' ' + metadata.GPSLongitude
    );
  }

  return metaStringArray.join(', ');
}

function hasGPSMetadata(metadata) {
  return (
    metadata.hasOwnProperty('GPSAltitude') ||
    metadata.hasOwnProperty('GPSAltitudeRef') ||
    metadata.hasOwnProperty('GPSDateStamp') ||
    metadata.hasOwnProperty('GPSImgDirection') ||
    metadata.hasOwnProperty('GPSImgDirectionRef') ||
    metadata.hasOwnProperty('GPSInfoIFDPointer') ||
    metadata.hasOwnProperty('GPSLatitude') ||
    metadata.hasOwnProperty('GPSLatitudeRef') ||
    metadata.hasOwnProperty('GPSLongitude') ||
    metadata.hasOwnProperty('GPSLongitudeRef') ||
    metadata.hasOwnProperty('GPSTimeStamp') ||
    metadata.hasOwnProperty('GPSPosition')
  );
}

function hasCameraMetadata(metadata) {
  return metadata.hasOwnProperty('Make') || metadata.hasOwnProperty('Model');
}

function hasDateMetadata(metadata) {
  return (
    metadata.hasOwnProperty('DateTime') ||
    metadata.hasOwnProperty('DateTimeDigitized') ||
    metadata.hasOwnProperty('DateTimeOriginal')
  );
}

function hasCopyrightMetadata(metadata) {
  return metadata.hasOwnProperty('Copyright');
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

// Callback function to execute when mutations are observed
let shown = false;
function mutationCallback(mutationsList, observer) {
  let shouldCheck = false;

  for (let mutation of mutationsList) {
    if (mutation.type === 'childList') {
      var newElement = mutation.target;
      var newImages = newElement.getElementsByTagName('img');
      if (newImages.length > 0) {
        shouldCheck = true;
        break;
      }
    } else if (mutation.type === 'attributes') {
      if (
        mutation.target.tagName === 'IMG' &&
        mutation.attributeName === 'src'
      ) {
        if (!shown) console.log(mutation.target.alt, mutation);
        shown = true;
        checkImage(mutation.target);
      }
    }
  }

  if (shouldCheck) {
    checkImages(document.querySelector('img:not(.exif_metadata)'));
    shouldCheck = false;
  }
}
