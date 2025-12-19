import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  UserPlusIcon,
  UsersIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

import { Page } from "@/components/shared/Page";
import { Button } from "@/components/ui";
import { useStep } from "@/hooks/useStep";
import { tatuajeService } from "@/services/tatuajeService";
import { clienteService } from "@/services/clienteService";
import { tutorService } from "@/services/tutorService";
import type { RegistroTatuajeDto } from "@/types/registroTatuaje";
import type { Cliente, ClienteFormData } from "@/types/cliente";
import type { Tutor, TutorFormData } from "@/types/tutor";

import { NuevoClienteModal } from "./components/NuevoClienteModal";
import { TutorStep } from "./components/TutorStep";
import { TatuajeStep } from "./components/TatuajeStep";
import { CitaStep } from "./components/CitaStep";
import { ConfirmacionStep } from "./components/ConfirmacionStep";
import { SuccessModal } from "./components/SuccessModal";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Transition,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Fragment } from "react";
import { Input } from "@/components/ui";
import { useDisclosure } from "@/hooks";

const TOTAL_STEPS = 5;

interface StepConfig {
  title: string;
  icon: typeof UserIcon;
}

const STEPS: StepConfig[] = [
  { title: "Cliente", icon: UserIcon },
  { title: "Tutor", icon: ShieldCheckIcon },
  { title: "Tatuaje", icon: DocumentTextIcon },
  { title: "Cita", icon: CalendarDaysIcon },
  { title: "Confirmación", icon: CheckCircleIcon },
];

