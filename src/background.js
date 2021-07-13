const state = {};
let currentTab;

function getTineyeHash(imgUrl) {
  const data = new URLSearchParams();
  data.append("url", imgUrl);

  return fetch("https://tineye.com/result_json/", {
    method: "POST",
    body: data,
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (response) {
      console.log(response);
      const hash = response.query_hash;
      return hash;
    });
}

function reverseImageSearchTineye(info, tab) {
  getTineyeHash(info.srcUrl)
    .then((hash) => {
      chrome.tabs.create({
        url: `https://tineye.com/search/${hash}?sort=crawl_date&order=asc&page=1`,
      });
    })
    .catch((error) => {
      console.warn(error);
    });
}

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
  reverseImageSearchTineye(info, tab);
}

function showNotificationOnIcon(count) {
  let text = count > 0 ? String(count) : "";
  if (count > 10) text = "10+";

  chrome.action.setBadgeBackgroundColor({ color: "#d00" }, () => {
    chrome.action.setBadgeText({ text: text });
  });
}

function showNotification() {
  const opt = {
    iconUrl: "icons/icon_128.png",
    type: "basic",
    title: "Images with GPS found",
    message: "Images with GPS found - message",
    priority: 1,
  };
  chrome.notifications.create("notify1", opt, function () {
    console.log("created!");
  });
}

function onClicked(info, tab) {
  if (info.menuItemId == "reverse-image-search") {
    reverseImageSearchAll(info, tab);
  } else if (info.menuItemId == "metadata-viewer") {
    toMetadataViewer(info, tab);
  }
}

function onActivated(activeInfo) {
  const tabCount = state[activeInfo.tabId] || 0;
  // console.log("change tab", activeInfo.tabId);
  // console.log("state", state);
  // console.log("new count", tabCount);
  showNotificationOnIcon(tabCount);
  return true;
}

function onMessage(request, sender, sendResponse) {
  // console.log(
  //   sender.tab
  //     ? "from a content script:" + sender.tab.url
  //     : "from the extension"
  // );

  state[sender.tab.id] = request.count;

  showNotificationOnIcon(request.count);
  sendResponse(request.count);
}

function onInstalled() {
  // console.log("installed");
  chrome.contextMenus.create({
    id: "reverse-image-search",
    title: "Reverse image search (Google, Bing, Yandex, TinEye)",
    contexts: ["image"],
    // onclick: reverseImageSearchAll,
  });

  chrome.contextMenus.create({
    id: "metadata-viewer",
    title: "Send to Metadata Viewer",
    contexts: ["image"],
    // onclick: toMetadataViewer,
  });

  // showNotification();
}

chrome.runtime.onInstalled.addListener(onInstalled);
chrome.runtime.onMessage.addListener(onMessage);
chrome.contextMenus.onClicked.addListener(onClicked);
chrome.tabs.onActivated.addListener(onActivated);
