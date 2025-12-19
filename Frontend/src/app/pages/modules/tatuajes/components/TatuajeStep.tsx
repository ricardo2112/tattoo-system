import { Fragment, useEffect, useState } from "react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
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
import { Input, Skeleton } from "@/components/ui";
import { catalogoService } from "@/services/catalogoService";
import type { Catalogo } from "@/types/catalogo";

interface TatuajeData {
  artista: string;
  detalle: string;
  precio: string;
  zonaTatuaje: string;
  abono: string;
  formaPago: string;
  estadoPago: string;
}

interface TatuajeStepProps {
  tatuajeData: TatuajeData;
  setTatuajeData: (data: TatuajeData) => void;
}

interface Usuario {
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
}

export function TatuajeStep({ tatuajeData, setTatuajeData }: TatuajeStepProps) {
  const [loading, setLoading] = useState(true);
  const [artistas, setArtistas] = useState<Usuario[]>([]);
  const [zonasDelCuerpo, setZonasDelCuerpo] = useState<Catalogo[]>([]);
  const [formasPago, setFormasPago] = useState<Catalogo[]>([]);

  // Estados para artista combobox
  const [selectedArtista, setSelectedArtista] = useState<Usuario | null>(null);
  const [artistaQuery, setArtistaQuery] = useState("");

  // Estados para zona combobox
  const [selectedZona, setSelectedZona] = useState<Catalogo | null>(null);
  const [zonaQuery, setZonaQuery] = useState("");

  // Estados para forma de pago combobox
  const [selectedFormaPago, setSelectedFormaPago] = useState<Catalogo | null>(null);
  const [formaPagoQuery, setFormaPagoQuery] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  // Limpiar selecciones cuando el componente se monta (cada vez que se vuelve a este paso)
  useEffect(() => {
    setSelectedArtista(null);
    setSelectedZona(null);
    setSelectedFormaPago(null);
    setArtistaQuery("");
    setZonaQuery("");
    setFormaPagoQuery("");
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // TODO: Cargar artistas filtrando por rol desde el backend
      // Temporal: usar usuarios mock hasta implementar endpoint
      const mockArtistas: Usuario[] = [
        { idUsuario: 1, nombre: "Juan", apellido: "Pérez", email: "juan@ejemplo.com" },
        { idUsuario: 2, nombre: "María", apellido: "García", email: "maria@ejemplo.com" },
      ];
      setArtistas(mockArtistas);

      // Cargar catálogos
      const catalogos = await catalogoService.getAll();

      // Cargar zonas del cuerpo
      const zonasTipo = catalogos.find(t => t.nombreTipo === "zona_del_cuerpo");
      if (zonasTipo) {
        setZonasDelCuerpo(zonasTipo.catalogos);
      }

      // Cargar formas de pago
      const formasPagoTipo = catalogos.find(t => t.nombreTipo === "forma_de_pago");
      if (formasPagoTipo) {
        setFormasPago(formasPagoTipo.catalogos);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof TatuajeData, value: string) => {
    const updatedData = { ...tatuajeData, [field]: value };

    // Auto-calcular estado de pago basado en precio y abono
    if (field === "precio" || field === "abono") {
      const precio = parseFloat(field === "precio" ? value : tatuajeData.precio) || 0;
      const abono = parseFloat(field === "abono" ? value : tatuajeData.abono) || 0;

      if (abono === 0) {
        updatedData.estadoPago = "pendiente";
      } else if (abono >= precio && precio > 0) {
        updatedData.estadoPago = "pagado";
      } else if (abono > 0 && abono < precio) {
        updatedData.estadoPago = "parcial";
      }
    }

    setTatuajeData(updatedData);
  };

  const handleArtistaChange = (artista: Usuario | null) => {
    setSelectedArtista(artista);
    if (artista) {
      handleChange("artista", `${artista.nombre} ${artista.apellido}`);
    }
  };

  const handleZonaChange = (zona: Catalogo | null) => {
    setSelectedZona(zona);
    if (zona) {
      handleChange("zonaTatuaje", zona.nombreCatalogo);
    }
  };

  const handleFormaPagoChange = (formaPago: Catalogo | null) => {
    setSelectedFormaPago(formaPago);
    if (formaPago) {
      handleChange("formaPago", formaPago.nombreCatalogo);
    }
  };

  const filteredArtistas =
    artistaQuery === ""
      ? artistas
      : artistas.filter((artista) => {
          const fullName = `${artista.nombre} ${artista.apellido}`.toLowerCase();
          return fullName.includes(artistaQuery.toLowerCase());
        });

  const filteredZonas =
    zonaQuery === ""
      ? zonasDelCuerpo
      : zonasDelCuerpo.filter((zona) =>
          zona.nombreCatalogo.toLowerCase().includes(zonaQuery.toLowerCase())
        );

  const filteredFormasPago =
    formaPagoQuery === ""
      ? formasPago
      : formasPago.filter((forma) =>
          forma.nombreCatalogo.toLowerCase().includes(formaPagoQuery.toLowerCase())
        );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4 dark:border-dark-600">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          <DocumentTextIcon className="size-7 text-primary-500" />
          Información del Tatuaje
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Complete los detalles del servicio de tatuaje
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Selector de Artista */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Artista <span className="text-red-500">*</span>
          </label>
          <Combobox value={selectedArtista} onChange={handleArtistaChange}>
            {({ open }) => (
              <div className="relative">
                <div className="relative w-full">
                  <ComboboxInput
                    as={Input}
                    className="pr-10"
                    placeholder="Buscar artista..."
                    displayValue={(artista: Usuario | null) =>
                      artista ? `${artista.nombre} ${artista.apellido}` : ""
                    }
                    onChange={(event) => setArtistaQuery(event.target.value)}
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
                  afterLeave={() => setArtistaQuery("")}
                >
                  <ComboboxOptions className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-lg border border-gray-300 bg-white py-1 shadow-lg dark:border-dark-500 dark:bg-dark-750">
                    {filteredArtistas.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-gray-800 dark:text-dark-100">
                        No se encontraron artistas
                      </div>
                    ) : (
                      filteredArtistas.map((artista) => (
                        <ComboboxOption
                          key={artista.idUsuario}
                          value={artista}
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
                              {artista.nombre} {artista.apellido}
                            </div>
                            <div className="text-sm opacity-75">{artista.email}</div>
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

        {/* Selector de Zona del Cuerpo */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Zona del Cuerpo <span className="text-red-500">*</span>
          </label>
          <Combobox value={selectedZona} onChange={handleZonaChange}>
            {({ open }) => (
              <div className="relative">
                <div className="relative w-full">
                  <ComboboxInput
                    as={Input}
                    className="pr-10"
                    placeholder="Buscar zona del cuerpo..."
                    displayValue={(zona: Catalogo | null) =>
                      zona ? zona.nombreCatalogo : ""
                    }
                    onChange={(event) => setZonaQuery(event.target.value)}
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
                  afterLeave={() => setZonaQuery("")}
                >
                  <ComboboxOptions className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-lg border border-gray-300 bg-white py-1 shadow-lg dark:border-dark-500 dark:bg-dark-750">
                    {filteredZonas.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-gray-800 dark:text-dark-100">
                        No se encontraron zonas
                      </div>
                    ) : (
                      filteredZonas.map((zona) => (
                        <ComboboxOption
                          key={zona.idCatalogo}
                          value={zona}
                          className={({ focus, selected }) =>
                            clsx(
                              "relative cursor-pointer select-none px-4 py-2.5 transition-colors",
                              focus && !selected && "bg-gray-100 dark:bg-dark-600",
                              selected && "bg-primary-600 text-white dark:bg-primary-500"
                            )
                          }
                        >
                          {zona.nombreCatalogo}
                        </ComboboxOption>
                      ))
                    )}
                  </ComboboxOptions>
                </Transition>
              </div>
            )}
          </Combobox>
        </div>

        {/* Detalle del Tatuaje */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">
            Detalle del Tatuaje <span className="text-red-500">*</span>
          </label>
          <textarea
            value={tatuajeData.detalle}
            onChange={(e) => handleChange("detalle", e.target.value)}
            placeholder="Descripción del diseño, estilo, tamaño, etc..."
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-dark-500 dark:bg-dark-600 dark:text-white"
          />
        </div>

        {/* Precio */}
        <div>
          <label className="mb-2 block text-sm font-medium">Precio Total (USD)</label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-500 dark:text-gray-400">
              $
            </span>
            <Input
              type="number"
              value={tatuajeData.precio}
              onChange={(e) => handleChange("precio", e.target.value)}
              placeholder="0.00"
              className="pl-8"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Abono */}
        <div>
          <label className="mb-2 block text-sm font-medium">Abono Inicial (USD)</label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-500 dark:text-gray-400">
              $
            </span>
            <Input
              type="number"
              value={tatuajeData.abono}
              onChange={(e) => handleChange("abono", e.target.value)}
              placeholder="0.00"
              className="pl-8"
              min="0"
              step="0.01"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Deje en blanco si no hay abono inicial
          </p>
        </div>

        {/* Forma de Pago - Solo mostrar si hay abono */}
        {tatuajeData.abono && parseFloat(tatuajeData.abono) > 0 && (
          <div>
            <label className="mb-2 block text-sm font-medium">
              Forma de Pago <span className="text-red-500">*</span>
            </label>
            <Combobox value={selectedFormaPago} onChange={handleFormaPagoChange}>
              {({ open }) => (
                <div className="relative">
                  <div className="relative w-full">
                    <ComboboxInput
                      as={Input}
                      className="pr-10"
                      placeholder="Seleccionar forma de pago..."
                      displayValue={(forma: Catalogo | null) =>
                        forma ? forma.nombreCatalogo : ""
                      }
                      onChange={(event) => setFormaPagoQuery(event.target.value)}
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
                    afterLeave={() => setFormaPagoQuery("")}
                  >
                    <ComboboxOptions className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-lg border border-gray-300 bg-white py-1 shadow-lg dark:border-dark-500 dark:bg-dark-750">
                      {filteredFormasPago.length === 0 ? (
                        <div className="px-4 py-2 text-sm text-gray-800 dark:text-dark-100">
                          No se encontraron formas de pago
                        </div>
                      ) : (
                        filteredFormasPago.map((forma) => (
                          <ComboboxOption
                            key={forma.idCatalogo}
                            value={forma}
                            className={({ focus, selected }) =>
                              clsx(
                                "relative cursor-pointer select-none px-4 py-2.5 transition-colors",
                                focus && !selected && "bg-gray-100 dark:bg-dark-600",
                                selected && "bg-primary-600 text-white dark:bg-primary-500"
                              )
                            }
                          >
                            {forma.nombreCatalogo}
                          </ComboboxOption>
                        ))
                      )}
                    </ComboboxOptions>
                  </Transition>
                </div>
              )}
            </Combobox>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Seleccione la forma de pago para el abono inicial
            </p>
          </div>
        )}

        {/* Estado de Pago - Solo lectura, calculado automáticamente */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">Estado de Pago</label>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-dark-600 dark:bg-dark-750">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Estado calculado:
              </span>
              <span
                className={clsx(
                  "rounded-full px-4 py-1.5 text-sm font-semibold capitalize",
                  tatuajeData.estadoPago === "pagado" &&
                    "bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-200",
                  tatuajeData.estadoPago === "parcial" &&
                    "bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-200",
                  tatuajeData.estadoPago === "pendiente" &&
                    "bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-200"
                )}
              >
                {tatuajeData.estadoPago === "parcial" ? "Pago Parcial" : tatuajeData.estadoPago}
              </span>
            </div>

            {/* Información del pago */}
            {tatuajeData.precio && (
              <div className="mt-3 space-y-2 border-t border-gray-200 pt-3 dark:border-dark-600">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Precio total:</span>
                  <span className="font-medium">${tatuajeData.precio} USD</span>
                </div>
                {tatuajeData.abono && parseFloat(tatuajeData.abono) > 0 && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Abono inicial:</span>
                      <span className="font-medium text-success-600 dark:text-success-400">
                        ${tatuajeData.abono} USD
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2 text-sm font-semibold dark:border-dark-600">
                      <span className="text-gray-700 dark:text-gray-300">Saldo pendiente:</span>
                      <span className="text-error-600 dark:text-error-400">
                        ${(parseFloat(tatuajeData.precio) - parseFloat(tatuajeData.abono)).toFixed(2)} USD
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            El estado se calcula automáticamente según el precio y el abono ingresado.
            {tatuajeData.abono && parseFloat(tatuajeData.abono) > 0 &&
              " El abono se registrará en el sistema de pagos y se asociará a este tatuaje."
            }
          </p>
        </div>
      </div>
    </div>
  );
}
