const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require("electron/main");
const { shell } = require("electron");
const { autoUpdater, AppUpdater } = require("electron-updater");
const fs = require("fs");
const fs_promises = require("fs").promises;
const path = require("node:path");

let mainWindow;
let tray;
const gotTheLock = app.requestSingleInstanceLock();

Object.defineProperty(app, "isPackaged", {
    get() {
        return true;
    },
});

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 600,
        height: 700,
        frame: false,
        resizable: false,
        maximizable: false,
        fullscreenable: false,
        webPreferences: {
            // devTools: false,
            preload: path.join(app.getAppPath(), "preload.js")
        }
    });

    mainWindow.loadFile("src/index.html");
}

const exec = require("child_process").exec;

function execute(command, callback) {
    exec(command, (error, stdout, stderr) => {
        callback(stdout);
    });
}

if (!gotTheLock) {
    app.quit();
}
else {
    app.on("second-instance", (event, commandLine, workingDirectory) => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.show();
            mainWindow.focus();
        }
    });

    app.whenReady().then(() => {
        createWindow();

        autoUpdater.checkForUpdates();
        
        mainWindow.on("close", function (event) {
            event.preventDefault();
            mainWindow.hide();
        });

        const icon = nativeImage.createFromDataURL("");
        tray = new Tray(icon);

        const contextMenu = Menu.buildFromTemplate([
            { label: "Space", type: "normal", enabled: false },
            { type: "separator" },
            { label: "Show", type: "normal", click: function () { mainWindow.show(); } },
            { type: "separator" },
            { label: "Quit Space", type: "normal", click: function () { mainWindow.destroy(); app.quit(); } }
        ]);

        tray.setToolTip("Space");
        tray.setTitle("Space");

        tray.setContextMenu(contextMenu);

        tray.on("click", () => {
            mainWindow.show();
        });

        app.on("activate", () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow();
            }
        });

        ipcMain.handle("createSpaceFolder", async (event) => {
            try {
                const parentFolderPath = path.join(app.getPath("appData"), "space-app", "spaces");

                if (!fs.existsSync(parentFolderPath)) {
                    await fs.promises.mkdir(parentFolderPath, { recursive: true });
                }

                return true;
            } catch (error) {
                console.error(error.message);
                throw error;
            }
        });

        ipcMain.handle("code", async (event, name) => {
            const folderPath = path.join(app.getPath("appData"), "space-app", "spaces", name);
            execute("code " + folderPath, (output) => {
                return output;
            });
        });

        ipcMain.handle("folder", async (event, name) => {
            const folderPath = path.join(app.getPath("appData"), "space-app", "spaces", name);
            shell.openPath(folderPath);
        })

        ipcMain.handle("newSpace", async (event, name) => {
            try {
                const folderPath = path.join(app.getPath("appData"), "space-app", "spaces", name);
                await fs_promises.mkdir(folderPath);
                return true;
            } catch (error) {
                console.error(error.message);
                throw error;
            }
        });

        ipcMain.handle("getFolders", async (event) => {
            const spacesPath = path.join(app.getPath("appData"), "space-app", "spaces");

            try {
                const files = await fs.promises.readdir(spacesPath);
                const folders = files.filter((name) => fs.statSync(path.join(spacesPath, name)).isDirectory());
                return folders;
            } catch (error) {
                console.error(error);
                throw error;
            };
        });

        ipcMain.handle("removeSpace", async (event, name) => {
            try {
                const folderPath = path.join(app.getPath("appData"), "space-app", "spaces", name);

                await deleteRecursiveFolder(folderPath);

                return true;
            } catch (error) {
                console.error(error.message);
                throw error;
            }
        });

        const deleteRecursiveFolder = async (folderPath) => {
            const files = await fs.promises.readdir(folderPath);

            for (const file of files) {
                const filePath = path.join(folderPath, file);
                const stats = await fs.promises.stat(filePath);

                if (stats.isDirectory()) {
                    await deleteRecursiveFolder(filePath);
                } else {
                    await fs.promises.unlink(filePath);
                }
            }

            await fs.promises.rmdir(folderPath);
        }

        ipcMain.handle("quit", (event) => {
            app.quit();
        });

        ipcMain.handle("minimize", (event) => {
            mainWindow.minimize();
        });
    });
}

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});