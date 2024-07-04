const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let dashboardWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
            devTools: true, // Activer les outils de développement
        },
        icon: path.join(__dirname, 'cannabis.png') // Spécifiez le chemin de l'icône ici
    });

    mainWindow.loadFile('index.html');
     // Cachez la barre de menu
     mainWindow.setMenuBarVisibility(false);
}

function createDashboardWindow() {
    dashboardWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
            devTools: true, // Activer les outils de développement
        },
        icon: path.join(__dirname, 'cannabis.png') // Spécifiez le chemin de l'icône ici
    });

    dashboardWindow.loadFile('dashboard.html');
    // Cachez la barre de menu
    mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

ipcMain.on('login-success', () => {
    mainWindow.close();
    createDashboardWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
