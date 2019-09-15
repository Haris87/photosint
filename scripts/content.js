const exif_checked = "exif_checked"; // class to add to elements that where already checked

function checkImages(element) {
  const images = document.getElementsByTagName("img");
  console.log("checking " + images.length + " images...");
  for (let image of images) {
    if (!image.classList.contains(exif_checked)) {
      image.style = "filter: grayscale(0.5);";
      image.style = "border: 6px dashed pink;";
      extractExifData(image);
    }
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
      image.style = "filter: grayscale(0);";
      image.onclick = function() {
        console.log(allMetaData);
        alert("I HAVE METADATA");
      };
    }
  });
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

/**
 * MUTATION OBSERVER
 */
// Select the node that will be observed for mutations
const targetNode = document.getElementsByTagName("body")[0];

// Options for the observer (which mutations to observe)
const config = { attributes: true, childList: true, subtree: true };

// Callback function to execute when mutations are observed
const callback = function(mutationsList, observer) {
  for (let mutation of mutationsList) {
    if (mutation.type === "childList") {
      var newElement = mutation.target;
      var newImages = newElement.getElementsByTagName("img");

      if (newImages.length > 0) {
        checkImages(newElement);
      }
    }
  }
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);

// Later, you can stop observing
//observer.disconnect();
