import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserIcon, ShieldCheckIcon, DocumentTextIcon, CalendarDaysIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

import { Button } from "@/components/ui";
import { useStep } from "@/hooks/useStep";
import { tatuajeService } from "@/services/tatuajeService";
import { clienteService } from "@/services/clienteService";
import { tutorService } from "@/services/tutorService";
import type { RegistroTatuajeDto } from "@/types/registroTatuaje";
import type { Cliente, ClienteFormData } from "@/types/cliente";
import type { Tutor, TutorFormData } from "@/types/tutor";
import { countries as allCountries, type Country } from "@/constants/countries";

import { ClienteStep } from "./components/ClienteStep";
import { TutorStep } from "./components/TutorStep";
import { TatuajeStep } from "./components/TatuajeStep";
import { CitaStep } from "./components/CitaStep";
import { ConfirmacionStep } from "./components/ConfirmacionStep";
import { SuccessModal } from "./components/SuccessModal";

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

  // Datos para Cliente Step
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteQuery, setClienteQuery] = useState("");
  const [modoCliente, setModoCliente] = useState<"seleccionar" | "crear">("seleccionar");
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [nuevoCliente, setNuevoCliente] = useState<ClienteFormData>({
    nombre: "",
    apellido: "",
    identificacion: "",
    fechaNacimiento: "",
    telefono: "",
    email: "",
  });

  // Phone country selector para Cliente
  const [selectedPhoneCountry, setSelectedPhoneCountry] = useState<Country | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneCountryQuery, setPhoneCountryQuery] = useState("");
  const countries = allCountries;

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

  // Estado para Tatuaje (Step 3)
  const [tatuajeData, setTatuajeData] = useState({
    artista: "",
    detalle: "",
    precio: "",
    zonaTatuaje: "",
    imagen: "",
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
      : nuevoCliente.fechaNacimiento || "";
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
          if (!nuevoCliente.nombre || !nuevoCliente.apellido) {
            setError("Nombre y apellido son obligatorios");
            return false;
          }
          if (!nuevoCliente.identificacion) {
            setError("La identificación es obligatoria");
            return false;
          }
          if (!nuevoCliente.fechaNacimiento) {
            setError("La fecha de nacimiento es obligatoria");
            return false;
          }
          if (!nuevoCliente.telefono) {
            setError("El teléfono es obligatorio");
            return false;
          }
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
      const cliente = modoCliente === "seleccionar" ? clienteSeleccionado : nuevoCliente;
      const tutor = esMenorDeEdad ? (modoTutor === "seleccionar" ? tutorSeleccionado : nuevoTutor) : null;

      const dto: RegistroTatuajeDto = {
        cliente: {
          idCliente: modoCliente === "seleccionar" ? cliente?.idCliente : 0,
          nombre: cliente?.nombre || "",
          apellido: cliente?.apellido || "",
          identificacion: cliente?.identificacion || "",
          fechaNacimiento: cliente?.fechaNacimiento || "",
          telefono: cliente?.telefono || "",
          email: cliente?.email || "",
        },
        tutor: tutor
          ? {
              idTutor: modoTutor === "seleccionar" ? tutor.idTutor : 0,
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
          imagen: tatuajeData.imagen || undefined,
          estadoPago: tatuajeData.estadoPago,
        },
        cita: {
          titulo: citaData.titulo || `Tatuaje - ${cliente?.nombre} ${cliente?.apellido}`,
          descripcion: citaData.descripcion,
          fechaInicio: citaData.fechaInicio,
          fechaFin: citaData.fechaFin,
          duracionMinutos: citaData.duracionMinutos ? parseInt(citaData.duracionMinutos) : undefined,
          zona: citaData.zona || tatuajeData.zonaTatuaje,
        },
        registradoPor: 1, // TODO: Obtener del contexto de usuario autenticado
      };

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
    const cliente = modoCliente === "seleccionar" ? clienteSeleccionado : nuevoCliente;
    return cliente ? `${cliente.nombre} ${cliente.apellido}`.trim() : "";
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* Stepper visual */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = currentStep === stepNumber;
            const isCompleted = currentStep > stepNumber;
            const Icon = step.icon;

            return (
              <div key={stepNumber} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex size-12 items-center justify-center rounded-full border-2 transition-all ${
                      isCompleted
                        ? "border-success bg-success text-white"
                        : isActive
                        ? "border-primary-500 bg-primary-500 text-white"
                        : "border-gray-300 bg-white text-gray-400 dark:border-dark-500 dark:bg-dark-700"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircleIcon className="size-6" />
                    ) : (
                      <Icon className="size-6" />
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      isActive
                        ? "text-primary-600 dark:text-primary-400"
                        : isCompleted
                        ? "text-success"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {stepNumber < TOTAL_STEPS && (
                  <div
                    className={`mx-2 h-0.5 flex-1 transition-all ${
                      isCompleted ? "bg-success" : "bg-gray-300 dark:bg-dark-500"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Contenido del paso actual */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-600 dark:bg-dark-700">
        {currentStep === 1 && (
          <ClienteStep
            modoCliente={modoCliente}
            setModoCliente={setModoCliente}
            clienteSeleccionado={clienteSeleccionado}
            setClienteSeleccionado={setClienteSeleccionado}
            clienteQuery={clienteQuery}
            setClienteQuery={setClienteQuery}
            nuevoCliente={nuevoCliente}
            setNuevoCliente={setNuevoCliente}
            clientes={clientes}
            countries={countries}
            selectedPhoneCountry={selectedPhoneCountry}
            setSelectedPhoneCountry={setSelectedPhoneCountry}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            phoneCountryQuery={phoneCountryQuery}
            setPhoneCountryQuery={setPhoneCountryQuery}
            esMenorDeEdad={esMenorDeEdad}
            calculateAge={calculateAge}
          />
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
            clienteNombre={getClienteNombre()}
          />
        )}

        {currentStep === 5 && (
          <ConfirmacionStep
            modoCliente={modoCliente}
            clienteSeleccionado={clienteSeleccionado}
            nuevoCliente={nuevoCliente}
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
        <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-6 dark:border-dark-600">
          <div>
            {currentStep > 1 && (
              <Button onClick={handlePrev} variant="outlined" disabled={loading}>
                Anterior
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => navigate("/modules/tatuajes")}
              variant="outlined"
              disabled={loading}
            >
              Cancelar
            </Button>

            {currentStep < TOTAL_STEPS ? (
              <Button onClick={handleNext} color="primary" disabled={loading}>
                Siguiente
              </Button>
            ) : (
              <Button onClick={handleSubmit} color="success" disabled={loading}>
                {loading ? "Registrando..." : "Confirmar Registro"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de éxito */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        registroResponse={registroResponse}
      />
    </div>
  );
}
