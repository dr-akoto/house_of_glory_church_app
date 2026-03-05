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

      // Calculate monthly data for chart (last 6 months)
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
        const monthName = monthStart.toLocaleString('default', { month: 'short' });
        
        const monthTrans = transactions.filter(t => {
          const transDate = new Date(t.date || t.createdAt);
          return transDate >= monthStart && transDate <= monthEnd;
        });
        
        const income = monthTrans
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
        
        const expense = monthTrans
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
        
        monthlyData.push({ month: monthName, income, expense });
      }

      // Get recent members
      let recentMembers = [];
      try {
        const membersQuery = query(
          collection(db, 'members'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentMembersSnapshot = await getDocs(membersQuery);
        recentMembers = recentMembersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (e) {
        // Fallback: use the members we already have
        recentMembers = members.slice(0, 5).map((m, i) => ({ id: i, ...m }));
      }

      // Calculate total balance (all time)
      const allTimeIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      const allTimeExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

      return {
        memberCount,
        activeMembers,
        recentSermons,
        upcomingAnnouncements,
        recentMembers,
        monthlyIncome: totalIncome,
        monthlyExpenses: totalExpenses,
        balance: allTimeIncome - allTimeExpenses,
        monthlyData,
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
        recentMembers: [],
        monthlyIncome: 0,
        monthlyExpenses: 0,
        balance: 0,
        monthlyData: [],
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
