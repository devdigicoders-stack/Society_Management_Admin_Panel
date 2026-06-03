import React from 'react';

const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="loader-container glass-panel" style={{ margin: '20px', textAlign: 'center', border: 'none', background: 'transparent', boxShadow: 'none' }}>
      <div className="loader-spinner"></div>
      <div className="loader-text">{text}</div>
    </div>
  );
};

export default Loader;
