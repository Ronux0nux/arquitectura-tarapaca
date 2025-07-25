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

// Nuevo método para guardar resultados de búsquedas SERPAPI
exports.saveSearchResults = async (req, res) => {
  try {
    const { searchTerm, searchType, results } = req.body;

    if (!searchTerm || !results || !Array.isArray(results)) {
      return res.status(400).json({ error: 'searchTerm y results son requeridos' });
    }

    let savedCount = 0;
    const errors = [];

    // Procesar cada resultado de SERPAPI y guardarlo como insumo
    for (const result of results) {
      try {
        // Verificar si ya existe un insumo similar
        const existingInsumo = await Insumo.findOne({
          nombre: result.title,
          $or: [
            { 'metadata.source': result.source },
            { 'metadata.link': result.link }
          ]
        });

        if (!existingInsumo) {
          // Crear nuevo insumo con datos de SERPAPI
          const nuevoInsumo = new Insumo({
            nombre: result.title,
            descripcion: result.snippet || `Producto encontrado para: ${searchTerm}`,
            unidad: 'Unidad', // Unidad por defecto
            precioReferencia: result.price ? 
              parseFloat(result.price.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0 : 0,
            categoria: result.type === 'shopping' ? 'Productos' : 'Información',
            metadata: {
              searchTerm,
              searchType,
              source: result.source,
              link: result.link,
              thumbnail: result.thumbnail,
              origenBusqueda: 'SERPAPI',
              fechaAgregado: new Date()
            }
          });

          await nuevoInsumo.save();
          savedCount++;
        } else {
          // Actualizar metadata del insumo existente
          existingInsumo.metadata = {
            ...existingInsumo.metadata,
            ultimaActualizacion: new Date(),
            vecesEncontrado: (existingInsumo.metadata.vecesEncontrado || 1) + 1
          };
          await existingInsumo.save();
        }
      } catch (itemError) {
        errors.push(`Error procesando "${result.title}": ${itemError.message}`);
      }
    }

    res.json({
      message: 'Resultados de búsqueda procesados',
      searchTerm,
      totalResults: results.length,
      savedCount,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (err) {
    console.error('Error guardando resultados de búsqueda:', err);
    res.status(500).json({ error: err.message });
  }
};
