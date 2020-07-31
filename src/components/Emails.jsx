import React, { Component } from "react";
import Email from "./Email";
import EmailView from "./EmailView";
import Header from "./Header";

// Import CONFIG VARS
import ENV_VARS from "../gmailAPI/.config/config";
let val = "";

class Emails extends Component {
  constructor() {
    super();
    this.state = {
      emails: [],
      messageView: "",
      messageSubject: ""
    };
  }

  // React function to run after component is loaded after fetch request
  componentDidMount() {
    const clientID = ENV_VARS.CLIENT_ID;
    const clientSecret = ENV_VARS.CLIENT_SECRET;
    const redirectUri = ENV_VARS.REDIRECT_URI;
    const refreshToken = ENV_VARS.REFRESH_TOKEN["mushfiq8194"];

    const refreshUrl = "https://www.googleapis.com/oauth2/v4/token";
    const params = `?refresh_token=${refreshToken}&client_id=${clientID}&client_secret=${clientSecret}&grant_type=refresh_token`;

    fetch(refreshUrl + params, {
      method: "POST"
    })
      .then(res => res.json())
      .then(data => {
        let token = data.access_token;
        let maxResults = 20;

        const gMailApiEndPoint = "https://www.googleapis.com/gmail/v1/users/me";
        let params = "/messages?maxResults=" + maxResults;

        let labels = [];
        if (labels.length) {
          for (let i = 0; i < labels.length; i++) {
            params += `&labelIds=${labels[i]}`;
          }
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
            for (let j = 0; j < messages.length; j++) {
              this.setState(prevState => ({
                emails: [
                  ...prevState.emails,
                  { id: j + 1, accessToken: token, messageId: messages[j].id }
                ]
              }));
            }
          })
          .catch(err => console.log(err));
      });
  }

  handleToUpdate = (html, subject) => {
    this.setState({
      messageView: html,
      messageSubject: subject
    });
  };

  render() {
    // CSS for EmailList and EmailView
    const style = {
      emailList: {
        backgroundColor: "#fff"
      },
      emailView: {}
    };

    return (
      <div className="grid-container">
        <div className="header">
          <Header />
        </div>
        <div className="left email-list" style={style.emailList}>
          {this.state.emails.map(email => (
            <Email
              key={email.id}
              messageId={email.messageId}
              accessToken={email.accessToken}
              handleToUpdate={this.handleToUpdate}
            />
          ))}
        </div>
        <div className="right email-view" style={style.emailView}>
          <div className="subject-view">{this.state.messageSubject}</div>
          <EmailView message={this.state.messageView} />
        </div>
      </div>
    );
  }
}

export default Emails;
