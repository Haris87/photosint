// Select the node that will be observed for mutations
const body = document.getElementsByTagName("body")[0];

let images = [];

// Options for the observer (which mutations to observe)
const config = { attributes: true, childList: true, subtree: true };

// Create an observer instance linked to the callback function
const observer = new MutationObserver(mutationCallback);

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
    // checkImages(document.querySelector('img:not(.exif_metadata)'));

    checkImages(document.getElementsByTagName("img")).then((_images) => {
      images = images.concat(_images);
    });
    shouldCheck = false;
  }
}

// check images when they enter viewport
enterView({
  selector: "img",
  enter: function (el) {
    // console.log("IMAGE ENTERED");
    checkImage(el).then(addImage);
    el.classList.add("entered");

    // el.addEventListener('mouseenter', function() {
    //   console.log('mouseenter', el.src);
    //   extractExifData(el, function(metadata) {
    //     console.log(metadata);
    //   });
    // });
  },
  exit: function (el) {
    // console.log("IMAGE LEFT");
    // el.classList.remove('entered');
    // el.classList.remove('exif_metadata');
    // el.classList.remove('no_exif_metadata');
    // el.classList.remove('gps_metadata');
  },
});

// observer body for changes (api calls, lazy load)
observer.observe(body, config);

function addImage(image) {
  images.push(image);
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  checkImages(document.getElementsByTagName("img")).then((_images) => {
    images = images.concat(_images);

    sendResponse(images);
    images = [];
  });

  // Note: Returning true is required here!
  //  ref: http://stackoverflow.com/questions/20077487/chrome-extension-message-passing-response-not-sent
  return true;
});
