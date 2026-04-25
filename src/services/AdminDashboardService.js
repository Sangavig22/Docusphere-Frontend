import { request } from "../api/apiClient";

export const AdminDashboardService = {
  getDashboardStats: () => request("/admin/dashboard"),

  getMonthlyUploads: async () => {
    const data = await request("/admin/dashboard");
    return {
      labels: data.monthlyUploads.map(item => `Month ${item.month}`),
      data: data.monthlyUploads.map(item => item.count),
    };
  },

  getActiveTeams: async () => {
    const data = await request("/admin/dashboard");
    return {
      labels: data.topTeams.map(item => item.teamName),
      data: data.topTeams.map(item => item.documentCount),
    };
  },
};
