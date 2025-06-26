const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async function (app) {
  app.get("/sticker/brat", async (req, res) => {
    const apikey = req.query.apikey;
    const VALID_API_KEY = 'vyzen10'; // ganti sesuai key yang kamu pakai

    if (!apikey || apikey !== VALID_API_KEY) {
      return res.status(401).json({
        status: false,
        message: "API key salah atau tidak ditemukan",
      });
    }

    const url = 'https://bratgenerator.net/id';

    try {
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);

      const title = $('title').text();
      const description = $('meta[name="description"]').attr('content');
      const inputTextLabel = $('p:contains("Ketik kata-kata Anda di sini")').text();
      const inputPlaceholder = $('input[type="text"]').attr('placeholder');
      const greenModeText = $("button:contains('Mode Hijau')").text().trim();
      const whiteModeText = $("button:contains('Mode Putih')").text().trim();
      const createButtonText = $("button:contains('Buat Sampul Brat Anda')").text().trim();
      const scrollDownText = $("p:contains('Gulir ke bawah untuk melihat Sampul Brat Anda')").text().trim();
      const imageDivText = $("div[style*='background-color:#8ACF00'] div").text().trim();
      const screenshotText = $("p:contains('Ambil tangkapan layar untuk menyimpan')").text().trim();
      const howItWorksTitle = $("h2:contains('Cara Kerja Pembuat Brat')").text();
      const featuresTitle = $("h2:contains('Pembuat Brat: Ubah Teks Anda Menjadi Sampul Album')").text();
      const testimonialsTitle = $("h2:contains('Pujian Klien untuk Pembuat Brat')").text();
      const faqTitle = $("p:contains('Pertanyaan yang Sering Diajukan tentang Pembuat Brat')").text();

      let testimonials = [];

      $('section.bg-\\\#f2f2f7\ ul.mb-6 li').each((index, element) => {
        const description = $(element).find('p.text-\\\#647084\').text();
        const authorName = $(element).find('p.font-bold').text();
        const authorTitle = $(element).find('p.text-sm.text-\\\#636262\').text();
        testimonials.push({
          description,
          author: {
            name: authorName,
            title: authorTitle,
          },
        });
      });

      res.json({
        status: true,
        source: url,
        result: {
          title,
          description,
          inputTextLabel,
          inputPlaceholder,
          greenModeText,
          whiteModeText,
          createButtonText,
          scrollDownText,
          imageDivText,
          screenshotText,
          howItWorksTitle,
          featuresTitle,
          testimonialsTitle,
          faqTitle,
          testimonials,
        },
      });

    } catch (error) {
      console.error("Error scraping brat:", error.message);
      res.status(500).json({
        status: false,
        message: "Gagal mengambil data",
        error: error.message,
      });
    }
  });
};