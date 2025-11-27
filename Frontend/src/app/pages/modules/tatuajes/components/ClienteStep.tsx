import { Fragment } from "react";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Transition,
} from "@headlessui/react";
import {
  ChevronDownIcon,
  UserPlusIcon,
  UserIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { SiInstagram } from "react-icons/si";
import Cleave from "cleave.js/react";
import clsx from "clsx";

import { Button, Input } from "@/components/ui";
import { DatePicker } from "@/components/shared/form/Datepicker";
import type { Cliente, ClienteFormData } from "@/types/cliente";
import type { Country } from "@/constants/countries";

interface ClienteStepProps {
  modoCliente: "seleccionar" | "crear";
  setModoCliente: (modo: "seleccionar" | "crear") => void;
  clienteSeleccionado: Cliente | null;
  setClienteSeleccionado: (cliente: Cliente | null) => void;
  clienteQuery: string;
  setClienteQuery: (query: string) => void;
  nuevoCliente: ClienteFormData;
  setNuevoCliente: (cliente: ClienteFormData) => void;
  clientes: Cliente[];
  countries: Country[];
  selectedPhoneCountry: Country | null;
  setSelectedPhoneCountry: (country: Country | null) => void;
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  phoneCountryQuery: string;
  setPhoneCountryQuery: (query: string) => void;
  esMenorDeEdad: boolean;
  calculateAge: (date: string) => number;
}

export function ClienteStep({
  modoCliente,
  setModoCliente,
  clienteSeleccionado,
  setClienteSeleccionado,
  clienteQuery,
  setClienteQuery,
  nuevoCliente,
  setNuevoCliente,
  clientes,
  countries,
  selectedPhoneCountry,
  setSelectedPhoneCountry,
  phoneNumber,
  setPhoneNumber,
  phoneCountryQuery,
  setPhoneCountryQuery,
  esMenorDeEdad,
  calculateAge,
}: ClienteStepProps) {
  const handleClienteChange = (cliente: Cliente | null) => {
    setClienteSeleccionado(cliente);
    setClienteQuery(cliente ? `${cliente.nombre} ${cliente.apellido}` : "");
  };

  const handleNuevoClienteChange = (field: keyof ClienteFormData, value: any) => {
    setNuevoCliente({ ...nuevoCliente, [field]: value });
  };

  const handlePhoneCountryChange = (country: Country | null) => {
    setSelectedPhoneCountry(country);
    if (country && phoneNumber) {
      const dialCode = country.dialCode || "";
      handleNuevoClienteChange("telefono", `${dialCode} ${phoneNumber}`);
    }
  };

  const handlePhoneNumberChange = (value: string) => {
    setPhoneNumber(value);
    if (selectedPhoneCountry) {
      const dialCode = selectedPhoneCountry.dialCode || "";
      handleNuevoClienteChange("telefono", `${dialCode} ${value}`);
    }
  };

  const filteredClientes =
    clienteQuery === ""
      ? clientes
      : clientes.filter((c) => {
          const fullName = `${c.nombre} ${c.apellido} ${c.identificacion}`.toLowerCase();
          return fullName.includes(clienteQuery.toLowerCase());
        });

  const filteredPhoneCountries =
    phoneCountryQuery === ""
      ? countries
      : countries.filter((country) =>
          country.name.toLowerCase().includes(phoneCountryQuery.toLowerCase())
        );

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4 dark:border-dark-600">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          <UserIcon className="size-7 text-primary-500" />
          Información del Cliente
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Seleccione un cliente existente o registre uno nuevo
        </p>
      </div>

      {/* Selector de modo */}
      <div className="flex gap-4">
        <Button
          onClick={() => setModoCliente("seleccionar")}
          variant={modoCliente === "seleccionar" ? "default" : "outlined"}
          className="flex-1"
        >
          <UserIcon className="mr-2 size-5" />
          Seleccionar Cliente
        </Button>
        <Button
          onClick={() => setModoCliente("crear")}
          variant={modoCliente === "crear" ? "default" : "outlined"}
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
            <Combobox value={clienteSeleccionado} onChange={handleClienteChange}>
              {({ open: comboOpen }) => (
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
                          "size-5 text-gray-400 transition-transform",
                          comboOpen && "rotate-180"
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
                      {filteredClientes.length === 0 && clienteQuery !== "" ? (
                        <div className="px-4 py-2 text-gray-800 dark:text-dark-100">
                          No se encontraron clientes
                        </div>
                      ) : (
                        filteredClientes.map((cliente) => (
                          <ComboboxOption
                            key={cliente.idCliente}
                            value={cliente}
                            className={({ focus, selected }) =>
                              clsx(
                                "relative cursor-pointer select-none px-4 py-2",
                                focus && !selected && "bg-gray-100 dark:bg-dark-600",
                                selected && "bg-primary-600 text-white"
                              )
                            }
                          >
                            <div>
                              <div className="font-medium">
                                {cliente.nombre} {cliente.apellido}
                              </div>
                              {cliente.identificacion && (
                                <div className="text-sm opacity-75">ID: {cliente.identificacion}</div>
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

          {/* Mostrar datos del cliente seleccionado */}
          {clienteSeleccionado && (
            <div className="rounded-lg bg-primary-50 p-4 dark:bg-primary-900/20">
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
                {clienteSeleccionado.email && (
                  <div>
                    <span className="font-medium">Email:</span> {clienteSeleccionado.email}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modo: Crear Nuevo Cliente */}
      {modoCliente === "crear" && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Nombre <span className="text-red-500">*</span>
              </label>
              <Input
                value={nuevoCliente.nombre || ""}
                onChange={(e) => handleNuevoClienteChange("nombre", e.target.value)}
                placeholder="Ingrese el nombre"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Apellido <span className="text-red-500">*</span>
              </label>
              <Input
                value={nuevoCliente.apellido || ""}
                onChange={(e) => handleNuevoClienteChange("apellido", e.target.value)}
                placeholder="Ingrese el apellido"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Identificación</label>
              <Input
                value={nuevoCliente.identificacion || ""}
                onChange={(e) => handleNuevoClienteChange("identificacion", e.target.value)}
                placeholder="Cédula o pasaporte"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Fecha de Nacimiento <span className="text-red-500">*</span>
              </label>
              <DatePicker
                value={nuevoCliente.fechaNacimiento}
                onChange={(date) => handleNuevoClienteChange("fechaNacimiento", date)}
                options={{
                  maxDate: new Date(new Date().setDate(new Date().getDate() - 1)),
                  dateFormat: "Y-m-d",
                }}
                placeholder="Seleccione la fecha"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Teléfono</label>
              <div className="flex -space-x-px">
                <Combobox value={selectedPhoneCountry} onChange={handlePhoneCountryChange}>
                  {({ open: phoneOpen }) => (
                    <div className="relative w-48">
                      <ComboboxInput
                        as={Input}
                        autoComplete="off"
                        className="rounded-r-none"
                        displayValue={(country: Country | null) =>
                          country ? country.dialCode : ""
                        }
                        onChange={(event) => setPhoneCountryQuery(event.target.value)}
                        placeholder="País"
                      />
                      <ComboboxButton className="absolute inset-y-0 right-2 flex items-center">
                        <ChevronDownIcon
                          className={clsx(
                            "size-5 text-gray-400 transition-transform",
                            phoneOpen && "rotate-180"
                          )}
                        />
                      </ComboboxButton>
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                        afterLeave={() => setPhoneCountryQuery("")}
                      >
                        <ComboboxOptions className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-lg border border-gray-300 bg-white py-1 shadow-lg dark:border-dark-500 dark:bg-dark-750">
                          {filteredPhoneCountries.map((country) => (
                            <ComboboxOption
                              key={country.code}
                              value={country}
                              className={({ focus, selected }) =>
                                clsx(
                                  "cursor-pointer px-4 py-2",
                                  focus && !selected && "bg-gray-100 dark:bg-dark-600",
                                  selected && "bg-primary-600 text-white"
                                )
                              }
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm">{country.name}</span>
                                </div>
                                <span className="text-sm">{country.dialCode}</span>
                              </div>
                            </ComboboxOption>
                          ))}
                        </ComboboxOptions>
                      </Transition>
                    </div>
                  )}
                </Combobox>
                <Input
                  value={phoneNumber}
                  onChange={(e) => handlePhoneNumberChange(e.target.value)}
                  placeholder="Número"
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
              <label className="mb-2 block text-sm font-medium">Email</label>
              <Input
                type="email"
                value={nuevoCliente.email || ""}
                onChange={(e) => handleNuevoClienteChange("email", e.target.value)}
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Instagram</label>
              <div className="relative">
                <Input
                  value={nuevoCliente.redes || ""}
                  onChange={(e) => handleNuevoClienteChange("redes", e.target.value)}
                  placeholder="@usuario"
                  className="pl-10"
                />
                <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                  <SiInstagram className="size-4 text-pink-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Mostrar advertencia si es menor */}
          {nuevoCliente.fechaNacimiento && esMenorDeEdad && (
            <div className="rounded-lg border border-warning-200 bg-warning-50 p-4 dark:border-warning-800 dark:bg-warning-900/20">
              <div className="flex items-start gap-3">
                <ShieldCheckIcon className="mt-0.5 size-6 flex-shrink-0 text-warning-600" />
                <div>
                  <h4 className="font-semibold text-warning-900 dark:text-warning-100">
                    Cliente Menor de Edad
                  </h4>
                  <p className="mt-1 text-sm text-warning-800 dark:text-warning-200">
                    El cliente tiene {calculateAge(nuevoCliente.fechaNacimiento)} años. En el
                    siguiente paso deberá registrar o seleccionar un tutor responsable.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
