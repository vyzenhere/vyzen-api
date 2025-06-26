const puppeteer = require("puppeteer");

module.exports = async function (app) {
  app.get("/sticker/brat", async (req, res) => {
    const { apikey, text } = req.query;
    const VALID_API_KEY = "vyzen10"; // Ganti sesuai key kamu

    if (!apikey || apikey !== VALID_API_KEY) {
      return res.status(401).json({
        status: false,
        message: "API key salah atau tidak ditemukan",
      });
    }

    if (!text) {
      return res.status(400).json({
        status: false,
        message: "Parameter 'text' tidak boleh kosong",
      });
    }

    try {
      const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();
      await page.goto("https://bratgenerator.net/id", { waitUntil: "networkidle2" });

      // Isi teks
      await page.type('input[type="text"]', text);

      // Klik tombol buat
      await Promise.all([
        page.click("button:has-text('Buat Sampul Brat Anda')"),
        page.waitForTimeout(3000) // tunggu hasil muncul
      ]);

      // Tunggu elemen hasil muncul (CSS class bisa berubah, perlu penyesuaian kalau gagal)
      await page.waitForSelector("div[style*='background-image']", { timeout: 5000 });

      const target = await page.$("div[style*='background-image']");

      if (!target) throw new Error("Gagal menemukan hasil Brat");

      const buffer = await target.screenshot({ type: "png" });

      await browser.close();

      // Kirim hasil sebagai image
      res.set("Content-Type", "image/png");
      res.send(buffer);

    } catch (error) {
      console.error("Gagal generate Brat:", error.message);
      res.status(500).json({
        status: false,
        message: "Gagal generate Brat",
        error: error.message,
      });
    }
  });
};
