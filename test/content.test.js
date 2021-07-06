const chai = require("chai");
const expect = chai.expect;
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const chrome = require("sinon-chrome/extensions");

const fs = require("fs");
const html = fs.readFileSync("./test/test.html").toString();
const { window } = new JSDOM(html);
let content;

describe("content.js ", () => {
  before(() => {
    global.chrome = chrome;
    global.window = window;
    global.document = window.document;
    global.btoa = window.btoa;
    global.MutationObserver = class {
      constructor(callback) {}
      disconnect() {}
      observe(element, initObject) {}
    };
    content = require("../src/content");
  });

  beforeEach(() => {
    chrome.flush();
  });

  describe("isEmpty ", () => {
    it("should be true", () => {
      expect(content.isEmpty({})).to.be.true;
    });
  });

  after(() => {
    chrome.flush();
    delete global.chrome;
  });
});
