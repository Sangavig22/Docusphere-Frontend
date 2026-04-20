import React from "react";

// If you have a line chart image, add it here. Example:
import chartLineImg from "../../assets/ChartLine.png"; // your ChartLine image

const AdminChartLine = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <img
        src={chartLineImg}
        alt="Uploads Line Chart"
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default AdminChartLine;
