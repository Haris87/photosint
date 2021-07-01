const state = {};
let currentTab;

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

function showCountOnIcon(count) {
  let text = count > 0 ? String(count) : "";

  if (count > 10) text = "10+";

  chrome.action.setBadgeBackgroundColor({ color: "#F00" }, () => {
    chrome.action.setBadgeText({ text: text });
  });
}

function onMessage(request, sender, sendResponse) {
  console.log(
    sender.tab
      ? "from a content script:" + sender.tab.url
      : "from the extension"
  );

  state[sender.tab.id] = request.count;

  showCountOnIcon(request.count);
  sendResponse(request.count);
}

chrome.runtime.onInstalled.addListener(onInstalled);
chrome.runtime.onMessage.addListener(onMessage);
chrome.contextMenus.onClicked.addListener(onClicked);

chrome.tabs.onActivated.addListener(function (activeInfo) {
  const tabCount = state[activeInfo.tabId] || 0;
  // console.log("change tab", activeInfo.tabId);
  // console.log("state", state);
  // console.log("new count", tabCount);
  showCountOnIcon(tabCount);
});
