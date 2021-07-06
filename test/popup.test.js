const chai = require("chai");
const expect = chai.expect;

const chrome = require("sinon-chrome/extensions");
// import * as popup from "../popup/popup";
let popup;

describe("popup.js ", () => {
  before(() => {
    global.chrome = chrome;
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

  after(() => {
    chrome.flush();
    delete global.chrome;
  });
});
