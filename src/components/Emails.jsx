import React, { Component } from "react";
import Email from "./Email";
// Import CONFIG VARS
import ENV_VARS from "../gmailAPI/.config/config"

class Emails extends Component {
  constructor() {
    super();
    this.state = {
      emails : []
    }
  }

  // React function to run after component is loaded after fetch request
  componentDidMount() {

    const clientID = ENV_VARS.CLIENT_ID;
    const clientSecret = ENV_VARS.CLIENT_SECRET;
    const redirectUri = ENV_VARS.REDIRECT_URI;
    const refreshToken = ENV_VARS.REFRESH_TOKEN;

    const refreshUrl = "https://www.googleapis.com/oauth2/v4/token";
    const params = `?refresh_token=${refreshToken}&client_id=${clientID}&client_secret=${clientSecret}&grant_type=refresh_token`;

    fetch(refreshUrl + params, {
      method: "POST"
    })
      .then(res => res.json())
      .then(data => {
        let token = data.access_token;

        const gMailApiEndPoint = "https://www.googleapis.com/gmail/v1/users/me";
        let params = "/messages?";
        
        let labels = ["INBOX"];
        for (let i = 0; i < labels.length; i++) {
          params += `&labelIds=${labels[i]}`;
        }

        fetch(gMailApiEndPoint + params, {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token
          }
        })
          .then(res => res.json())
          .then(data => {
            const messages = data.messages;
            console.log("Number of Messages: " + messages.length);
            for (let j = 0; j < 10; j++) {
              this.setState(prevState => ({
                emails: [...prevState.emails, {id: (j+1), accessToken: token, messageId: messages[j].id}]
              }))
              // getMessage(token, messages[i].id);
            }
          })
          .catch(err => console.log(err));

        // getMessageList(accessToken);
      });
  }
  
  render() {

    // CSS for Email List
    const emailListStyle = {
      backgroundColor: "#053752",
      height: '100%',
      width: '100%'
    };

    return (
      <div style={ emailListStyle }>
        {this.state.emails.map(email => (
          <Email key={email.id} messageId={email.messageId} accessToken={email.accessToken} />
        ))}
      </div>
    );
  }
}

export default Emails;
