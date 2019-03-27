// email ID to access
let primaryEmail = "mushfiq8194@gmail.com";

function main() {
  let accessToken = "";
  
  // Import CONFIG VARS
  import ENV_VARS from "./.config/config.js";
  const clientID = ENV_VARS.CLIENT_ID;
  const clientSecret = ENV_VARS.CLIENT_SECRET;
  const redirectUri = ENV_VARS.REDIRECT_URI;
  const refreshToken = ENV_VARS.REFRESH_TOKEN;
  
  // check if redirected
  const url = new URLSearchParams(window.location.search);
  // if (refreshToken.length>0) getAcessToken(refreshToken);
  if (refreshToken) getAccessTokenWithRefreshToken(refreshToken,clientID,clientSecret);
  // otherwise, get access token using code
  else if (url.has("code")) getAcessTokenWithCode(url.get("code"),clientID,clientSecret,redirectUri);
}

/**
 * Redirect function that goes to the redirectURI and retrieves the authentication code
 * Should be ideally called from a button onClick event
 * @param {string} clientID
 * @param {string} redirectUri
 * @return code
 */
function redirect(clientID,redirectUri) {
  const oauth2EndPoint = "https://accounts.google.com/o/oauth2/v2/auth";
  const scopes = [
    "https://mail.google.com/", // Full access to the account, including permanent deletion of threads and messages. This scope should only be requested if your application needs to immediately and permanently delete threads and messages, bypassing Trash; all other actions can be performed with less permissive scopes.
    "https://www.googleapis.com/auth/gmail.readonly", // Read all resources and their metadata—no write operations.
    "https://www.googleapis.com/auth/gmail.compose", // Create, read, update, and delete drafts. Send messages and drafts.
    "https://www.googleapis.com/auth/gmail.send", // Send messages only. No read or modify privileges on mailbox.
    "https://www.googleapis.com/auth/gmail.insert", // Insert and import messages only.
    "https://www.googleapis.com/auth/gmail.labels", // Create, read, update, and delete labels only.
    "https://www.googleapis.com/auth/gmail.modify", // All read/write operations except immediate, permanent deletion of threads and messages, bypassing Trash.
    "https://www.googleapis.com/auth/gmail.metadata", // Read resources metadata including labels, history records, and email message headers, but not the message body or attachments.
    "https://www.googleapis.com/auth/gmail.settings.basic", // Manage basic mail settings.
    "https://www.googleapis.com/auth/gmail.settings.sharing" // Manage sensitive mail settings, including forwarding rules and aliases.
  ];

  let params = `?client_id=${clientID}&redirect_uri=${redirectUri}&response_type=code&access_type=offline&scope=${scopes[0]}&state=randomNumber&prompt=consent`;

  // console.log(oauth2EndPoint+params);
  window.location.replace(oauth2EndPoint + params);
}

/**
 * get Access Token from code using OAuth2.0
 * @param {string} code retrieved earlier from parsing redirected URL
 * @param {string} clientID
 * @param {string} clientSecret
 * @param {string} redirectUri
 * @returns accessToken
 */
function getAcessTokenWithCode(code,clientID,clientSecret,redirectUri) {
  const authUrl = "https://www.googleapis.com/oauth2/v4/token";
  const params = `?code=${code}&client_id=${clientID}&client_secret=${clientSecret}&redirect_uri=${redirectUri}&grant_type=authorization_code`;
  return fetch(authUrl + params, {
    method: "POST"
  })
    .then(res => res.json())
    .then(data => {
      accessToken = data.access_token;
      refreshToken = data.refresh_token;
      getMessageList(accessToken);
    })
    .catch(err => console.log(err));
}

/**
 * refresh accessToken
 * @param {string} refreshToken
 * @param {string} clientID
 * @param {string} clientSecret
 * @returns accessToken
 */
function getAccessTokenWithRefreshToken(refreshToken,clientID,clientSecret) {
  const refreshUrl = "https://www.googleapis.com/oauth2/v4/token";
  const params = `?refresh_token=${refreshToken}&client_id=${clientID}&client_secret=${clientSecret}&grant_type=refresh_token`;

  return fetch(refreshUrl + params, {
    method: "POST"
  })
    .then(res => res.json())
    .then(data => {
      accessToken = data.access_token;
      getMessageList(accessToken);
    });
}

/**
 * getMessageList retrieves a list of all emails (Paginated)
 * @param {*} token access token
 * @param {*} userId email id of the user to retrieve information
 * @returns array of objects that has paginated list of email messages
 */
function getMessageList(token) {
  const gMailApiEndPoint = "https://www.googleapis.com/gmail/v1/users/me";
  let params = "/messages?";
  
  let labels = ["INBOX"];
  for (let i = 0; i < labels.length; i++) {
    params += `&labelIds=${labels[i]}`;
  }

  return fetch(gMailApiEndPoint + params, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token
    }
  })
    .then(res => res.json())
    .then(data => {
      const messages = data.messages;
      console.log("Number of Messages: " + messages.length);
      for (let i = 0; i < 10; i++) {
        getMessage(token, messages[i].id);
      }
    })
    .catch(err => console.log(err));
}

/**
 * retrieves the exact email message from the message ID
 * @param {*} token access token
 * @param {*} userId email id of the user to retrieve information
 * @param {*} messageId message id for the email thread
 * @returns one email message
 *
 * notes on MIME types
 *
 * text/plain * Most messages composed by people have a plaintext version, for email readers that do not support HTML.
 * text/html * Most rich emails are actually HTML. This one tends to be the most canonical.
 * multipart/related * This type is for message bodies with an embedded image. The ‘parts’ of this component should be the message contents (sometimes, this is just text/plain if this is a plain email or it can be multipart/alternative)
 * multipart/mixed * When messages have an attachment (that could be an image). The parts of this component are usually either multipart/related (if there is an embedded image) or text/html. If there is an attachment, this will likely be at the top level.
 * multipart/alternative * When there are plaintext and html versions of this message. Most emails will have this at the top level, unless there is an attachment.
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
    .then(data => {
      let body = "";
      let mimeType = data.payload.mimeType; // see notes on MIME types above
      console.log(data);

      // Figure out how to get the message body based on MimeType
      if (mimeType == "text/html") body = data.payload.body.data;
      else if (mimeType == "multipart/alternative")
        body = data.payload.parts[1].body.data;
      else if (mimeType == "multipart/mixed") {
        for (let i = 0; i < data.payload.parts.length; i++) {
          let innerMimeType = data.payload.parts[i].mimeType;
          if (innerMimeType == "text/html" || innerMimeType == "text/plain")
            body = data.payload.parts[i].body.data;
          else if (innerMimeType == "multipart/alternative")
            body = data.payload.parts[i].parts[1].body.data;
          // TODO
          // else if (innerMimeType=="application/pdf") {
          //   let attachmentId=data.payload.parts[i].body.attachmentId;
          //   console.log('attachmentId: ' + attachmentId);
          //   console.log('messageId: ' + messageId);
          // }
        }
      }

      let formattedBody = body.replace(/-/g, "+").replace(/_/g, "/"); // format base64encoded string to use window.atob()
      let decodedBody = atob(formattedBody); // use window.atob() to decode
      let cleanHTMLoutput = "";

      // delete unwanted characters
      for (let j = 0; j < decodedBody.length; j++) {
        if (decodedBody.charCodeAt(j) <= 127) {
          cleanHTMLoutput += decodedBody.charAt(j);
        }
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

      // this should return the following
      // messageSubject
      // messageFrom
      // messageDate
      // cleanHTMLoutput

    })
    .catch(err => console.log(err));
}
