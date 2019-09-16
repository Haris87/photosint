// Select the node that will be observed for mutations
const targetNode = document.getElementsByTagName("body")[0];

// Options for the observer (which mutations to observe)
const config = { attributes: true, childList: true, subtree: true };

// Create an observer instance linked to the callback function
const observer = new MutationObserver(mutationCallback);

observer.observe(targetNode, config);

function checkImages(element) {
  const images = element.getElementsByTagName("img");
  for (let image of images) {
    if (image.complete) {
      extractExifData(image);
    } else {
      image.addEventListener("load", function() {
        extractExifData(this);
      });
    }

    // loading(image)
  }
}
checkImages(document);

function extractExifData(image) {
  EXIF.getData(image, function() {
    var metadata = EXIF.getAllTags(image);

    // image.parentNode.classList.add(exif_checked);
    image.classList.add("exif_checked");

    if (isEmpty(metadata)) {
      // image.parentNode.classList.add("no_exif");
      image.classList.add("no_exif_metadata");
    } else if (hasGPSMetadata(metadata)) {
      image.classList.add("gps_metadata");
    } else {
      // image.parentNode.classList.add("exif_metadata");
      image.classList.add("exif_metadata");

      image.onmouseenter = function(ev) {
        console.log(metadata);
      };
    }
  });
}

function hasGPSMetadata(metadata) {
  return (
    metadata.hasOwnProperty("GPSAltitude") ||
    metadata.hasOwnProperty("GPSAltitudeRef") ||
    metadata.hasOwnProperty("GPSDateStamp") ||
    metadata.hasOwnProperty("GPSImgDirection") ||
    metadata.hasOwnProperty("GPSImgDirectionRef") ||
    metadata.hasOwnProperty("GPSInfoIFDPointer") ||
    metadata.hasOwnProperty("GPSLatitude") ||
    metadata.hasOwnProperty("GPSLatitudeRef") ||
    metadata.hasOwnProperty("GPSLongitude") ||
    metadata.hasOwnProperty("GPSLongitudeRef") ||
    metadata.hasOwnProperty("GPSTimeStamp")
  );
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

// Callback function to execute when mutations are observed
function mutationCallback(mutationsList, observer) {
  let shouldCheck = false;
  for (let mutation of mutationsList) {
    if (mutation.type === "childList") {
      var newElement = mutation.target;
      var newImages = newElement.getElementsByTagName("img");
      if (newImages.length > 0) {
        shouldCheck = true;
        break;
      }
    }
  }

  if (shouldCheck) {
    checkImages(document);
    shouldCheck = false;
  }
}
