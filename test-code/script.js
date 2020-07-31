// componentDidMount() {
//   const clientID = ENV_VARS.CLIENT_ID;
//   const clientSecret = ENV_VARS.CLIENT_SECRET;
//   const redirectUri = ENV_VARS.REDIRECT_URI;
//   const refreshToken = ENV_VARS.REFRESH_TOKEN["mushfiq8194"];

//   // let { messages, token } = this.myFunc(refreshToken, clientID, clientSecret, 20);
//   let token = await this.getAccessToken(refreshToken, clientID, clientSecret);

//   console.log(token);
// }

myFunc = async(refreshToken, clientId, clientSecret, maxResults) => {
  let token = await this.getAccessToken(refreshToken, clientId, clientSecret);
  let msgs = await this.getMessageList(token, maxResults);
  return { msgs, token };
}

getAccessToken = async (refreshToken, clientId, clientSecret) => {
  let refreshUrl = "https://www.googleapis.com/oauth2/v4/token";
  let params = `?refresh_token=${refreshToken}&client_id=${clientId}&client_secret=${clientSecret}&grant_type=refresh_token`;
  return fetch(refreshUrl + params, {
    method: "POST"
  })
    .then(res => res.json())
    .then(data => {
      let accessToken = data.access_token;
      return accessToken;
    })
    .catch(err => console.log(err));
};

getMessageList = async (token, maxResults) => {
  const gMailApiEndPoint = "https://www.googleapis.com/gmail/v1/users/me/messages";
  let params = "?maxResults=" + maxResults;

  let labels = [];
  if (labels.length) {
    for (let i = 0; i < labels.length; i++) {
      params += `&labelIds=${labels[i]}`;
    }
  }

  return fetch(gMailApiEndPoint+params, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token
    }
  })
    .then(res => res.json())
    .then(data => {
      let messages = data.messages;
      return messages;
    })
    .catch(err => console.log(err));
};