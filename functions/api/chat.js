export async function onRequestPost(context) {
  try {
    const apiKey = context.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { messageHistory } = await context.request.json();
    const contents = messageHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: contents,
        systemInstruction: {
          parts: [{ text: 'You are a helpful AI assistant for Aero Studios.' }]
        }
      })
    });
    const data = await response.json();
    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Gemini API error" }), {
        status: response.status,
        headers: { "Content-Type": "application/json" }
      });
    }
    const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    return new Response(JSON.stringify({ reply: aiReply }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
