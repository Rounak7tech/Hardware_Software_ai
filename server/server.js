// server/server.js
const express = require("express");
const fetch = require("node-fetch"); // only if Node <18
require("dotenv").config();

const app = express();
app.use(express.json());

app.post("/api/recommend", async (req, res) => {
  const { components } = req.body;
  if (!components) return res.status(400).send({ error: "No components provided" });

  const prompt = `You are an IoT project assistant. Suggest 3 project ideas using these components: ${components.join(", ")}.
  For each project return JSON with: title, description (2-3 lines), requiredComponents (array), and difficulty (Easy/Medium/Hard).`;

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 600,
        temperature: 0.8
      })
    });

    const data = await openaiRes.json();
    const content = data.choices?.[0]?.message?.content ?? "";
    try {
      const parsed = JSON.parse(content);
      res.json({ ok: true, result: parsed });
    } catch {
      res.json({ ok: true, resultText: content });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
});

app.listen(4000, () => console.log("✅ AI recommender running on http://localhost:4000"));
