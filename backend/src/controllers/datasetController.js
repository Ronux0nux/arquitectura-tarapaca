const csv = require('csv-parser');
const fs = require('fs');
const Insumo = require('../models/Insumo');

exports.uploadDataset = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const results = [];
// esto me ayuda a leer el archivo csv
    // Supón que el archivo CSV tiene columnas: nombre, precioReferencia

    // Lee el archivo CSV fila por fila
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        for (const row of results) {
          //  Ajusta los nombres de columna según tu CSV real:
          await Insumo.findOneAndUpdate(
            { nombre: row["IDLicitación"] },
            {
              unidad: row["Unidad"],
              precioReferencia: row["Precio Unitario"]
            },
            { upsert: true, new: true }
          );
        }

        // Elimina archivo después de procesar
        fs.unlinkSync(req.file.path);

        res.json({ message: 'Dataset CSV procesado con éxito', rows: results.length });
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
