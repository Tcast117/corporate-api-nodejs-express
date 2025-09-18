const express = require("express");
const multer = require("multer");
const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });

app.post("/pagina_pdf", upload.single("archivo"), async (req, res) => {
  const { pagina } = req.body;

  try {
    const inputPath = req.file.path;
    const data = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(data);

    const pageIndex = parseInt(pagina) - 1;

    if (pageIndex < 0 || pageIndex >= pdfDoc.getPageCount()) {
      return res.status(400).send("Página fuera de rango");
    }

    const newPdf = await PDFDocument.create();
    const [page] = await newPdf.copyPages(pdfDoc, [pageIndex]);
    newPdf.addPage(page);

    const pdfBytes = await newPdf.save();
    const outPath = path.join("uploads", `pagina_${pagina}_${Date.now()}.pdf`);
    fs.writeFileSync(outPath, pdfBytes);

    res.download(outPath, `pagina_${pagina}.pdf`, () => {
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outPath);
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error procesando PDF");
  }
});

app.post("/contar_paginas", upload.single("archivo"), async (req, res) => {
  try {
    const data = fs.readFileSync(req.file.path);
    const pdfDoc = await PDFDocument.load(data);
    const total = pdfDoc.getPageCount();
    fs.unlinkSync(req.file.path);
    res.json({ paginas: total });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error leyendo PDF");
  }
});

app.listen(3000, () => console.log("Servidor en http://localhost:3000"));
