// ============================================================
//  MARACAIBO SWIMMING CLUB — Google Apps Script
//  Sistema de Gestión Completo
//  Versión 1.0
// ============================================================
//
//  INSTRUCCIONES DE INSTALACIÓN:
//  1. Abre Google Sheets → Extensiones → Apps Script
//  2. Borra el código existente y pega TODO este archivo
//  3. Guarda (Ctrl+S) con nombre "MSC Sistema"
//  4. Ejecuta setupSheets() una sola vez para crear todas las hojas
//  5. Ve a Implementar → Nueva implementación → Aplicación web
//     - Ejecutar como: Yo
//     - Quién tiene acceso: Cualquier usuario
//  6. Copia la URL y pégala en el HTML del chatbot
//  7. Listo!
// ============================================================

const SS = SpreadsheetApp.getActiveSpreadsheet();

// ── NOMBRES DE HOJAS ────────────────────────────────────────
const HOJA_ALUMNOS    = "Alumnos";
const HOJA_PAGOS      = "Pagos";
const HOJA_LEADS      = "Leads Chatbot";
const HOJA_HORARIOS   = "Horarios";
const HOJA_CONFIG     = "Configuración";

// ── COLORES MSC ─────────────────────────────────────────────
const COLOR_NAVY      = "#031d3a";
const COLOR_BLUE      = "#0057a8";
const COLOR_CYAN      = "#00b4d8";
const COLOR_GOLD      = "#f4b942";
const COLOR_GREEN     = "#22c55e";
const COLOR_RED       = "#ef4444";
const COLOR_YELLOW    = "#f59e0b";
const COLOR_WHITE     = "#ffffff";
const COLOR_LIGHT     = "#e8f4fd";

// ============================================================
//  1. SETUP — CREAR TODAS LAS HOJAS
// ============================================================
function setupSheets() {
  setupHojaAlumnos();
  setupHojaPagos();
  setupHojaLeads();
  setupHojaHorarios();
  setupHojaConfig();
  SpreadsheetApp.getUi().alert("✅ Sistema MSC instalado correctamente.\n\nHojas creadas:\n• Alumnos\n• Pagos\n• Leads Chatbot\n• Horarios\n• Configuración\n\nAhora configura tu información en la hoja 'Configuración'.");
}

function getOrCreateSheet(name) {
  let sheet = SS.getSheetByName(name);
  if (!sheet) sheet = SS.insertSheet(name);
  else sheet.clear();
  return sheet;
}

function setupHojaAlumnos() {
  const s = getOrCreateSheet(HOJA_ALUMNOS);
  const headers = [
    "ID", "Nombre Completo", "Edad", "Fecha Nacimiento",
    "Teléfono", "WhatsApp", "Email", "Nombre Representante",
    "Teléfono Representante", "Programa", "Nivel",
    "Modalidad", "Horario", "Fecha Inscripción",
    "Estado", "Monto Mensualidad", "Observaciones"
  ];
  s.getRange(1, 1, 1, headers.length).setValues([headers]);
  styleHeader(s, headers.length, COLOR_NAVY, COLOR_GOLD);
  s.setFrozenRows(1);
  s.setColumnWidth(1, 60);
  s.setColumnWidth(2, 200);
  s.setColumnWidth(3, 60);
  s.setColumnWidth(14, 130);
  s.setColumnWidth(15, 90);
  s.setColumnWidth(17, 250);

  // Validación Estado
  const estadoRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Activo", "Inactivo", "Suspendido", "Prueba"], true).build();
  s.getRange("O2:O1000").setDataValidation(estadoRule);

  // Validación Programa
  const progRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Bebés y Mamás", "Infantil", "Juvenil", "Competición", "Adultos"], true).build();
  s.getRange("J2:J1000").setDataValidation(progRule);

  // Validación Modalidad
  const modRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Piscina", "Domicilio"], true).build();
  s.getRange("L2:L1000").setDataValidation(modRule);

  // Formato condicional — Estado
  applyConditionalFormat(s, "O2:O1000", "Activo",   COLOR_GREEN,  COLOR_WHITE);
  applyConditionalFormat(s, "O2:O1000", "Inactivo", COLOR_RED,    COLOR_WHITE);
  applyConditionalFormat(s, "O2:O1000", "Prueba",   COLOR_YELLOW, COLOR_NAVY);
}

