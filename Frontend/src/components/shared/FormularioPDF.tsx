import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";
import { PrinterIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import { generarPDFFormulario } from "@/utils/pdfGenerator";

interface FormularioPDFProps {
  htmlContent: string;
  onClose?: () => void;
}

export const FormularioPDF: React.FC<FormularioPDFProps> = ({ htmlContent, onClose }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    if (iframeRef.current) {
      const iframeDoc = iframeRef.current.contentDocument;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();
      }
    }
  }, [htmlContent]);

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };

  const handleSavePDF = () => {
    setIsGeneratingPDF(true);

    try {
      // Generar nombre de archivo con fecha actual
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
      const fileName = `Formulario_Consentimiento_${dateStr}_${timeStr}.pdf`;

      // Generar PDF con texto seleccionable usando la función personalizada
      const pdf = generarPDFFormulario(htmlContent);
      pdf.save(fileName);

    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Ocurrió un error al generar el PDF. Por favor, intente nuevamente.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex h-full max-h-[95vh] w-full max-w-5xl flex-col rounded-lg bg-white shadow-2xl dark:bg-dark-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-dark-600">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Formulario de Consentimiento
          </h2>
          <div className="flex gap-3">
            <Button
              onClick={handlePrint}
              variant="filled"
              color="primary"
              className="flex items-center gap-2"
            >
              <PrinterIcon className="size-5" />
              Imprimir
            </Button>
            <Button
              onClick={handleSavePDF}
              variant="outlined"
              color="primary"
              className="flex items-center gap-2"
              disabled={isGeneratingPDF}
            >
              <DocumentArrowDownIcon className="size-5" />
              {isGeneratingPDF ? "Generando PDF..." : "Guardar como PDF"}
            </Button>
            {onClose && (
              <Button onClick={onClose} variant="outlined" color="neutral">
                Cerrar
              </Button>
            )}
          </div>
        </div>

        {/* Contenido del formulario */}
        <div className="flex-1 overflow-auto bg-gray-100 p-6 dark:bg-dark-900">
          <div className="mx-auto bg-white shadow-lg" style={{ width: "210mm", minHeight: "297mm" }}>
            <iframe
              ref={iframeRef}
              title="Formulario PDF"
              className="h-full w-full border-0"
              style={{ minHeight: "297mm" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
