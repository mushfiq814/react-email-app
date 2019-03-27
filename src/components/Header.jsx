import React, { Component } from 'react';

class Header extends Component {
  render() { 

    const style = {
      height: '60px',
      fontSize: '40px',
      padding: '20px',
      backgroundColor: '#651061',
      color: '#fff',
      fontWeight: 'bold'
    }

    return ( <div style={style}>
      React Email Client
    </div> );
  }
}
 
export default Header;