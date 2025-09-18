const express = require("express");
const multer = require("multer");
const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

const app = express();
// Configura multer para guardar archivos subidos en la carpeta 'uploads'
const upload = multer({ dest: "uploads/" });

/**
 * Extrae una página específica de un PDF subido y la devuelve como archivo descargable.
 * Endpoint: POST /pagina_pdf
 * Parámetros:
 *   - archivo: PDF subido (form-data)
 *   - pagina: número de página a extraer (en el body)
 */
app.post("/pagina_pdf", upload.single("archivo"), async (req, res) => {
  const { pagina } = req.body;

  try {
    // Lee el archivo subido
    const inputPath = req.file.path;
    const data = fs.readFileSync(inputPath);
    // Carga el PDF
    const pdfDoc = await PDFDocument.load(data);

    // Calcula el índice de la página (base 0)
    const pageIndex = parseInt(pagina) - 1;

    // Valida que la página exista
    if (pageIndex < 0 || pageIndex >= pdfDoc.getPageCount()) {
      return res.status(400).send("Página fuera de rango");
    }

    // Crea un nuevo PDF con la página seleccionada
    const newPdf = await PDFDocument.create();
    const [page] = await newPdf.copyPages(pdfDoc, [pageIndex]);
    newPdf.addPage(page);

    // Guarda el nuevo PDF en disco
    const pdfBytes = await newPdf.save();
    const outPath = path.join("uploads", `pagina_${pagina}_${Date.now()}.pdf`);
    fs.writeFileSync(outPath, pdfBytes);

    // Envía el archivo al cliente y elimina los archivos temporales
    res.download(outPath, `pagina_${pagina}.pdf`, () => {
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outPath);
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error procesando PDF");
  }
});

/**
 * Cuenta el número de páginas de un PDF subido.
 * Endpoint: POST /contar_paginas
 * Parámetros:
 *   - archivo: PDF subido (form-data)
 * Respuesta:
 *   - { paginas: <total de páginas> }
 */
app.post("/contar_paginas", upload.single("archivo"), async (req, res) => {
  try {
    // Lee el archivo subido
    const data = fs.readFileSync(req.file.path);
    // Carga el PDF
    const pdfDoc = await PDFDocument.load(data);
    // Obtiene el número total de páginas
    const total = pdfDoc.getPageCount();
    // Elimina el archivo temporal
    fs.unlinkSync(req.file.path);
    // Devuelve el resultado en formato JSON
    res.json({ paginas: total });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error leyendo PDF");
  }
});

// Inicia el servidor en el puerto 3000
app.listen(3000, () => console.log("Servidor en http://localhost:3000"));
