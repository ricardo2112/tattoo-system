import jsPDF from "jspdf";
import "jspdf-autotable";

interface ExtendedJsPDF extends jsPDF {
  autoTable: (options: any) => jsPDF;
  lastAutoTable?: {
    finalY: number;
  };
}

/**
 * Genera un PDF con texto seleccionable a partir de datos estructurados
 */
export const generarPDFFormulario = (htmlContent: string): jsPDF => {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  }) as ExtendedJsPDF;

  // Parser básico para extraer datos del HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");

  let yPosition = 20;
  const pageWidth = 210;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Header - Logo y título
  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.text("TATTOO Z STUDIO", pageWidth / 2, yPosition, { align: "center" });

  yPosition += 7;
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text("Estudio Profesional de Tatuajes", pageWidth / 2, yPosition, { align: "center" });

  yPosition += 5;
  pdf.setFontSize(9);
  pdf.text("Telf: 099 8 944 682", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 4;
  pdf.text("www.tattoozstudio.com", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 4;
  pdf.text("Av. De los Shyris y Telégrafo", pageWidth / 2, yPosition, { align: "center" });

  // Línea separadora
  yPosition += 6;
  pdf.setLineWidth(0.8);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Título del documento
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  const titulo = doc.querySelector(".title")?.textContent || "REGISTRO DE CLIENTE TATUAJE";
  pdf.text(titulo, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 10;

  // Función auxiliar para agregar secciones
  const agregarSeccion = (seccionElement: Element) => {
    if (!seccionElement) return;

    // Verificar si necesitamos una nueva página
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    // Obtener título de la sección
    const tituloElement = seccionElement.querySelector(".section-title");
    const titulo = tituloElement?.textContent || "";

    // Título de sección
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text(titulo, margin, yPosition);
    yPosition += 2;

    // Línea bajo el título
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 6;

    // Extraer info-items
    const items = seccionElement.querySelectorAll(".info-item");
    items.forEach((item) => {
      const label = item.querySelector(".info-label")?.textContent || "";
      const value = item.querySelector(".info-value")?.textContent || "";

      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(100, 100, 100);
      pdf.text(label.toUpperCase(), margin, yPosition);
      yPosition += 5;

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0);
      const lineas = pdf.splitTextToSize(value, contentWidth);
      pdf.text(lineas, margin, yPosition);
      yPosition += lineas.length * 4 + 3;
    });

    yPosition += 3;
  };

  // Agregar aviso de menor de edad si existe
  const avisoMenor = doc.querySelector(".minor-notice");
  if (avisoMenor && avisoMenor.textContent) {
    pdf.setFillColor(255, 243, 205);
    pdf.setDrawColor(255, 193, 7);
    pdf.setLineWidth(0.5);
    pdf.rect(margin, yPosition - 5, contentWidth, 10, "FD");

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(133, 100, 4);
    const textoAviso = avisoMenor.textContent.trim();
    pdf.text(textoAviso, pageWidth / 2, yPosition, { align: "center" });
    pdf.setTextColor(0, 0, 0);
    yPosition += 10;
  }

  // Agregar secciones principales
  const secciones = doc.querySelectorAll(".section");
  secciones.forEach((seccion) => {
    // Verificar si es la sección de tutor y si está visible
    if (seccion.classList.contains("tutor-section")) {
      // Verificar si el elemento tiene contenido visible
      const hasContent = seccion.querySelector(".info-item");
      if (hasContent) {
        agregarSeccion(seccion);
      }
    } else {
      agregarSeccion(seccion);
    }
  });

  // Agregar tabla de precios
  const precioRows = doc.querySelectorAll(".price-row");
  if (precioRows.length > 0) {
    if (yPosition > 230) {
      pdf.addPage();
      yPosition = 20;
    }

    const tableData: string[][] = [];
    precioRows.forEach((row) => {
      const label = row.querySelector(".info-label")?.textContent || row.childNodes[0]?.textContent || "";
      const value = row.querySelector(".info-value")?.textContent || row.childNodes[1]?.textContent || "";
      tableData.push([label.trim(), value.trim()]);
    });

    pdf.autoTable({
      startY: yPosition,
      head: [["Concepto", "Monto"]],
      body: tableData,
      margin: { left: margin, right: margin },
      theme: "grid",
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      styles: {
        fontSize: 10,
      },
    });

    yPosition = pdf.lastAutoTable?.finalY || yPosition + 30;
    yPosition += 5;
  }

  // Agregar condiciones
  const condiciones = doc.querySelector(".conditions");
  if (condiciones) {
    if (yPosition > 200) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text("CONDICIONES", margin, yPosition);
    yPosition += 6;

    const items = condiciones.querySelectorAll("li");
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");

    items.forEach((item) => {
      const texto = item.textContent?.trim() || "";
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }

      const lineas = pdf.splitTextToSize(`• ${texto}`, contentWidth - 5);
      pdf.text(lineas, margin + 2, yPosition);
      yPosition += lineas.length * 3.5 + 2;
    });

    yPosition += 5;
  }

  // Agregar consentimiento
  const consentimiento = doc.querySelector(".consent .consent-text");
  if (consentimiento) {
    if (yPosition > 220) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFillColor(249, 249, 249);
    const textoConsent = consentimiento.textContent?.trim() || "";
    const lineasConsent = pdf.splitTextToSize(textoConsent, contentWidth - 10);
    const altoRect = lineasConsent.length * 4 + 10;

    pdf.rect(margin, yPosition - 3, contentWidth, altoRect, "F");
    pdf.setDrawColor(221, 221, 221);
    pdf.rect(margin, yPosition - 3, contentWidth, altoRect, "S");

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text(lineasConsent, margin + 5, yPosition + 2);
    yPosition += altoRect + 5;

    // Nota del tutor si existe
    const notaTutor = doc.querySelector(".consent .note");
    if (notaTutor && notaTutor.textContent?.trim()) {
      pdf.setFont("helvetica", "italic");
      pdf.setTextColor(100, 100, 100);
      const lineasNota = pdf.splitTextToSize(notaTutor.textContent.trim(), contentWidth);
      pdf.text(lineasNota, margin, yPosition);
      yPosition += lineasNota.length * 4 + 5;
      pdf.setTextColor(0, 0, 0);
    }
  }

  // Agregar línea de firma
  if (yPosition > 250) {
    pdf.addPage();
    yPosition = 20;
  }

  yPosition += 15;
  pdf.setLineWidth(0.5);
  pdf.line(pageWidth / 2 - 40, yPosition, pageWidth / 2 + 40, yPosition);
  yPosition += 5;

  const tipoFirmante = doc.querySelector(".signature-label")?.textContent || "FIRMA DEL CLIENTE";
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.text(tipoFirmante, pageWidth / 2, yPosition, { align: "center" });

  // Footer
  yPosition = 287;
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(100, 100, 100);
  pdf.text("TATTOO Z STUDIO", pageWidth - margin, yPosition, { align: "right" });
  yPosition += 3;
  pdf.text("Av. De los Shyris y Telégrafo", pageWidth - margin, yPosition, { align: "right" });
  yPosition += 3;
  pdf.text("www.tattoozstudio.com - Telf: 099 8 944 682", pageWidth - margin, yPosition, { align: "right" });

  return pdf;
};
