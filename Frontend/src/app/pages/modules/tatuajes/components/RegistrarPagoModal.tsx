// Import Dependencies
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  CheckCircleIcon,
  CurrencyDollarIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Fragment, useState, useEffect } from "react";

// Local Imports
import { Button, Input, Select } from "@/components/ui";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { pagoService } from "@/services/pagoService";
import { tatuajeService } from "@/services/tatuajeService";
import { catalogoService } from "@/services/catalogoService";
import type { Catalogo } from "@/types/catalogo";

// ----------------------------------------------------------------------

interface RegistrarPagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  idTatuaje: number;
  onSuccess: () => void;
  montoPendiente: number;
}

export function RegistrarPagoModal({
  isOpen,
  onClose,
  idTatuaje,
  onSuccess,
  montoPendiente,
}: RegistrarPagoModalProps) {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formasPago, setFormasPago] = useState<Catalogo[]>([]);

  // Form state
  const [monto, setMonto] = useState<string>("");
  const [formaPago, setFormaPago] = useState<string>("");
  const [fechaPago, setFechaPago] = useState<Date | null>(new Date());
  const [errors, setErrors] = useState<{
    monto?: string;
    formaPago?: string;
    fechaPago?: string;
  }>({});

  useEffect(() => {
    loadFormasPago();
  }, []);

  const loadFormasPago = async () => {
    try {
      // Cargar todos los catálogos
      const catalogos = await catalogoService.getAll();
      console.log("Catálogos cargados:", catalogos);

      // Buscar el tipo "forma_de_pago"
      const formasPagoTipo = catalogos.find(t => t.nombreTipo === "forma_de_pago");
      console.log("Tipo forma_de_pago encontrado:", formasPagoTipo);

      if (formasPagoTipo) {
        console.log("Formas de pago:", formasPagoTipo.catalogos);
        setFormasPago(formasPagoTipo.catalogos);
      } else {
        console.warn("No se encontró el tipo 'forma_de_pago' en los catálogos");
        console.log("Tipos disponibles:", catalogos.map(c => c.nombreTipo));
      }
    } catch (error) {
      console.error("Error al cargar formas de pago:", error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    const montoNumerico = parseFloat(monto);

    if (!monto || montoNumerico <= 0) {
      newErrors.monto = "El monto debe ser mayor a 0";
    } else if (montoNumerico > montoPendiente) {
      newErrors.monto = `El monto no puede ser mayor al pendiente ($${montoPendiente.toFixed(2)})`;
    }

    if (!formaPago) {
      newErrors.formaPago = "Debe seleccionar una forma de pago";
    }

    if (!fechaPago) {
      newErrors.fechaPago = "Debe seleccionar una fecha";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // 1. Crear el pago
      const nuevoPago = await pagoService.create({
        monto: parseFloat(monto),
        formaPago: formaPago,
        fechaPago: fechaPago?.toISOString(),
      });

      // 2. Asociar el pago al tatuaje
      await tatuajeService.registrarPago(idTatuaje, nuevoPago.idPago);

      // 3. Mostrar éxito
      setShowSuccess(true);

      // 4. Resetear el formulario
      setTimeout(() => {
        setShowSuccess(false);
        handleClose();
        onSuccess();
      }, 2000);
    } catch (error: any) {
      console.error("Error al registrar pago:", error);
      alert(
        error.response?.data?.message ||
          "Error al registrar el pago. Por favor intente nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setMonto("");
      setFormaPago("");
      setFechaPago(new Date());
      setErrors({});
      onClose();
    }
  };

  if (showSuccess) {
    return (
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5" onClose={() => {}}>
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
            <DialogPanel className="scrollbar-sm relative flex max-w-md flex-col overflow-y-auto rounded-lg bg-white px-4 py-10 text-center transition-all duration-300 dark:bg-dark-700 sm:px-5">
              <CheckCircleIcon className="mx-auto inline size-28 shrink-0 text-success" />

              <div className="mt-4">
                <DialogTitle
                  as="h3"
                  className="text-2xl font-semibold text-gray-800 dark:text-dark-100"
                >
                  Pago Registrado
                </DialogTitle>

                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  El pago ha sido registrado exitosamente y asociado al tatuaje.
                </p>
              </div>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    );
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
        onClose={handleClose}
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
          <DialogPanel className="scrollbar-sm relative flex w-full max-w-lg flex-col overflow-y-auto rounded-lg bg-white px-6 py-6 transition-all duration-300 dark:bg-dark-700 sm:px-8">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-dark-600">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                  <CurrencyDollarIcon className="size-6 text-primary" />
                </div>
                <DialogTitle
                  as="h3"
                  className="text-xl font-semibold text-gray-900 dark:text-white"
                >
                  Registrar Pago
                </DialogTitle>
              </div>
              <button
                onClick={handleClose}
                disabled={loading}
                className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-dark-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="size-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              {/* Monto */}
              <div>
                <label
                  htmlFor="monto"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Monto del Pago <span className="text-error">*</span>
                </label>
                <Input
                  id="monto"
                  type="number"
                  step="0.01"
                  min="0"
                  max={montoPendiente}
                  placeholder="Ingrese el monto"
                  value={monto}
                  onChange={(e) => {
                    setMonto(e.target.value);
                    if (errors.monto) setErrors({ ...errors, monto: undefined });
                  }}
                  className={errors.monto ? "border-error" : ""}
                  disabled={loading}
                  prefix={<span className="text-gray-500">$</span>}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Monto pendiente: ${montoPendiente.toFixed(2)}
                </p>
                {errors.monto && (
                  <p className="mt-1 text-sm text-error">{errors.monto}</p>
                )}
              </div>

              {/* Forma de Pago */}
              <div>
                <label
                  htmlFor="formaPago"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Forma de Pago <span className="text-error">*</span>
                </label>
                <Select
                  id="formaPago"
                  value={formaPago}
                  onChange={(e) => {
                    setFormaPago(e.target.value);
                    if (errors.formaPago)
                      setErrors({ ...errors, formaPago: undefined });
                  }}
                  className={errors.formaPago ? "border-error" : ""}
                  disabled={loading}
                >
                  <option value="">Seleccione una forma de pago</option>
                  {formasPago.map((forma) => (
                    <option key={forma.idCatalogo} value={forma.nombreCatalogo}>
                      {forma.nombreCatalogo}
                    </option>
                  ))}
                </Select>
                {errors.formaPago && (
                  <p className="mt-1 text-sm text-error">{errors.formaPago}</p>
                )}
              </div>

              {/* Fecha de Pago */}
              <div>
                <label
                  htmlFor="fechaPago"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Fecha de Pago <span className="text-error">*</span>
                </label>
                <DatePicker
                  value={fechaPago || undefined}
                  onChange={(dates) => {
                    const date = Array.isArray(dates) ? dates[0] : dates;
                    setFechaPago(date);
                    if (errors.fechaPago)
                      setErrors({ ...errors, fechaPago: undefined });
                  }}
                  options={{
                    dateFormat: "d/m/Y",
                    maxDate: new Date(),
                  }}
                  className={errors.fechaPago ? "border-error" : ""}
                  disabled={loading}
                />
                {errors.fechaPago && (
                  <p className="mt-1 text-sm text-error">{errors.fechaPago}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={handleClose}
                  variant="outlined"
                  className="flex-1"
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? "Registrando..." : "Registrar Pago"}
                </Button>
              </div>
            </form>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
