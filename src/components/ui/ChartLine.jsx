import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useDashboardChartData } from "../../hooks/useAdminDashboardChartData";

const AdminChartLine = () => {
  const { dashboardData, loading } = useDashboardChartData();
  const [data, setData] = useState([]);

  useEffect(() => {
    if (dashboardData && dashboardData.monthlyUploads) {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const formattedData = dashboardData.monthlyUploads.map(item => ({
        name: monthNames[item.month - 1],
        uploads: item.monthlyUploads
      }));
      setData(formattedData);
    }
  }, [dashboardData]);

  if (loading) return <div className="text-center">Loading...</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#64748b', fontSize: 12 }}
          dy={10}
        />
        <YAxis 
          allowDecimals={false} 
          axisLine={false} 
          tickLine={false}
          tick={{ fill: '#64748b', fontSize: 12 }}
        />
        <Tooltip 
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        />
        <Line 
          type="monotone" 
          dataKey="uploads" 
          stroke="#3b82f6" 
          strokeWidth={3}
          dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 6, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default AdminChartLine;
