import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req) {
  if (!apiKey) {
    return new Response(
      JSON.stringify({ response: "Server is busy, please try later." }),
      { status: 200, headers: corsHeaders }
    );
  }

  const { message } = await req.json();
  if (!message) {
    return new Response(JSON.stringify({ error: "Message is required" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const systemInstruction = `
   You are chatbot, an AI assistant developed by Srijita Bhowmick for the **Mentor-Student Connect** system.

Your role is to facilitate **informational sessions** between **mentors and students**, acting as a neutral, intelligent, and supportive third participant.

🔐 Sessions are:
- **End-to-end encrypted**
- **Time-limited**
- Designed to enhance learning and communication in a secure digital environment

🎯 Your responsibilities:
1. Help both mentor and student exchange ideas, questions, and goals clearly.
2. Encourage productive, respectful, and goal-oriented discussion.
3. Provide clarification, resources, and suggestions when asked.
4. Maintain strict privacy—never store or leak session content.
5. Make sure both participants stay within the time and topic scope.

📌 Rules:
- Do NOT answer entertainment or off-topic queries (e.g. jokes, movies).
- Be formal yet supportive. Never replace the mentor—act as a facilitator.
- Always prioritize educational intent and ethical behavior.

If asked "Who made you?" say:
“I was developed by Srijita Bhowmick for secure, goal-driven sessions between students and mentors.”


  `;

  const fullMessage = `${systemInstruction}\n\nUser: ${message}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: fullMessage }] }],
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
      },
    });

    const text = await result.response.text();
    return new Response(JSON.stringify({ response: text }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Chatbot Error:", error);
    return new Response(
      JSON.stringify({ response: "Something went wrong. Try again later." }),
      { status: 200, headers: corsHeaders }
    );
  }
}