function setupHojaPagos() {
  const s = getOrCreateSheet(HOJA_PAGOS);
  const headers = [
    "ID Pago", "ID Alumno", "Nombre Alumno", "Mes", "Año",
    "Monto", "Fecha Pago", "Método Pago", "Estado Pago",
    "Comprobante", "Registrado Por", "Observaciones"
  ];
  s.getRange(1, 1, 1, headers.length).setValues([headers]);
  styleHeader(s, headers.length, COLOR_BLUE, COLOR_WHITE);
  s.setFrozenRows(1);
  s.setColumnWidth(3, 200);

  const estadoPagoRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Pagado", "Pendiente", "Vencido", "Exonerado"], true).build();
  s.getRange("I2:I1000").setDataValidation(estadoPagoRule);

  const metodoPagoRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Transferencia", "Efectivo USD", "Efectivo Bs", "Zelle", "Pago Móvil", "Otro"], true).build();
  s.getRange("H2:H1000").setDataValidation(metodoPagoRule);

  applyConditionalFormat(s, "I2:I1000", "Pagado",    COLOR_GREEN,  COLOR_WHITE);
  applyConditionalFormat(s, "I2:I1000", "Pendiente", COLOR_YELLOW, COLOR_NAVY);
  applyConditionalFormat(s, "I2:I1000", "Vencido",   COLOR_RED,    COLOR_WHITE);
}

function setupHojaLeads() {
  const s = getOrCreateSheet(HOJA_LEADS);
  const headers = [
    "Timestamp", "Nombre", "Edad", "Teléfono",
    "Programa", "Modalidad", "Horario Preferido",
    "Fuente", "Estado Lead", "Fecha Seguimiento", "Notas"
  ];
  s.getRange(1, 1, 1, headers.length).setValues([headers]);
  styleHeader(s, headers.length, COLOR_CYAN, COLOR_NAVY);
  s.setFrozenRows(1);
  s.setColumnWidth(1, 160);
  s.setColumnWidth(2, 180);

  const estadoLeadRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Nuevo", "Contactado", "Inscrito", "No interesado"], true).build();
  s.getRange("I2:I1000").setDataValidation(estadoLeadRule);
}

