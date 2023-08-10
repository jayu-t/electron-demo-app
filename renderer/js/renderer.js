// Some JavaScript to load the image and show the form. There is no actual backend functionality. This is just the UI

const imgForm = document.querySelector("#img-form");
const widthInput = document.querySelector("#width");
const heightInput = document.querySelector("#height");
const fileName = document.querySelector("#filename");
const outputPath = document.querySelector("#output-path");
const img = document.querySelector("#img");

function loadImage(e) {
  const file = e.target.files[0];

  if (!isFileImage(file)) {
    alertError("Please select an image file");
    return;
  }

  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = function () {
    widthInput.value = this.width;
    heightInput.value = this.height;
  };

  imgForm.style.display = "block";
  fileName.innerHTML = file.name;
  outputPath.innerHTML = path.join(os.homeDir(), "image-resizer");
}

function sendImage(e) {
  e.preventDefault();

  const width = widthInput.value;
  const height = heightInput.value;
  const imagePath = img.files[0].path;

  if (!img.files[0]) {
    alertError("Please upload an image");
    return;
  }

  if (width === "" || height === "") {
    alertError("Please fill height and width");
  }

  ipcRenderer.send("image:resize", {
    imagePath,
    width,
    height,
  });
}

ipcRenderer.on("image:done", () => {
  alertSuccess(`Image resized to ${widthInput.value} X ${heightInput.value}`);
});

function isFileImage(file) {
  const acceptedImageTypes = ["image/gif", "image/jpeg", "image/png"];
  return file && acceptedImageTypes.includes(file["type"]);
}

function alertError(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: "red",
      color: "white",
      textAlign: "center",
    },
  });
}

function alertSuccess(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: "green",
      color: "white",
      textAlign: "center",
    },
  });
}

img.addEventListener("change", loadImage);
imgForm.addEventListener("submit", sendImage);
