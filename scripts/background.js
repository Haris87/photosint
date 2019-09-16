function reverseImageSearchGoogle(info, tab) {
  chrome.tabs.create({
    url: "https://images.google.com/searchbyimage?image_url=" + info.srcUrl
  });
}

function reverseImageSearchYandex(info, tab) {
  chrome.tabs.create({
    url:
      "https://yandex.com/images/search?url=" + info.srcUrl + "&rpt=imageview"
  });
}

function reverseImageSearchBing(info, tab) {
  chrome.tabs.create({
    url:
      "https://www.bing.com/images/search?q=imgurl:" +
      info.srcUrl +
      "&view=detailv2&selectedIndex=0&pageurl=&mode=ImageViewer&iss=sbi"
  });
}

function reverseImageSearchAll(info, tab) {
  reverseImageSearchBing(info, tab);
  reverseImageSearchYandex(info, tab);
  reverseImageSearchGoogle(info, tab);
}

chrome.contextMenus.create({
  title: "Reverse image search (all)",
  contexts: ["image"],
  onclick: reverseImageSearchAll
});

/*
chrome.contextMenus.create({
  title: "Reverse image search in Google",
  contexts: ["image"],
  onclick: reverseImageSearchGoogle
});

chrome.contextMenus.create({
  title: "Reverse image search in Yandex",
  contexts: ["image"],
  onclick: reverseImageSearchYandex
});

chrome.contextMenus.create({
  title: "Reverse image search in Bing",
  contexts: ["image"],
  onclick: reverseImageSearchBing
});
*/
