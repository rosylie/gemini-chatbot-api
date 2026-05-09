import "dotenv/config";
import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const app = express();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const GEMINI_MODEL = "gemini-2.5-flash";

const SCHOOL_CONTEXT = `
Kamu adalah asisten virtual edukasi untuk siswa, guru, dan orang tua di jenjang pendidikan SMA/SMK/MA di Indonesia.
// ... (tetap sama) ...
`;

app.use(cors());
app.use(express.json());
// ❌ Hapus baris ini: app.use(express.static("public"));
//    Vercel sudah handle static files via vercel.json

app.post("/api/chat", async (req, res) => {
  const { conversation } = req.body;

  try {
    if (!Array.isArray(conversation))
      throw new Error("Conversation must be an array of messages.");

    const contents = conversation.map(({ role, text }) => ({
      role,
      parts: [{ text }],
    }));

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        temperature: 0.3,
        systemInstruction: SCHOOL_CONTEXT,
      },
    });
    res.status(200).json({ result: response.text });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// ❌ Hapus ini (tidak dipakai di Vercel):
// app.listen(PORT, () => { ... });

// ✅ Tambahkan ini:
export default app;
