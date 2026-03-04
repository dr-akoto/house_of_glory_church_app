const { db } = require('../config/firebase');
const {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} = require('firebase/firestore');

const dashboardService = {
  async getStats() {
    try {
      // Get members count
      const membersSnapshot = await getDocs(collection(db, 'members'));
      const members = membersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          status: data.status || 'active', // default to active if not set
        };
      });
      const memberCount = members.length;
      const activeMembers = members.filter(m => m.status === 'active').length;

      // Get recent sermons (with fallback for missing index)
      let recentSermons = [];
      try {
        const sermonsQuery = query(
          collection(db, 'sermons'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const sermonsSnapshot = await getDocs(sermonsQuery);
        recentSermons = sermonsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (e) {
        // Fallback without ordering
        const sermonsSnapshot = await getDocs(collection(db, 'sermons'));
        recentSermons = sermonsSnapshot.docs.slice(0, 5).map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
      }

      // Get upcoming announcements (with fallback for missing index)
      let upcomingAnnouncements = [];
      try {
        const announcementsQuery = query(
          collection(db, 'announcements'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const announcementsSnapshot = await getDocs(announcementsQuery);
        upcomingAnnouncements = announcementsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (e) {
        // Fallback without ordering
        const announcementsSnapshot = await getDocs(collection(db, 'announcements'));
        upcomingAnnouncements = announcementsSnapshot.docs.slice(0, 5).map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
      }

      // Get finance stats
      const financeSnapshot = await getDocs(collection(db, 'finance'));
      const transactions = financeSnapshot.docs.map(doc => doc.data());
      
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const monthlyTransactions = transactions.filter(t => {
        const transDate = new Date(t.date || t.createdAt);
        return transDate >= firstDayOfMonth;
      });

      const totalIncome = monthlyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

      const totalExpenses = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

      return {
        memberCount,
        activeMembers,
        recentSermons,
        upcomingAnnouncements,
        finances: {
          totalIncome,
          totalExpenses,
          balance: totalIncome - totalExpenses,
        },
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        memberCount: 0,
        activeMembers: 0,
        recentSermons: [],
        upcomingAnnouncements: [],
        finances: {
          totalIncome: 0,
          totalExpenses: 0,
          balance: 0,
        },
      };
    }
  },
};

module.exports = dashboardService;
