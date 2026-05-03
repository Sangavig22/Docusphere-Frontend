import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useDashboardChartData } from "../../hooks/useAdminDashboardChartData";

const AdminChartBar = () => {
  const { dashboardData, loading } = useDashboardChartData();
  const [data, setData] = useState([]);

  useEffect(() => {
    if (dashboardData && dashboardData.topTeams) {
      const formattedData = dashboardData.topTeams.map(item => ({
        name: item.teamName.replace(" Team", ""),
        activity: Math.round(item.activityPercentage || 0)
      }));
      setData(formattedData);
    }
  }, [dashboardData]);

  if (loading) return <div className="text-center">Loading...</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="name" 
          angle={-35} 
          textAnchor="end" 
          height={70} 
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#64748b', fontSize: 12 }}
        />
        <YAxis
          allowDecimals={false}
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#64748b', fontSize: 12 }}
          domain={[0, 100]}
        />
        <Tooltip
          cursor={{ fill: '#f1f5f9' }}
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          formatter={(value) => [`${value}%`, 'Activity']}
        />
        <Bar 
          dataKey="activity" 
          fill="#3b82f6" 
          radius={[6, 6, 0, 0]} 
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AdminChartBar;
