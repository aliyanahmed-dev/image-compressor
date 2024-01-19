const os = require("os");
const fs = require("fs");
const resizeImg = require("resize-img");
const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const path = require("path");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}
const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";

let mainWindow;
let aboutWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width:  800,
    height: 600,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Open the DevTools.
  // if (isDev) {
  //   mainWindow.webContents.openDevTools();
  // }
};

const createaboutWindow = () => {
  // Create the about window.
  aboutWindow = new BrowserWindow({
    width: 700,
    height: 600,
  });

  // and load the index.html of the app.
  aboutWindow.loadFile(path.join(__dirname, "about.html"));
};

// app.on('ready', createWindow);

const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: "About",
              click: () => createaboutWindow(),
            },
          ],
        },
      ]
    : []),
  {
    role: "fileMenu",
  },
  ...(!isMac
    ? [
        {
          label: "Help",
          submenu: [
            {
              label: "About",
              click: () => createaboutWindow(),
            },
          ],
        },
      ]
    : []),
];

// Respond to the resize image event
ipcMain.on("images:save", (e, compressedImages) => {
  const dest = path.join(os.homedir(), "compressimagesave");
  // Create destination folder if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest);
  }

  // Process each compressed image
  compressedImages.forEach((compressedImage) => {
    saveImage({
      imgData: compressedImage.imgData,
      file: compressedImage.file,
      dest,
    });
  });
  shell.openPath(dest);

  // saveImage(options);
});
// Resize and save image
async function saveImage({ imgData, file, dest }) {
  try {
    // Create destination folder if it doesn't exist
    const fileExtension = path.extname(file.name);
    const newFileName = `${path.basename(file.name,fileExtension)}_compressed.webp`;
    const filePath = path.join(dest, newFileName);
    // Remove the data URI prefix (e.g., 'data:image/jpeg;base64,')
    const base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");

    // Create a buffer from the base64 data
    const imgBuffer = Buffer.from(base64Data, "base64");

    // Write the buffer to the file
    fs.writeFileSync(filePath, imgBuffer);

    // shell.openPath(dest);
  } catch (err) {
    console.log(err);
  }
}

app.whenReady().then(() => {
  createWindow();

  const MainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(MainMenu);
  // Remove variable from memory
  mainWindow.on("closed", () => (mainWindow = null));
  app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
