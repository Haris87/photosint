const urls = [];

export function createCardNode(imgUrl, exif) {
  const div = document.createElement("DIV");
  const filename = getFilename(imgUrl);
  const domain = getDomain(imgUrl);

  let card = `<div class="card mb-3" style="max-width: 540px;">
    <div class="row g-0">
        <div class="col-md-4">
        <img src="${imgUrl}" class="img-fluid rounded mx-auto d-block" alt="..."/>
        </div>
        <div class="col-md-8">
        <div class="card-body">
          <div>
            <table class="table table-striped" cellspacing="10">
              <tr><td class="key">Domain</td><td>${domain}</td></tr>
              <tr><td class="key">Filename</td><td>${filename}</td></tr>`;
  for (const key in exif) {
    card += `<tr><td class="key">${key || ""}</td><td>${JSON.stringify(
      exif[key]
    )}</td></tr>`;
  }
  card += `</table><div class="map" id="map-${getImageId(
    imgUrl
  )}"></div></div></div></div></div></div>`;

  div.innerHTML = card;
  return div.firstChild;
}

export function addMap(imgUrl, exif) {
  if (exif["GPSLongitude"]) {
    const lat = convertDMSToDD(
      exif["GPSLatitude"][0],
      exif["GPSLatitude"][1],
      exif["GPSLatitude"][2],
      exif["GPSLatitudeRef"]
    );
    const long = convertDMSToDD(
      exif["GPSLongitude"][0],
      exif["GPSLongitude"][1],
      exif["GPSLongitude"][2],
      exif["GPSLongitudeRef"]
    );
    // console.log("GPS", lat, long);
    const mapElements = document.querySelectorAll(".map");
    for (const mapElement of mapElements) {
      const id = mapElement.attributes.getNamedItem("id").value;

      if (id == "map-" + getImageId(imgUrl)) {
        mapElement.style = "display: block;";
        const mymap = L.map(id).setView([lat, long], 7);
        L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}",
          {
            foo: "bar",
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }
        ).addTo(mymap);

        const marker = L.marker([lat, long]).addTo(mymap);
      }
    }
  }
}

export function convertDMSToDD(degrees, minutes, seconds, direction) {
  var dd = degrees + minutes / 60 + seconds / (60 * 60);

  if (direction == "S" || direction == "W") {
    dd = dd * -1;
  } // Don't do anything for N or E
  return dd;
}

export function getDomain(url) {
  let hostname;
  if (url.indexOf("://") > -1) {
    hostname = url.split("/")[2];
  } else {
    hostname = url.split("/")[0];
  }
  hostname = hostname.split(":")[0];
  hostname = hostname.split("?")[0];

  return hostname;
}

export function getFilename(url) {
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

export function getImageId(imgUrl) {
  return btoa(imgUrl);
}

export function appendCard(url, exif) {
  var card = createCardNode(url, exif);
  document.getElementById("images").appendChild(card);
  addMap(url, exif);
}

export function onScan() {
  // console.log("scaning...");
  const request = { command: "fetchImages" };

  // Send message to content script (dom-watcher):
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, request, function (images) {
      // console.log("popup got images:", images);
      appendImages(images);
    });
  });
}

export function appendImages(_images) {
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

export function updateCount() {
  document.getElementById("count").innerHTML = urls.length;
}

/**
 * Check for updates every 2 seconds
 */
//TODO: find more effective alternative
export function watcher() {
  onScan();
  setInterval(onScan, 2000);
}
watcher();
