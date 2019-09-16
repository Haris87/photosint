// Select the node that will be observed for mutations
const targetNode = document.getElementsByTagName("body")[0];

// Options for the observer (which mutations to observe)
const config = { attributes: true, childList: true, subtree: true };

// Create an observer instance linked to the callback function
const observer = new MutationObserver(mutationCallback);

observer.observe(targetNode, config);

// class to add to elements that where already checked
const exif_checked = "exif_checked";

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
    var allMetaData = EXIF.getAllTags(image);
    // image.parentNode.classList.add(exif_checked);
    image.classList.add(exif_checked);

    if (isEmpty(allMetaData)) {
      // image.parentNode.classList.add("no_exif");
      image.classList.add("no_exif");
    } else {
      // image.parentNode.classList.add("has_exif");
      image.classList.add("has_exif");

      image.onmouseenter = function(ev) {
        console.log(allMetaData);
      };
    }
  });
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
