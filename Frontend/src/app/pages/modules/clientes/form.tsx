// Import Dependencies
import { Fragment, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDisclosure } from "@/hooks/index";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
// Local Imports
import { Page } from "@/components/shared/Page";
import { Button, Skeleton } from "@/components/ui";
import { NuevoClienteForm } from "@/components/shared/form/NuevoClienteForm";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { clienteService } from "@/services/clienteService";
import type { ClienteFormData, Cliente } from "@/types/cliente";

// ----------------------------------------------------------------------

/**
 * Generate a slug from cliente name
 */
const generateClienteSlug = (cliente: Cliente): string => {
  const fullName = `${cliente.nombre || ""} ${cliente.apellido || ""}`.trim();
  return fullName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export default function ClienteForm() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [isOpen, { open, close }] = useDisclosure(false);
  const [modalStatus, setModalStatus] = useState<"success" | "error">("success");
  const [modalMessage, setModalMessage] = useState("");

  // Estados para el modal de confirmación
  const [isConfirmOpen, { open: openConfirm, close: closeConfirm }] = useDisclosure(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmState, setConfirmState] = useState<"pending" | "success" | "error">("pending");
  const [pendingFormData, setPendingFormData] = useState<ClienteFormData | null>(null);

  // Estados de carga
  const [loadingCliente, setLoadingCliente] = useState(false);

  // Estado del formulario
  const [initialFormData, setInitialFormData] = useState<ClienteFormData | undefined>(undefined);

  // Cargar cliente si existe slug
  useEffect(() => {
    const loadCliente = async () => {
      if (slug) {
        await loadClienteBySlug(slug);
      }
    };
    loadCliente();
  }, [slug]);

  const loadClienteBySlug = async (clienteSlug: string) => {
    try {
      setLoadingCliente(true);
      const allClientes = await clienteService.getAll();
      const foundCliente = allClientes.find(c => generateClienteSlug(c) === clienteSlug);

      if (foundCliente) {
        setClienteId(foundCliente.idCliente);
        setInitialFormData(foundCliente);
      } else {
        setModalStatus("error");
        setModalMessage("Cliente no encontrado");
        open();
        setTimeout(() => navigate("/modules/clientes"), 2000);
      }
    } catch (error) {
      console.error("Error al buscar cliente:", error);
      setModalStatus("error");
      setModalMessage("Error al buscar el cliente");
      open();
    } finally {
      setLoadingCliente(false);
    }
  };

  const handleSubmit = async (formData: ClienteFormData) => {
    // Guardar los datos del formulario y abrir modal de confirmación
    setPendingFormData(formData);
    setConfirmState("pending");
    openConfirm();
  };

  const handleConfirmSave = async () => {
    if (!pendingFormData) return;

    try {
      setConfirmLoading(true);
      let response;
      if (clienteId) {
        console.log("Actualizando cliente ID:", clienteId);
        response = await clienteService.update(clienteId, pendingFormData);
      } else {
        console.log("Creando nuevo cliente");
        response = await clienteService.create(pendingFormData);
      }
      console.log("Respuesta del servidor:", response);
      setConfirmState("success");
      setConfirmLoading(false);
      setTimeout(() => {
        closeConfirm();
        navigate("/modules/clientes");
      }, 2000);
    } catch (error: any) {
      console.error("Error al guardar:", error?.response?.data || error);
      setConfirmLoading(false);
      setConfirmState("error");
    }
  };

  const handleBack = () => {
    navigate("/modules/clientes");
  };

  if (loadingCliente) {
    return (
      <Page title="Cargando...">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <Skeleton className="h-12 w-full rounded-lg mb-6" />
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </Page>
    );
  }

  return (
    <Page title={clienteId ? "Editar Cliente" : "Nuevo Cliente"}>
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <Button
              onClick={handleBack}
              variant="outlined"
              isIcon
              className="size-10 rounded-full"
              data-tooltip
              data-tooltip-content="Volver a clientes"
            >
              <ArrowLeftIcon className="size-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {clienteId ? "Editar Cliente" : "Nuevo Cliente"}
              </h1>
            </div>
          </div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Complete la información en los siguientes pasos
          </p>
        </div>

        {/* Formulario Reutilizable */}
        <NuevoClienteForm
          initialData={initialFormData}
          onSubmit={handleSubmit}
          loading={false}
          submitButtonText={clienteId ? "Actualizar Cliente" : "Guardar Cliente"}
          showNavigation={false}
          showStepper={true}
          showInternalNavigation={true}
        />

        {/* Modal de Confirmación para guardar */}
        <ConfirmModal
          show={isConfirmOpen}
          onClose={closeConfirm}
          onOk={handleConfirmSave}
          confirmLoading={confirmLoading}
          state={confirmState}
          messages={{
            pending: {
              Icon: ExclamationTriangleIcon,
              title: "¿Está seguro?",
              description: clienteId
                ? "¿Desea actualizar la información de este cliente?"
                : "¿Desea guardar este nuevo cliente?",
              actionText: clienteId ? "Actualizar" : "Guardar",
            },
            success: {
              title: clienteId ? "Cliente Actualizado" : "Cliente Creado",
              description: clienteId
                ? "El cliente ha sido actualizado exitosamente."
                : "El cliente ha sido creado exitosamente.",
              actionText: "Aceptar",
            },
            error: {
              title: "Error al Guardar",
              description: "No se pudo guardar el cliente. Por favor, verifique su conexión e intente nuevamente.",
              actionText: "Reintentar",
            },
          }}
        />

        {/* Modal de Error de validación */}
        <Transition appear show={isOpen} as={Fragment}>
          <Dialog as="div" className="relative z-[100]" onClose={close}>
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

            <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden p-4">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="relative flex w-full max-w-lg flex-col rounded-lg bg-white px-6 py-10 text-center shadow-xl transition-all dark:bg-dark-700 sm:px-8">
                  {modalStatus === "success" ? (
                    <CheckCircleIcon className="mx-auto inline size-20 shrink-0 text-success sm:size-24" />
                  ) : (
                    <XCircleIcon className="mx-auto inline size-20 shrink-0 text-error sm:size-24" />
                  )}

                  <div className="mt-6">
                    <DialogTitle
                      as="h3"
                      className="text-xl font-semibold text-gray-800 dark:text-dark-100 sm:text-2xl"
                    >
                      {modalStatus === "success" ? "Éxito" : "Error"}
                    </DialogTitle>

                    <p className="mt-4 min-h-[60px] text-base text-gray-600 dark:text-gray-400 sm:text-lg">
                      {modalMessage}
                    </p>

                    <div className="mt-8 flex justify-center gap-3">
                      <Button
                        onClick={close}
                        color={modalStatus === "success" ? "success" : "error"}
                        className="px-8"
                      >
                        Cerrar
                      </Button>
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </Dialog>
        </Transition>
      </div>
    </Page>
  );
}
