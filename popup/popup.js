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

chrome.runtime.onMessage.addListener((msg, sender) => {
  console.log("MESSAGE", msg);
});
