const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = 'token.json';

function authorize(credentials, callback) {
const { client_secret, client_id, redirect_uris } = credentials.installed;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

fs.readFile(TOKEN_PATH, (err, token) => {
if (err) return getNewToken(oAuth2Client, callback);
oAuth2Client.setCredentials(JSON.parse(token));
callback(oAuth2Client);
});
}

function getNewToken(oAuth2Client, callback) {
const authUrl = oAuth2Client.generateAuthUrl({
access_type: 'offline',
scope: SCOPES,
});

console.log('Authorize this app by visiting this URL:', authUrl);

const rl = readline.createInterface({
input: process.stdin,
output: process.stdout,
});

rl.question('Enter the code from that page here: ', (code) => {
rl.close();
oAuth2Client.getToken(code, (err, token) => {
    if (err) return console.error('Error getting token', err);
    oAuth2Client.setCredentials(token);
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), () => {
    console.log('Token stored to', TOKEN_PATH);
    });
    callback(oAuth2Client);
});
});
}

function listJobEmails(auth) {
const gmail = google.gmail({ version: 'v1', auth });

gmail.users.messages.list({
userId: 'me',
q: 'subject:(job OR interview OR career) newer_than:60d',
maxResults: 10,
}, async (err, res) => {
if (err) return console.log('API error:', err);

const messages = res.data.messages || [];
for (let msg of messages) {
    const fullMsg = await gmail.users.messages.get({ userId: 'me', id: msg.id });
    const snippet = fullMsg.data.snippet;
    const subjectHeader = fullMsg.data.payload.headers.find(h => h.name === 'Subject');
    const subject = subjectHeader ? subjectHeader.value : 'No subject';
    console.log('✅ Woww cutie We Found your email:', subject, '|', snippet);
}
});
}

function syncEmails() {
fs.readFile('credentials.json', (err, content) => {
if (err) return console.log('Error loading credentials:', err);
authorize(JSON.parse(content), listJobEmails);
});
}

module.exports = { syncEmails };

