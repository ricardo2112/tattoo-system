// Import Dependencies
import { Fragment, useState } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

// Local Imports
import { NuevoClienteForm } from "@/components/shared/form/NuevoClienteForm";
import type { ClienteFormData } from "@/types/cliente";
import { ConfirmModal, ModalState } from "@/components/shared/ConfirmModal";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

// ----------------------------------------------------------------------

interface NuevoClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (clienteData: ClienteFormData) => void;
  initialData?: ClienteFormData;
}

const messages = {
  pending: {
    Icon: ExclamationTriangleIcon,
    iconClassName: "text-warning",
    title: "¿Desea guardar este cliente?",
    description: "Por favor confirme que desea guardar la información del cliente.",
    actionText: "Guardar Cliente",
  },
  success: {
    title: "Cliente Guardado",
    description: "La información del cliente se ha guardado correctamente.",
  },
  error: {
    title: "Error en los datos",
    description: "Por favor verifica que todos los campos requeridos estén completos y sean válidos.",
  },
};

export function NuevoClienteModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: NuevoClienteModalProps) {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmState, setConfirmState] = useState<ModalState>("pending");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingData, setPendingData] = useState<ClienteFormData | null>(null);

  const handleSubmit = async (clienteData: ClienteFormData) => {
    // Validar los datos antes de mostrar el modal de confirmación
    const validation = validateClientData(clienteData);

    if (!validation.isValid) {
      // Mostrar modal de error si hay problemas con los datos
      setConfirmState("error");
      setShowConfirmModal(true);
      return;
    }

    // Si todo está bien, guardar los datos y mostrar modal de confirmación
    setPendingData(clienteData);
    setConfirmState("pending");
    setShowConfirmModal(true);
  };

  const validateClientData = (data: ClienteFormData): { isValid: boolean; error?: string } => {
    if (!data.nombre?.trim()) {
      return { isValid: false, error: "El nombre es requerido" };
    }
    if (!data.apellido?.trim()) {
      return { isValid: false, error: "El apellido es requerido" };
    }
    if (!data.fechaNacimiento) {
      return { isValid: false, error: "La fecha de nacimiento es requerida" };
    }
    if (data.email?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return { isValid: false, error: "El email no es válido" };
      }
    }
    return { isValid: true };
  };

  const handleConfirmSave = async () => {
    if (!pendingData) return;

    setConfirmLoading(true);

    // Simular guardado (puedes reemplazar esto con una llamada real al servicio)
    try {
      // await clienteService.create(pendingData);

      // Simular un delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setConfirmLoading(false);
      setConfirmState("success");

      // Esperar un momento para que el usuario vea el éxito
      setTimeout(() => {
        setShowConfirmModal(false);
        onSuccess(pendingData);
        setPendingData(null);
        onClose();
      }, 1500);
    } catch (error) {
      setConfirmLoading(false);
      setConfirmState("error");
      console.error("Error al guardar cliente:", error);
    }
  };

  const handleCloseConfirmModal = () => {
    if (!confirmLoading) {
      setShowConfirmModal(false);
      // No resetear pendingData si es un error, para que el usuario pueda corregir
      if (confirmState !== "error") {
        setPendingData(null);
      }
      setConfirmState("pending");
    }
  };

  const handleCloseMainModal = () => {
    if (!confirmLoading) {
      onClose();
    }
  };

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
          onClose={handleCloseMainModal}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur transition-opacity dark:bg-black/40" />
          </TransitionChild>

          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="scrollbar-sm relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-y-auto rounded-lg bg-white shadow-xl transition-all dark:bg-dark-700">
              {/* Header con botón de cerrar */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-dark-600 dark:bg-dark-700">
                <DialogTitle
                  as="h3"
                  className="text-2xl font-bold text-gray-900 dark:text-white"
                >
                  Nuevo Cliente
                </DialogTitle>
                <button
                  onClick={handleCloseMainModal}
                  disabled={confirmLoading}
                  className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-dark-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="size-6" />
                </button>
              </div>

              {/* Contenido del formulario */}
              <div className="p-6">
                <NuevoClienteForm
                  initialData={initialData}
                  onSubmit={handleSubmit}
                  submitButtonText="Guardar Cliente"
                  showNavigation={false}
                  showStepper={true}
                  showInternalNavigation={true}
                  loading={confirmLoading}
                />
              </div>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>

      {/* Modal de confirmación */}
      <ConfirmModal
        show={showConfirmModal}
        onClose={handleCloseConfirmModal}
        messages={messages}
        onOk={handleConfirmSave}
        confirmLoading={confirmLoading}
        state={confirmState}
      />
    </>
  );
}
