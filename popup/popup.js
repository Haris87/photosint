function createCardNode(imgUrl, exif) {
  var div = document.createElement("DIV");
  div.innerHTML = `<div class="card mb-3" style="max-width: 540px;">
    <div class="row g-0">
        <div class="col-md-4">
        <img src="${imgUrl}" class="img-fluid rounded-start" alt="...">
        </div>
        <div class="col-md-8">
        <div class="card-body">
            <table>
                <tr><td>Make</td><td>${exif.Make || ""}</td></tr>
                <tr><td>Model</td><td>${exif.Model || ""}</td></tr>
                <tr><td>Date</td><td>${exif.Date || ""}</td></tr>
                <tr><td>GPS</td><td>${exif.GPS || ""}</td></tr>
            </table>  
        </div>
        </div>
    </div>
    </div>`;
  return div.firstChild;
}

function appendCard(url, exif) {
  var card = createCardNode(url, exif);
  document.getElementById("images").appendChild(card);
}

appendCard("http://lorempixel.com/500/900/", {});
appendCard("http://lorempixel.com/400/800/", {});
appendCard("http://lorempixel.com/500/300/", {});
appendCard("http://lorempixel.com/900/200/", {});

function onSync() {
  console.log("onSync clicked");
  const p = { cmd: "any command" };
  //   chrome.runtime.sendMessage(p, function (response) {
  //     console.log("message from background:", response);
  //   });

  // If you want to sendMessage from tab of browser,
  // use `chrome.tabs.sendMessage()`.

  // Send message from active tab to background:
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, p, function (response) {
      console.log("message from background:", response);
    });
  });
}
onSync();

document.getElementById("sync-btn").addEventListener("click", onSync);
// chrome.storage.onChanged.addListener(function(changes, namespace) {

// })
