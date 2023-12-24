const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("versions", {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
    code: (name) => ipcRenderer.invoke("code", name),
    folder: (name) => ipcRenderer.invoke("folder", name),
    newSpace: (name) => ipcRenderer.invoke("newSpace", name),
    getFolders: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const folders = await ipcRenderer.invoke("getFolders");
                resolve(folders);
            } catch (error) {
                console.error(error);
                reject(error);
            }
        });
    },
    removeSpace: (name) => ipcRenderer.invoke("removeSpace", name),
    quit: () => ipcRenderer.invoke("quit"),
    minimize: () => ipcRenderer.invoke("minimize"),
    createSpaceFolder: () => ipcRenderer.invoke("createSpaceFolder"),
})