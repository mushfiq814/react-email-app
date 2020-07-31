import React, { Component } from 'react';

class EmailView extends Component {
  constructor() {
    super();
    this.state = {
      messageHtml: ""
    }
  }

  render() {
    const style = {
      padding: '10px',
      backgroundColor: '#ddd',
      color: '#000',
      height: '10vh'
    }
  
    return ( 
      <div style={style} dangerouslySetInnerHTML={{__html: this.props.message}}>
      </div>
    );
  }
}
 
export default EmailView;