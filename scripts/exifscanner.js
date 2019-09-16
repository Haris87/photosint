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
  console.log("checking " + images.length + " images...");
  for (let image of images) {
    if (image.complete) {
      extractExifData(image);
    } else {
      image.addEventListener("load", function() {
        console.log("THIS", this, image);
        extractExifData(this);
      });
    }

    // if (!image.classList.contains(exif_checked)) {
    //   image.style = "filter: grayscale(0) sepia(0);";
    //   // image.style = "border: 6px dashed pink;";
    // }
  }
}
checkImages(document);

function extractExifData(image) {
  EXIF.getData(image, function() {
    var allMetaData = EXIF.getAllTags(image);
    image.classList.add(exif_checked);
    image.style = "border: 0px";
    if (isEmpty(allMetaData)) {
      image.style = "filter: grayscale(1);";
    } else {
      // image.style = "filter: sepia(1);";
      image.classList.add("has_exif");
      image.onclick = function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        console.log(allMetaData);
        alert(JSON.stringify(allMetaData));
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
      console.log("mutation. images: ", newImages.length);
      if (newImages.length > 0) {
        console.log("SHOULD CHECK");
        shouldCheck = true;
        break;
      }
    }
  }

  if (shouldCheck) {
    console.log("new images");
    checkImages(document);
    shouldCheck = false;
  }
}
