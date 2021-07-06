class EventEmitter {
  constructor() {
    this.callbacks = {};
  }

  on(event, cb) {
    if (!this.callbacks[event]) this.callbacks[event] = [];
    this.callbacks[event].push(cb);
  }

  emit(event, data) {
    let cbs = this.callbacks[event];
    if (cbs) {
      cbs.forEach((cb) => cb(data));
    }
  }
}
const target = new EventEmitter();

// The body node will be observed for mutations
const body = document.getElementsByTagName("body")[0];

let images = [];

// Options for the observer (which mutations to observe)
const config = { attributes: true, childList: true, subtree: true };

// Create an observer instance linked to the callback export function
const observer = new MutationObserver(mutationCallback);

/**
 * Callback export function to execute when mutations are observed
 */
export function mutationCallback(mutationsList, observer) {
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
    scanImages();
    shouldCheck = false;
  }
}

/**
 * Check images when they enter veiwport
 */
document.getElementsByTagName("body")[0].addEventListener("load", function () {
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
});

// observer body for changes (api calls, lazy load)
observer.observe(body, config);

/**
 * Add image to image urls array
 */
export function addImage(image) {
  images.push(image);
  updateIconNotification();
}

/**
 * Removes duplicate urls from images array
 * @returns
 */
export function removeDuplicateImages() {
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
  // console.log("got message from popup", request, sender);
  scanImages();
  sendResponse(images);

  // Note: Returning true is required here!
  //  ref: http://stackoverflow.com/questions/20077487/chrome-extension-message-passing-response-not-sent
  return true;
});

/**
 * Send message to background to update notification count
 */
export function updateIconNotification() {
  let count = removeDuplicateImages().length;
  chrome.runtime.sendMessage({ count: String(count) }, function (response) {
    // console.log("response from background:", response);
  });
}

/**
 * Event that fires when all images are loaded
 */
export function eventImagesLoaded() {
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

/**
 * Handle html image nodes
 */
export function scanImages() {
  const nodes = document.getElementsByTagName("img");
  if (
    NodeList.prototype.isPrototypeOf(nodes) ||
    HTMLCollection.prototype.isPrototypeOf(nodes)
  ) {
    for (let image of nodes) {
      target.emit("image-found", { node: image });
    }
  } else if (HTMLElement.prototype.isPrototypeOf(nodes)) {
    target.emit("image-found", { node: nodes });
  }
}

/**
 * When image with found, check for EXIF and extract, notify background
 */
target.on("image-found", (event) => {
  // console.log("event", event);
  checkImage(event.node).then((image) => {
    images.push(image);
    images = removeDuplicateImages();
    updateIconNotification();
  });
});

export function checkImages(nodes) {
  return new Promise((resolve, reject) => {
    // console.log("checking nodes", nodes.length);
    if (
      NodeList.prototype.isPrototypeOf(nodes) ||
      HTMLCollection.prototype.isPrototypeOf(nodes)
    ) {
      // console.log("checking nodes", nodes.length);
      for (let image of nodes) {
        // extractAndShowExifData(image);
        // console.log(image.alt, image.src);
        // if (image.src == 'https://s.nbst.gr/files/1/2019/07/2170889-353x221.jpg') {
        //   console.log('GIANNAKOPOULOS');
        // }
        checkImage(image).then(resolve);

        // loading(image)
      }
    } else if (HTMLElement.prototype.isPrototypeOf(nodes)) {
      checkImage(nodes).then(resolve);
    }
  });
}

export function checkImage(image) {
  return new Promise((resolve, reject) => {
    if (!image.complete) {
      image.addEventListener("load", function () {
        // extractAndShowExifData(this);
      });
    } else {
      extractExifData(image).then(resolve);
    }
  });
}

export function extractExifData(image) {
  // check image if not already has exif
  // if (!image.classList.contains('exif_metadata')) {
  return new Promise((resolve, reject) => {
    try {
      EXIF.getData(
        image,
        function () {
          var metadata = EXIF.getAllTags(image);

          if (!isEmpty(metadata)) {
            //NOTE: this css is for testing
            image.classList.add("exif_metadata");

            if (hasGPSMetadata(metadata)) {
              //NOTE: this css is for testing
              image.classList.add("gps_metadata");
            }

            // TODO: Convert to readable string
            // if (metadata["UserComment"]) {
            // }

            resolve({ url: image.src, metadata: metadata });
          } else {
            image.classList.add("no_exif_metadata");
          }
        },
        function (err) {
          console.warn("Exif get data error:", err);
          reject(err);
        }
      );
    } catch (e) {
      console.warn("Exif get data error:", e);
      reject(e);
    }
  });

  // }
}

export function hasGPSMetadata(metadata) {
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
    metadata.hasOwnProperty("GPSTimeStamp") ||
    metadata.hasOwnProperty("GPSPosition")
  );
}

export function hasCameraMetadata(metadata) {
  return metadata.hasOwnProperty("Make") || metadata.hasOwnProperty("Model");
}

export function hasDateMetadata(metadata) {
  return (
    metadata.hasOwnProperty("DateTime") ||
    metadata.hasOwnProperty("DateTimeDigitized") ||
    metadata.hasOwnProperty("DateTimeOriginal")
  );
}

export function hasCopyrightMetadata(metadata) {
  return metadata.hasOwnProperty("Copyright");
}

export function isEmpty(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}
