const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const path = require("path");
const os = require("os");
const fs = require("fs");
const resizeImg = require("resize-img");

const isMac = process.platform === "darwin";
const isDev = process.env.NODE_ENV !== "production";
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    title: "Image Resizer",
    width: isDev ? 1000 : 500,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: true,
    },
  });

  // Open devtool in dev env
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile(path.join(__dirname, "./renderer/index.html"));
}

function createAboutWindow() {
  mainWindow = new BrowserWindow({
    title: "About Image Resizer",
    width: 300,
    height: 300,
  });

  mainWindow.setMenu(null);

  mainWindow.loadFile(path.join(__dirname, "./renderer/about.html"));
}

app.whenReady().then(() => {
  createWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
});

app.on("window-all-closed", () => {
  if (isMac) {
    app.quit();
  }
});

// Menu template
const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
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
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  //   {
  //     label: "File",
  //     submenu: [
  //       {
  //         label: "Quit",
  //         click: () => app.quit(),
  //         accelerator: "CmdOrCtrl+W",
  //       },
  //     ],
  //   },
];

ipcMain.on("image:resize", (event, options) => {
  options.dest = path.join(os.homedir(), "imageresizer");
  resizeImage(options);
});

async function resizeImage({ imagePath, width, height, dest }) {
  try {
    const newPath = await resizeImg(fs.readFileSync(imagePath), {
      width: +width,
      height: +height,
    });

    const filename = path.basename(imagePath);
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    fs.writeFileSync(path.join(dest, filename), newPath);

    mainWindow.webContents.send("image:done");

    shell.openPath(dest);
  } catch (error) {
    console.log(error);
  }
}
