var googleReverseImageSearch =
  'https://images.google.com/searchbyimage?image_url=http://www.geocreepy.com/Place_based_project.png';

chrome.contextMenus.create({
  title: 'Search: %s',
  contexts: ['selection'],
  onclick: getword
});
