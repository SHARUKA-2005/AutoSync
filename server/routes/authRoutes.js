const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const CREDENTIALS_PATH = path.join(__dirname, '../credentials.json');
const TOKEN_PATH = path.join(__dirname, '../token.json');
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

let oAuth2Client = null;

// Initialize OAuth client
function getOAuthClient() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error('credentials.json not found');
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_secret, client_id, redirect_uris } = credentials.installed;

  if (!oAuth2Client) {
    oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );
  }

  return oAuth2Client;
}

// Check if user is authenticated
router.get('/status', async (req, res) => {
  try {
    if (!fs.existsSync(TOKEN_PATH)) {
      return res.json({ authenticated: false });
    }

    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    const client = getOAuthClient();
    client.setCredentials(token);

    // Try to refresh the token if it's expired
    try {
      const tokenInfo = await client.getAccessToken();
      if (tokenInfo.token) {
        return res.json({ authenticated: true });
      }
    } catch (error) {
      // Token is invalid or expired
      if (fs.existsSync(TOKEN_PATH)) {
        fs.unlinkSync(TOKEN_PATH);
      }
      return res.json({ authenticated: false, error: 'Token expired' });
    }
    
    res.json({ authenticated: true });
  } catch (err) {
    console.error('Auth status error:', err);
    res.json({ authenticated: false, error: err.message });
  }
});

// Get authorization URL
router.get('/url', (req, res) => {
  try {
    const client = getOAuthClient();
    
    const authUrl = client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent' // Force consent screen to get refresh token
    });

    res.json({ authUrl });
  } catch (err) {
    console.error('Error generating auth URL:', err);
    res.status(500).json({ error: err.message });
  }
});

// Handle OAuth callback
router.get('/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Error</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 20px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              text-align: center;
              max-width: 400px;
            }
            h1 { color: #dc2626; margin-bottom: 20px; }
            p { color: #64748b; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Authentication Error</h1>
            <p>No authorization code received. Please try again.</p>
          </div>
        </body>
      </html>
    `);
  }

  try {
    const client = getOAuthClient();
    const { tokens } = await client.getToken(code);
    
    // Save token to file
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    
    console.log('✅ Token successfully saved to', TOKEN_PATH);

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Successful</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 20px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              text-align: center;
              max-width: 400px;
              animation: slideIn 0.5s ease-out;
            }
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateY(-20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .success-icon {
              width: 80px;
              height: 80px;
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 20px;
              font-size: 40px;
            }
            h1 {
              color: #1e293b;
              margin-bottom: 15px;
              font-size: 28px;
            }
            p {
              color: #64748b;
              line-height: 1.6;
              margin-bottom: 10px;
            }
            .closing {
              font-size: 14px;
              color: #94a3b8;
              margin-top: 20px;
            }
          </style>
          <script>
            setTimeout(() => {
              window.close();
            }, 3000);
          </script>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✓</div>
            <h1>Authentication Successful!</h1>
            <p>Your Gmail account has been connected successfully.</p>
            <p>You can now sync your job emails.</p>
            <p class="closing">This window will close automatically...</p>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('Error exchanging code for token:', err);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Error</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 20px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              text-align: center;
              max-width: 400px;
            }
            h1 { color: #dc2626; margin-bottom: 20px; }
            p { color: #64748b; line-height: 1.6; }
            .error { 
              background: #fee2e2; 
              padding: 15px; 
              border-radius: 10px; 
              color: #991b1b;
              margin-top: 20px;
              font-family: monospace;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Authentication Failed</h1>
            <p>There was an error completing the authentication.</p>
            <div class="error">${err.message}</div>
          </div>
        </body>
      </html>
    `);
  }
});

// Revoke authentication
router.post('/revoke', (req, res) => {
  try {
    if (fs.existsSync(TOKEN_PATH)) {
      fs.unlinkSync(TOKEN_PATH);
      oAuth2Client = null;
      res.json({ success: true, message: 'Authentication revoked' });
    } else {
      res.json({ success: false, message: 'No active authentication' });
    }
  } catch (err) {
    console.error('Error revoking auth:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;