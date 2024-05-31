import React, { useState } from 'react';
import './SlidingPanel.css';

const SlidingPanel = ({ children, isOpen , setOpen}) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setOpen("");
      setIsClosing(false);
    }, 0); 
  };
  let overlay;
  if(isOpen){
    overlay = <div className="overlay" onClick={handleClose}></div>;
  } else {
    overlay = <></>;
  }

  return (
    <div className='panel-container'>
      <div className={`sliding-panel ${isOpen ? 'open' : ''} ${isClosing ? 'closing' : ''}`}>
        <div className="panel-content">{children}</div>
      </div>
      {overlay}
    </div>
  );
};

export default SlidingPanel;
