import './LogoIcon.css';
import LogoIconImage from '../../assets/logoIcon.JPG';
import LogoText from '../../assets/logoText.png';
import React from 'react';

function LogoIcon() {
  return (
    <div className='logo'>
      <img src={LogoIconImage} alt="Logo GastroNet" className="logo-icon img-fluid" />
      <img src={LogoText} alt="Logo GastroNet" className="logo-text img-fluid" />
    </div>
  );
}

export default LogoIcon;
