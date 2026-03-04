import React from "react";

const NotificationDropdown = () => {
  const notifications = [
    { id: 1, message: "New User Registered", time: "2 min ago" },
    { id: 2, message: "Security Alert", time: "10 min ago" },
  ];

  return (
    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden">
      <div className="p-4 border-b border-slate-50 flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
        <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
          2 new
        </span>
      </div>
      <div className="flex flex-col">
        {notifications.map((n) => (
          <div key={n.id} className="p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors">
            <p className="text-sm text-slate-700 font-medium">{n.message}</p>
            <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
          </div>
        ))}
      </div>
      <button className="w-full py-3 text-xs text-blue-600 font-semibold hover:bg-blue-50 transition-colors">
        View All Notifications
      </button>
    </div>
  );
};

export default NotificationDropdown;