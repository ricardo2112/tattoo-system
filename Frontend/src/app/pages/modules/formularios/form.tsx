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
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CodeBracketIcon,
} from "@heroicons/react/24/outline";
import { Page } from "@/components/shared/Page";
import { Button, Skeleton, Input, Textarea, Card } from "@/components/ui";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { formularioService } from "@/services/formularioService";

interface FormularioFormData {
  nombreFormulario: string;
  descripcion?: string;
  cuerpoHtml?: string;
}

export default function FormularioForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const formularioId = id ? parseInt(id) : null;

  // Estados de modales
  const [isPlaceholdersModalOpen, { open: openPlaceholdersModal, close: closePlaceholdersModal }] = useDisclosure(false);
  const [isConfirmOpen, { open: openConfirm, close: closeConfirm }] = useDisclosure(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmState, setConfirmState] = useState<"pending" | "success" | "error">("pending");

  // Estados de carga y datos
  const [loadingFormulario, setLoadingFormulario] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado del formulario
  const [formData, setFormData] = useState<FormularioFormData>({
    nombreFormulario: "",
    descripcion: "",
    cuerpoHtml: "",
  });

  // Placeholders disponibles
  const placeholders = [
    { key: "{{CLIENTE_NOMBRE}}", desc: "Nombre completo del cliente" },
    { key: "{{CLIENTE_CI}}", desc: "Cédula/Pasaporte del cliente" },
    { key: "{{CLIENTE_FECHA_NACIMIENTO}}", desc: "Fecha de nacimiento" },
    { key: "{{CLIENTE_TELEFONO}}", desc: "Teléfono del cliente" },
    { key: "{{CLIENTE_EMAIL}}", desc: "Email del cliente" },
    { key: "{{CLIENTE_CONDICIONES_MEDICAS}}", desc: "Condiciones médicas" },
    { key: "{{CLIENTE_ENFERMEDADES_PIEL}}", desc: "Enfermedades de la piel" },
    { key: "{{CLIENTE_COMO_ENCONTRO}}", desc: "Cómo encontró el estudio" },
    { key: "{{CLIENTE_OBSERVACIONES}}", desc: "Observaciones del cliente" },
    { key: "{{TUTOR_NOMBRE}}", desc: "Nombre del tutor (menores)" },
    { key: "{{TUTOR_CI}}", desc: "Cédula del tutor" },
    { key: "{{TUTOR_TELEFONO}}", desc: "Teléfono del tutor" },
    { key: "{{TUTOR_EMAIL}}", desc: "Email del tutor" },
    { key: "{{TUTOR_PARENTESCO}}", desc: "Parentesco del tutor" },
    { key: "{{ARTISTA_NOMBRE}}", desc: "Nombre del artista" },
    { key: "{{TIPO_SERVICIO}}", desc: "Tipo de servicio" },
    { key: "{{SERVICIO_DETALLE}}", desc: "Detalle del servicio" },
    { key: "{{ZONA_CUERPO}}", desc: "Zona del cuerpo" },
    { key: "{{FECHA_CITA}}", desc: "Fecha de la cita" },
    { key: "{{HORA_CITA}}", desc: "Hora de la cita" },
    { key: "{{PRECIO_TOTAL}}", desc: "Precio total" },
    { key: "{{ABONO}}", desc: "Abono realizado" },
    { key: "{{SALDO}}", desc: "Saldo pendiente" },
    { key: "{{FORMA_PAGO}}", desc: "Forma de pago" },
    { key: "{{FECHA_AGENDAMIENTO}}", desc: "Fecha de agendamiento" },
  ];

  // Cargar formulario si existe id
  useEffect(() => {
    if (formularioId) {
      loadFormulario();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formularioId]);

  const loadFormulario = async () => {
    if (!formularioId) return;

    try {
      setLoadingFormulario(true);
      const formulario = await formularioService.getById(formularioId);
      setFormData({
        nombreFormulario: formulario.nombreFormulario,
        descripcion: formulario.descripcion || "",
        cuerpoHtml: formulario.cuerpoHtml || "",
      });
    } catch (error) {
      console.error("Error al cargar formulario:", error);
      setError("Error al cargar el formulario");
    } finally {
      setLoadingFormulario(false);
    }
  };

  const validateForm = (): string | null => {
    if (!formData.nombreFormulario.trim()) {
      return "El nombre del formulario es requerido.";
    }
    if (!formData.cuerpoHtml?.trim()) {
      return "El contenido HTML del formulario es requerido.";
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setConfirmState("pending");
    openConfirm();
  };

  const handleConfirmSave = async () => {
    try {
      setConfirmLoading(true);

      const dataToSave = {
        ...formData,
        activo: true, // Siempre activo al crear/editar
      };

      if (formularioId) {
        await formularioService.update(formularioId, dataToSave);
      } else {
        await formularioService.create(dataToSave);
      }

      setConfirmState("success");
      setConfirmLoading(false);
      setTimeout(() => {
        closeConfirm();
        navigate("/modules/formularios");
      }, 2000);
    } catch (error: any) {
      console.error("Error al guardar:", error?.response?.data || error);
      setConfirmLoading(false);
      setConfirmState("error");
    }
  };

  const handleBack = () => {
    navigate("/modules/formularios");
  };

  if (loadingFormulario) {
    return (
      <Page title="Cargando...">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <Skeleton className="h-12 w-full rounded-lg mb-6" />
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </Page>
    );
  }

  return (
    <Page title={formularioId ? "Editar Formulario" : "Nuevo Formulario"}>
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                onClick={handleBack}
                variant="outlined"
                isIcon
                className="size-10 rounded-full"
                data-tooltip
                data-tooltip-content="Volver a formularios"
              >
                <ArrowLeftIcon className="size-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formularioId ? "Editar Formulario" : "Nuevo Formulario"}
                </h1>
              </div>
            </div>
            <Button onClick={openPlaceholdersModal} color="secondary" variant="outlined">
              <CodeBracketIcon className="mr-2 size-5" />
              Ver Placeholders
            </Button>
          </div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {formularioId
              ? "Actualiza la información del formulario"
              : "Crea un nuevo formulario HTML con placeholders dinámicos"}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="size-5 shrink-0 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <Card className="p-8">
            <div className="space-y-6">
              {/* Informaci�n B�sica */}
              <div className="border-b border-gray-200 pb-6 dark:border-dark-600">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                  <DocumentTextIcon className="size-5" />
                  Información Básica
                </h2>
                <div className="space-y-4">
                  <Input
                    label="Nombre del Formulario"
                    placeholder="Ej: Formulario de Consentimiento para Tatuajes"
                    value={formData.nombreFormulario}
                    onChange={(e) => setFormData({ ...formData, nombreFormulario: e.target.value })}
                    required
                  />

                  <Textarea
                    label="Descripción (Opcional)"
                    placeholder="Breve descripción del formulario y su propósito"
                    rows={3}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  />
                </div>
              </div>

              {/* Contenido HTML */}
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                    <CodeBracketIcon className="size-5" />
                    Contenido HTML
                  </h2>
                  <Button
                    type="button"
                    onClick={openPlaceholdersModal}
                    variant="flat"
                    className="text-sm text-primary-600 dark:text-primary-400"
                  >
                    Ver placeholders disponibles
                  </Button>
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-dark-600 dark:bg-dark-600/30">
                  <Textarea
                    placeholder="Pega aquí el código HTML del formulario...

Ejemplo:
<div>
  <h1>{{CLIENTE_NOMBRE}}</h1>
  <p>Email: {{CLIENTE_EMAIL}}</p>
</div>"
                    rows={20}
                    value={formData.cuerpoHtml}
                    onChange={(e) => setFormData({ ...formData, cuerpoHtml: e.target.value })}
                    className="font-mono text-sm"
                    required
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Utiliza los placeholders para insertar datos dinámicos. Los placeholders serán reemplazados automáticamente con la información real.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Botones de Acci�n */}
          <div className="mt-6 flex gap-4">
            <Button
              type="button"
              onClick={handleBack}
              variant="outlined"
              className="flex-1 font-medium"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              color="primary"
              className="flex-1 font-semibold shadow-md shadow-primary-600/20"
            >
              {formularioId ? "Actualizar Formulario" : "Crear Formulario"}
            </Button>
          </div>
        </form>

        {/* Modal de Confirmaci�n */}
        <ConfirmModal
          show={isConfirmOpen}
          onClose={closeConfirm}
          onOk={handleConfirmSave}
          confirmLoading={confirmLoading}
          state={confirmState}
          messages={{
            pending: {
              Icon: ExclamationTriangleIcon,
              title: "Confirmación",
              description: formularioId
                ? "¿Desea actualizar la información de este formulario?"
                : "¿Desea crear este nuevo formulario?",
              actionText: formularioId ? "Actualizar" : "Crear",
            },
            success: {
              title: formularioId ? "Formulario Actualizado" : "Formulario Creado",
              description: formularioId
                ? "El formulario ha sido actualizado exitosamente."
                : "El formulario ha sido creado exitosamente.",
              actionText: "Aceptar",
            },
            error: {
              title: "Error al Guardar",
              description: "No se pudo guardar el formulario. Por favor, verifique su conexión e intente nuevamente.",
              actionText: "Reintentar",
            },
          }}
        />

        {/* Modal de Placeholders */}
        <Transition appear show={isPlaceholdersModalOpen} as={Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
            onClose={closePlaceholdersModal}
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
              <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity dark:bg-black/50" />
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
              <DialogPanel className="scrollbar-sm relative flex max-h-[85vh] w-full max-w-4xl flex-col overflow-y-auto rounded-xl bg-white shadow-2xl transition-all duration-300 dark:bg-dark-700">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200/80 bg-gradient-to-r from-primary-50 to-primary-100/50 px-6 py-5 dark:border-dark-600 dark:from-dark-700 dark:to-dark-600">
                  <DialogTitle as="h3" className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary-600 shadow-md dark:bg-primary-500">
                      <CodeBracketIcon className="size-5 text-white" />
                    </div>
                    Placeholders Disponibles
                  </DialogTitle>
                  <Button
                    onClick={closePlaceholdersModal}
                    variant="flat"
                    isIcon
                    className="size-9 rounded-full text-gray-600 transition-colors hover:bg-white/60 dark:text-gray-300 dark:hover:bg-dark-600"
                  >
                    X
                  </Button>
                </div>

                <div className="p-8">
                  <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Importante:</strong> Copia y pega estos placeholders exactamente como se muestran. Son sensibles a mayúsculas y deben incluir las llaves dobles.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    {placeholders.map((placeholder) => (
                      <div
                        key={placeholder.key}
                        className="group flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-primary-300 hover:shadow-md dark:border-dark-600 dark:bg-dark-700/50 dark:hover:border-primary-700"
                      >
                        <div className="flex-1">
                          <code className="block rounded bg-primary-100 px-2 py-1 font-mono text-xs font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                            {placeholder.key}
                          </code>
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {placeholder.desc}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(placeholder.key);
                          }}
                          className="shrink-0 rounded-lg bg-gray-100 p-2 text-gray-600 opacity-0 transition-all hover:bg-gray-200 group-hover:opacity-100 dark:bg-dark-600 dark:text-gray-300 dark:hover:bg-dark-500"
                          title="Copiar"
                        >
                          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </Dialog>
        </Transition>
      </div>
    </Page>
  );
}
