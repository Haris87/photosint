const urls = [];

function createCardNode(imgUrl, exif) {
  const div = document.createElement("DIV");
  let card = `<div class="card mb-3" style="max-width: 540px;">
    <div class="row g-0">
        <div class="col-md-4">
        <img src="${imgUrl}" class="img-fluid rounded-start" alt="...">
        </div>
        <div class="col-md-8">
        <div class="card-body">
            <table cellspacing="10">`;
  for (const key in exif) {
    card += `<tr><td>${key}</td><td>${JSON.stringify(exif[key])}</td></tr>`;
  }
  card += `</table></div></div></div></div>`;

  div.innerHTML = card;
  return div.firstChild;
}

function appendCard(url, exif) {
  var card = createCardNode(url, exif);
  document.getElementById("images").appendChild(card);
}

function onSync() {
  console.log("onSync clicked");
  const p = { cmd: "any command" };

  // Send message from active tab to background:
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, p, function (images) {
      console.log(images);
      appendImages(images);
      //   images.forEach((image) => {
      //     if (document.querySelectorAll(`[src="${image.url}"]`).length == 0) {

      //     }
      //   });
    });
  });
}

function appendImages(_images) {
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
}

/**
 * Check for updates every 2 seconds
 */
setInterval(onSync, 2000);

document.getElementById("sync-btn").addEventListener("click", onSync);
