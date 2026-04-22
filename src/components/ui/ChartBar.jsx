import React from "react";


import chartBarImg from "../../assets/ChartBar.png";

const AdminChartBar = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <img
        src={chartBarImg}
        alt="Active Team Chart"
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default AdminChartBar;
