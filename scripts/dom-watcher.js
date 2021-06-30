// The body node will be observed for mutations
const body = document.getElementsByTagName("body")[0];

let images = [];

// Options for the observer (which mutations to observe)
const config = { attributes: true, childList: true, subtree: true };

// Create an observer instance linked to the callback function
const observer = new MutationObserver(mutationCallback);

/**
 * Callback function to execute when mutations are observed
 */
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
    } else if (mutation.type === "attributes") {
      if (
        mutation.target.tagName === "IMG" &&
        mutation.attributeName === "src"
      ) {
        checkImage(mutation.target).then(addImage);
      }
    }
  }

  if (shouldCheck) {
    checkImages(document.getElementsByTagName("img")).then((_images) => {
      images = images.concat(_images);
      updateIconNotification();
    });
    shouldCheck = false;
  }
}

/**
 * Check images when they enter veiwport
 */
enterView({
  selector: "img",
  enter: function (el) {
    // console.log("IMAGE ENTERED");
    checkImage(el).then(addImage);
  },
  exit: function (el) {
    // console.log("IMAGE LEFT");
  },
});

// observer body for changes (api calls, lazy load)
observer.observe(body, config);

/**
 * Add image to image urls array
 */
function addImage(image) {
  images.push(image);
  updateIconNotification();
}

/**
 * Removes duplicate urls from images array
 * @returns
 */
function removeDuplicateImages() {
  const urls = [];

  return images.filter((i) => {
    if (urls.indexOf(i.url) == -1) {
      urls.push(i.url);
      return i;
    }
  });
}

/**
 * Get requests for images from popup
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("got message from popup", request, sender);
  checkImages(document.getElementsByTagName("img")).then((_images) => {
    images = images.concat(_images);

    // notify background about the count change
    updateIconNotification();

    // send requested images to popup
    sendResponse(images);
  });

  // Note: Returning true is required here!
  //  ref: http://stackoverflow.com/questions/20077487/chrome-extension-message-passing-response-not-sent
  return true;
});

/**
 * Send message to background to update notification count
 */
function updateIconNotification() {
  let count = removeDuplicateImages().length;
  chrome.runtime.sendMessage({ count: String(count) }, function (response) {
    console.log("response from background:", response);
  });
}

/**
 * Event that fires when all images are loaded
 */
function eventImagesLoaded() {
  return Promise.all(
    Array.from(document.images)
      .filter((img) => !img.complete)
      .map(
        (img) =>
          new Promise((resolve) => {
            img.onload = img.onerror = resolve;
          })
      )
  );
}

/**
 * After all images are loaded, update notification count
 */
eventImagesLoaded().then(() => {
  updateIconNotification();
});
