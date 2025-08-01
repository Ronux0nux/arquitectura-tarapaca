// Datos de ejemplo para mostrar cuando no hay conexión al backend
export const sampleCSVProviders = [
  {
    id: "1001",
    fullName: "JUAN CARLOS RODRIGUEZ LOPEZ",
    firstName: "JUAN CARLOS",
    lastName: "RODRIGUEZ",
    secondLastName: "LOPEZ",
    rut: "12.345.678-9",
    profession: "Arquitecto",
    date: "2025-07-15",
    fileName: "Proveedores_Pag001_Tabla1.csv",
    source: "CSV_Import",
    importDate: "2025-08-01T15:30:00.000Z"
  },
  {
    id: "1002",
    fullName: "MARIA TERESA GONZALEZ SILVA",
    firstName: "MARIA TERESA",
    lastName: "GONZALEZ",
    secondLastName: "SILVA",
    rut: "15.678.912-3",
    profession: "Ingeniero Civil",
    date: "2025-07-20",
    fileName: "Proveedores_Pag001_Tabla1.csv",
    source: "CSV_Import",
    importDate: "2025-08-01T15:30:00.000Z"
  },
  {
    id: "1003",
    fullName: "PEDRO ANTONIO MARTINEZ FERNANDEZ",
    firstName: "PEDRO ANTONIO",
    lastName: "MARTINEZ",
    secondLastName: "FERNANDEZ",
    rut: "18.456.789-1",
    profession: "Constructor Civil",
    date: "2025-07-25",
    fileName: "Proveedores_Pag002_Tabla1.csv",
    source: "CSV_Import",
    importDate: "2025-08-01T15:30:00.000Z"
  },
  {
    id: "1004",
    fullName: "ANA LUCIA TORRES MORALES",
    firstName: "ANA LUCIA",
    lastName: "TORRES",
    secondLastName: "MORALES",
    rut: "14.123.456-7",
    profession: "Arquitecto Paisajista",
    date: "2025-07-10",
    fileName: "Proveedores_Pag002_Tabla1.csv",
    source: "CSV_Import",
    importDate: "2025-08-01T15:30:00.000Z"
  },
  {
    id: "1005",
    fullName: "CARLOS EDUARDO HERRERA CASTRO",
    firstName: "CARLOS EDUARDO",
    lastName: "HERRERA",
    secondLastName: "CASTRO",
    rut: "16.789.123-4",
    profession: "Ingeniero en Construcción",
    date: "2025-07-30",
    fileName: "Proveedores_Pag003_Tabla1.csv",
    source: "CSV_Import",
    importDate: "2025-08-01T15:30:00.000Z"
  },
  {
    id: "1006",
    fullName: "SOFIA ALEJANDRA RUIZ MENDOZA",
    firstName: "SOFIA ALEJANDRA",
    lastName: "RUIZ",
    secondLastName: "MENDOZA",
    rut: "13.987.654-2",
    profession: "Diseñadora de Interiores",
    date: "2025-07-05",
    fileName: "Proveedores_Pag003_Tabla1.csv",
    source: "CSV_Import",
    importDate: "2025-08-01T15:30:00.000Z"
  },
  {
    id: "1007",
    fullName: "ROBERTO MIGUEL VARGAS JIMENEZ",
    firstName: "ROBERTO MIGUEL",
    lastName: "VARGAS",
    secondLastName: "JIMENEZ",
    rut: "17.234.567-8",
    profession: "Maestro Construcción",
    date: "2025-07-12",
    fileName: "Proveedores_Pag004_Tabla1.csv",
    source: "CSV_Import",
    importDate: "2025-08-01T15:30:00.000Z"
  },
  {
    id: "1008",
    fullName: "CARMEN ROSA DELGADO PEÑA",
    firstName: "CARMEN ROSA",
    lastName: "DELGADO",
    secondLastName: "PEÑA",
    rut: "19.345.678-9",
    profession: "Topógrafa",
    date: "2025-07-18",
    fileName: "Proveedores_Pag004_Tabla1.csv",
    source: "CSV_Import",
    importDate: "2025-08-01T15:30:00.000Z"
  },
  {
    id: "1009",
    fullName: "FERNANDO JOSE MORENO ORTIZ",
    firstName: "FERNANDO JOSE",
    lastName: "MORENO",
    secondLastName: "ORTIZ",
    rut: "11.567.890-1",
    profession: "Electricista",
    date: "2025-07-22",
    fileName: "Proveedores_Pag005_Tabla1.csv",
    source: "CSV_Import",
    importDate: "2025-08-01T15:30:00.000Z"
  },
  {
    id: "1010",
    fullName: "VALENTINA ISABEL CAMPOS RIVERA",
    firstName: "VALENTINA ISABEL",
    lastName: "CAMPOS",
    secondLastName: "RIVERA",
    rut: "20.123.456-7",
    profession: "Ingeniero Estructural",
    date: "2025-07-28",
    fileName: "Proveedores_Pag005_Tabla1.csv",
    source: "CSV_Import",
    importDate: "2025-08-01T15:30:00.000Z"
  }
];

export const sampleStats = {
  total: 10,
  conRUT: 10,
  conProfesion: 10,
  conFecha: 10,
  porcentajeCompletos: 100,
  metadata: {
    totalFiles: 5,
    processedFiles: 5,
    totalProviders: 10,
    uniqueProviders: 10,
    duplicatesRemoved: 0
  }
};

export const sampleFileStats = {
  totalFiles: 5,
  totalRecords: 10,
  folderPath: "/path/to/cotizaciones manual/resultados",
  files: [
    {
      fileName: "Proveedores_Pag001_Tabla1.csv",
      size: 1024,
      records: 2,
      lastModified: "2025-07-30T10:00:00.000Z"
    },
    {
      fileName: "Proveedores_Pag002_Tabla1.csv", 
      size: 1024,
      records: 2,
      lastModified: "2025-07-30T10:00:00.000Z"
    },
    {
      fileName: "Proveedores_Pag003_Tabla1.csv",
      size: 1024, 
      records: 2,
      lastModified: "2025-07-30T10:00:00.000Z"
    },
    {
      fileName: "Proveedores_Pag004_Tabla1.csv",
      size: 1024,
      records: 2, 
      lastModified: "2025-07-30T10:00:00.000Z"
    },
    {
      fileName: "Proveedores_Pag005_Tabla1.csv",
      size: 1024,
      records: 2,
      lastModified: "2025-07-30T10:00:00.000Z"
    }
  ]
};
