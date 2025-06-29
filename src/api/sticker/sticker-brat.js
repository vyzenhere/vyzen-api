const express = require("express");
const { Sticker } = require("wa-sticker-formatter");
const axios = require("axios");

// Daftar API key yang valid (bisa ambil dari config atau file jika mau lebih fleksibel)
const validApiKeys = ["vyzen10"];

module.exports = async function (app) {
  app.get("/sticker/brat", async (req, res) => {
    const text = req.query.text;
    const apikey = req.query.apikey;

    if (!apikey || !validApiKeys.includes(apikey)) {
      return res.status(403).json({
        status: false,
        message: "API key tidak valid!",
      });
    }

    if (!text) {
      return res.status(400).json({
        status: false,
        message: "Parameter 'text' wajib diisi",
      });
    }

    try {
      const stickerURL = `https://aqul-brat.hf.space?text=${encodeURIComponent(text)}`;
      const stickerBuffer = await createSticker(null, stickerURL, "Vyzen");

      res.setHeader("Content-Type", "image/webp");
      res.status(200).send(stickerBuffer);
    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: false,
        message: "Gagal membuat stiker",
        error: err.message,
      });
    }
  });
};

async function createSticker(img, url, packName, authorName = "shinoa-ai", quality = 80) {
  const stickerMetadata = {
    type: 'crop',
    pack: packName,
    author: authorName,
    quality
  };
  return new Sticker(img || url, stickerMetadata).toBuffer();
}