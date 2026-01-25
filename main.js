const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');

// Remove the default menu
Menu.setApplicationMenu(null);

let mainWindow;

// Lazy-loaded services (loaded after window is shown for faster startup)
let authService;
let membersService;
let departmentsService;
let financeService;
let sermonsService;
let bibleService;
let announcementsService;
let mediaService;
let backupService;
let dashboardService;

// Load services lazily - only when first needed
function getService(name) {
  switch (name) {
    case 'auth':
      if (!authService) authService = require('./services/auth');
      return authService;
    case 'members':
      if (!membersService) membersService = require('./services/members');
      return membersService;
    case 'departments':
      if (!departmentsService) departmentsService = require('./services/departments');
      return departmentsService;
    case 'finance':
      if (!financeService) financeService = require('./services/finance');
      return financeService;
    case 'sermons':
      if (!sermonsService) sermonsService = require('./services/sermons');
      return sermonsService;
    case 'bible':
      if (!bibleService) bibleService = require('./services/bible');
      return bibleService;
    case 'announcements':
      if (!announcementsService) announcementsService = require('./services/announcements');
      return announcementsService;
    case 'media':
      if (!mediaService) mediaService = require('./services/media');
      return mediaService;
    case 'backup':
      if (!backupService) backupService = require('./services/backup');
      return backupService;
    case 'dashboard':
      if (!dashboardService) dashboardService = require('./services/dashboard');
      return dashboardService;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    title: 'Assemblies Of God',
    autoHideMenuBar: true,
    show: false, // Don't show until ready-to-show
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Show window as soon as it's ready (before content fully loads)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // In development, load from Vite dev server
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools();
  } else {
    // In production, load from built files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Auth IPC handlers
ipcMain.handle('auth:login', async (event, credentials) => {
  return getService('auth').login(credentials);
});

ipcMain.handle('auth:logout', async () => {
  return getService('auth').logout();
});

ipcMain.handle('auth:check', async () => {
  return getService('auth').checkAuth();
});

ipcMain.handle('auth:changePassword', async (event, data) => {
  return getService('auth').changePassword(data);
});

// Members IPC handlers
ipcMain.handle('members:getAll', async () => {
  return getService('members').getAll();
});

ipcMain.handle('members:create', async (event, member) => {
  return getService('members').create(member);
});

ipcMain.handle('members:update', async (event, { id, data }) => {
  return getService('members').update(id, data);
});

ipcMain.handle('members:delete', async (event, id) => {
  return getService('members').delete(id);
});

// Departments IPC handlers
ipcMain.handle('departments:getAll', async () => {
  return getService('departments').getAll();
});

ipcMain.handle('departments:create', async (event, department) => {
  return getService('departments').create(department);
});

ipcMain.handle('departments:update', async (event, { id, data }) => {
  return getService('departments').update(id, data);
});

ipcMain.handle('departments:delete', async (event, id) => {
  return getService('departments').delete(id);
});

// Finance IPC handlers
ipcMain.handle('finance:getAll', async () => {
  return getService('finance').getAll();
});

ipcMain.handle('finance:create', async (event, transaction) => {
  return getService('finance').create(transaction);
});

ipcMain.handle('finance:update', async (event, { id, data }) => {
  return getService('finance').update(id, data);
});

ipcMain.handle('finance:delete', async (event, id) => {
  return getService('finance').delete(id);
});

ipcMain.handle('finance:getStats', async () => {
  return getService('finance').getStats();
});

ipcMain.handle('finance:getTithes', async () => {
  return getService('finance').getTithes();
});

ipcMain.handle('finance:addTithe', async (event, tithe) => {
  return getService('finance').addTithe(tithe);
});

ipcMain.handle('finance:updateTithe', async (event, { id, data }) => {
  return getService('finance').updateTithe(id, data);
});

ipcMain.handle('finance:deleteTithe', async (event, id) => {
  return getService('finance').deleteTithe(id);
});

// Sermons IPC handlers
ipcMain.handle('sermons:getAll', async () => {
  return getService('sermons').getAll();
});

ipcMain.handle('sermons:create', async (event, sermon) => {
  return getService('sermons').create(sermon);
});

ipcMain.handle('sermons:update', async (event, { id, data }) => {
  return getService('sermons').update(id, data);
});

ipcMain.handle('sermons:delete', async (event, id) => {
  return getService('sermons').delete(id);
});

// Bible IPC handlers
ipcMain.handle('bible:getBooks', async () => {
  return getService('bible').getBooks();
});

ipcMain.handle('bible:getChapter', async (event, { book, chapter }) => {
  return getService('bible').getChapter(book, chapter);
});

ipcMain.handle('bible:search', async (event, query) => {
  return getService('bible').search(query);
});

ipcMain.handle('bible:getBookmarks', async () => {
  return getService('bible').getBookmarks();
});

ipcMain.handle('bible:addBookmark', async (event, bookmark) => {
  return getService('bible').addBookmark(bookmark);
});

ipcMain.handle('bible:removeBookmark', async (event, id) => {
  return getService('bible').removeBookmark(id);
});

// Announcements IPC handlers
ipcMain.handle('announcements:getAll', async () => {
  return getService('announcements').getAll();
});

ipcMain.handle('announcements:create', async (event, announcement) => {
  return getService('announcements').create(announcement);
});

ipcMain.handle('announcements:update', async (event, { id, data }) => {
  return getService('announcements').update(id, data);
});

ipcMain.handle('announcements:delete', async (event, id) => {
  return getService('announcements').delete(id);
});

ipcMain.handle('announcements:send', async (event, data) => {
  return getService('announcements').send(data);
});

// Media IPC handlers
ipcMain.handle('media:getAll', async (event, filters) => {
  return getService('media').getAll(filters);
});

ipcMain.handle('media:upload', async (event, media) => {
  return getService('media').upload(media);
});

ipcMain.handle('media:delete', async (event, id) => {
  return getService('media').delete(id);
});

// Backup IPC handlers
ipcMain.handle('backup:create', async () => {
  return getService('backup').create();
});

ipcMain.handle('backup:restore', async () => {
  return getService('backup').restore();
});

// Dashboard IPC handlers
ipcMain.handle('dashboard:getStats', async () => {
  return getService('dashboard').getStats();
});
