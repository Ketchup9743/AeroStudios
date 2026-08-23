export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { message } = await request.json();

    if (!env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ reply: 'Gemini API key not configured on server.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      })
    });

    const data = await geminiRes.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    
    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error communicating with Gemini API:', error);
    return new Response(JSON.stringify({ reply: 'Error communicating with AI service.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
