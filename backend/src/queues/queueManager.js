const { Queue, Worker } = require('bullmq');
const { redisClient } = require('../config/redis');
const logger = require('../config/logger');

// Configuración de conexión para BullMQ
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

// ==================== COLAS ====================

// Cola para procesamiento de archivos PDF
const pdfQueue = new Queue('pdf-processing', { connection });

// Cola para procesamiento de archivos Excel
const excelQueue = new Queue('excel-processing', { connection });

// Cola para importación masiva de proveedores
const providerImportQueue = new Queue('provider-import', { connection });

// Cola para búsquedas con SerpAPI
const searchQueue = new Queue('search-processing', { connection });

// ==================== WORKERS ====================

// Worker para procesar PDFs
const pdfWorker = new Worker(
  'pdf-processing',
  async (job) => {
    logger.info(`📄 Procesando PDF: ${job.name} (ID: ${job.id})`);
    const { filePath, projectId, userId } = job.data;

    try {
      // Aquí iría la lógica de procesamiento de PDF
      // Por ahora simulamos el procesamiento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      logger.info(`✅ PDF procesado: ${job.name}`);
      return { 
        success: true, 
        filePath, 
        projectId,
        processedAt: new Date().toISOString() 
      };
    } catch (error) {
      logger.error(`❌ Error procesando PDF ${job.name}: ${error.message}`);
      throw error;
    }
  },
  { connection }
);

// Worker para procesar Excel
const excelWorker = new Worker(
  'excel-processing',
  async (job) => {
    logger.info(`📊 Procesando Excel: ${job.name} (ID: ${job.id})`);
    const { filePath, projectId, userId } = job.data;

    try {
      // Aquí iría la lógica de procesamiento de Excel
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      logger.info(`✅ Excel procesado: ${job.name}`);
      return { 
        success: true, 
        filePath, 
        projectId,
        processedAt: new Date().toISOString() 
      };
    } catch (error) {
      logger.error(`❌ Error procesando Excel ${job.name}: ${error.message}`);
      throw error;
    }
  },
  { connection }
);

// Worker para importación de proveedores
const providerImportWorker = new Worker(
  'provider-import',
  async (job) => {
    logger.info(`🏢 Importando proveedores: ${job.name} (ID: ${job.id})`);
    const { filePath, userId, totalRows } = job.data;

    try {
      // Aquí iría la lógica de importación masiva
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      logger.info(`✅ Proveedores importados: ${totalRows} registros`);
      return { 
        success: true, 
        imported: totalRows,
        processedAt: new Date().toISOString() 
      };
    } catch (error) {
      logger.error(`❌ Error importando proveedores: ${error.message}`);
      throw error;
    }
  },
  { connection }
);

// Worker para búsquedas
const searchWorker = new Worker(
  'search-processing',
  async (job) => {
    logger.info(`🔍 Procesando búsqueda: ${job.name} (ID: ${job.id})`);
    const { searchTerm, searchType, userId } = job.data;

    try {
      // Aquí iría la lógica de búsqueda con SerpAPI
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      logger.info(`✅ Búsqueda completada: ${searchTerm}`);
      return { 
        success: true, 
        searchTerm,
        results: [],
        processedAt: new Date().toISOString() 
      };
    } catch (error) {
      logger.error(`❌ Error en búsqueda ${searchTerm}: ${error.message}`);
      throw error;
    }
  },
  { connection }
);

// ==================== EVENTOS DE WORKERS ====================

// Eventos para PDF Worker
pdfWorker.on('completed', (job) => {
  logger.info(`✅ Job PDF completado: ${job.id}`);
});

pdfWorker.on('failed', (job, err) => {
  logger.error(`❌ Job PDF falló: ${job.id} - ${err.message}`);
});

// Eventos para Excel Worker
excelWorker.on('completed', (job) => {
  logger.info(`✅ Job Excel completado: ${job.id}`);
});

excelWorker.on('failed', (job, err) => {
  logger.error(`❌ Job Excel falló: ${job.id} - ${err.message}`);
});

// Eventos para Provider Import Worker
providerImportWorker.on('completed', (job) => {
  logger.info(`✅ Job importación completado: ${job.id}`);
});

providerImportWorker.on('failed', (job, err) => {
  logger.error(`❌ Job importación falló: ${job.id} - ${err.message}`);
});

// Eventos para Search Worker
searchWorker.on('completed', (job) => {
  logger.info(`✅ Job búsqueda completado: ${job.id}`);
});

searchWorker.on('failed', (job, err) => {
  logger.error(`❌ Job búsqueda falló: ${job.id} - ${err.message}`);
});

// ==================== FUNCIONES HELPER ====================

/**
 * Agregar job para procesar PDF
 */
async function addPdfJob(data, options = {}) {
  try {
    const job = await pdfQueue.add('process-pdf', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      ...options,
    });
    logger.info(`📄 Job PDF agregado: ${job.id}`);
    return job;
  } catch (error) {
    logger.error(`Error agregando job PDF: ${error.message}`);
    throw error;
  }
}

/**
 * Agregar job para procesar Excel
 */
async function addExcelJob(data, options = {}) {
  try {
    const job = await excelQueue.add('process-excel', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      ...options,
    });
    logger.info(`📊 Job Excel agregado: ${job.id}`);
    return job;
  } catch (error) {
    logger.error(`Error agregando job Excel: ${error.message}`);
    throw error;
  }
}

/**
 * Agregar job para importar proveedores
 */
async function addProviderImportJob(data, options = {}) {
  try {
    const job = await providerImportQueue.add('import-providers', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      ...options,
    });
    logger.info(`🏢 Job importación agregado: ${job.id}`);
    return job;
  } catch (error) {
    logger.error(`Error agregando job importación: ${error.message}`);
    throw error;
  }
}

/**
 * Agregar job para búsqueda
 */
async function addSearchJob(data, options = {}) {
  try {
    const job = await searchQueue.add('process-search', data, {
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      ...options,
    });
    logger.info(`🔍 Job búsqueda agregado: ${job.id}`);
    return job;
  } catch (error) {
    logger.error(`Error agregando job búsqueda: ${error.message}`);
    throw error;
  }
}

/**
 * Obtener estado de un job
 */
async function getJobStatus(queue, jobId) {
  try {
    const job = await queue.getJob(jobId);
    if (!job) return null;

    const state = await job.getState();
    return {
      id: job.id,
      name: job.name,
      state,
      progress: job.progress,
      data: job.data,
      returnvalue: job.returnvalue,
      timestamp: job.timestamp,
    };
  } catch (error) {
    logger.error(`Error obteniendo estado del job: ${error.message}`);
    return null;
  }
}

module.exports = {
  // Colas
  pdfQueue,
  excelQueue,
  providerImportQueue,
  searchQueue,
  
  // Workers (exportados para poder cerrarlos si es necesario)
  pdfWorker,
  excelWorker,
  providerImportWorker,
  searchWorker,
  
  // Funciones helper
  addPdfJob,
  addExcelJob,
  addProviderImportJob,
  addSearchJob,
  getJobStatus,
};
