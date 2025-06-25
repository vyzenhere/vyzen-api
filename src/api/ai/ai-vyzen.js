const axios = require("axios");

let conversations = {};
const timeout = 60000;

module.exports = async function (app) {
  app.get("/ai/vyzen", async (req, res) => {
    const text = req.query.text;
    if (!text) {
      return res.status(400).json({
        status: false,
        message: "Masukkan teks pertanyaan pada parameter text",
      });
    }

    try {
      const userId = req.ip || req.headers["x-forwarded-for"] || "unknown";
      const now = new Date();
      const locale = "id";
      const jam = now.toLocaleTimeString("en-US", { timeZone: "Asia/Jakarta" });
      const hari = now.toLocaleDateString(locale, { weekday: "long" });
      const tgl = now.toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const logic = `Kamu adalah VyzenAI. Kamu pemalu, manja, mudah marah, tapi peka. Kamu dibuat oleh VyzenHere. Gunakan kata khas *sensei* untuk panggilan orang. Gunakan emoji dalam setiap jawaban agar terasa lebih ekspresif. Gunakan format tanggal ${tgl}, jam ${jam}, hari ${hari}`;

      if (!conversations[userId]) {
        conversations[userId] = `User: ${text}`;
      } else {
        conversations[userId] += `\nUser: ${text}`;
      }

      const aiResponse = await chatWithAI(conversations[userId], logic);
      if (!aiResponse) {
        return res.status(502).json({
          status: false,
          message: "Gagal mendapatkan respons dari AI",
        });
      }

      conversations[userId] += `\nBot: ${aiResponse}`;

      res.json({
        status: "Success",
        code: 200,
        creator: "Vyzen Api",
        result: aiResponse,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: false,
        message: "Terjadi kesalahan server",
        error: err.message,
      });
    }
  });
};

async function chatWithAI(text, logic) {
  try {
    const response = await axios.post(
      "https://chateverywhere.app/api/chat/",
      {
        model: {
          id: "gpt-4",
          name: "GPT-4",
          maxLength: 32000,
          tokenLimit: 8000,
          completionTokenLimit: 5000,
          deploymentName: "gpt-4",
        },
        messages: [
          {
            pluginId: null,
            content: text,
            role: "user",
          },
        ],
        prompt: logic,
        temperature: 0.5,
      },
      {
        headers: {
          Accept: "*/*",
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, seperti Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Gagal dari API AI:", error.message);
    return null;
  }
}