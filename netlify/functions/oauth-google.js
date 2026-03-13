/* Google OAuth BFF — handles OAuth flow server-side */
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI_BASE = 'https://sintex.ai/api/auth/google/callback';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  const path = event.path || '';

  // Step 1: Redirect to Google consent
  if (!path.includes('callback')) {
    if (!CLIENT_ID) {
      return {
        statusCode: 200, headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Google OAuth not configured', mock: true, user: { name: 'Elrom', email: 'demo@sintex.ai', picture: '' } })
      };
    }
    const state = Math.random().toString(36).slice(2);
    const scope = encodeURIComponent('openid email profile');
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI_BASE)}&response_type=code&scope=${scope}&state=${state}&access_type=offline`;
    return { statusCode: 302, headers: { Location: url } };
  }

  // Step 2: Handle callback — exchange code for token
  const code = event.queryStringParameters?.code;
  if (!code) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: '<script>window.opener.postMessage({type:"oauth-error",error:"No code"},"*");window.close();</script>'
    };
  }

  try {
    // Exchange code for token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI_BASE,
        grant_type: 'authorization_code'
      })
    });
    const tokens = await tokenRes.json();

    if (!tokens.access_token) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html' },
        body: '<script>window.opener.postMessage({type:"oauth-error",error:"Token exchange failed"},"*");window.close();</script>'
      };
    }

    // Get user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    const user = await userRes.json();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: `<script>window.opener.postMessage({type:"oauth-success",provider:"google",user:${JSON.stringify({ name: user.name, email: user.email, picture: user.picture })}},"*");window.close();</script>`
    };
  } catch (e) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: `<script>window.opener.postMessage({type:"oauth-error",error:"${e.message}"},"*");window.close();</script>`
    };
  }
};
