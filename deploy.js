const zipFolder = require("zip-folder");
const fs = require("fs");

let folder = "dist";
let zipName = "photosint.zip";

// credentials and IDs from gitlab-ci.yml file (your appropriate config file)
let REFRESH_TOKEN = process.env.REFRESH_TOKEN;
let EXTENSION_ID = process.env.EXTENSION_ID;
let CLIENT_SECRET = process.env.CLIENT_SECRET;
let CLIENT_ID = process.env.CLIENT_ID;

const webStore = require("chrome-webstore-upload")({
  extensionId: EXTENSION_ID,
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  refreshToken: REFRESH_TOKEN,
});

// zipping the output folder
zipFolder(folder, zipName, function (err) {
  if (err) {
    console.log("oh no!", err);
    process.exit(1);
  } else {
    console.log(`Successfully Zipped ${folder} and saved as ${zipName}`);
    uploadZip(); // on successful zipping, call upload
  }
});

function uploadZip() {
  // creating file stream to upload
  const extensionSource = fs.createReadStream(`./${zipName}`);

  // upload the zip to webstore
  webStore
    .uploadExisting(extensionSource)
    .then((res) => {
      console.log("Successfully uploaded the ZIP");

      // publish the uploaded zip
      webStore
        .publish()
        .then((res) => {
          console.log("Successfully published the newer version");
        })
        .catch((error) => {
          console.log(`Error while publishing uploaded extension: ${error}`);
          process.exit(1);
        });
    })
    .catch((error) => {
      console.log(`Error while uploading ZIP: ${error}`);
      process.exit(1);
    });
}
