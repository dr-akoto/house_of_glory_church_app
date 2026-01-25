const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Auth
  auth: {
    login: (credentials) => ipcRenderer.invoke('auth:login', credentials),
    logout: () => ipcRenderer.invoke('auth:logout'),
    check: () => ipcRenderer.invoke('auth:check'),
    changePassword: (data) => ipcRenderer.invoke('auth:changePassword', data),
  },
  
  // Members
  members: {
    getAll: () => ipcRenderer.invoke('members:getAll'),
    create: (member) => ipcRenderer.invoke('members:create', member),
    update: (id, data) => ipcRenderer.invoke('members:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('members:delete', id),
  },
  
  // Departments
  departments: {
    getAll: () => ipcRenderer.invoke('departments:getAll'),
    create: (department) => ipcRenderer.invoke('departments:create', department),
    update: (id, data) => ipcRenderer.invoke('departments:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('departments:delete', id),
  },
  
  // Finance
  finance: {
    getAll: () => ipcRenderer.invoke('finance:getAll'),
    create: (transaction) => ipcRenderer.invoke('finance:create', transaction),
    update: (id, data) => ipcRenderer.invoke('finance:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('finance:delete', id),
    getStats: () => ipcRenderer.invoke('finance:getStats'),
    // Tithes
    getTithes: () => ipcRenderer.invoke('finance:getTithes'),
    addTithe: (tithe) => ipcRenderer.invoke('finance:addTithe', tithe),
    updateTithe: (id, data) => ipcRenderer.invoke('finance:updateTithe', { id, data }),
    deleteTithe: (id) => ipcRenderer.invoke('finance:deleteTithe', id),
  },
  
  // Sermons
  sermons: {
    getAll: () => ipcRenderer.invoke('sermons:getAll'),
    create: (sermon) => ipcRenderer.invoke('sermons:create', sermon),
    update: (id, data) => ipcRenderer.invoke('sermons:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('sermons:delete', id),
  },
  
  // Bible
  bible: {
    getBooks: () => ipcRenderer.invoke('bible:getBooks'),
    getChapter: (book, chapter) => ipcRenderer.invoke('bible:getChapter', { book, chapter }),
    search: (query) => ipcRenderer.invoke('bible:search', query),
    getBookmarks: () => ipcRenderer.invoke('bible:getBookmarks'),
    addBookmark: (bookmark) => ipcRenderer.invoke('bible:addBookmark', bookmark),
    removeBookmark: (id) => ipcRenderer.invoke('bible:removeBookmark', id),
  },
  
  // Announcements
  announcements: {
    getAll: () => ipcRenderer.invoke('announcements:getAll'),
    create: (announcement) => ipcRenderer.invoke('announcements:create', announcement),
    update: (id, data) => ipcRenderer.invoke('announcements:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('announcements:delete', id),
    send: (data) => ipcRenderer.invoke('announcements:send', data),
  },
  
  // Media
  media: {
    getAll: (filters) => ipcRenderer.invoke('media:getAll', filters),
    upload: (media) => ipcRenderer.invoke('media:upload', media),
    delete: (id) => ipcRenderer.invoke('media:delete', id),
  },
  
  // Backup
  backup: {
    create: () => ipcRenderer.invoke('backup:create'),
    restore: () => ipcRenderer.invoke('backup:restore'),
  },

  // Dashboard
  dashboard: {
    getStats: () => ipcRenderer.invoke('dashboard:getStats'),
  },
});
