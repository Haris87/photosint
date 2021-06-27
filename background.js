function reverseImageSearchGoogle(info, tab) {
  chrome.tabs.create({
    url: "https://images.google.com/searchbyimage?image_url=" + info.srcUrl,
  });
}

function reverseImageSearchYandex(info, tab) {
  chrome.tabs.create({
    url:
      "https://yandex.com/images/search?url=" + info.srcUrl + "&rpt=imageview",
  });
}

function reverseImageSearchBing(info, tab) {
  chrome.tabs.create({
    url:
      "https://www.bing.com/images/search?q=imgurl:" +
      info.srcUrl +
      "&view=detailv2&selectedIndex=0&pageurl=&mode=ImageViewer&iss=sbi",
  });
}

function toMetadataViewer(info, tab) {
  chrome.tabs.create({
    url: "https://metadataviewer.herokuapp.com/?img=" + info.srcUrl,
  });
}

function reverseImageSearchAll(info, tab) {
  reverseImageSearchBing(info, tab);
  reverseImageSearchYandex(info, tab);
  reverseImageSearchGoogle(info, tab);
}

console.log("BG");
function onInstalled() {
  console.log("installed");
  chrome.contextMenus.create({
    id: "reverse-image-search",
    title: "Reverse image search (Google, Bing, Yandex)",
    contexts: ["image"],
    // onclick: reverseImageSearchAll,
  });

  chrome.contextMenus.create({
    id: "metadata-viewer",
    title: "Send to Metadata Viewer",
    contexts: ["image"],
    // onclick: toMetadataViewer,
  });
}

function onClicked(info, tab) {
  console.log(info, tab);
  if (info.menuItemId == "reverse-image-search") {
    reverseImageSearchAll(info, tab);
  } else if (info.menuItemId == "metadata-viewer") {
    toMetadataViewer(info, tab);
  }
}

chrome.runtime.onInstalled.addListener(onInstalled);
chrome.contextMenus.onClicked.addListener(onClicked);
