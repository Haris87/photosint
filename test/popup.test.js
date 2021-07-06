const chai = require("chai");
const expect = chai.expect;
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const chrome = require("sinon-chrome/extensions");

const fs = require("fs");
const html = fs.readFileSync("./src/popup/popup.html").toString();
const { window } = new JSDOM(html);
let popup;

describe("popup.js ", () => {
  before(() => {
    global.chrome = chrome;
    global.window = window;
    global.document = window.document;
    global.btoa = window.btoa;
    global.setInterval = function (callback, num) {};
    popup = require("../src/popup/popup");
  });

  beforeEach(() => {
    chrome.flush();
  });

  describe("getFilename ", () => {
    it("should return the last part of the URL", () => {
      const url = "https://www.google.com/test/test.jpg";
      expect(popup.getFilename(url)).to.equal("test.jpg");
    });
  });

  describe("addMap ", () => {
    it("should throw", () => {
      expect(popup.addMap("imgurl", {})).to.throw;
    });
  });

  describe("createCardNode ", () => {
    it("should throw", () => {
      expect(popup.createCardNode("imgurl", {})).to.throw;
    });
  });

  describe("convertDMSToDD ", () => {
    it("should convert degress to decimal", () => {
      expect(popup.convertDMSToDD(33, 0, 0, "N")).to.equal(33);
    });
  });

  describe("getDomain ", () => {
    it("should extract domain", () => {
      const url = "https://www.google.com/test/route?test=param";
      expect(popup.getDomain(url)).to.equal("www.google.com");
    });
  });

  describe("getImageId ", () => {
    it("should encode base64", () => {
      const url = "https://www.google.com/test/route?test=param";
      const base64 = btoa(url);
      expect(popup.getImageId(url)).to.equal(base64);
    });
  });

  describe("onScan ", () => {
    it("should not throw", () => {
      expect(popup.onScan()).to.not.throw;
    });
  });

  describe("appendCard ", () => {
    it("should not throw", () => {
      const url = "https://www.google.com/test/route?test=param";
      const base64 = btoa(url);
      expect(popup.appendCard(url, {})).to.not.throw;
    });
  });

  describe("appendImages ", () => {
    it("should not throw", () => {
      const images = [];
      expect(popup.appendImages(images)).to.not.throw;
    });
  });

  describe("updateCount ", () => {
    it("should not throw", () => {
      expect(popup.updateCount()).to.not.throw;
    });
  });

  describe("watcher ", () => {
    it("should not throw", () => {
      expect(popup.watcher()).to.not.throw;
    });
  });

  after(() => {
    chrome.flush();
    delete global.chrome;
  });
});
