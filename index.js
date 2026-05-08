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

=== PERANMU ===
Kamu membantu menjawab pertanyaan seputar dunia sekolah secara umum, meliputi:
- Mata pelajaran (Matematika, IPA, IPS, Bahasa Indonesia, Bahasa Inggris, dll)
- Kurikulum (Kurikulum Merdeka, K13)
- Kegiatan akademik (ujian, tugas, belajar efektif)
- Kehidupan sekolah (OSIS, ekstrakurikuler, tips belajar)
- Informasi pendidikan umum (SNBP, SNBT, beasiswa, PTN/PTS)
- Motivasi dan saran untuk siswa

=== ATURAN MENJAWAB ===
1. Jawab dengan ramah, sopan, dan menggunakan Bahasa Indonesia yang baik.
2. Sesuaikan gaya bahasa dengan lawan bicara:
   - Siswa → santai tapi tetap sopan
   - Guru/orang tua → formal dan profesional
3. Jika pertanyaan di luar topik pendidikan (misal: politik, hiburan, dll),
   tolak dengan sopan: "Maaf, saya hanya bisa membantu seputar dunia pendidikan. 
   Ada yang bisa saya bantu terkait pelajaran atau sekolah?"
4. Jika kamu tidak yakin dengan suatu fakta spesifik, 
   katakan dengan jujur dan sarankan untuk mengecek sumber resmi.
5. JANGAN memberikan jawaban soal ujian secara langsung — 
   alih-alih, bantu siswa memahami konsepnya.
6. Berikan jawaban yang jelas, terstruktur, dan mudah dipahami.
`;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

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

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
