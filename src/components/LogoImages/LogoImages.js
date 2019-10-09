import React from 'react';
import bbLogo from '../../images/logo_bb.png';
import ibmLogo from '../../images/ibm_blue.png';

const logoImages = () => (
  <div className="logo-images">
    <h3>POWERED BY</h3>
    <img alt="bb logo" src={bbLogo} width="100%" />
    <img alt="ibm logo" src={ibmLogo} width="60%" />
  </div>
);

export default logoImages;
