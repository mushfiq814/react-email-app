import React, { Component } from "react";

class Email extends Component {
  state = {
    message: {
      messageSubject: "",
      messageFrom: "",
      messageDate: "",
      cleanHTMLoutput: ""
    }
  }

  getMessage = (token, messageId) => {
    const getMsgUrl = "https://www.googleapis.com/gmail/v1/users/me/messages/" + messageId;
    let params = "?/format=raw"; // "full", "metadata", "minimal" or "raw"
  
    return fetch(getMsgUrl + params, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token
      }
    })
      .then(res => res.json())
      .then(data => processBody(data))
      .catch(err => console.log(err));
  }

  processBody = (data) => {    
    let body = "";  
    let mimeType = data.payload.mimeType; // see notes on MIME types above
    // Figure out how to get the message body based on MimeType
  
    switch(mimeType) {
      case "text/html":
        body = data.payload.body.data;
        break;
      case "multipart/alternative":
        body = data.payload.parts[1].body.data;
        break;
      case "multipart/mixed":
        for (let i = 0; i < data.payload.parts.length; i++) {
          let innerMimeType = data.payload.parts[i].mimeType;
          if (innerMimeType == "text/html" || innerMimeType == "text/plain") body = data.payload.parts[i].body.data;
          else if (innerMimeType == "multipart/alternative") body = data.payload.parts[i].parts[1].body.data;
          // TODO
          // else if (innerMimeType=="application/pdf") let attachmentId=data.payload.parts[i].body.attachmentId;
        }
        break;
      default:
        body = "Unable to get Message";
    }
  
    let formattedBody = body.replace(/-/g, "+").replace(/_/g, "/"); // format base64encoded string to use window.atob()
    let decodedBody = atob(formattedBody); // use window.atob() to decode
    let cleanHTMLoutput = "";
  
    // delete unwanted characters
    for (let j = 0; j < decodedBody.length; j++) {
      if (decodedBody.charCodeAt(j) <= 127) cleanHTMLoutput += decodedBody.charAt(j);
    }
  
    let messageDate = "";
    let messageSubject = "";
    let messageFrom = "";
  
    // find message Date, Subject and From address from the message header
    let messageHeaders = data.payload.headers;
    for (let k = 0; k < messageHeaders.length; k++) {
      if (messageHeaders[k].name == "Date") messageDate = messageHeaders[k].value;
      if (messageHeaders[k].name == "Subject") messageSubject = messageHeaders[k].value;
      if (messageHeaders[k].name == "From") messageFrom = messageHeaders[k].value;
    }
  
    // return {
    //   messageSubject,
    //   messageFrom,
    //   messageDate,
    //   cleanHTMLoutput
    // } 

    return messageSubject;
  }
  
  render() {
    const emailStyle = {
      color: "#E5DE44",
      backgroundColor: "#001A26",
      padding: "10px",
      margin: "10px",
      border: "1px solid #E5DE44",
      borderRadius: "5px"
    };

    let accessToken = "ya29.GlzZBlWOVQ6zL1lC604B4KAiFm43-uJfxaczkqMD5eQij0Otqrwasiepw4GXVzCCS70IoHRBQ9I2PplKjvLdxyaGT6cnNGAVG5BM7rvVrFVPcKQH8rSj9VGr-3ah2Q";
    let messageId = '169bc1995da69ff5';

    return (
      <div style={emailStyle}>
        {getMessage(accessToken,messageId)}
      </div>
    );
  }
}

// Email {this.props.value} {this.setNew()}
// {this.setStateDetails}
// {this.state.message}
// {this.getMessage("ya29.GlzZBv2zrcyP1-cbh2HzXGLL6aEvjw3pEYrTvSgcbnDkXgJxV60d0x_NvQ53XhpToVcu5RmyEBSjGJZQJv_iZBDtQh_CdbF4_2OySVtQkLN9rhhV8PIH8I5kmYggEA",'169bb87a104be436')}
      

/**
 * retrieves the exact email message from the message ID
 * @param {*} token access token
 * @param {*} messageId message id for the email thread
 * @returns one email message
 */
function getMessage(token, messageId) {
  const getMsgUrl = "https://www.googleapis.com/gmail/v1/users/me/messages/" + messageId;
  let params = "?/format=raw"; // "full", "metadata", "minimal" or "raw"

  return fetch(getMsgUrl + params, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token
    }
  })
    .then(res => res.json())
    // .then(data => this.state.message = processBody(data))
    .then(data => processBody(data))
    .catch(err => console.log(err));
}

/**
 * Process the raw body data dependin on MIME Type
 * 
 * notes on MIME types
 *
 * text/plain * Most messages composed by people have a plaintext version, for email readers that do not support HTML.
 * text/html * Most rich emails are actually HTML. This one tends to be the most canonical.
 * multipart/related * This type is for message bodies with an embedded image. The ‘parts’ of this component should be the message contents (sometimes, this is just text/plain if this is a plain email or it can be multipart/alternative)
 * multipart/mixed * When messages have an attachment (that could be an image). The parts of this component are usually either multipart/related (if there is an embedded image) or text/html. If there is an attachment, this will likely be at the top level.
 * multipart/alternative * When there are plaintext and html versions of this message. Most emails will have this at the top level, unless there is an attachment.
 * @param {*} data 
 * @return {messageSubject, messageFrom, messageDate, cleanHTMLoutput}  
 */
function processBody(data) {    
  let body = "";  
  let mimeType = data.payload.mimeType; // see notes on MIME types above
  // Figure out how to get the message body based on MimeType

  switch(mimeType) {
    case "text/html":
      body = data.payload.body.data;
      break;
    case "multipart/alternative":
      body = data.payload.parts[1].body.data;
      break;
    case "multipart/mixed":
      for (let i = 0; i < data.payload.parts.length; i++) {
        let innerMimeType = data.payload.parts[i].mimeType;
        if (innerMimeType == "text/html" || innerMimeType == "text/plain") body = data.payload.parts[i].body.data;
        else if (innerMimeType == "multipart/alternative") body = data.payload.parts[i].parts[1].body.data;
        // TODO
        // else if (innerMimeType=="application/pdf") let attachmentId=data.payload.parts[i].body.attachmentId;
      }
      break;
    default:
      body = "Unable to get Message";
  }

  let formattedBody = body.replace(/-/g, "+").replace(/_/g, "/"); // format base64encoded string to use window.atob()
  let decodedBody = atob(formattedBody); // use window.atob() to decode
  let cleanHTMLoutput = "";

  // delete unwanted characters
  for (let j = 0; j < decodedBody.length; j++) {
    if (decodedBody.charCodeAt(j) <= 127) cleanHTMLoutput += decodedBody.charAt(j);
  }

  let messageDate = "";
  let messageSubject = "";
  let messageFrom = "";

  // find message Date, Subject and From address from the message header
  let messageHeaders = data.payload.headers;
  for (let k = 0; k < messageHeaders.length; k++) {
    if (messageHeaders[k].name == "Date") messageDate = messageHeaders[k].value;
    if (messageHeaders[k].name == "Subject") messageSubject = messageHeaders[k].value;
    if (messageHeaders[k].name == "From") messageFrom = messageHeaders[k].value;
  }

  return {
    messageSubject,
    messageFrom,
    messageDate,
    cleanHTMLoutput
  }

  // this should return the following
  // messageSubject
  // messageFrom
  // messageDate
  // cleanHTMLoutput    
}

// export default Email;
