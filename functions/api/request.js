export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { discordUser, email, projectTitle, promoCode, description } = await request.json();
    
    if (!env.DISCORD_WEBHOOK_URL) {
      return new Response(JSON.stringify({ error: 'Webhook URL not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const discordPayload = {
      content: `🔔 **New Project Request Received!** <@1537969782765133854>`,
      allowed_mentions: {
        users: ["1537969782765133854"]
      },
      embeds: [{
        title: projectTitle,
        color: 3092790,
        fields: [
          { name: 'Discord User', value: discordUser, inline: true },
          { name: 'Email', value: email, inline: true },
          { name: 'Promo Code', value: promoCode || 'None provided', inline: true },
          { name: 'Description', value: description, inline: false }
        ],
        timestamp: new Date().toISOString()
      }]
    };

    const discordRes = await fetch(env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload)
    });

    if (discordRes.ok) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ error: 'Failed to post to Discord' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error forwarding request:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