export default function TatuajeForm() {
  const navigate = useNavigate();
  const [currentStep, { goToNextStep, goToPrevStep }] = useStep(TOTAL_STEPS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registroResponse, setRegistroResponse] = useState<any>(null);

  // Modal de nuevo cliente
  const [isModalOpen, { open: openModal, close: closeModal }] = useDisclosure(false);

  // Datos para Cliente Step
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteQuery, setClienteQuery] = useState("");
  const [modoCliente, setModoCliente] = useState<"seleccionar" | "crear">("seleccionar");
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [nuevoClienteData, setNuevoClienteData] = useState<ClienteFormData>({
    nombre: "",
    apellido: "",
    identificacion: "",
    fechaNacimiento: "",
    telefono: "",
    email: "",
  });

  // Datos para Tutor Step
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [tutorQuery, setTutorQuery] = useState("");
  const [modoTutor, setModoTutor] = useState<"seleccionar" | "crear">("seleccionar");
  const [tutorSeleccionado, setTutorSeleccionado] = useState<Tutor | null>(null);
  const [nuevoTutor, setNuevoTutor] = useState<TutorFormData>({
    nombre: "",
    apellido: "",
    identificacion: "",
    parentezco: "",
  });

  // Estado para Tatuaje (Step 3) - Actualizado con abono y forma de pago
  const [tatuajeData, setTatuajeData] = useState({
    artista: "",
    detalle: "",
    precio: "",
    zonaTatuaje: "",
    abono: "",
    formaPago: "",
    estadoPago: "pendiente",
  });

  // Estado para Cita (Step 4)
  const [citaData, setCitaData] = useState({
    titulo: "",
    descripcion: "",
    fechaInicio: "",
    fechaFin: "",
    duracionMinutos: "",
    zona: "",
  });

  // Cargar clientes y tutores al montar
  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientesData, tutoresData] = await Promise.all([
          clienteService.getAll(),
          tutorService.getAll(),
        ]);
        setClientes(clientesData);
        setTutores(tutoresData);
      } catch (err) {
        console.error("Error cargando datos:", err);
      }
    };
    loadData();
  }, []);

  // Función auxiliar para calcular edad
  const calculateAge = (dateString: string): number => {
    if (!dateString) return 0;
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Determinar si es menor de edad
  const getClienteFechaNacimiento = (): string => {
    return modoCliente === "seleccionar"
      ? clienteSeleccionado?.fechaNacimiento || ""
      : nuevoClienteData.fechaNacimiento || "";
  };

  const esMenorDeEdad = calculateAge(getClienteFechaNacimiento()) < 18;

  // Validación por paso
  const validateStep = (): boolean => {
    setError(null);

    switch (currentStep) {
      case 1: // Cliente
        if (modoCliente === "seleccionar") {
          if (!clienteSeleccionado) {
            setError("Debe seleccionar un cliente o crear uno nuevo");
            return false;
          }
        } else {
          // Validación para modo "crear" - ya se validó en handleNuevoClienteSubmit
          // Solo verificamos que los datos básicos existan
          if (!nuevoClienteData.nombre || !nuevoClienteData.apellido) {
            setError("Nombre y apellido son obligatorios");
            return false;
          }
          if (!nuevoClienteData.identificacion) {
            setError("La identificación es obligatoria");
            return false;
          }
          if (!nuevoClienteData.fechaNacimiento) {
            setError("La fecha de nacimiento es obligatoria");
            return false;
          }
          // El teléfono NO es obligatorio
        }
        return true;

      case 2: // Tutor
        if (esMenorDeEdad) {
          if (modoTutor === "seleccionar") {
            if (!tutorSeleccionado) {
              setError("Debe seleccionar un tutor o crear uno nuevo para menores de edad");
              return false;
            }
          } else {
            if (!nuevoTutor.nombre || !nuevoTutor.apellido) {
              setError("Nombre y apellido del tutor son obligatorios");
              return false;
            }
            if (!nuevoTutor.identificacion) {
              setError("La identificación del tutor es obligatoria");
              return false;
            }
          }
        }
        return true;

      case 3: // Tatuaje
        if (!tatuajeData.zonaTatuaje) {
          setError("La zona del tatuaje es obligatoria");
          return false;
        }
        if (!tatuajeData.detalle) {
          setError("El detalle del tatuaje es obligatorio");
          return false;
        }
        if (!tatuajeData.artista) {
          setError("Debe seleccionar un artista");
          return false;
        }
        // Validar forma de pago si hay abono
        if (tatuajeData.abono && parseFloat(tatuajeData.abono) > 0) {
          if (!tatuajeData.formaPago) {
            setError("Debe seleccionar una forma de pago cuando hay un abono");
            return false;
          }
        }
        return true;

      case 4: // Cita
        if (!citaData.fechaInicio) {
          setError("La fecha de inicio es obligatoria");
          return false;
        }
        if (!citaData.fechaFin) {
          setError("La fecha de fin es obligatoria");
          return false;
        }
        const inicio = new Date(citaData.fechaInicio);
        const fin = new Date(citaData.fechaFin);
        if (fin <= inicio) {
          setError("La fecha de fin debe ser posterior a la fecha de inicio");
          return false;
        }
        return true;

      case 5: // Confirmación
        return true;

      default:
        return true;
    }
  };

  // Navegar al siguiente paso
  const handleNext = () => {
    if (validateStep()) {
      goToNextStep();
    }
  };

  // Navegar al paso anterior
  const handlePrev = () => {
    setError(null);
    goToPrevStep();
  };

  // Enviar el formulario completo
  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    setError(null);

    try {
      // Construir el DTO según el formato del backend
      const cliente = modoCliente === "seleccionar" ? clienteSeleccionado : nuevoClienteData;
      const tutor = esMenorDeEdad ? (modoTutor === "seleccionar" ? tutorSeleccionado : nuevoTutor) : null;

      console.log("--- Iniciando construcción del DTO ---");
      console.log("Modo cliente:", modoCliente);
      console.log("Cliente seleccionado:", clienteSeleccionado);
      console.log("Nuevo cliente data:", nuevoClienteData);
      console.log("Cliente final:", cliente);

      // Convertir fechaNacimiento a string ISO LOCAL (sin conversión UTC)
      const fechaNacimientoStr = (() => {
        if (!cliente?.fechaNacimiento) return "";

        const fecha: any = cliente.fechaNacimiento;

        // Si ya es un string, verificar si está en formato correcto
        if (typeof fecha === 'string') {
          // Si tiene la 'Z' al final (UTC), convertir a fecha local
          if (fecha.endsWith('Z')) {
            const date = new Date(fecha);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}T00:00:00`;
          }
          return fecha;
        }

        // Si es un objeto Date, formatear como ISO local
        if (fecha instanceof Date) {
          const year = fecha.getFullYear();
          const month = String(fecha.getMonth() + 1).padStart(2, '0');
          const day = String(fecha.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}T00:00:00`;
        }

        // Si es un array (del DatePicker)
        if (Array.isArray(fecha) && fecha.length > 0) {
          const date = new Date(fecha[0]);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}T00:00:00`;
        }

        return String(fecha);
      })();

      const dto: RegistroTatuajeDto = {
        cliente: {
          idCliente: modoCliente === "seleccionar" ? cliente?.idCliente : undefined,
          nombre: cliente?.nombre || "",
          apellido: cliente?.apellido || "",
          identificacion: cliente?.identificacion || "",
          fechaNacimiento: fechaNacimientoStr,
          telefono: cliente?.telefono || "",
          email: cliente?.email || "",
          nacionalidad: cliente?.nacionalidad,
          redes: cliente?.redes,
          condicionMedica: cliente?.condicionMedica,
          enfermedadPiel: cliente?.enfermedadPiel,
          deporte: cliente?.deporte,
          referencia: cliente?.referencia,
          observaciones: cliente?.observaciones,
        },
        tutor: tutor
          ? {
              idTutor: modoTutor === "seleccionar" ? tutor.idTutor : undefined,
              nombre: tutor.nombre,
              apellido: tutor.apellido,
              identificacion: tutor.identificacion || "",
              parentezco: tutor.parentezco || "",
            }
          : undefined,
        tatuaje: {
          artista: tatuajeData.artista,
          detalle: tatuajeData.detalle,
          precio: tatuajeData.precio ? parseFloat(tatuajeData.precio) : undefined,
          zonaTatuaje: tatuajeData.zonaTatuaje,
          estadoPago: tatuajeData.estadoPago,
        },
        pago: tatuajeData.abono && parseFloat(tatuajeData.abono) > 0
          ? {
              monto: parseFloat(tatuajeData.abono),
              formaPago: tatuajeData.formaPago || "Efectivo",
              fechaPago: new Date().toISOString(),
            }
          : undefined,
        cita: {
          titulo: citaData.titulo || `Tatuaje ${tatuajeData.zonaTatuaje} - ${cliente?.nombre} ${cliente?.apellido}`,
          descripcion: citaData.descripcion || `Cliente: ${cliente?.nombre} ${cliente?.apellido} | Artista: ${tatuajeData.artista} | Zona: ${tatuajeData.zonaTatuaje} | Detalle: ${tatuajeData.detalle}`,
          fechaInicio: citaData.fechaInicio,
          fechaFin: citaData.fechaFin,
          duracionMinutos: citaData.duracionMinutos ? parseInt(citaData.duracionMinutos) : undefined,
          zona: citaData.zona || tatuajeData.zonaTatuaje,
        },
        registradoPor: 1, // TODO: Obtener del contexto de usuario autenticado
      };

      console.log("DTO construido - cliente.idCliente:", dto.cliente.idCliente);
      console.log("DTO completo:", dto);

      const response = await tatuajeService.registrarCompleto(dto);
      setRegistroResponse(response);
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("Error al registrar:", err);
      setError(err.response?.data?.message || "Error al registrar el tatuaje. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Obtener el nombre del cliente para mostrar en pasos posteriores
  const getClienteNombre = (): string => {
    const cliente = modoCliente === "seleccionar" ? clienteSeleccionado : nuevoClienteData;
    return cliente ? `${cliente.nombre} ${cliente.apellido}`.trim() : "";
  };

  // Handler para cuando se crea un cliente desde el modal
  const handleModalClienteSuccess = (formData: ClienteFormData) => {
    console.log("📝 Datos del nuevo cliente recibidos desde modal:", formData);

    // Guardar los datos en el estado
    setNuevoClienteData(formData);
    console.log("✅ Datos guardados en el estado del formulario de tatuaje");
    console.log("✅ Cliente guardado exitosamente");
  };

  const filteredClientes =
    clienteQuery === ""
      ? clientes
      : clientes.filter((c) => {
          const fullName = `${c.nombre} ${c.apellido} ${c.identificacion}`.toLowerCase();
          return fullName.includes(clienteQuery.toLowerCase());
        });

  return (
    <Page title="Nuevo Registro de Tatuaje">
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <Button
              onClick={() => navigate("/modules/tatuajes")}
              variant="outlined"
              isIcon
              className="size-10 rounded-full"
              data-tooltip
              data-tooltip-content="Volver a tatuajes"
            >
              <ArrowLeftIcon className="size-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Nuevo Registro de Tatuaje
              </h1>
            </div>
          </div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Complete la información en los siguientes pasos
          </p>
        </div>

        {/* Stepper visual */}
        <ol className="steps mb-8">
          {STEPS.map((step, i) => {
            const stepNumber = i + 1;
            return (
              <li
                key={stepNumber}
                className={clsx(
                  "step",
                  currentStep > stepNumber
                    ? "before:bg-primary-500"
                    : "before:bg-gray-200 dark:before:bg-surface-2"
                )}
              >
                <button
                  onClick={() => {
                    // Opcional: permitir navegar a pasos anteriores
                    // if (stepNumber < currentStep) setStep(stepNumber);
                  }}
                  className={clsx(
                    "step-header rounded-full transition-all dark:text-white",
                    currentStep === stepNumber
                      ? "border-2 border-primary-500 bg-gray-200 text-gray-800 dark:bg-surface-2"
                      : currentStep > stepNumber
                      ? "bg-primary-600 text-white dark:bg-primary-500"
                      : "bg-gray-200 text-gray-800 dark:bg-surface-2"
                  )}
                >
                  {stepNumber}
                </button>
                <h3 className="text-sm font-medium text-gray-600 dark:text-dark-100">
                  {step.title}
                </h3>
              </li>
            );
          })}
        </ol>

        {/* Contenido del paso actual */}
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-md dark:border-dark-600 dark:bg-dark-700">
        {/* Paso 1: Cliente */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4 dark:border-dark-600">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
                <UserIcon className="size-7 text-primary-500" />
                Información del Cliente
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Seleccione un cliente existente o cree uno nuevo
              </p>
            </div>

            {/* Selector de modo */}
            <div className="flex gap-4">
              <Button
                onClick={() => setModoCliente("seleccionar")}
                variant={modoCliente === "seleccionar" ? "filled" : "outlined"}
                className="flex-1"
              >
                <UsersIcon className="mr-2 size-5" />
                Seleccionar Cliente
              </Button>
              <Button
                onClick={() => {
                  setModoCliente("crear");
                  openModal();
                }}
                variant={modoCliente === "crear" ? "filled" : "outlined"}
                className="flex-1"
              >
                <UserPlusIcon className="mr-2 size-5" />
                Crear Nuevo Cliente
              </Button>
            </div>

            {/* Modo: Seleccionar Cliente */}
            {modoCliente === "seleccionar" && (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Buscar Cliente <span className="text-red-500">*</span>
                  </label>
                  <Combobox value={clienteSeleccionado} onChange={setClienteSeleccionado}>
                    {({ open }) => (
                      <div className="relative">
                        <div className="relative w-full">
                          <ComboboxInput
                            as={Input}
                            className="pr-10"
                            placeholder="Buscar por nombre, apellido o identificación..."
                            displayValue={(cliente: Cliente | null) =>
                              cliente
                                ? `${cliente.nombre} ${cliente.apellido} ${cliente.identificacion ? `(${cliente.identificacion})` : ""}`
                                : ""
                            }
                            onChange={(event) => setClienteQuery(event.target.value)}
                          />
                          <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronDownIcon
                              className={clsx(
                                "size-5 text-gray-400 transition-transform dark:text-dark-300",
                                open && "rotate-180"
                              )}
                            />
                          </ComboboxButton>
                        </div>
                        <Transition
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                          afterLeave={() => setClienteQuery("")}
                        >
                          <ComboboxOptions className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-lg border border-gray-300 bg-white py-1 shadow-lg dark:border-dark-500 dark:bg-dark-750">
                            {filteredClientes.length === 0 ? (
                              <div className="px-4 py-2 text-sm text-gray-800 dark:text-dark-100">
                                No se encontraron clientes
                              </div>
                            ) : (
                              filteredClientes.map((cliente) => (
                                <ComboboxOption
                                  key={cliente.idCliente}
                                  value={cliente}
                                  className={({ focus, selected }) =>
                                    clsx(
                                      "relative cursor-pointer select-none px-4 py-2.5 transition-colors",
                                      focus && !selected && "bg-gray-100 dark:bg-dark-600",
                                      selected && "bg-primary-600 text-white dark:bg-primary-500"
                                    )
                                  }
                                >
                                  <div>
                                    <div className="font-medium">
                                      {cliente.nombre} {cliente.apellido}
                                    </div>
                                    {cliente.identificacion && (
                                      <div className="text-sm opacity-75">{cliente.identificacion}</div>
                                    )}
                                  </div>
                                </ComboboxOption>
                              ))
                            )}
                          </ComboboxOptions>
                        </Transition>
                      </div>
                    )}
                  </Combobox>
                </div>

                {clienteSeleccionado && (
                  <div className="rounded-lg border-2 border-primary-200 bg-primary-50 p-4 dark:border-primary-800 dark:bg-primary-900/20">
                    <h3 className="mb-2 font-semibold text-primary-900 dark:text-primary-100">
                      Cliente Seleccionado
                    </h3>
                    <div className="grid gap-2 text-sm">
                      <div>
                        <span className="font-medium">Nombre:</span> {clienteSeleccionado.nombre}{" "}
                        {clienteSeleccionado.apellido}
                      </div>
                      {clienteSeleccionado.fechaNacimiento && (
                        <div>
                          <span className="font-medium">Edad:</span>{" "}
                          {calculateAge(clienteSeleccionado.fechaNacimiento)} años
                        </div>
                      )}
                      {clienteSeleccionado.telefono && (
                        <div>
                          <span className="font-medium">Teléfono:</span> {clienteSeleccionado.telefono}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Modo: Crear Nuevo Cliente - Mostrar resumen si ya se creó */}
            {modoCliente === "crear" && nuevoClienteData.nombre && (
              <div className="rounded-lg border-2 border-success-200 bg-success-50 p-4 dark:border-success-800 dark:bg-success-900/20">
                <h3 className="mb-2 font-semibold text-success-900 dark:text-success-100">
                  Nuevo Cliente Registrado
                </h3>
                <div className="grid gap-2 text-sm">
                  <div>
                    <span className="font-medium">Nombre:</span> {nuevoClienteData.nombre}{" "}
                    {nuevoClienteData.apellido}
                  </div>
                  {nuevoClienteData.identificacion && (
                    <div>
                      <span className="font-medium">Identificación:</span>{" "}
                      {nuevoClienteData.identificacion}
                    </div>
                  )}
                  {nuevoClienteData.fechaNacimiento && (
                    <div>
                      <span className="font-medium">Edad:</span>{" "}
                      {calculateAge(nuevoClienteData.fechaNacimiento)} años
                    </div>
                  )}
                  {nuevoClienteData.telefono && (
                    <div>
                      <span className="font-medium">Teléfono:</span> {nuevoClienteData.telefono}
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => openModal()}
                  variant="soft"
                  className="mt-3"
                >
                  Editar información
                </Button>
              </div>
            )}

            {/* Modo: Crear Nuevo Cliente - Indicador si aún no se ha creado */}
            {modoCliente === "crear" && !nuevoClienteData.nombre && (
              <div className="rounded-lg border-2 border-primary-200 bg-primary-50 p-6 text-center dark:border-primary-800 dark:bg-primary-900/20">
                <UserPlusIcon className="mx-auto mb-3 size-12 text-primary-500" />
                <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
                  Haz clic en "Crear Nuevo Cliente" para abrir el formulario
                </p>
                <Button onClick={openModal} variant="filled" color="primary">
                  Abrir Formulario
                </Button>
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <TutorStep
            esMenorDeEdad={esMenorDeEdad}
            modoTutor={modoTutor}
            setModoTutor={setModoTutor}
            tutorSeleccionado={tutorSeleccionado}
            setTutorSeleccionado={setTutorSeleccionado}
            tutorQuery={tutorQuery}
            setTutorQuery={setTutorQuery}
            nuevoTutor={nuevoTutor}
            setNuevoTutor={setNuevoTutor}
            tutores={tutores}
          />
        )}

        {currentStep === 3 && (
          <TatuajeStep tatuajeData={tatuajeData} setTatuajeData={setTatuajeData} />
        )}

        {currentStep === 4 && (
          <CitaStep
            citaData={citaData}
            setCitaData={setCitaData}
            tatuajeZona={tatuajeData.zonaTatuaje}
            tatuajeDetalle={tatuajeData.detalle}
            tatuajeArtista={tatuajeData.artista}
            clienteNombre={getClienteNombre()}
          />
        )}

        {currentStep === 5 && (
          <ConfirmacionStep
            modoCliente={modoCliente}
            clienteSeleccionado={clienteSeleccionado}
            nuevoCliente={nuevoClienteData}
            modoTutor={modoTutor}
            tutorSeleccionado={tutorSeleccionado}
            nuevoTutor={nuevoTutor}
            tatuajeData={tatuajeData}
            citaData={citaData}
            esMenorDeEdad={esMenorDeEdad}
            calculateAge={calculateAge}
          />
        )}

          {/* Mensaje de error */}
          {error && (
            <div className="mt-4 rounded-lg border border-error-300 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
              <p className="text-sm text-error-800 dark:text-error-200">{error}</p>
            </div>
          )}

          {/* Botones de navegación */}
          <div className="mt-8 flex justify-between border-t border-gray-200 pt-6 dark:border-dark-600">
            <Button
              onClick={handlePrev}
              disabled={currentStep === 1 || loading}
              variant="soft"
              color="neutral"
              className="px-6"
            >
              Anterior
            </Button>

            {currentStep < TOTAL_STEPS ? (
              <Button
                onClick={handleNext}
                disabled={loading}
                variant="soft"
                color="primary"
                className="px-6"
              >
                Siguiente
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                color="success"
                variant="filled"
                className="px-8"
                disabled={loading}
              >
                {loading ? "Registrando..." : "Registrar Tatuaje"}
              </Button>
            )}
          </div>
        </div>

        {/* Modal de éxito */}
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          registroResponse={registroResponse}
        />

        {/* Modal de nuevo cliente */}
        <NuevoClienteModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSuccess={handleModalClienteSuccess}
          initialData={modoCliente === "crear" ? nuevoClienteData : undefined}
        />
      </div>
    </Page>
  );
}
