const XLSX = require('xlsx');
const fs = require('fs');
const OrdenCompra = require('../models/OrdenCompra');

exports.uploadOrdenCompra = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    for (const row of sheet) {
      await OrdenCompra.create({
        comprador: row["comprador"],
        fecha: row["fecha"],
        proveedor: row["proveedor"],
        estado: row["estado"],
        moneda: row["monedaOC"],
        conversionRate: parseFloat(row["conversionrate"]) || 1,
        montoBruto: parseFloat(row["montooc_bruto"]) || 0,
        tipoOrden: row["tipoorden"]
      });
    }

    fs.unlinkSync(req.file.path);

    res.json({ message: 'Órdenes de compra cargadas exitosamente', rows: sheet.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
