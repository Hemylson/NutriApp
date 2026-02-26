// src/utils/pdfGenerator.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Genera un PDF profesional del plan de alimentación
 * Formato tipo tabla con header, opciones por tiempo de comida y footer con recomendaciones
 */
export const generarPDFProfesional = (datosExportacion) => {
  const {
    nombrePaciente,
    nombreNutricionista = 'Nutricionista',
    jvpm = '',
    logo = null,
    gridPlan,
    tiemposComida,
    numOpciones,
    datosNutricionales,
    recomendaciones = []
  } = datosExportacion;

  // Crear documento PDF en orientación horizontal (landscape)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'letter'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;

  // ===================================
  // HEADER
  // ===================================
  
  // Logo (si existe) - NOTA: SVG no se puede usar directamente, necesita conversión
  // Por ahora mostramos texto alternativo
  if (logo) {
  try {
    doc.addImage(
      logo,
      "PNG", // muy importante
      margin,
      margin,
      25, // ancho en mm
      25  // alto en mm
    );
  } catch (error) {
    console.warn("Error al insertar logo:", error);
  }
}

  // Título del nutricionista (derecha superior)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(nombreNutricionista, pageWidth - margin, margin + 5, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Nutricionista y Dietista', pageWidth - margin, margin + 10, { align: 'right' });

  // Nombre del paciente (centro)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const nombreY = margin + 35;
  doc.text(nombrePaciente, pageWidth / 2, nombreY, { align: 'center' });
  
  // Fecha (derecha)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const fecha = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.text(fecha, pageWidth - margin, nombreY, { align: 'right' });

  // ===================================
  // TABLA DE PLAN DE COMIDAS
  // ===================================
  
  const startY = nombreY + 10;
  
  // Preparar headers
  const headers = [['Tiempo de\ncomida']];
  for (let i = 1; i <= numOpciones; i++) {
    headers[0].push(`Opción ${i}`);
  }

  // Preparar filas
  const rows = [];
  
  tiemposComida.forEach(tiempo => {
    const row = [tiempo];
    
    for (let i = 1; i <= numOpciones; i++) {
      const prep = gridPlan[tiempo]?.[i];
      
      if (prep) {
        let contenido = `${prep.nombre}\n\n`;
        
        // Agregar ingredientes
        if (prep.ingredientes && prep.ingredientes.length > 0) {
          prep.ingredientes.forEach(ing => {
            contenido += `${ing.cantidad} ${ing.unidad} ${ing.alimento}\n`;
          });
          contenido += '\n';
        }
        
        // Agregar método de cocción si existe
        if (prep.metodoCoccion && prep.metodoCoccion !== 'Ninguno') {
          contenido += `Método: ${prep.metodoCoccion}\n\n`;
        }
        
        // Agregar intercambios
        if (prep.intercambios) {
          const intercambiosTexto = [];
          const mapeoNombres = {
            lecheDescremada: 'LD',
            lecheSemidescremada: 'LS',
            lecheEntera: 'LE',
            vegetales: 'V',
            frutas: 'F',
            panesCereales: 'PC',
            cerealesConGrasa: 'CG',
            cerealesSinGrasa: 'CSG',
            proteinasMagras: 'PM',
            proteinasSemimagras: 'PS',
            proteinasAltas: 'PA',
            grasas: 'G'
          };
          
          Object.entries(prep.intercambios).forEach(([key, value]) => {
            if (value > 0) {
              const sigla = mapeoNombres[key] || key;
              intercambiosTexto.push(`${sigla}:${value}`);
            }
          });
          
          if (intercambiosTexto.length > 0) {
            contenido += `Intercambios: ${intercambiosTexto.join(' ')}`;
          }
        }
        
        row.push(contenido.trim());
      } else {
        row.push('');
      }
    }
    
    rows.push(row);
  });

  // Generar tabla usando autoTable
  autoTable(doc, {
    head: headers,
    body: rows,
    startY: startY,
    theme: 'grid',
    styles: {
        fontSize: 7,
        cellPadding: 2.5,
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        textColor: [0, 0, 0],
        font: 'helvetica',
        valign: 'top',
        overflow: 'linebreak'
    },
    headStyles: {
        fillColor: [200, 200, 200],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        fontSize: 8,
        minCellHeight: 10
    },
    columnStyles: {
        0: { 
        cellWidth: 28, 
        fontStyle: 'bold',
        halign: 'left',
        fillColor: [240, 240, 240],
        fontSize: 8
        }
    },
    margin: { left: margin, right: margin },
    tableWidth: 'auto'
    });

  // ===================================
  // RECOMENDACIONES (FOOTER)
  // ===================================
  
  let finalY = doc.lastAutoTable?.finalY
    ? doc.lastAutoTable.finalY + 8
    : startY + 8;
  
  // Si no hay espacio suficiente, crear nueva página
  if (finalY > pageHeight - 60) {
    doc.addPage();
    finalY = margin;
  }

  // Recomendaciones predeterminadas
  const recomendacionesPredeterminadas = [
    'No se incluyen en las verduras: papa, yuca, camote, elote. Estos se contabilizan como carbohidratos.',
    'Se recomienda no utilizar aderezos de tipo mayonesa, salsa de tomate industrial, pepinesa, etc. Si puede utilizar vinagre y hierbas aromáticas.',
    'Evite el consumo de sal y productos que la contengan (cubitos, sazonadores, consomés, sopas deshidratadas, enlatados, etc.)',
    'Es importante no omitir ningún tiempo de comida. Y realizar actividad física, como mínimo 30 minutos diarios.',
    'Puede dar sabor a las comidas con hierbas aromáticas, ajo, apio, cúrcuma, comino, pimienta, etc.',
    'Elige carbohidratos complejos y ricos en fibra como avena, legumbres, frutas enteras y vegetales sin almidón.',
    'Manténgase hidratado, consuma alrededor de 2 litros de agua por día.'
  ];

  const recsFinales = recomendaciones.length > 0 ? recomendaciones : recomendacionesPredeterminadas;

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  
  recsFinales.forEach((rec) => {
    const text = `- ${rec}`;
    const lines = doc.splitTextToSize(text, pageWidth - (margin * 2));
    
    // Verificar espacio
    if (finalY + (lines.length * 3.5) > pageHeight - 25) {
      doc.addPage();
      finalY = margin;
    }
    
    doc.text(lines, margin, finalY);
    finalY += lines.length * 3.5 + 1.5;
  });

  // ===================================
  // FIRMA PROFESIONAL (FOOTER)
  // ===================================
  
  finalY += 8;
  
  if (finalY > pageHeight - 25) {
    doc.addPage();
    finalY = margin;
  }

  // Cuadro de firma
  const firmaWidth = 70;
  const firmaHeight = 18;
  const firmaX = pageWidth - margin - firmaWidth;
  
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(firmaX, finalY, firmaWidth, firmaHeight);
  
  // Texto de firma
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(nombreNutricionista, firmaX + firmaWidth / 2, finalY + 7, { align: 'center' });
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Nutricionista y Dietista', firmaX + firmaWidth / 2, finalY + 11, { align: 'center' });
  
  if (jvpm) {
    doc.setFontSize(7);
    doc.text(jvpm, firmaX + firmaWidth / 2, finalY + 15, { align: 'center' });
  }

  // ===================================
  // GUARDAR PDF
  // ===================================
  
  const nombreArchivo = `plan-alimentacion-${nombrePaciente.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(nombreArchivo);
  
  return true;
};