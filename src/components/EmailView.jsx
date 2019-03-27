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
      width: '50vw'
    }
  
    return ( 
      <div style={style} dangerouslySetInnerHTML={{__html: this.props.message}}>
      </div>
    );
  }
}
 
export default EmailView;