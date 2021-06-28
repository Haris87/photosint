function checkImages(nodes) {
  return new Promise((resolve, reject) => {
    // console.log("checking nodes", nodes.length);
    if (
      NodeList.prototype.isPrototypeOf(nodes) ||
      HTMLCollection.prototype.isPrototypeOf(nodes)
    ) {
      // console.log("checking nodes", nodes.length);
      for (let image of nodes) {
        // extractAndShowExifData(image);
        // console.log(image.alt, image.src);
        // if (image.src == 'https://s.nbst.gr/files/1/2019/07/2170889-353x221.jpg') {
        //   console.log('GIANNAKOPOULOS');
        // }
        checkImage(image).then(resolve);

        // loading(image)
      }
    } else if (HTMLElement.prototype.isPrototypeOf(nodes)) {
      checkImage(nodes).then(resolve);
    }
  });
}

function checkImage(image) {
  return new Promise((resolve, reject) => {
    if (!image.complete) {
      image.addEventListener("load", function () {
        // extractAndShowExifData(this);
      });
    } else {
      extractExifData(image).then(resolve);
    }
  });
}

function init() {
  // console.log("init");
  setTimeout(function () {
    checkImages(document.getElementsByTagName("img"));
  }, 1000);
}
// init();

function extractExifData(image) {
  // check image if not already has exif
  // if (!image.classList.contains('exif_metadata')) {
  return new Promise((resolve, reject) => {
    EXIF.getData(
      image,
      function () {
        var metadata = EXIF.getAllTags(image);

        if (!isEmpty(metadata)) {
          image.classList.add("exif_checked");
          // console.log(metadata);

          //NOTE: this css is for testing
          image.classList.add("exif_metadata");

          if (hasGPSMetadata(metadata)) {
            //NOTE: this css is for testing
            image.classList.add("gps_metadata");
          }

          resolve({ url: image.src, metadata: metadata });
        } else {
          image.classList.add("no_exif_metadata");
        }
      },
      function (err) {
        console.warn("Exif get data error:", err);
        reject(err);
      }
    );
  });

  // }
}

function extractAndShowExifData(image) {
  EXIF.getData(image, function () {
    var metadata = EXIF.getAllTags(image);

    var parent = !!image.parentNode ? image.parentNode : image;
    // image.classList.add('exif_checked');

    if (!isEmpty(metadata)) {
      parent.classList.add("show_exif_metadata");
      parent.setAttribute("data-exif", createMetadataSummary(metadata));

      if (hasGPSMetadata(metadata)) {
        parent.classList.add("show_gps_metadata");
        parent.setAttribute("data-gps", createGPSSummary(metadata));
      }

      // if (hasGPSMetadata(metadata)) {
      //   parent.classList.add('show_gps_metadata');
      // }
    }
  });
}

function createMetadataSummary(metadata) {
  var metaString = "";

  metaString += hasCameraMetadata(metadata)
    ? (metadata.Make || "" + " " + metadata.Model || "") + ", "
    : "";
  metaString += hasDateMetadata(metadata)
    ? (metadata.DateTime ||
        metadata.DateTimeDigitized ||
        metadata.DateTimeOriginal) + ", "
    : "";

  metaString += hasCopyrightMetadata(metadata) ? "© " + metadata.Copyright : "";

  return metaString;
}

function createGPSSummary(metadata) {
  var metaStringArray = [];

  if (metadata.hasOwnProperty("GPSAltitude")) {
    metaStringArray.push("Alt: " + metadata.GPSAltitude);
  }

  if (metadata.hasOwnProperty("GPSImgDirection")) {
    metaStringArray.push("Dir: " + metadata.GPSImgDirection);
  }

  if (metadata.hasOwnProperty("GPSInfoIFDPointer")) {
    metaStringArray.push("ID pointer: " + metadata.GPSInfoIFDPointer);
  }

  if (metadata.hasOwnProperty("GPSPosition")) {
    metaStringArray.push("Lat Long: " + metadata.GPSPosition);
    metaString += metadata.GPSPosition;
  } else if (
    metadata.hasOwnProperty("GPSLatitude") &&
    metadata.hasOwnProperty("GPSLongitude")
  ) {
    metaStringArray.push(
      "Lat Long: " + metadata.GPSLatitude + " " + metadata.GPSLongitude
    );
  }

  return metaStringArray.join(", ");
}

function hasGPSMetadata(metadata) {
  return (
    metadata.hasOwnProperty("GPSAltitude") ||
    metadata.hasOwnProperty("GPSAltitudeRef") ||
    metadata.hasOwnProperty("GPSDateStamp") ||
    metadata.hasOwnProperty("GPSImgDirection") ||
    metadata.hasOwnProperty("GPSImgDirectionRef") ||
    metadata.hasOwnProperty("GPSInfoIFDPointer") ||
    metadata.hasOwnProperty("GPSLatitude") ||
    metadata.hasOwnProperty("GPSLatitudeRef") ||
    metadata.hasOwnProperty("GPSLongitude") ||
    metadata.hasOwnProperty("GPSLongitudeRef") ||
    metadata.hasOwnProperty("GPSTimeStamp") ||
    metadata.hasOwnProperty("GPSPosition")
  );
}

function hasCameraMetadata(metadata) {
  return metadata.hasOwnProperty("Make") || metadata.hasOwnProperty("Model");
}

function hasDateMetadata(metadata) {
  return (
    metadata.hasOwnProperty("DateTime") ||
    metadata.hasOwnProperty("DateTimeDigitized") ||
    metadata.hasOwnProperty("DateTimeOriginal")
  );
}

function hasCopyrightMetadata(metadata) {
  return metadata.hasOwnProperty("Copyright");
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}
