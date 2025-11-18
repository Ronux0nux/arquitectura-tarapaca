const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear directorio de uploads si no existe
const uploadsDir = path.join(__dirname, '../../uploads/projects');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const projectId = req.params.id;
    const projectDir = path.join(uploadsDir, projectId.toString());
    
    // Crear directorio del proyecto si no existe
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }
    
    cb(null, projectDir);
  },
  filename: function (req, file, cb) {
    // Generar nombre único: timestamp-nombreoriginal
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, safeName + '-' + uniqueSuffix + ext);
  }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  // Extensiones permitidas
  const allowedExtensions = [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx',
    '.jpg', '.jpeg', '.png', '.gif',
    '.zip', '.rar', '.7z',
    '.txt', '.csv',
    '.dwg', '.dxf' // Planos CAD
  ];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${ext}. Permitidos: ${allowedExtensions.join(', ')}`));
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB máximo
  }
});

module.exports = upload;
