// Import Dependencies
import { Fragment, useEffect, useState } from "react";
import { useStep } from "@/hooks/index";
import clsx from "clsx";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Transition,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { SiInstagram } from "react-icons/si";
import Cleave from "cleave.js/react";
// Local Imports
import { Button, Input, Skeleton, Radio } from "@/components/ui";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { countryService } from "@/services/countryService";
import { catalogoService } from "@/services/catalogoService";
import type { ClienteFormData } from "@/types/cliente";
import type { Country } from "@/types/country";
import type { Catalogo } from "@/types/catalogo";

// ----------------------------------------------------------------------

const STEP_TITLES = [
  "Información Personal",
  "Contacto",
  "Historial Médico",
  "Referencias",
];

export interface NuevoClienteFormProps {
  initialData?: ClienteFormData;
  onSubmit: (data: ClienteFormData) => void | Promise<void>;
  onCancel?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  submitButtonText?: string;
  loading?: boolean;
  showNavigation?: boolean;
  showStepper?: boolean;
  showInternalNavigation?: boolean;
  className?: string;
}

/**
 * Componente reutilizable para crear o editar clientes
 * Diseño elegante, premium y enfocado en usabilidad
 */
export function NuevoClienteForm({
  initialData,
  onSubmit,
  onCancel,
  onNext,
  onPrev,
  submitButtonText = "Guardar Cliente",
  loading = false,
  showNavigation = true,
  showStepper = true,
  showInternalNavigation = true,
  className = "",
}: NuevoClienteFormProps) {
  const [currentStep, helpers] = useStep(4);

  const {
    canGoToPrevStep,
    canGoToNextStep,
    goToNextStep,
    goToPrevStep,
    setStep,
  } = helpers;

  // Estados de carga
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
    ...initialData,
  });

  // Estados para autocomplete y búsqueda
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [countryQuery, setCountryQuery] = useState("");
  const [selectedPhoneCountry, setSelectedPhoneCountry] = useState<Country | null>(null);
  const [phoneCountryQuery, setPhoneCountryQuery] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Estados para condiciones médicas
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

  // Estados para validación
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar países y catálogos
  useEffect(() => {
    loadCountries();
    loadCatalogos();
  }, []);

  // Cargar datos iniciales cuando estén disponibles
  useEffect(() => {
    if (initialData && !loadingCountries && !loadingCatalogos && countries.length > 0) {
      loadInitialData(initialData);
    }
  }, [initialData, loadingCountries, loadingCatalogos, countries]);

  const loadCountries = async () => {
    try {
      const data = await countryService.getAll();
      setCountries(data);
    } catch (error) {
      console.error("Error al cargar países:", error);
    } finally {
      setLoadingCountries(false);
    }
  };

  const loadCatalogos = async () => {
    try {
      const allCatalogos = await catalogoService.getAll();

      const condicionesTipo = allCatalogos.find(t => t.nombreTipo === "condición_médica");
      const enfermedadesTipo = allCatalogos.find(t => t.nombreTipo === "enfermedad_de_piel");
      const deportesTipo = allCatalogos.find(t => t.nombreTipo === "deporte");
      const referenciasTipo = allCatalogos.find(t => t.nombreTipo === "como_nos_encontro");

      if (condicionesTipo) setCondicionesMedicasCatalogo(condicionesTipo.catalogos);
      if (enfermedadesTipo) setEnfermedadesPielCatalogo(enfermedadesTipo.catalogos);
      if (deportesTipo) setDeportesCatalogo(deportesTipo.catalogos);
      if (referenciasTipo) setReferenciasCatalogo(referenciasTipo.catalogos);
    } catch (error) {
      console.error("Error al cargar catálogos:", error);
    } finally {
      setLoadingCatalogos(false);
    }
  };

  const loadInitialData = (data: ClienteFormData) => {
    try {
      setFormData(data);

      // Cargar país de nacionalidad si existe
      if (data.nacionalidad && countries.length > 0) {
        const country = countries.find(c => c.alpha2Code === data.nacionalidad);
        if (country) {
          setSelectedCountry(country);
        }
      } else {
        const ecuador = countries.find(c => c.alpha2Code === "EC");
        setSelectedCountry(ecuador||null);
      }

      // Cargar país y número de teléfono
      if (data.telefono && countries.length > 0) {
        const phoneMatch = data.telefono.match(/^\+(\d+)\s+(.+)$/);
        if (phoneMatch) {
          const callingCode = phoneMatch[1];
          const number = phoneMatch[2];
          const phoneCountry = countries.find(c => c.callingCodes[0] === callingCode);
          if (phoneCountry) {
            setSelectedPhoneCountry(phoneCountry);
          }
          setPhoneNumber(number);
        } else {
          setPhoneNumber(data.telefono);
        }
      }

      // Cargar condiciones médicas
      if (data.condicionMedica && data.condicionMedica.trim() !== "") {
        setTieneCondicionesMedicas("si");
        const condiciones = data.condicionMedica.split(",").map(c => c.trim());
        const catalogoNames = condicionesMedicasCatalogo.map(c => c.nombreCatalogo);
        const selected = condiciones.filter(c => catalogoNames.includes(c));
        const otras = condiciones.filter(c => !catalogoNames.includes(c));
        setSelectedCondiciones(selected);
        if (otras.length > 0) setOtraCondicion(otras.join(", "));
      }

      // Cargar enfermedades de piel
      if (data.enfermedadPiel && data.enfermedadPiel.trim() !== "") {
        setTieneEnfermedadesPiel("si");
        const enfermedades = data.enfermedadPiel.split(",").map(e => e.trim());
        const catalogoNames = enfermedadesPielCatalogo.map(e => e.nombreCatalogo);
        const selected = enfermedades.filter(e => catalogoNames.includes(e));
        const otras = enfermedades.filter(e => !catalogoNames.includes(e));
        setSelectedEnfermedades(selected);
        if (otras.length > 0) setOtraEnfermedad(otras.join(", "));
      }

      // Cargar deportes
      if (data.deporte && data.deporte.trim() !== "") {
        setPracticaDeporte("si");
        const deportes = data.deporte.split(",").map(d => d.trim());
        const catalogoNames = deportesCatalogo.map(d => d.nombreCatalogo);
        const selected = deportes.filter(d => catalogoNames.includes(d));
        const otros = deportes.filter(d => !catalogoNames.includes(d));
        setSelectedDeportes(selected);
        if (otros.length > 0) setOtroDeporte(otros.join(", "));
      }

      // Cargar referencias
      if (data.referencia && data.referencia.trim() !== "") {
        const referencias = data.referencia.split(",").map(r => r.trim());
        const catalogoNames = referenciasCatalogo.map(r => r.nombreCatalogo);
        const selected = referencias.filter(r => catalogoNames.includes(r));
        const otras = referencias.filter(r => !catalogoNames.includes(r));
        setSelectedReferencias(selected);
        if (otras.length > 0) setOtraReferencia(otras.join(", "));
      }
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error);
    }
  };

  const handleInputChange = (field: keyof ClienteFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
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

  const validateStep = (step: number): { isValid: boolean; error?: string } => {
    switch (step) {
      case 1:
        if (!formData.nombre?.trim()) {
          return { isValid: false, error: "El nombre es requerido" };
        }
        if (!formData.apellido?.trim()) {
          return { isValid: false, error: "El apellido es requerido" };
        }
        if (!formData.fechaNacimiento) {
          return { isValid: false, error: "La fecha de nacimiento es requerida" };
        }
        return { isValid: true };
      case 2:
        if (formData.email?.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(formData.email)) {
            return { isValid: false, error: "El email no es válido" };
          }
        }
        return { isValid: true };
      default:
        return { isValid: true };
    }
  };

  const handleNextStep = () => {
    const validation = validateStep(currentStep);
    if (validation.isValid) {
      goToNextStep();
    }
    return validation;
  };

  const handleSubmit = async () => {
    const validation = validateStep(currentStep);
    if (!validation.isValid) {
      console.log("❌ Validación fallida en paso", currentStep, ":", validation.error);
      return validation;
    }

    // Procesar fecha de nacimiento
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

    console.log("📤 Enviando datos del cliente desde NuevoClienteForm:", finalData);
    await onSubmit(finalData);
    console.log("✅ Datos del cliente enviados correctamente");
    return { isValid: true };
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

  if (loadingCountries || loadingCatalogos) {
    return (
      <div className={className}>
        <Skeleton className="h-12 w-full rounded-lg mb-6" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Stepper */}
      {showStepper && (
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
      )}

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

        {/* Internal Navigation Buttons (for stepper navigation) */}
        {showInternalNavigation && (
          <div className="mt-8 flex justify-between border-t border-gray-200 pt-6 dark:border-dark-600">
            <Button
              onClick={goToPrevStep}
              disabled={!canGoToPrevStep || loading}
              variant="soft"
              color="neutral"
              className="px-6"
            >
              Anterior
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={handleNextStep}
                disabled={!canGoToNextStep || loading}
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
                {loading ? "Guardando..." : submitButtonText}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* External Navigation Buttons (for parent form navigation) */}
      {showNavigation && (
        <div className="mt-6 flex justify-between">
          <div className="flex gap-3">
            {onCancel && (
              <Button
                onClick={onCancel}
                variant="outlined"
                className="px-6"
                disabled={loading}
              >
                Cancelar
              </Button>
            )}
            {onPrev && (
              <Button
                onClick={onPrev}
                variant="outlined"
                className="px-6"
                disabled={loading}
              >
                Anterior
              </Button>
            )}
          </div>

          {onNext && (
            <Button
              onClick={async () => {
                const validation = await handleSubmit();
                if (validation.isValid) {
                  onNext();
                }
              }}
              className="px-6"
              disabled={loading}
            >
              Siguiente
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
