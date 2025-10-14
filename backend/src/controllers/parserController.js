const pool = require('../db');
const logger = require('../config/logger');
const { addPdfJob, addExcelJob, getJobStatus, pdfQueue, excelQueue } = require('../queues/queueManager');

/**
 * Procesar archivo PDF de forma asíncrona
 */
exports.parsePDF = async (req, res) => {
  try {
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No se proporcionó archivo PDF' });
    }

    logger.info(`📄 Iniciando parseo de PDF: ${file.originalname}`);

    // Agregar job a la cola
    const job = await addPdfJob({
      filePath: file.path,
      fileName: file.originalname,
      projectId: req.body.projectId,
      userId: req.body.userId,
    });

    res.json({
      success: true,
      message: 'PDF agregado a la cola de procesamiento',
      jobId: job.id,
      status: 'processing',
    });

  } catch (error) {
    logger.error(`Error en parsePDF: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Procesar archivo Excel de forma asíncrona
 */
exports.parseExcel = async (req, res) => {
  try {
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No se proporcionó archivo Excel' });
    }

    logger.info(`📊 Iniciando parseo de Excel: ${file.originalname}`);

    // Agregar job a la cola
    const job = await addExcelJob({
      filePath: file.path,
      fileName: file.originalname,
      projectId: req.body.projectId,
      userId: req.body.userId,
    });

    res.json({
      success: true,
      message: 'Excel agregado a la cola de procesamiento',
      jobId: job.id,
      status: 'processing',
    });

  } catch (error) {
    logger.error(`Error en parseExcel: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Obtener estado de procesamiento de un job
 */
exports.getParseStatus = async (req, res) => {
  try {
    const { jobId, type } = req.params;
    
    let queue;
    if (type === 'pdf') {
      queue = pdfQueue;
    } else if (type === 'excel') {
      queue = excelQueue;
    } else {
      return res.status(400).json({ error: 'Tipo inválido. Use "pdf" o "excel"' });
    }

    const status = await getJobStatus(queue, jobId);
    
    if (!status) {
      return res.status(404).json({ error: 'Job no encontrado' });
    }

    res.json(status);

  } catch (error) {
    logger.error(`Error en getParseStatus: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Listar todos los jobs en proceso
 */
exports.listActiveJobs = async (req, res) => {
  try {
    const { type } = req.query;

    const result = {
      pdf: null,
      excel: null,
    };

    if (!type || type === 'pdf') {
      const pdfActive = await pdfQueue.getActive();
      const pdfWaiting = await pdfQueue.getWaiting();
      result.pdf = {
        active: pdfActive.length,
        waiting: pdfWaiting.length,
        jobs: [...pdfActive, ...pdfWaiting].map(j => ({
          id: j.id,
          name: j.name,
          data: j.data,
        })),
      };
    }

    if (!type || type === 'excel') {
      const excelActive = await excelQueue.getActive();
      const excelWaiting = await excelQueue.getWaiting();
      result.excel = {
        active: excelActive.length,
        waiting: excelWaiting.length,
        jobs: [...excelActive, ...excelWaiting].map(j => ({
          id: j.id,
          name: j.name,
          data: j.data,
        })),
      };
    }

    res.json(result);

  } catch (error) {
    logger.error(`Error en listActiveJobs: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Validar formato de archivo
 */
exports.validateFile = async (req, res) => {
  try {
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No se proporcionó archivo' });
    }

    const allowedTypes = {
      pdf: ['application/pdf'],
      excel: [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ],
    };

    const fileType = file.mimetype;
    let isValid = false;
    let detectedType = null;

    if (allowedTypes.pdf.includes(fileType)) {
      isValid = true;
      detectedType = 'pdf';
    } else if (allowedTypes.excel.includes(fileType)) {
      isValid = true;
      detectedType = 'excel';
    }

    logger.info(`Validación de archivo: ${file.originalname} - Tipo: ${detectedType} - Válido: ${isValid}`);

    res.json({
      valid: isValid,
      type: detectedType,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
    });

  } catch (error) {
    logger.error(`Error en validateFile: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};
