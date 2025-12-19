import { Fragment } from "react";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Transition,
} from "@headlessui/react";
import { ChevronDownIcon, UserPlusIcon, UserIcon, ShieldCheckIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

import { Button, Input } from "@/components/ui";
import type { Tutor, TutorFormData } from "@/types/tutor";

interface TutorStepProps {
  esMenorDeEdad: boolean;
  modoTutor: "seleccionar" | "crear";
  setModoTutor: (modo: "seleccionar" | "crear") => void;
  tutorSeleccionado: Tutor | null;
  setTutorSeleccionado: (tutor: Tutor | null) => void;
  tutorQuery: string;
  setTutorQuery: (query: string) => void;
  nuevoTutor: TutorFormData;
  setNuevoTutor: (tutor: TutorFormData) => void;
  tutores: Tutor[];
}

export function TutorStep({
  esMenorDeEdad,
  modoTutor,
  setModoTutor,
  tutorSeleccionado,
  setTutorSeleccionado,
  tutorQuery,
  setTutorQuery,
  nuevoTutor,
  setNuevoTutor,
  tutores,
}: TutorStepProps) {
  const handleTutorChange = (tutor: Tutor | null) => {
    setTutorSeleccionado(tutor);
    setTutorQuery(tutor ? `${tutor.nombre} ${tutor.apellido}` : "");
  };

  const handleNuevoTutorChange = (field: keyof TutorFormData, value: any) => {
    setNuevoTutor({ ...nuevoTutor, [field]: value });
  };

  const filteredTutores =
    tutorQuery === ""
      ? tutores
      : tutores.filter((t) => {
          const fullName = `${t.nombre} ${t.apellido} ${t.identificacion}`.toLowerCase();
          return fullName.includes(tutorQuery.toLowerCase());
        });

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4 dark:border-dark-600">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          <ShieldCheckIcon className="size-7 text-primary-500" />
          Tutor Responsable
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {esMenorDeEdad
            ? "El cliente es menor de edad. Debe registrar un tutor responsable"
            : "El cliente es mayor de edad. Puede continuar al siguiente paso"}
        </p>
      </div>

      {!esMenorDeEdad ? (
        <div className="rounded-lg border border-success-200 bg-success-50 p-6 text-center dark:border-success-800 dark:bg-success-900/20">
          <CheckCircleIcon className="mx-auto mb-3 size-12 text-success-600" />
          <h3 className="text-lg font-semibold text-success-900 dark:text-success-100">
            No se requiere tutor
          </h3>
          <p className="mt-2 text-sm text-success-800 dark:text-success-200">
            El cliente es mayor de edad. Puede continuar con el registro.
          </p>
        </div>
      ) : (
        <>
          {/* Selector de modo tutor */}
          <div className="flex gap-4">
            <Button
              onClick={() => setModoTutor("seleccionar")}
              variant={modoTutor === "seleccionar" ? "filled" : "outlined"}
              className="flex-1"
            >
              <UserIcon className="mr-2 size-5" />
              Seleccionar Tutor
            </Button>
            <Button
              onClick={() => setModoTutor("crear")}
              variant={modoTutor === "crear" ? "filled" : "outlined"}
              className="flex-1"
            >
              <UserPlusIcon className="mr-2 size-5" />
              Crear Nuevo Tutor
            </Button>
          </div>

          {/* Modo: Seleccionar Tutor */}
          {modoTutor === "seleccionar" && (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Buscar Tutor <span className="text-red-500">*</span>
                </label>
                <Combobox value={tutorSeleccionado} onChange={handleTutorChange}>
                  {({ open: comboOpen }) => (
                    <div className="relative">
                      <div className="relative w-full">
                        <ComboboxInput
                          as={Input}
                          className="pr-10"
                          placeholder="Buscar por nombre, apellido o identificación..."
                          displayValue={(tutor: Tutor | null) =>
                            tutor
                              ? `${tutor.nombre} ${tutor.apellido} ${tutor.identificacion ? `(${tutor.identificacion})` : ""}`
                              : ""
                          }
                          onChange={(event) => setTutorQuery(event.target.value)}
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
                        afterLeave={() => setTutorQuery("")}
                      >
                        <ComboboxOptions className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-lg border border-gray-300 bg-white py-1 shadow-lg dark:border-dark-500 dark:bg-dark-750">
                          {filteredTutores.length === 0 && tutorQuery !== "" ? (
                            <div className="px-4 py-2 text-gray-800 dark:text-dark-100">
                              No se encontraron tutores
                            </div>
                          ) : (
                            filteredTutores.map((tutor) => (
                              <ComboboxOption
                                key={tutor.idTutor}
                                value={tutor}
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
                                    {tutor.nombre} {tutor.apellido}
                                  </div>
                                  {tutor.parentezco && (
                                    <div className="text-sm opacity-75">{tutor.parentezco}</div>
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

              {tutorSeleccionado && (
                <div className="rounded-lg bg-primary-50 p-4 dark:bg-primary-900/20">
                  <h3 className="mb-2 font-semibold text-primary-900 dark:text-primary-100">
                    Tutor Seleccionado
                  </h3>
                  <div className="grid gap-2 text-sm">
                    <div>
                      <span className="font-medium">Nombre:</span> {tutorSeleccionado.nombre}{" "}
                      {tutorSeleccionado.apellido}
                    </div>
                    {tutorSeleccionado.parentezco && (
                      <div>
                        <span className="font-medium">Parentezco:</span> {tutorSeleccionado.parentezco}
                      </div>
                    )}
                    {tutorSeleccionado.identificacion && (
                      <div>
                        <span className="font-medium">ID:</span> {tutorSeleccionado.identificacion}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modo: Crear Nuevo Tutor */}
          {modoTutor === "crear" && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={nuevoTutor.nombre}
                    onChange={(e) => handleNuevoTutorChange("nombre", e.target.value)}
                    placeholder="Ingrese el nombre"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Apellido <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={nuevoTutor.apellido}
                    onChange={(e) => handleNuevoTutorChange("apellido", e.target.value)}
                    placeholder="Ingrese el apellido"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Identificación</label>
                  <Input
                    value={nuevoTutor.identificacion || ""}
                    onChange={(e) => handleNuevoTutorChange("identificacion", e.target.value)}
                    placeholder="Cédula o pasaporte"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Parentezco</label>
                  <select
                    value={nuevoTutor.parentezco || ""}
                    onChange={(e) => handleNuevoTutorChange("parentezco", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-dark-500 dark:bg-dark-600 dark:text-white"
                  >
                    <option value="">Seleccione una opción</option>
                    <option value="Padre">Padre</option>
                    <option value="Madre">Madre</option>
                    <option value="Tutor">Tutor</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
