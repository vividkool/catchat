import React from "react";
import "./AdBanner.css";

const AdBanner: React.FC = () => {
  return (
    <div className="ad-banner-container">
      {/* 
        This is a placeholder for Google AdSense or other ad networks.
        In a real implementation, you would place the script tag here.
      */}
      <div className="ad-placeholder">
        <p>スポンサーリンク</p>
        <div className="ad-content">広告スペース (320x50)</div>
      </div>
    </div>
  );
};

export default AdBanner;
