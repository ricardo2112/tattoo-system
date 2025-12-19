import { Fragment, useState } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { CheckCircleIcon, DocumentTextIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui";
import { FormularioPDF } from "@/components/shared/FormularioPDF";
import { procesarFormulario } from "@/utils/formularioProcessor";
import { formularioTatuajeTemplate } from "@/templates/formularioTatuajeTemplate";
import type { RegistroTatuajeResponse } from "@/types/registroTatuaje";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  registroResponse: RegistroTatuajeResponse | null;
}

export function SuccessModal({ isOpen, onClose, registroResponse }: SuccessModalProps) {
  const navigate = useNavigate();
  const [showFormulario, setShowFormulario] = useState(false);

  const handleContinue = () => {
    onClose();
    navigate("/modules/tatuajes");
  };

  const handleVerFormulario = () => {
    setShowFormulario(true);
  };

  const handleCloseFormulario = () => {
    setShowFormulario(false);
  };

  if (!registroResponse) return null;

  const { cliente, tatuaje, pago, cita, mensaje } = registroResponse;

  // Procesar el HTML del formulario con los datos reales
  const formularioHtml = registroResponse.formularioHtml
    ? procesarFormulario(registroResponse.formularioHtml, registroResponse)
    : procesarFormulario(formularioTatuajeTemplate, registroResponse);

  return (
    <>
      {/* Modal de éxito */}
      <Transition appear show={isOpen && !showFormulario} as={Fragment}>
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
                <DialogPanel className="relative w-full max-w-2xl transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all dark:bg-dark-700">
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
                  <div className="px-6 py-6">
                    {/* Resumen del registro */}
                    <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-dark-600 dark:bg-dark-750">
                      <h4 className="mb-3 font-semibold text-gray-900 dark:text-white">Detalles del Registro</h4>
                      <div className="grid gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Cliente:</span>
                          <span className="font-medium">
                            {cliente.nombre} {cliente.apellido}
                          </span>
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
                        {pago && (
                          <>
                            <div className="flex justify-between border-t border-gray-200 pt-3 dark:border-dark-600">
                              <span className="text-gray-600 dark:text-gray-400">Abono Registrado:</span>
                              <span className="font-medium text-success-600 dark:text-success-400">
                                ${pago.monto.toFixed(2)} USD
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Forma de Pago:</span>
                              <span className="font-medium">{pago.formaPago || "Efectivo"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Estado de Pago:</span>
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  tatuaje.estadoPago === "pagado"
                                    ? "bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-200"
                                    : tatuaje.estadoPago === "parcial"
                                    ? "bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-200"
                                    : "bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-200"
                                }`}
                              >
                                {tatuaje.estadoPago === "pagado"
                                  ? "Pagado"
                                  : tatuaje.estadoPago === "parcial"
                                  ? "Pago Parcial"
                                  : "Pendiente"}
                              </span>
                            </div>
                          </>
                        )}
                        {cita.googleEventId && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Google Calendar:</span>
                            <span className="font-medium text-success">✓ Sincronizado</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Información del formulario */}
                    <div className="rounded-lg border-2 border-primary-200 bg-primary-50 p-4 dark:border-primary-800 dark:bg-primary-900/20">
                      <div className="flex items-start gap-3">
                        <DocumentTextIcon className="size-6 flex-shrink-0 text-primary-600 dark:text-primary-400" />
                        <div className="flex-1">
                          <h4 className="mb-1 font-semibold text-primary-900 dark:text-primary-100">
                            Formulario de Consentimiento
                          </h4>
                          <p className="mb-3 text-sm text-primary-800 dark:text-primary-200">
                            Se ha generado el formulario de consentimiento. Puede visualizarlo, imprimirlo o guardarlo
                            como PDF.
                          </p>
                          <Button
                            onClick={handleVerFormulario}
                            variant="filled"
                            color="primary"
                            className="flex items-center gap-2"
                          >
                            <DocumentTextIcon className="size-4" />
                            Ver Formulario
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer con acciones */}
                  <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-dark-600 dark:bg-dark-750">
                    <div className="flex justify-end gap-3">
                      <Button onClick={handleVerFormulario} variant="outlined" color="primary">
                        <DocumentTextIcon className="mr-2 size-5" />
                        Ver Formulario
                      </Button>
                      <Button onClick={handleContinue} color="success" variant="filled">
                        Ir a Lista de Tatuajes
                      </Button>
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal del formulario PDF */}
      {showFormulario && <FormularioPDF htmlContent={formularioHtml} onClose={handleCloseFormulario} />}
    </>
  );
}
