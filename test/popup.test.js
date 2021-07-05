const chrome = require("sinon-chrome/extensions");

import * as popup from "../popup/popup";

describe("popup.js ", () => {
  beforeAll(() => {
    global.chrome = chrome;
  });

  beforeEach(() => {
    chrome.flush();
  });

  describe("getFilename ", () => {
    it("should return the last part of the URL", () => {
      const url = "https://www.google.com/test/test.jpg";
      expect(popup.getFilename()).toBe("test.jpg");
    });
  });

  afterAll(() => {
    chrome.flush();
    delete global.chrome;
  });
});
