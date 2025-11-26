// Import Dependencies
import { Fragment, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStep, useDisclosure } from "@/hooks/index";
import clsx from "clsx";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Transition,
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
} from "@headlessui/react";
import {
  ChevronDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { SiInstagram } from "react-icons/si";
import Cleave from "cleave.js/react";
// Local Imports
import { Page } from "@/components/shared/Page";
import { Button, Input, Skeleton, Radio } from "@/components/ui";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { clienteService } from "@/services/clienteService";
import { countryService } from "@/services/countryService";
import { catalogoService } from "@/services/catalogoService";
import type { ClienteFormData, Cliente } from "@/types/cliente";
import type { Country } from "@/types/country";
import type { Catalogo } from "@/types/catalogo";

// ----------------------------------------------------------------------

const STEP_TITLES = [
  "Información Personal",
  "Contacto",
  "Historial Médico",
  "Referencias",
];

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
  const [currentStep, helpers] = useStep(4);
  const [isOpen, { open, close }] = useDisclosure(false);
  const [modalStatus, setModalStatus] = useState<"success" | "error">("success");
  const [modalMessage, setModalMessage] = useState("");

  const {
    canGoToPrevStep,
    canGoToNextStep,
    goToNextStep,
    goToPrevStep,
    setStep,
  } = helpers;

  // Estados de carga
  const [loading, setLoading] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);

  // Estados de datos
  const [countries, setCountries] = useState<Country[]>([]);
  const [condicionesMedicasCatalogo, setCondicionesMedicasCatalogo] = useState<Catalogo[]>([]);
  const [enfermedadesPielCatalogo, setEnfermedadesPielCatalogo] = useState<Catalogo[]>([]);
  const [deportesCatalogo, setDeportesCatalogo] = useState<Catalogo[]>([]);
  const [referenciasCatalogo, setReferenciasCatalogo] = useState<Catalogo[]>([]);

  // Estado del formulario
  const [formData, setFormData] = useState<ClienteFormData>({
    identificacion: "",
    nombre: "",
    apellido: "",
    fechaNacimiento: "",
    nacionalidad: "",
    telefono: "",
    email: "",
    redes: "",
    condicionMedica: "",
    enfermedadPiel: "",
    deporte: "",
    referencia: "",
    observaciones: "",
  });

  // Estados para autocomplete y b�squeda
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [countryQuery, setCountryQuery] = useState("");
  const [selectedPhoneCountry, setSelectedPhoneCountry] = useState<Country | null>(null);
  const [phoneCountryQuery, setPhoneCountryQuery] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Estados para condiciones m�dicas
  const [tieneCondicionesMedicas, setTieneCondicionesMedicas] = useState<"si" | "no">("no");
  const [selectedCondiciones, setSelectedCondiciones] = useState<string[]>([]);
  const [otraCondicion, setOtraCondicion] = useState("");

  // Estados para enfermedades de piel
  const [tieneEnfermedadesPiel, setTieneEnfermedadesPiel] = useState<"si" | "no">("no");
  const [selectedEnfermedades, setSelectedEnfermedades] = useState<string[]>([]);
  const [otraEnfermedad, setOtraEnfermedad] = useState("");

  // Estados para deportes
  const [practicaDeporte, setPracticaDeporte] = useState<"si" | "no">("no");
  const [selectedDeportes, setSelectedDeportes] = useState<string[]>([]);
  const [otroDeporte, setOtroDeporte] = useState("");

  // Estados para referencias
  const [selectedReferencias, setSelectedReferencias] = useState<string[]>([]);
  const [otraReferencia, setOtraReferencia] = useState("");

  // Cargar países y catálogos primero
  useEffect(() => {
    loadCountries();
    loadCatalogos();
  }, []);

  // Cargar cliente después de que países y catálogos estén listos
  useEffect(() => {
    const loadCliente = async () => {
      if (slug && !loadingCountries && !loadingCatalogos && countries.length > 0) {
        await loadClienteBySlug(slug);
      }
    };
    loadCliente();
  }, [slug, loadingCountries, loadingCatalogos, countries]);

  const loadClienteBySlug = async (clienteSlug: string) => {
    try {
      setLoading(true);
      const allClientes = await clienteService.getAll();
      const foundCliente = allClientes.find(c => generateClienteSlug(c) === clienteSlug);

      if (foundCliente) {
        setClienteId(foundCliente.idCliente);
        await loadClienteData(foundCliente);
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
      setLoading(false);
    }
  };

  const loadCountries = async () => {
    try {
      const data = await countryService.getAll();
      setCountries(data);
    } catch (error) {
      console.error("Error al cargar pa�ses:", error);
    } finally {
      setLoadingCountries(false);
    }
  };

  const loadCatalogos = async () => {
    try {
      const allCatalogos = await catalogoService.getAll();
      console.log("Catálogos cargados:", allCatalogos);

      // Buscar tipos de cat�logo por nombre (coincidiendo con la base de datos)
      const condicionesTipo = allCatalogos.find(t => t.nombreTipo === "condición_médica");
      const enfermedadesTipo = allCatalogos.find(t => t.nombreTipo === "enfermedad_de_piel");
      const deportesTipo = allCatalogos.find(t => t.nombreTipo === "deporte");
      const referenciasTipo = allCatalogos.find(t => t.nombreTipo === "como_nos_encontro");

      if (condicionesTipo) setCondicionesMedicasCatalogo(condicionesTipo.catalogos);
      if (enfermedadesTipo) setEnfermedadesPielCatalogo(enfermedadesTipo.catalogos);
      if (deportesTipo) setDeportesCatalogo(deportesTipo.catalogos);
      if (referenciasTipo) setReferenciasCatalogo(referenciasTipo.catalogos);
    } catch (error) {
      console.error("Error al cargar cat�logos:", error);
    } finally {
      setLoadingCatalogos(false);
    }
  };

  const loadClienteData = async (cliente: Cliente) => {
    try {
      console.log("=== CARGANDO DATOS DEL CLIENTE ===");
      console.log("Cliente:", cliente);
      console.log("Países disponibles:", countries.length);
      console.log("Catálogos - Condiciones:", condicionesMedicasCatalogo.length);
      console.log("Catálogos - Enfermedades:", enfermedadesPielCatalogo.length);
      console.log("Catálogos - Deportes:", deportesCatalogo.length);
      console.log("Catálogos - Referencias:", referenciasCatalogo.length);

      if (countries.length === 0) {
        console.error("ERROR: No hay países cargados aún");
        return;
      }

      setFormData(cliente);

      // Cargar país de nacionalidad si existe
      if (cliente.nacionalidad && countries.length > 0) {
        const country = countries.find(c => c.alpha2Code === cliente.nacionalidad);
        console.log("País de nacionalidad encontrado:", country);
        if (country) {
          setSelectedCountry(country);
        }
      }

      // Cargar país y número de teléfono
      if (cliente.telefono && countries.length > 0) {
        // Extraer código de país del teléfono (formato: +598 99 123 456)
        const phoneMatch = cliente.telefono.match(/^\+(\d+)\s+(.+)$/);
        console.log("Teléfono original:", cliente.telefono);
        console.log("Teléfono parseado:", phoneMatch);

        if (phoneMatch) {
          const callingCode = phoneMatch[1];
          const number = phoneMatch[2];

          // Buscar el país por código de llamada
          const phoneCountry = countries.find(c => c.callingCodes[0] === callingCode);
          console.log("País del teléfono encontrado:", phoneCountry);

          if (phoneCountry) {
            setSelectedPhoneCountry(phoneCountry);
          }
          setPhoneNumber(number);
        } else {
          // Si no tiene formato, solo guardar el número
          setPhoneNumber(cliente.telefono);
        }
      }

      // Cargar condiciones médicas
      if (cliente.condicionMedica && cliente.condicionMedica.trim() !== "") {
        console.log("Condiciones médicas del cliente:", cliente.condicionMedica);
        setTieneCondicionesMedicas("si");

        const condiciones = cliente.condicionMedica.split(",").map(c => c.trim());
        const catalogoNames = condicionesMedicasCatalogo.map(c => c.nombreCatalogo);
        const selected = condiciones.filter(c => catalogoNames.includes(c));
        const otras = condiciones.filter(c => !catalogoNames.includes(c));

        console.log("Condiciones seleccionadas:", selected);
        console.log("Otras condiciones:", otras);

        setSelectedCondiciones(selected);
        if (otras.length > 0) setOtraCondicion(otras.join(", "));
      } else {
        setTieneCondicionesMedicas("no");
      }

      // Cargar enfermedades de piel
      if (cliente.enfermedadPiel && cliente.enfermedadPiel.trim() !== "") {
        console.log("Enfermedades de piel del cliente:", cliente.enfermedadPiel);
        setTieneEnfermedadesPiel("si");

        const enfermedades = cliente.enfermedadPiel.split(",").map(e => e.trim());
        const catalogoNames = enfermedadesPielCatalogo.map(e => e.nombreCatalogo);
        const selected = enfermedades.filter(e => catalogoNames.includes(e));
        const otras = enfermedades.filter(e => !catalogoNames.includes(e));

        console.log("Enfermedades seleccionadas:", selected);
        console.log("Otras enfermedades:", otras);

        setSelectedEnfermedades(selected);
        if (otras.length > 0) setOtraEnfermedad(otras.join(", "));
      } else {
        setTieneEnfermedadesPiel("no");
      }

      // Cargar deportes
      if (cliente.deporte && cliente.deporte.trim() !== "") {
        console.log("Deportes del cliente:", cliente.deporte);
        setPracticaDeporte("si");

        const deportes = cliente.deporte.split(",").map(d => d.trim());
        const catalogoNames = deportesCatalogo.map(d => d.nombreCatalogo);
        const selected = deportes.filter(d => catalogoNames.includes(d));
        const otros = deportes.filter(d => !catalogoNames.includes(d));

        console.log("Deportes seleccionados:", selected);
        console.log("Otros deportes:", otros);

        setSelectedDeportes(selected);
        if (otros.length > 0) setOtroDeporte(otros.join(", "));
      } else {
        setPracticaDeporte("no");
      }

      // Cargar referencias
      if (cliente.referencia && cliente.referencia.trim() !== "") {
        console.log("Referencias del cliente:", cliente.referencia);

        const referencias = cliente.referencia.split(",").map(r => r.trim());
        const catalogoNames = referenciasCatalogo.map(r => r.nombreCatalogo);
        const selected = referencias.filter(r => catalogoNames.includes(r));
        const otras = referencias.filter(r => !catalogoNames.includes(r));

        console.log("Referencias seleccionadas:", selected);
        console.log("Otras referencias:", otras);

        setSelectedReferencias(selected);
        if (otras.length > 0) setOtraReferencia(otras.join(", "));
      }
    } catch (error) {
      console.error("Error al cargar cliente:", error);
      setModalStatus("error");
      setModalMessage("Error al cargar los datos del cliente");
      open();
    }
  };

  const handleInputChange = (field: keyof ClienteFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCountryChange = (country: Country | null) => {
    setSelectedCountry(country);
    if (country) {
      handleInputChange("nacionalidad", country.alpha2Code);
    }
  };

  const handlePhoneCountryChange = (country: Country | null) => {
    setSelectedPhoneCountry(country);
    if (country) {
      const callingCode = country.callingCodes[0] || "";
      handleInputChange("telefono", `+${callingCode} ${phoneNumber}`);
    }
  };

  const handlePhoneNumberChange = (value: string) => {
    setPhoneNumber(value);
    if (selectedPhoneCountry) {
      const callingCode = selectedPhoneCountry.callingCodes[0] || "";
      handleInputChange("telefono", `+${callingCode} ${value}`);
    }
  };

  const handleCondicionMedicaToggle = (nombreCondicion: string) => {
    setSelectedCondiciones((prev) =>
      prev.includes(nombreCondicion)
        ? prev.filter((c) => c !== nombreCondicion)
        : [...prev, nombreCondicion]
    );
  };

  const handleEnfermedadPielToggle = (nombreEnfermedad: string) => {
    setSelectedEnfermedades((prev) =>
      prev.includes(nombreEnfermedad)
        ? prev.filter((e) => e !== nombreEnfermedad)
        : [...prev, nombreEnfermedad]
    );
  };

  const handleDeporteToggle = (nombreDeporte: string) => {
    setSelectedDeportes((prev) =>
      prev.includes(nombreDeporte)
        ? prev.filter((d) => d !== nombreDeporte)
        : [...prev, nombreDeporte]
    );
  };

  const handleReferenciaToggle = (nombreReferencia: string) => {
    setSelectedReferencias((prev) =>
      prev.includes(nombreReferencia)
        ? prev.filter((r) => r !== nombreReferencia)
        : [...prev, nombreReferencia]
    );
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.nombre?.trim()) {
          setModalStatus("error");
          setModalMessage("Error al guardar los datos, el nombre es requerido");
          open();
          return false;
        }
        if (!formData.apellido?.trim()) {
          setModalStatus("error");
          setModalMessage("Error al guardar los datos, el apellido es requerido");
          open();
          return false;
        }
        if (!formData.fechaNacimiento) {
          setModalStatus("error");
          setModalMessage("Error al guardar los datos, la fecha de nacimiento es requerida");
          open();
          return false;
        }
        return true;
      case 2:
        if (formData.email?.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(formData.email)) {
            setModalStatus("error");
            setModalMessage("El email no es válido");
            open();
            return false;
          }
        }
        return true;
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      goToNextStep();
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    // Procesar fecha de nacimiento - extraer del array si es necesario
    let fechaNacimientoFinal: any = formData.fechaNacimiento;
    if (Array.isArray(formData.fechaNacimiento) && formData.fechaNacimiento.length > 0) {
      fechaNacimientoFinal = formData.fechaNacimiento[0];
    }

    // Preparar datos finales
    const finalData: ClienteFormData = {
      ...formData,
      fechaNacimiento: fechaNacimientoFinal,
      condicionMedica: tieneCondicionesMedicas === "si"
        ? [...selectedCondiciones, otraCondicion].filter(Boolean).join(", ")
        : "",
      enfermedadPiel: tieneEnfermedadesPiel === "si"
        ? [...selectedEnfermedades, otraEnfermedad].filter(Boolean).join(", ")
        : "",
      deporte: practicaDeporte === "si"
        ? [...selectedDeportes, otroDeporte].filter(Boolean).join(", ")
        : "",
      referencia: [...selectedReferencias, otraReferencia].filter(Boolean).join(", "),
    };

    console.log("Datos a enviar:", finalData);

    try {
      setLoading(true);
      let response;
      if (clienteId) {
        console.log("Actualizando cliente ID:", clienteId);
        response = await clienteService.update(clienteId, finalData);
        setModalMessage("Cliente actualizado exitosamente");
      } else {
        console.log("Creando nuevo cliente");
        response = await clienteService.create(finalData);
        setModalMessage("Cliente creado exitosamente");
      }
      console.log("Respuesta del servidor:", response);
      setModalStatus("success");
      open();
      setTimeout(() => {
        navigate("/modules/clientes");
      }, 2000);
    } catch (error: any) {
      console.error("Error al guardar:", error?.response?.data || error);
      setModalStatus("error");
      setModalMessage("Error al guardar el cliente. Por favor, intente nuevamente.");
      open();
    } finally {
      setLoading(false);
    }
  };

  const openConfirmModal = () => {
    if (validateStep(currentStep)) {
      setModalStatus("success");
      setModalMessage("¿Está seguro que desea guardar la información del cliente?");
      open();
    }
  };

  const confirmSave = () => {
    close();
    handleSubmit();
  };

  const handleBack = () => {
    navigate("/modules/clientes");
  };

  const filteredCountries =
    countryQuery === ""
      ? countries
      : countries.filter((country) =>
          country.name
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(countryQuery.toLowerCase().replace(/\s+/g, ""))
        );

  const filteredPhoneCountries =
    phoneCountryQuery === ""
      ? countries
      : countries.filter((country) =>
          country.name
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(phoneCountryQuery.toLowerCase().replace(/\s+/g, ""))
        );

  if (loading || loadingCountries || loadingCatalogos) {
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

      {/* Stepper */}
      <ol className="steps mb-8">
        {STEP_TITLES.map((title, i) => {
          const step = i + 1;
          return (
            <li
              key={step}
              className={clsx(
                "step",
                currentStep > step
                  ? "before:bg-primary-500"
                  : "before:bg-gray-200 dark:before:bg-surface-2"
              )}
            >
              <button
                onClick={() => setStep(step)}
                className={clsx(
                  "step-header rounded-full transition-all dark:text-white",
                  currentStep === step
                    ? "border-2 border-primary-500 bg-gray-200 text-gray-800 dark:bg-surface-2"
                    : currentStep > step
                    ? "bg-primary-600 text-white dark:bg-primary-500"
                    : "bg-gray-200 text-gray-800 dark:bg-surface-2"
                )}
              >
                {step}
              </button>
              <h3 className="text-sm font-medium text-gray-600 dark:text-dark-100">
                {title}
              </h3>
            </li>
          );
        })}
      </ol>

      {/* Form Content */}
      <div className="rounded-lg bg-white p-8 shadow-md dark:bg-dark-700">
        {/* Paso 1: Información Personal */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Información Personal
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Identificación
                </label>
                <Input
                  value={formData.identificacion || ""}
                  onChange={(e) => handleInputChange("identificacion", e.target.value)}
                  placeholder="Ingrese la identificación"
                  className="w-full"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.nombre || ""}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  placeholder="Ingrese el nombre"
                  className="w-full"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Apellido <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.apellido || ""}
                  onChange={(e) => handleInputChange("apellido", e.target.value)}
                  placeholder="Ingrese el apellido"
                  className="w-full"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Fecha de Nacimiento <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  value={formData.fechaNacimiento}
                  onChange={(date) => handleInputChange("fechaNacimiento", date)}
                  options={{
                    maxDate: new Date(new Date().setDate(new Date().getDate() - 1)),
                    dateFormat: "Y-m-d",
                  }}
                  placeholder="Seleccione la fecha"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Nacionalidad
                </label>
                <Combobox value={selectedCountry} onChange={handleCountryChange}>
                  {({ open }) => (
                    <div className="relative">
                      <div className="relative w-full cursor-pointer overflow-hidden">
                        <ComboboxInput
                          as={Input}
                          autoComplete="off"
                          className="px-10"
                          displayValue={(country: Country | null) =>
                            country ? country.name : ""
                          }
                          onChange={(event) => setCountryQuery(event.target.value)}
                          placeholder="Buscar país..."
                        />
                        {selectedCountry && (
                          <div className="pointer-events-none absolute inset-y-0 flex items-center ltr:left-0 ltr:pl-3 rtl:right-0 rtl:pr-3">
                            <img
                              className="size-5 rounded"
                              src={selectedCountry.flags.svg}
                              alt={selectedCountry.name}
                            />
                          </div>
                        )}
                        <ComboboxButton className="absolute inset-y-0 flex items-center ltr:right-0 ltr:pr-2 rtl:left-0 rtl:pl-2">
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
                        enter="transition ease-out"
                        enterFrom="opacity-0 translate-y-2"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-2"
                        afterLeave={() => setCountryQuery("")}
                      >
                        <ComboboxOptions className="absolute z-10 mt-2 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-300 bg-white py-1 shadow-lg dark:border-dark-500 dark:bg-dark-750">
                          {filteredCountries.length === 0 && countryQuery !== "" ? (
                            <div className="relative cursor-default select-none px-4 py-2 text-gray-800 dark:text-dark-100">
                              No se encontraron países
                            </div>
                          ) : (
                            filteredCountries.map((country) => (
                              <ComboboxOption
                                key={country.alpha2Code}
                                value={country}
                                className={({ focus, selected }) =>
                                  clsx(
                                    "relative cursor-pointer select-none px-4 py-2 transition-colors",
                                    focus && !selected && "bg-gray-100 dark:bg-dark-600",
                                    selected && "bg-primary-600 text-white dark:bg-primary-500",
                                    !selected && "text-gray-800 dark:text-dark-100"
                                  )
                                }
                              >
                                <div className="flex items-center space-x-3">
                                  <img
                                    className="size-5 rounded"
                                    src={country.flags.svg}
                                    alt={country.name}
                                  />
                                  <span>{country.name}</span>
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
            </div>
          </div>
        )}

        {/* Paso 2: Contacto */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Información de Contacto
            </h2>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Teléfono
                </label>
                <div className="flex -space-x-px">
                  <Combobox value={selectedPhoneCountry} onChange={handlePhoneCountryChange}>
                    {({ open }) => (
                      <div className="relative w-64">
                        <ComboboxInput
                          as={Input}
                          autoComplete="off"
                          className="rounded-r-none px-10"
                          displayValue={(country: Country | null) =>
                            country ? `+${country.callingCodes[0]}` : ""
                          }
                          onChange={(event) => setPhoneCountryQuery(event.target.value)}
                          placeholder="Buscar país..."
                        />
                        {selectedPhoneCountry && (
                          <div className="pointer-events-none absolute inset-y-0 flex items-center ltr:left-0 ltr:pl-3 rtl:right-0 rtl:pr-3">
                            <img
                              className="size-5 rounded"
                              src={selectedPhoneCountry.flags.svg}
                              alt={selectedPhoneCountry.name}
                            />
                          </div>
                        )}
                        <ComboboxButton className="absolute inset-y-0 flex items-center ltr:right-0 ltr:pr-2 rtl:left-0 rtl:pl-2">
                          <ChevronDownIcon
                            className={clsx(
                              "size-5 text-gray-400 transition-transform dark:text-dark-300",
                              open && "rotate-180"
                            )}
                          />
                        </ComboboxButton>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out"
                          enterFrom="opacity-0 translate-y-2"
                          enterTo="opacity-100 translate-y-0"
                          leave="transition ease-in"
                          leaveFrom="opacity-100 translate-y-0"
                          leaveTo="opacity-0 translate-y-2"
                          afterLeave={() => setPhoneCountryQuery("")}
                        >
                          <ComboboxOptions className="absolute z-10 mt-2 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-300 bg-white py-1 shadow-lg dark:border-dark-500 dark:bg-dark-750">
                            {filteredPhoneCountries.length === 0 ? (
                              <div className="px-4 py-2 text-gray-800 dark:text-dark-100">
                                No se encontraron países
                              </div>
                            ) : (
                              filteredPhoneCountries.map((country) => (
                                <ComboboxOption
                                  key={country.alpha2Code}
                                  value={country}
                                  className={({ focus, selected }) =>
                                    clsx(
                                      "cursor-pointer px-4 py-2 transition-colors",
                                      focus && !selected && "bg-gray-100 dark:bg-dark-600",
                                      selected && "bg-primary-600 text-white"
                                    )
                                  }
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <img
                                        className="size-5 rounded"
                                        src={country.flags.svg}
                                        alt={country.name}
                                      />
                                      <span>{country.name}</span>
                                    </div>
                                    <span className="text-sm">+{country.callingCodes[0]}</span>
                                  </div>
                                </ComboboxOption>
                              ))
                            )}
                          </ComboboxOptions>
                        </Transition>
                      </div>
                    )}
                  </Combobox>
                  <Input
                    value={phoneNumber}
                    onChange={(e) => handlePhoneNumberChange(e.target.value)}
                    placeholder="Número de teléfono"
                    className="flex-1 rounded-l-none"
                    component={Cleave}
                    options={{
                      delimiter: " ",
                      blocks: [2, 3, 4, 4],
                      numericOnly: true,
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Email 
                </label>
                <Input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Instagram
                </label>
                <div className="relative">
                  <Input
                    value={formData.redes || ""}
                    onChange={(e) => handleInputChange("redes", e.target.value)}
                    placeholder="@usuario"
                    className="w-full pl-10"
                  />
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <SiInstagram className="size-4 text-pink-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Paso 3: Historial Médico */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Historial Médico y Deportivo
            </h2>

            {/* Condiciones Médicas */}
            <div>
              <label className="mb-3 block text-sm font-medium">
                ¿Tiene condiciones médicas?
              </label>
              <div className="flex space-x-4">
                <Radio
                  name="condiciones"
                  checked={tieneCondicionesMedicas === "si"}
                  onChange={() => setTieneCondicionesMedicas("si")}
                  label="Sí"
                />
                <Radio
                  name="condiciones"
                  checked={tieneCondicionesMedicas === "no"}
                  onChange={() => setTieneCondicionesMedicas("no")}
                  label="No"
                />
              </div>

              {tieneCondicionesMedicas === "si" && (
                <div className="mt-4 space-y-3 rounded-lg border border-gray-200 p-4 dark:border-dark-500">
                  <label className="text-sm font-medium mb-4">
                    Seleccione las condiciones:
                  </label>
                  <div className="grid gap-2 ls:grid-cols-2 mt-2">
                    {condicionesMedicasCatalogo.map((condicion) => (
                      <label
                        key={condicion.idCatalogo}
                        className="flex cursor-pointer items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCondiciones.includes(condicion.nombreCatalogo)}
                          onChange={() =>
                            handleCondicionMedicaToggle(condicion.nombreCatalogo)
                          }
                          className="size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {condicion.nombreCatalogo}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-3">
                    <label className="mb-2 block text-sm">Otra (especifique):</label>
                    <Input
                      value={otraCondicion}
                      onChange={(e) => setOtraCondicion(e.target.value)}
                      placeholder="Escriba otra condición"
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Enfermedades de Piel */}
            <div>
              <label className="mb-3 block text-sm font-medium">
                ¿Tiene enfermedades de piel?
              </label>
              <div className="flex space-x-4">
                <Radio
                  name="enfermedades"
                  checked={tieneEnfermedadesPiel === "si"}
                  onChange={() => setTieneEnfermedadesPiel("si")}
                  label="Sí"
                />
                <Radio
                  name="enfermedades"
                  checked={tieneEnfermedadesPiel === "no"}
                  onChange={() => setTieneEnfermedadesPiel("no")}
                  label="No"
                />
              </div>

              {tieneEnfermedadesPiel === "si" && (
                <div className="mt-4 space-y-3 rounded-lg border border-gray-200 p-4 dark:border-dark-500">
                  <label className="text-sm font-medium">
                    Seleccione las enfermedades:
                  </label>
                  <div className="grid gap-2 sm:grid-cols-2 mt-2">
                    {enfermedadesPielCatalogo.map((enfermedad) => (
                      <label
                        key={enfermedad.idCatalogo}
                        className="flex cursor-pointer items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={selectedEnfermedades.includes(enfermedad.nombreCatalogo)}
                          onChange={() =>
                            handleEnfermedadPielToggle(enfermedad.nombreCatalogo)
                          }
                          className="size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {enfermedad.nombreCatalogo}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-3">
                    <label className="mb-2 block text-sm">Otra (especifique):</label>
                    <Input
                      value={otraEnfermedad}
                      onChange={(e) => setOtraEnfermedad(e.target.value)}
                      placeholder="Escriba otra enfermedad"
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Deportes */}
            <div>
              <label className="mb-3 block text-sm font-medium">
                ¿Practica algún deporte?
              </label>
              <div className="flex space-x-4">
                <Radio
                  name="deporte"
                  checked={practicaDeporte === "si"}
                  onChange={() => setPracticaDeporte("si")}
                  label="Sí"
                />
                <Radio
                  name="deporte"
                  checked={practicaDeporte === "no"}
                  onChange={() => setPracticaDeporte("no")}
                  label="No"
                />
              </div>

              {practicaDeporte === "si" && (
                <div className="mt-4 space-y-3 rounded-lg border border-gray-200 p-4 dark:border-dark-500">
                  <label className="text-sm font-medium">
                    Seleccione los deportes:
                  </label>
                  <div className="grid gap-2 sm:grid-cols-2 mt-2">
                    {deportesCatalogo.map((deporte) => (
                      <label
                        key={deporte.idCatalogo}
                        className="flex cursor-pointer items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={selectedDeportes.includes(deporte.nombreCatalogo)}
                          onChange={() => handleDeporteToggle(deporte.nombreCatalogo)}
                          className="size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {deporte.nombreCatalogo}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-3">
                    <label className="mb-2 block text-sm">Otro (especifique):</label>
                    <Input
                      value={otroDeporte}
                      onChange={(e) => setOtroDeporte(e.target.value)}
                      placeholder="Escriba otro deporte"
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Paso 4: Referencias */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Referencias y Observaciones
            </h2>

            <div>
              <label className="mb-3 block text-sm font-medium">
                ¿Cómo nos conoció?
              </label>
              <div className="space-y-3 rounded-lg border border-gray-200 p-4 dark:border-dark-500">
                <div className="grid gap-2 sm:grid-cols-2">
                  {referenciasCatalogo.map((referencia) => (
                    <label
                      key={referencia.idCatalogo}
                      className="flex cursor-pointer items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={selectedReferencias.includes(referencia.nombreCatalogo)}
                        onChange={() => handleReferenciaToggle(referencia.nombreCatalogo)}
                        className="size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {referencia.nombreCatalogo}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="mt-3">
                  <label className="mb-2 block text-sm">Otra (especifique):</label>
                  <Input
                    value={otraReferencia}
                    onChange={(e) => setOtraReferencia(e.target.value)}
                    placeholder="Escriba otra referencia"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Observaciones
              </label>
              <textarea
                value={formData.observaciones || ""}
                onChange={(e) => handleInputChange("observaciones", e.target.value)}
                placeholder="Comentarios adicionales..."
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-dark-500 dark:bg-dark-600 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-6 flex justify-between">
        <Button
          onClick={goToPrevStep}
          disabled={!canGoToPrevStep}
          variant="outlined"
          className="px-6"
        >
          Anterior
        </Button>

        {currentStep < 4 ? (
          <Button onClick={handleNextStep} disabled={!canGoToNextStep} className="px-6">
            Siguiente
          </Button>
        ) : (
          <Button onClick={openConfirmModal} color="primary" className="px-8">
            Guardar Cliente
          </Button>
        )}
      </div>

      {/* Modal de Confirmación */}
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
                    {modalStatus === "success" ? "Confirmación" : "Error"}
                  </DialogTitle>

                  <p className="mt-4 min-h-[60px] text-base text-gray-600 dark:text-gray-400 sm:text-lg">
                    {modalMessage}
                  </p>

                  <div className="mt-8 flex justify-center gap-3">
                    {modalMessage.includes("¿Está seguro") ? (
                      <>
                        <Button onClick={close} variant="outlined" className="px-6">
                          Cancelar
                        </Button>
                        <Button onClick={confirmSave} color="success" className="px-6">
                          Confirmar
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={close}
                        color={modalStatus === "success" ? "success" : "error"}
                        className="px-8"
                      >
                        Cerrar
                      </Button>
                    )}
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
