const { dialog, app } = require('electron');
const fs = require('fs');
const path = require('path');
const { db } = require('../config/firebase');
const { collection, getDocs } = require('firebase/firestore');

const COLLECTIONS = ['members', 'departments', 'finance', 'sermons', 'announcements', 'media'];

const backupService = {
  async create() {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Save Backup',
        defaultPath: path.join(app.getPath('documents'), `hog-backup-${Date.now()}.json`),
        filters: [{ name: 'JSON', extensions: ['json'] }],
      });

      if (canceled || !filePath) {
        return { success: false, message: 'Backup cancelled' };
      }

      const backupData = {};

      for (const collectionName of COLLECTIONS) {
        const snapshot = await getDocs(collection(db, collectionName));
        backupData[collectionName] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      }

      fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

      return { success: true, path: filePath };
    } catch (error) {
      console.error('Backup error:', error);
      return { success: false, message: error.message };
    }
  },

  async restore() {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Select Backup File',
        filters: [{ name: 'JSON', extensions: ['json'] }],
        properties: ['openFile'],
      });

      if (canceled || !filePaths.length) {
        return { success: false, message: 'Restore cancelled' };
      }

      const data = JSON.parse(fs.readFileSync(filePaths[0], 'utf-8'));

      // Here you would implement the restore logic
      // This would involve writing the data back to Firestore

      return { success: true };
    } catch (error) {
      console.error('Restore error:', error);
      return { success: false, message: error.message };
    }
  },
};

module.exports = backupService;
