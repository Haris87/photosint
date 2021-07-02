const urls = [];

function createCardNode(imgUrl, exif) {
  const div = document.createElement("DIV");
  const filename = getFilename(imgUrl);
  let card = `<div class="card mb-3" style="max-width: 540px;">
    <div class="card-header">${filename}</div>
    <div class="row g-0">
        <div class="col-md-4">
        <img src="${imgUrl}" class="img-fluid rounded mx-auto d-block" alt="..."/>
        </div>
        <div class="col-md-8">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-striped" cellspacing="10">`;
  for (const key in exif) {
    card += `<tr><td>${key}</td><td>${JSON.stringify(exif[key])}</td></tr>`;
  }
  card += `</table></div></div></div></div></div>`;

  div.innerHTML = card;
  return div.firstChild;
}

function getFilename(url) {
  try {
    const parts = url.split("/");

    if (parts.length > 0) {
      const last = parts[parts.length - 1];
      return last.split("?")[0];
    } else {
      return url;
    }
  } catch (e) {
    console.warn(e);
  }
}

function appendCard(url, exif) {
  var card = createCardNode(url, exif);
  document.getElementById("images").appendChild(card);
}

function onScan() {
  console.log("scaning...");
  const request = { command: "fetchImages" };

  // Send message to content script (dom-watcher):
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, request, function (images) {
      console.log("popup got images:", images);
      appendImages(images);
    });
  });
}

function appendImages(_images) {
  if (_images) {
    _images
      .filter((i) => {
        if (urls.indexOf(i.url) == -1) {
          urls.push(i.url);
          return i;
        }
      })
      .forEach((i) => {
        appendCard(i.url, i.metadata);
      });
    updateCount();
  }
}

function updateCount() {
  document.getElementById("count").innerHTML = urls.length;
}

/**
 * Check for updates every 2 seconds
 */
//TODO: find more effective alternative
function watcher() {
  onScan();
  setInterval(onScan, 2000);
}
watcher();
