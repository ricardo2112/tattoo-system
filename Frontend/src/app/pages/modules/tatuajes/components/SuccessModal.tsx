import { Fragment, useState, useRef } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { CheckCircleIcon, PrinterIcon, DocumentArrowDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from "jspdf";

import { Button } from "@/components/ui";
import type { RegistroTatuajeResponse } from "@/types/registroTatuaje";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  registroResponse: RegistroTatuajeResponse | null;
}

export function SuccessModal({ isOpen, onClose, registroResponse }: SuccessModalProps) {
  const navigate = useNavigate();
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const formularioRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => formularioRef.current,
    documentTitle: `Formulario_Consentimiento_${registroResponse?.tatuaje.idTatuaje}`,
  });

  const handleGeneratePDF = async () => {
    if (!registroResponse?.formularioHtml || !formularioRef.current) return;

    try {
      setGeneratingPDF(true);

      // Crear PDF con jsPDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Agregar el HTML al PDF
      const element = formularioRef.current;
      await pdf.html(element, {
        callback: (doc) => {
          doc.save(`Formulario_Consentimiento_${registroResponse.tatuaje.idTatuaje}.pdf`);
        },
        x: 10,
        y: 10,
        width: 190,
        windowWidth: 800,
      });
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Error al generar el PDF. Intente imprimiendo directamente.");
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleContinue = () => {
    onClose();
    navigate("/modules/tatuajes");
  };

  if (!registroResponse) return null;

  const { cliente, tatuaje, cita, esMenorDeEdad, formularioHtml, mensaje } = registroResponse;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={handleContinue}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur transition-opacity dark:bg-black/40" />
        </TransitionChild>

        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="relative w-full max-w-3xl transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all dark:bg-dark-700">
                {/* Header */}
                <div className="border-b border-gray-200 bg-success-50 px-6 py-4 dark:border-dark-600 dark:bg-success-900/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-full bg-success text-white">
                        <CheckCircleIcon className="size-7" />
                      </div>
                      <div>
                        <DialogTitle as="h3" className="text-xl font-semibold text-success-900 dark:text-success-100">
                          ¡Registro Exitoso!
                        </DialogTitle>
                        <p className="text-sm text-success-800 dark:text-success-200">{mensaje}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleContinue}
                      className="rounded-full p-2 hover:bg-success-100 dark:hover:bg-success-900/30"
                    >
                      <XMarkIcon className="size-5 text-success-800 dark:text-success-200" />
                    </button>
                  </div>
                </div>

                {/* Contenido */}
                <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
                  {/* Resumen del registro */}
                  <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-dark-600 dark:bg-dark-750">
                    <h4 className="mb-3 font-semibold text-gray-900 dark:text-white">Detalles del Registro</h4>
                    <div className="grid gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Cliente:</span>
                        <span className="font-medium">{cliente.nombre} {cliente.apellido}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Tatuaje ID:</span>
                        <span className="font-medium">#{tatuaje.idTatuaje}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Cita ID:</span>
                        <span className="font-medium">#{cita.idCita}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Fecha de Cita:</span>
                        <span className="font-medium">
                          {new Date(cita.fechaInicio).toLocaleString("es-ES", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                      {cita.googleEventId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Google Calendar:</span>
                          <span className="text-success font-medium">✓ Sincronizado</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Formulario de consentimiento */}
                  {esMenorDeEdad && formularioHtml && (
                    <div className="space-y-4">
                      <div className="rounded-lg border-2 border-warning-300 bg-warning-50 p-4 dark:border-warning-700 dark:bg-warning-900/20">
                        <h4 className="mb-2 font-semibold text-warning-900 dark:text-warning-100">
                          Formulario de Consentimiento para Menores
                        </h4>
                        <p className="text-sm text-warning-800 dark:text-warning-200">
                          Se ha generado el formulario de consentimiento. Puede imprimirlo o descargarlo en PDF.
                        </p>
                      </div>

                      {/* Vista previa del formulario */}
                      <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 dark:border-dark-600 dark:bg-dark-800">
                        <div
                          ref={formularioRef}
                          dangerouslySetInnerHTML={{ __html: formularioHtml }}
                          className="prose prose-sm max-w-none dark:prose-invert"
                        />
                      </div>
                    </div>
                  )}

                  {!esMenorDeEdad && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-dark-600 dark:bg-dark-750">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Cliente mayor de edad. No se requiere formulario de consentimiento.
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer con acciones */}
                <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-dark-600 dark:bg-dark-750">
                  {esMenorDeEdad && formularioHtml ? (
                    <div className="flex flex-wrap justify-end gap-3">
                      <Button onClick={handleContinue} variant="outlined">
                        Continuar sin Imprimir
                      </Button>
                      <Button
                        onClick={handlePrint}
                        variant="outlined"
                        className="flex items-center gap-2"
                      >
                        <PrinterIcon className="size-5" />
                        Imprimir Formulario
                      </Button>
                      <Button
                        onClick={handleGeneratePDF}
                        color="primary"
                        className="flex items-center gap-2"
                        disabled={generatingPDF}
                      >
                        <DocumentArrowDownIcon className="size-5" />
                        {generatingPDF ? "Generando PDF..." : "Descargar PDF"}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <Button onClick={handleContinue} color="success">
                        Ir a Lista de Tatuajes
                      </Button>
                    </div>
                  )}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