function setupHojaHorarios() {
  const s = getOrCreateSheet(HOJA_HORARIOS);
  const headers = ["Horario", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  s.getRange(1, 1, 1, headers.length).setValues([headers]);
  styleHeader(s, headers.length, COLOR_NAVY, COLOR_CYAN);

  const horarios = [
    ["6:00 AM - 7:00 AM"],["7:00 AM - 8:00 AM"],["8:00 AM - 9:00 AM"],
    ["9:00 AM - 10:00 AM"],["4:00 PM - 5:00 PM"],["5:00 PM - 6:00 PM"],
    ["6:00 PM - 7:00 PM"],["7:00 PM - 8:00 PM"]
  ];
  s.getRange(2, 1, horarios.length, 1).setValues(horarios);
  s.setFrozenRows(1);
  s.setFrozenColumns(1);
}

function setupHojaConfig() {
  const s = getOrCreateSheet(HOJA_CONFIG);
  const config = [
    ["CONFIGURACIÓN MSC", ""],
    ["", ""],
    ["Club", "Maracaibo Swimming Club"],
    ["Teléfono", "0414-6004468"],
    ["Instagram", "@mcboswimclub"],
    ["Email", "tu@email.com"],
    ["Dirección", "Calle 67, entre Av 2A y 2C, CIDEZ, Maracaibo"],
    ["", ""],
    ["MENSUALIDADES", ""],
    ["Bebés y Mamás", 50],
    ["Infantil", 60],
    ["Juvenil", 65],
    ["Competición", 70],
    ["Adultos", 55],
    ["Recargo Domicilio (%)", 20],
    ["", ""],
    ["RECORDATORIOS", ""],
    ["Día recordatorio 1", 10],
    ["Día recordatorio 2", 25],
    ["Email recordatorio activado", "SI"],
    ["WhatsApp recordatorio activado", "SI"],
  ];
  s.getRange(1, 1, config.length, 2).setValues(config);
  s.getRange(1, 1, 1, 2).merge()
    .setValue("⚙️ CONFIGURACIÓN MARACAIBO SWIMMING CLUB")
    .setBackground(COLOR_NAVY).setFontColor(COLOR_GOLD)
    .setFontWeight("bold").setFontSize(14).setHorizontalAlignment("center");
  s.getRange("A9").setBackground(COLOR_BLUE).setFontColor(COLOR_WHITE).setFontWeight("bold");
  s.getRange("A17").setBackground(COLOR_BLUE).setFontColor(COLOR_WHITE).setFontWeight("bold");
  s.setColumnWidth(1, 250);
  s.setColumnWidth(2, 300);
}

// ============================================================
//  2. RECIBIR DATOS DEL CHATBOT (POST)
// ============================================================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SS.getSheetByName(HOJA_LEADS);
    const now = new Date();

    const row = [
      Utilities.formatDate(now, "America/Caracas", "dd/MM/yyyy HH:mm"),
      data.nombre    || "",
      data.edad      || "",
      data.telefono  || "",
      data.programa  || "",
      data.modalidad || "",
      data.horario   || "",
      data.fuente    || "Chatbot Web",
      "Nuevo",
      "",
      ""
    ];
    sheet.appendRow(row);

    // Color amarillo para leads nuevos
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1, 1, row.length)
      .setBackground("#fef9c3");

    return ContentService
      .createTextOutput(JSON.stringify({status: "ok", message: "Lead registrado"}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({status: "error", message: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({status: "ok", message: "MSC API activa"}))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
//  3. REGISTRAR ALUMNO MANUALMENTE
// ============================================================
function registrarAlumno(datos) {
  const sheet = SS.getSheetByName(HOJA_ALUMNOS);
  const lastRow = sheet.getLastRow();
  const newId = "MSC-" + String(lastRow).padStart(4, "0");
  const now = Utilities.formatDate(new Date(), "America/Caracas", "dd/MM/yyyy");

  const row = [
    newId,
    datos.nombre || "",
    datos.edad || "",
    datos.fechaNacimiento || "",
    datos.telefono || "",
    datos.whatsapp || datos.telefono || "",
    datos.email || "",
    datos.representante || "",
    datos.telefonoRep || "",
    datos.programa || "",
    datos.nivel || "Principiante",
    datos.modalidad || "Piscina",
    datos.horario || "",
    now,
    "Activo",
    datos.monto || "",
    datos.observaciones || ""
  ];
  sheet.appendRow(row);

  // Generar pago del mes actual
  generarPagoMes(newId, datos.nombre, datos.monto);
  return newId;
}

// ============================================================
//  4. CONTROL DE PAGOS
// ============================================================
function generarPagoMes(idAlumno, nombre, monto) {
  const sheet = SS.getSheetByName(HOJA_PAGOS);
  const now = new Date();
  const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
                  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const lastRow = sheet.getLastRow();
  const idPago = "PAG-" + String(lastRow).padStart(5, "0");

  sheet.appendRow([
    idPago, idAlumno, nombre,
    meses[now.getMonth()], now.getFullYear(),
    monto, "", "", "Pendiente", "", "", ""
  ]);
}

function generarPagosMensuales() {
  // Genera pagos pendientes para todos los alumnos activos al inicio de cada mes
  const alumnos = SS.getSheetByName(HOJA_ALUMNOS);
  const pagos   = SS.getSheetByName(HOJA_PAGOS);
  const data    = alumnos.getDataRange().getValues();
  const meses   = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
                    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const now     = new Date();
  const mesActual = meses[now.getMonth()];
  const anioActual = now.getFullYear();

  // Obtener pagos ya registrados este mes
  const pagosData = pagos.getDataRange().getValues();
  const clavesPagos = new Set(pagosData.slice(1).map(r => `${r[1]}-${r[3]}-${r[4]}`));

  let generados = 0;
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    const idAlumno = row[0];
    const estado   = row[14];
    const monto    = row[15];
    const nombre   = row[1];
    const clave    = `${idAlumno}-${mesActual}-${anioActual}`;

    if (estado === "Activo" && !clavesPagos.has(clave)) {
      const lastRow = pagos.getLastRow();
      const idPago  = "PAG-" + String(lastRow).padStart(5, "0");
      pagos.appendRow([idPago, idAlumno, nombre, mesActual, anioActual, monto, "", "", "Pendiente", "", "", ""]);
      generados++;
    }
  }
  SpreadsheetApp.getUi().alert(`✅ Se generaron ${generados} registros de pago para ${mesActual} ${anioActual}.`);
}

// ============================================================
//  5. RECORDATORIOS DE PAGO (días 10 y 25)
// ============================================================
function verificarRecordatorio() {
  const hoy = new Date().getDate();
  const config = SS.getSheetByName(HOJA_CONFIG).getDataRange().getValues();
  let dia1 = 10, dia2 = 25;

  config.forEach(row => {
    if (row[0] === "Día recordatorio 1") dia1 = parseInt(row[1]);
    if (row[0] === "Día recordatorio 2") dia2 = parseInt(row[1]);
  });

  if (hoy === dia1 || hoy === dia2) {
    enviarRecordatoriosPago();
  }
}

function enviarRecordatoriosPago() {
  const pagos   = SS.getSheetByName(HOJA_PAGOS).getDataRange().getValues();
  const alumnos = SS.getSheetByName(HOJA_ALUMNOS).getDataRange().getValues();
  const meses   = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
                    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const now     = new Date();
  const mesActual  = meses[now.getMonth()];
  const anioActual = now.getFullYear();

  // Mapa de alumnos por ID
  const alumnosMap = {};
  alumnos.slice(1).forEach(row => {
    if (row[0]) alumnosMap[row[0]] = { nombre: row[1], email: row[6], tel: row[5] };
  });

  // Buscar pagos pendientes del mes
  const pendientes = pagos.slice(1).filter(row =>
    row[3] === mesActual && row[4] === anioActual && row[8] === "Pendiente"
  );

  if (pendientes.length === 0) {
    Logger.log("No hay pagos pendientes para recordar.");
    return;
  }

  // Crear resumen para el administrador
  let resumen = `📋 RECORDATORIO DE PAGOS - ${mesActual} ${anioActual}\n`;
  resumen += `Fecha: ${Utilities.formatDate(now, "America/Caracas", "dd/MM/yyyy")}\n\n`;
  resumen += `Alumnos con pago pendiente (${pendientes.length}):\n\n`;

  pendientes.forEach((pago, i) => {
    const alumno = alumnosMap[pago[1]] || {};
    resumen += `${i+1}. ${pago[2]}\n`;
    resumen += `   Monto: $${pago[5]} | Tel: ${alumno.tel || "N/A"}\n\n`;
  });

  // Enviar email al administrador
  const configSheet = SS.getSheetByName(HOJA_CONFIG).getDataRange().getValues();
  let emailAdmin = "";
  configSheet.forEach(row => { if (row[0] === "Email") emailAdmin = row[1]; });

  if (emailAdmin) {
    MailApp.sendEmail({
      to: emailAdmin,
      subject: `🏊 MSC — ${pendientes.length} pagos pendientes — ${mesActual} ${anioActual}`,
      body: resumen
    });
    Logger.log(`Email de recordatorio enviado a ${emailAdmin}`);
  }

  // Enviar emails individuales a alumnos que tengan email
  pendientes.forEach(pago => {
    const alumno = alumnosMap[pago[1]];
    if (alumno && alumno.email) {
      try {
        MailApp.sendEmail({
          to: alumno.email,
          subject: "🏊 Maracaibo Swimming Club — Recordatorio de pago",
          body: `Hola ${alumno.nombre},\n\nTe recordamos que tu mensualidad de ${mesActual} ${anioActual} por $${pago[5]} está pendiente de pago.\n\nPara cancelar contacta al:\n📱 WhatsApp: 0414-6004468\n📸 Instagram: @mcboswimclub\n\n¡Gracias por ser parte de la familia MSC! 🏊\n\nMaracaibo Swimming Club`
        });
      } catch(e) {
        Logger.log("Error enviando email a " + alumno.email + ": " + e);
      }
    }
  });

  Logger.log(`Recordatorio enviado: ${pendientes.length} pagos pendientes`);
}

// ============================================================
//  6. LISTA DE PARTICIPANTES ACTIVOS
// ============================================================
function generarListaActivos() {
  const alumnos = SS.getSheetByName(HOJA_ALUMNOS).getDataRange().getValues();
  const pagos   = SS.getSheetByName(HOJA_PAGOS).getDataRange().getValues();
  const meses   = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
                    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const now     = new Date();
  const mesActual  = meses[now.getMonth()];
  const anioActual = now.getFullYear();

  // IDs con pago al día este mes
  const pagados = new Set(
    pagos.slice(1)
      .filter(r => r[3] === mesActual && r[4] === anioActual && r[8] === "Pagado")
      .map(r => r[1])
  );

  // Filtrar activos
  const activos = alumnos.slice(1).filter(r => r[0] && r[14] === "Activo");

  // Crear o limpiar hoja de reporte
  let reportSheet = SS.getSheetByName("Lista Activos");
  if (!reportSheet) reportSheet = SS.insertSheet("Lista Activos");
  else reportSheet.clear();

  // Título
  reportSheet.getRange(1, 1, 1, 7).merge()
    .setValue(`🏊 LISTA DE ALUMNOS ACTIVOS — ${mesActual.toUpperCase()} ${anioActual}`)
    .setBackground(COLOR_NAVY).setFontColor(COLOR_GOLD)
    .setFontWeight("bold").setFontSize(14).setHorizontalAlignment("center");

  reportSheet.getRange(2, 1, 1, 7)
    .setValues([[`Generado: ${Utilities.formatDate(now, "America/Caracas", "dd/MM/yyyy HH:mm")} | Total activos: ${activos.length}`, "", "", "", "", "", ""]])
    .merge().setBackground(COLOR_BLUE).setFontColor(COLOR_WHITE)
    .setHorizontalAlignment("center").setFontSize(10);

  // Headers
  const headers = ["ID", "Nombre", "Programa", "Nivel", "Horario", "Modalidad", "Pago " + mesActual];
  reportSheet.getRange(3, 1, 1, 7).setValues([headers]);
  styleHeader(reportSheet, 7, COLOR_CYAN, COLOR_NAVY, 3);

  // Datos por horario (ordenado)
  activos.sort((a, b) => (a[12] || "").localeCompare(b[12] || ""));

  let currentRow = 4;
  activos.forEach((row, i) => {
    const estadoPago = pagados.has(row[0]) ? "✅ Pagado" : "⚠️ Pendiente";
    const bgColor = (i % 2 === 0) ? COLOR_LIGHT : COLOR_WHITE;
    const pagoColor = pagados.has(row[0]) ? "#dcfce7" : "#fef9c3";

    reportSheet.getRange(currentRow, 1, 1, 7).setValues([[
      row[0], row[1], row[9], row[10], row[12], row[11], estadoPago
    ]]).setBackground(bgColor);

    reportSheet.getRange(currentRow, 7).setBackground(pagoColor);
    currentRow++;
  });

  // Totales
  reportSheet.getRange(currentRow + 1, 1, 1, 7).merge()
    .setValue(`Total alumnos activos: ${activos.length} | Con pago al día: ${pagados.size} | Pendientes: ${activos.length - pagados.size}`)
    .setBackground(COLOR_NAVY).setFontColor(COLOR_GOLD)
    .setFontWeight("bold").setHorizontalAlignment("center");

  // Formato columnas
  reportSheet.setColumnWidth(1, 90);
  reportSheet.setColumnWidth(2, 200);
  reportSheet.setColumnWidth(3, 130);
  reportSheet.setColumnWidth(4, 110);
  reportSheet.setColumnWidth(5, 150);
  reportSheet.setColumnWidth(6, 100);
  reportSheet.setColumnWidth(7, 110);
  reportSheet.setFrozenRows(3);

  SS.setActiveSheet(reportSheet);
  SpreadsheetApp.getUi().alert(`✅ Lista generada: ${activos.length} alumnos activos.\nVe a la hoja "Lista Activos" para verla.`);
}

// ============================================================
//  7. REPORTE DE MOROSOS
// ============================================================
function generarReporteMorosos() {
  const alumnos = SS.getSheetByName(HOJA_ALUMNOS).getDataRange().getValues();
  const pagos   = SS.getSheetByName(HOJA_PAGOS).getDataRange().getValues();
  const meses   = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
                    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const now     = new Date();
  const mesActual  = meses[now.getMonth()];
  const anioActual = now.getFullYear();

  const pagados = new Set(
    pagos.slice(1)
      .filter(r => r[3] === mesActual && r[4] === anioActual && r[8] === "Pagado")
      .map(r => r[1])
  );

  const morosos = alumnos.slice(1).filter(r => r[0] && r[14] === "Activo" && !pagados.has(r[0]));

  let reportSheet = SS.getSheetByName("Morosos");
  if (!reportSheet) reportSheet = SS.insertSheet("Morosos");
  else reportSheet.clear();

  reportSheet.getRange(1, 1, 1, 6).merge()
    .setValue(`⚠️ ALUMNOS CON PAGO PENDIENTE — ${mesActual.toUpperCase()} ${anioActual}`)
    .setBackground(COLOR_RED).setFontColor(COLOR_WHITE)
    .setFontWeight("bold").setFontSize(13).setHorizontalAlignment("center");

  const headers = ["ID", "Nombre", "Teléfono/WhatsApp", "Programa", "Horario", "Monto Pendiente"];
  reportSheet.getRange(2, 1, 1, 6).setValues([headers]);
  styleHeader(reportSheet, 6, "#991b1b", COLOR_WHITE, 2);

  morosos.forEach((row, i) => {
    reportSheet.getRange(i + 3, 1, 1, 6).setValues([[
      row[0], row[1], row[5] || row[4], row[9], row[12], "$" + row[15]
    ]]).setBackground(i % 2 === 0 ? "#fef2f2" : COLOR_WHITE);
  });

  reportSheet.setColumnWidth(2, 200);
  reportSheet.setColumnWidth(3, 160);

  SS.setActiveSheet(reportSheet);
  SpreadsheetApp.getUi().alert(`⚠️ ${morosos.length} alumnos con pago pendiente este mes.\nVe a la hoja "Morosos".`);
}

// ============================================================
//  8. DASHBOARD RESUMEN
// ============================================================
function generarDashboard() {
  const alumnos = SS.getSheetByName(HOJA_ALUMNOS).getDataRange().getValues();
  const pagos   = SS.getSheetByName(HOJA_PAGOS).getDataRange().getValues();
  const leads   = SS.getSheetByName(HOJA_LEADS).getDataRange().getValues();
  const meses   = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
                    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const now     = new Date();
  const mesActual  = meses[now.getMonth()];
  const anioActual = now.getFullYear();

  const activos   = alumnos.slice(1).filter(r => r[14] === "Activo").length;
  const inactivos = alumnos.slice(1).filter(r => r[14] === "Inactivo").length;
  const prueba    = alumnos.slice(1).filter(r => r[14] === "Prueba").length;

  const pagosMes  = pagos.slice(1).filter(r => r[3] === mesActual && r[4] === anioActual);
  const pagados   = pagosMes.filter(r => r[8] === "Pagado").length;
  const pendientes= pagosMes.filter(r => r[8] === "Pendiente").length;
  const ingresosMes = pagosMes.filter(r => r[8] === "Pagado").reduce((sum, r) => sum + (parseFloat(r[5]) || 0), 0);

  const leadsNuevos = leads.slice(1).filter(r => r[8] === "Nuevo").length;

  let dash = SS.getSheetByName("Dashboard");
  if (!dash) dash = SS.insertSheet("Dashboard", 0);
  else dash.clear();

  dash.getRange(1, 1, 1, 4).merge()
    .setValue("🏊 MARACAIBO SWIMMING CLUB — DASHBOARD")
    .setBackground(COLOR_NAVY).setFontColor(COLOR_GOLD)
    .setFontSize(16).setFontWeight("bold").setHorizontalAlignment("center");

  dash.getRange(2, 1, 1, 4).merge()
    .setValue(`${mesActual} ${anioActual} | Actualizado: ${Utilities.formatDate(now, "America/Caracas", "dd/MM/yyyy HH:mm")}`)
    .setBackground(COLOR_BLUE).setFontColor(COLOR_WHITE)
    .setHorizontalAlignment("center").setFontSize(10);

  const stats = [
    ["", ""],
    ["👥 ALUMNOS", ""],
    ["Total Activos",   activos],
    ["En Prueba",       prueba],
    ["Inactivos",       inactivos],
    ["TOTAL",          activos + inactivos + prueba],
    ["", ""],
    [`💰 PAGOS — ${mesActual}`, ""],
    ["Pagados",         pagados],
    ["Pendientes",      pendientes],
    [`Ingresos del Mes`, `$${ingresosMes.toFixed(2)}`],
    ["", ""],
    ["📥 LEADS CHATBOT", ""],
    ["Nuevos sin contactar", leadsNuevos],
  ];

  stats.forEach((row, i) => {
    const r = dash.getRange(i + 4, 1, 1, 2);
    r.setValues([row]);
    if (row[0].includes("ALUMNOS") || row[0].includes("PAGOS") || row[0].includes("LEADS")) {
      r.merge().setBackground(COLOR_BLUE).setFontColor(COLOR_WHITE).setFontWeight("bold");
    } else if (row[0] === "TOTAL" || row[0].includes("Ingresos")) {
      r.setBackground(COLOR_GOLD).setFontWeight("bold");
    }
  });

  dash.setColumnWidth(1, 220);
  dash.setColumnWidth(2, 150);
  SS.setActiveSheet(dash);
}

// ============================================================
//  9. MENÚ PERSONALIZADO
// ============================================================
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("🏊 MSC Sistema")
    .addItem("📊 Dashboard", "generarDashboard")
    .addSeparator()
    .addItem("👥 Lista Alumnos Activos + Pagos", "generarListaActivos")
    .addItem("⚠️ Reporte Morosos", "generarReporteMorosos")
    .addSeparator()
    .addItem("💰 Generar Pagos del Mes", "generarPagosMensuales")
    .addItem("📧 Enviar Recordatorios Ahora", "enviarRecordatoriosPago")
    .addSeparator()
    .addItem("⚙️ Instalar Sistema (primera vez)", "setupSheets")
    .addToUi();
}

// ============================================================
//  10. TRIGGERS AUTOMÁTICOS
// ============================================================
function instalarTriggers() {
  // Eliminar triggers existentes
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));

  // Trigger diario para verificar si es día 10 o 25
  ScriptApp.newTrigger("verificarRecordatorio")
    .timeBased().everyDays(1).atHour(8).create();

  // Trigger mensual para generar pagos (día 1 de cada mes)
  ScriptApp.newTrigger("generarPagosMensuales")
    .timeBased().onMonthDay(1).atHour(7).create();

  SpreadsheetApp.getUi().alert("✅ Triggers instalados:\n\n• Recordatorio diario a las 8am (activo los días 10 y 25)\n• Generación automática de pagos el día 1 de cada mes");
}

// ============================================================
//  UTILIDADES
// ============================================================
function styleHeader(sheet, numCols, bgColor, fontColor, row = 1) {
  sheet.getRange(row, 1, 1, numCols)
    .setBackground(bgColor)
    .setFontColor(fontColor)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setBorder(true, true, true, true, true, true);
}

function applyConditionalFormat(sheet, range, value, bgColor, fontColor) {
  const rule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo(value)
    .setBackground(bgColor)
    .setFontColor(fontColor)
    .setRanges([sheet.getRange(range)])
    .build();
  const rules = sheet.getConditionalFormatRules();
  rules.push(rule);
  sheet.setConditionalFormatRules(rules);
}
