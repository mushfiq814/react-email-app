import React, { Component } from "react";

class Email extends Component {
  constructor() {
    super();
    this.state = {
      messageSubject: "",
      messageFrom: "",
      messageDate: "",
      messageHtml: "",
      messageSnippet: "",
      labels: [],
      isUnread: "false"
    };
  }

  // React function to run after component is loaded after fetch request
  componentDidMount() {
    let token = this.props.accessToken;
    let messageId = this.props.messageId;

    const getMsgUrl =
      "https://www.googleapis.com/gmail/v1/users/me/messages/" + messageId;
    let params = "?/format=raw"; // "full", "metadata", "minimal" or "raw"

    return fetch(getMsgUrl + params, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token
      }
    })
      .then(res => res.json())
      .then(data => {
        let processed = this.processBody(data);
        let processedSnippet = this.truncateText(data.snippet, 30);

        let isUnread = "false";

        for (let label of data.labelIds) {
          if (label === "UNREAD") {
            isUnread = "true";
            break;
          }
        }

        this.setState({
          messageSubject: processed.messageSubject,
          messageFrom: processed.messageFrom,
          messageDate: processed.messageDate,
          messageHtml: processed.cleanHTMLoutput,
          messageSnippet: processedSnippet,
          labels: data.labelIds,
          isUnread: isUnread
        });
      })
      .catch(err => console.log(err));
  }

  /**
   * This method processes the raw body data returned by Gmail and decodes and parses it.
   *
   * notes on MIME types
   * text/plain * Most messages composed by people have a plaintext version, for email readers that do not support HTML.
   * text/html * Most rich emails are actually HTML. This one tends to be the most canonical.
   * multipart/related * This type is for message bodies with an embedded image. The ‘parts’ of this component should be the message contents (sometimes, this is just text/plain if this is a plain email or it can be multipart/alternative)
   * multipart/mixed * When messages have an attachment (that could be an image). The parts of this component are usually either multipart/related (if there is an embedded image) or text/html. If there is an attachment, this will likely be at the top level.
   * multipart/alternative * When there are plaintext and html versions of this message. Most emails will have this at the top level, unless there is an attachment.
   */
  processBody = data => {
    let body = "";
    let mimeType = data.payload.mimeType; // see notes on MIME types above
    // Figure out how to get the message body based on MimeType

    switch (mimeType) {
      case "text/html":
        body = data.payload.body.data;
        break;
      case "multipart/alternative":
        body = data.payload.parts[1].body.data;
        break;
      case "multipart/mixed":
        for (let i = 0; i < data.payload.parts.length; i++) {
          let innerMimeType = data.payload.parts[i].mimeType;
          if (innerMimeType == "text/html" || innerMimeType == "text/plain")
            body = data.payload.parts[i].body.data;
          else if (innerMimeType == "multipart/alternative")
            body = data.payload.parts[i].parts[1].body.data;
          // TODO
          // else if (innerMimeType=="application/pdf") let attachmentId=data.payload.parts[i].body.attachmentId;
        }
        break;
      default:
        body = "Unable to get Message";
        break;
    }

    let formattedBody = body.replace(/-/g, "+").replace(/_/g, "/"); // format base64encoded string to use window.atob()
    let decodedBody = atob(formattedBody); // use window.atob() to decode
    let cleanHTMLoutput = "";

    // delete unwanted characters
    for (let j = 0; j < decodedBody.length; j++) {
      if (decodedBody.charCodeAt(j) <= 127)
        cleanHTMLoutput += decodedBody.charAt(j);
    }

    let messageDate = "";
    let messageSubject = "";
    let messageFrom = "";

    // find message Date, Subject and From address from the message header
    let messageHeaders = data.payload.headers;
    for (let k = 0; k < messageHeaders.length; k++) {
      if (messageHeaders[k].name == "Date")
        messageDate = messageHeaders[k].value;
      if (messageHeaders[k].name == "Subject")
        messageSubject = messageHeaders[k].value;
      if (messageHeaders[k].name == "From")
        messageFrom = messageHeaders[k].value;
    }

    // messageSubject = this.truncateText(messageSubject, 30);
    messageFrom = this.truncateText(messageFrom, 20);
    messageDate = this.truncateText(messageDate, 20);

    return {
      messageSubject,
      messageFrom,
      messageDate,
      cleanHTMLoutput
    };
  };

  /**
   * Truncate Text
   * @param {*} text text to truncate
   * @param {*} limit char limit to next end of word
   */
  truncateText = (text, limit) => {
    const shortened = text.indexOf(" ", limit);
    if (shortened == -1) return text;
    return text.substring(0, shortened) + "...";
  };

  render() {
    // CSS for Email Block
    const emailStyle = {
      container: {
        display: "grid",
        alignItems: "center",
        height: "100px",
        padding: "10px 30px"
      },
      msgSubject: {
        fontWeight: this.state.isUnread === "true" ? "600" : "200",
        fontSize: "20px",
        padding: "0",
        margin: "0"
      },
      msgFromAndDate: {
        fontSize: "15px",
        opacity: "0.8",
        padding: "0",
        margin: "0"
      },
      labels: {
        container: {
          display: "flex"
        },
        label: {
          fontWeight: "900",
          fontSize: "10px",
          borderRadius: "5px",
          backgroundColor: "#f7c8f7",
          color: "#281e28",
          padding: "2px 5px",
          margin: "2px"
        }
      }
    };

    let handleToUpdate = this.props.handleToUpdate;

    return (
      <div
        className="email-container"
        onClick={() => handleToUpdate(this.state.messageHtml, this.state.messageSubject)}
        style={emailStyle.container}
      >
        <p className="message-subject" style={emailStyle.msgSubject}>{this.state.messageSnippet}</p>
        <p className="message-from" style={emailStyle.msgFromAndDate}>{this.state.messageFrom}</p>
        <p className="message-date" style={emailStyle.msgFromAndDate}>{this.state.messageDate}</p>
        <div style={emailStyle.labels.container}>
          {this.state.labels.map(label => (<p style={emailStyle.labels.label}>{label}</p>))}
        </div>
      </div>
    );
  }
}

export default Email;
