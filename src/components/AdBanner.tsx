import React from "react";
import "./AdBanner.css";

const AdBanner: React.FC = () => {
  return (
    <div className="ad-banner-container">
      {/* Google AdSense Script for Verification */}
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4043809182042148"
        crossOrigin="anonymous"
      ></script>

      <div className="ad-placeholder">
        <p>スポンサーリンク</p>
        <div className="ad-content">広告スペース (320x50)</div>
      </div>
    </div>
  );
};

export default AdBanner;
