export async function onRequestPost(context) {
  try {
    const { request: incomingReq, env } = context;
    const { email, clientName } = await incomingReq.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const token = `AERO-${Math.floor(1000 + Math.random() * 9000)}-${randomHex}`;

    if (env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'Aero Studios <onboarding@resend.dev>',
          to: [email],
          subject: 'Your Aero Studios Client Dashboard Token',
          html: `<p>Hello ${clientName || 'Client'},</p><p>Your private project dashboard access token is:</p><h3>${token}</h3><p>Keep this token safe. You can use it to view your project updates.</p>`
        })
      });
    }

    if (env.DISCORD_TOKEN_URL) {
      await fetch(env.DISCORD_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `🚨 **New Client Token Generated!**\n- **Email:** ${email}\n- **Name:** ${clientName || 'Not provided'}\n- **Token:** \`${token}\``
        })
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'Token generated and sent!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
