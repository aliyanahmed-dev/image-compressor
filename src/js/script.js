// Some JavaScript to load the image and show the form. There is no actual backend functionality. This is just the UI
const img = document.querySelector('#img');
const imgform = document.querySelector("#img-form");
const widthInput = document.querySelector("#width");
const heightInput = document.querySelector("#height");
const filename = document.querySelector("#filename");
const outputpath = document.querySelector("#output-path");
// const outputImageDiv = document.querySelector("#outputImage-div");
// const outputImage = document.querySelector("#output");




function loadImages(e) {
const files = e.target.files;

// Filter out non-image files
const imageFiles = Array.from(files).filter(fileCheck);

if (imageFiles.length === 0) {
  alert("No valid image files selected.");
  return;
}


const compressedImages = [];

const processImage = (imgFile) => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      const img = new Image();
      img.src = e.target.result;

      img.onload = function () {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressedDataURL = canvas.toDataURL("image/webp", 0.5);

        compressedImages.push({
          imgData: compressedDataURL,
          file: {
            path: imgFile.path,
            name: imgFile.name,
          },
        });

        resolve();
      };
    };

    reader.readAsDataURL(imgFile);
  });
};

// Process each image file asynchronously
const processImagePromises = imageFiles.map(processImage);

// Wait for all promises to resolve
Promise.all(processImagePromises)
  .then(() => {
    // Log the compressed images before sending to the main process
 

    // All images are processed, send the compressed data to the main process
    ipcRenderer.send("images:save", compressedImages);

  })
  .catch((error) => {
    console.error("Error processing images:", error);
  });
}


function fileCheck(file){
  const acceptedImageTypes = ['image/gif', 'image/png', 'image/jpeg'];
  return file && acceptedImageTypes.includes(file['type']);
}


document.querySelector('#img').addEventListener('change', loadImages);
