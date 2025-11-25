import { Page } from "@/components/shared/Page";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Skeleton,
} from "@/components/ui";
import {
  ArrowLeftIcon,
  PencilIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CakeIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { SiWhatsapp, SiInstagram } from "react-icons/si";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { clienteService } from "@/services/clienteService";
import { tatuajeService } from "@/services/tatuajeService";
import { countryService } from "@/services/countryService";
import { calcularEdad } from "@/utils/edad";
import type { Cliente } from "@/types/cliente";
import type { Tatuaje } from "@/types/tatuaje";
import type { Pago } from "@/types/pago";
import type { Cita } from "@/types/cita";
import type { Country } from "@/types/country";

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

interface TatuajeWithDetails extends Tatuaje {
  pagos?: Pago[];
  citas?: Cita[];
}

export default function ClienteDetail() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  const [loading, setLoading] = useState(true);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [country, setCountry] = useState<Country | null>(null);
  const [tatuajes, setTatuajes] = useState<TatuajeWithDetails[]>([]);

  useEffect(() => {
    loadClienteData();
  }, [slug]);

  const loadClienteData = async () => {
    try {
      setLoading(true);

      // Cargar todos los clientes y buscar por slug
      const [allClientes, countries] = await Promise.all([
        clienteService.getAll(),
        countryService.getAll(),
      ]);

      const foundCliente = allClientes.find(c => generateClienteSlug(c) === slug);

      if (!foundCliente) {
        navigate("/modules/clientes");
        return;
      }

      setCliente(foundCliente);

      // Cargar pa�s
      if (foundCliente.nacionalidad) {
        const clienteCountry = countries.find(c => c.alpha2Code === foundCliente.nacionalidad);
        if (clienteCountry) setCountry(clienteCountry);
      }

      // Cargar tatuajes y sus detalles
      const clienteTatuajes = await tatuajeService.getByClienteId(foundCliente.idCliente);

      const tatuajesWithDetails = await Promise.all(
        clienteTatuajes.map(async (tatuaje) => {
          try {
            const [pagos, citas] = await Promise.all([
              tatuajeService.getPagosByTatuajeId(tatuaje.idTatuaje),
              tatuajeService.getCitasByTatuajeId(tatuaje.idTatuaje),
            ]);
            return { ...tatuaje, pagos, citas };
          } catch (error) {
            console.error(`Error loading details for tatuaje ${tatuaje.idTatuaje}:`, error);
            return { ...tatuaje, pagos: [], citas: [] };
          }
        })
      );

      setTatuajes(tatuajesWithDetails);
    } catch (error) {
      console.error("Error loading cliente data:", error);
      navigate("/modules/clientes");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/modules/clientes");
  };

  const handleEdit = () => {
    if (cliente) {
      navigate(`/modules/clientes/editar/${slug}`);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "$0.00";
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: "UYU",
    }).format(amount);
  };

  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("es-UY", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date?: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("es-UY", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEstadoPagoColor = (estado: string): "success" | "warning" | "error" | "neutral" => {
    switch (estado.toLowerCase()) {
      case "pagado":
      case "completo":
        return "success";
      case "parcial":
        return "warning";
      case "pendiente":
        return "error";
      default:
        return "neutral";
    }
  };

  const getEstadoCitaColor = (estado: string): "success" | "warning" | "error" | "info" | "neutral" => {
    switch (estado.toLowerCase()) {
      case "completada":
        return "success";
      case "confirmada":
        return "info";
      case "pendiente":
        return "warning";
      case "cancelada":
        return "error";
      default:
        return "neutral";
    }
  };

  // Calcular totales y pendientes
  const calcularTotales = (tatuaje: TatuajeWithDetails) => {
    const precio = tatuaje.precio || 0;
    const pagado = tatuaje.pagos?.reduce((sum, pago) => sum + pago.monto, 0) || 0;
    const pendiente = precio - pagado;
    return { precio, pagado, pendiente };
  };

  const hasPendingPayments = tatuajes.some(t => {
    const { pendiente } = calcularTotales(t);
    return pendiente > 0;
  });

  if (loading) {
    return (
      <Page title="Cargando...">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <Skeleton className="h-12 w-64 mb-6 rounded-lg" />
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-96 w-full rounded-lg" />
            <Skeleton className="h-96 w-full lg:col-span-2 rounded-lg" />
          </div>
        </div>
      </Page>
    );
  }

  if (!cliente) {
    return null;
  }

  return (
    <Page title={`${cliente.nombre} ${cliente.apellido}`}>
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
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
                {cliente.nombre} {cliente.apellido}
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Perfil del cliente
              </p>
            </div>
          </div>
          <Button onClick={handleEdit} color="primary" className="py-3">
            <PencilIcon className="size-5 mr-2" />
            Editar Cliente
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Informaci�n Personal - Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="flex flex-col items-center border-b border-gray-150 pb-6 dark:border-dark-600">
                <Avatar
                  size={24}
                  classNames={{
                    display: "border-4 border-gray-100 bg-gradient-to-br from-blue-500 to-purple-600 text-3xl font-bold dark:border-dark-600",
                  }}
                >
                  {cliente.nombre?.[0]}{cliente.apellido?.[0]}
                </Avatar>
                <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                  {cliente.nombre} {cliente.apellido}
                </h2>
                {cliente.fechaNacimiento && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {calcularEdad(cliente.fechaNacimiento)} a�os
                  </p>
                )}
              </div>

              <div className="mt-6 space-y-4">
                {/* Identificaci�n */}
                {cliente.identificacion && (
                  <div className="flex items-start gap-3">
                    <UserIcon className="size-5 mt-0.5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        CI/Pasaporte
                      </p>
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                        {cliente.identificacion}
                      </p>
                    </div>
                  </div>
                )}

                {/* Email */}
                {cliente.email && (
                  <div className="flex items-start gap-3">
                    <EnvelopeIcon className="size-5 mt-0.5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Email
                      </p>
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white break-all">
                        {cliente.email}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tel�fono */}
                {cliente.telefono && (
                  <div className="flex items-start gap-3">
                    <PhoneIcon className="size-5 mt-0.5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Tel�fono
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <SiWhatsapp className="size-4 text-green-600" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {cliente.telefono}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Instagram */}
                {cliente.redes && (
                  <div className="flex items-start gap-3">
                    <SiInstagram className="size-5 mt-0.5 text-pink-600" />
                    <div className="flex-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Instagram
                      </p>
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                        @{cliente.redes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Nacionalidad */}
                {country && (
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="size-5 mt-0.5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Nacionalidad
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <img
                          src={country.flags.svg}
                          alt={country.name}
                          className="h-4 w-6 rounded object-cover shadow-sm"
                        />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {country.name}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Fecha de Nacimiento */}
                {cliente.fechaNacimiento && (
                  <div className="flex items-start gap-3">
                    <CakeIcon className="size-5 mt-0.5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Fecha de Nacimiento
                      </p>
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(cliente.fechaNacimiento)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Informaci�n M�dica */}
              {(cliente.condicionMedica || cliente.enfermedadPiel || cliente.deporte) && (
                <div className="mt-6 border-t border-gray-150 pt-6 dark:border-dark-600">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Informaci�n Adicional
                  </h3>
                  <div className="mt-4 space-y-3">
                    {cliente.condicionMedica && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Condiciones M�dicas
                        </p>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                          {cliente.condicionMedica}
                        </p>
                      </div>
                    )}
                    {cliente.enfermedadPiel && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Enfermedades de Piel
                        </p>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                          {cliente.enfermedadPiel}
                        </p>
                      </div>
                    )}
                    {cliente.deporte && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Deportes
                        </p>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                          {cliente.deporte}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Observaciones */}
              {cliente.observaciones && (
                <div className="mt-6 border-t border-gray-150 pt-6 dark:border-dark-600">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Observaciones
                  </h3>
                  <p className="mt-3 text-sm text-gray-900 dark:text-white">
                    {cliente.observaciones}
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Servicios y Detalles - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pagos Pendientes - Solo si hay */}
            {hasPendingPayments && (
              <Card className="border-l-4 border-l-warning bg-warning/5 p-6 dark:bg-warning/10">
                <div className="flex items-start gap-4">
                  <ExclamationTriangleIcon className="size-6 text-warning" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Pagos Pendientes
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Este cliente tiene pagos pendientes en uno o m�s servicios
                    </p>
                    <div className="mt-3 space-y-2">
                      {tatuajes.map(tatuaje => {
                        const { pendiente } = calcularTotales(tatuaje);
                        if (pendiente <= 0) return null;
                        return (
                          <div key={tatuaje.idTatuaje} className="flex items-center justify-between rounded-lg bg-white p-3 dark:bg-dark-700">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {tatuaje.detalle || `Tatuaje #${tatuaje.idTatuaje}`}
                            </span>
                            <Badge variant="soft" color="warning">
                              {formatCurrency(pendiente)} pendiente
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Tatuajes */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Servicios de Tatuaje
              </h2>
              {tatuajes.length === 0 ? (
                <div className="mt-6 text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    No hay servicios registrados para este cliente
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-6">
                  {tatuajes.map((tatuaje) => {
                    const { precio, pagado, pendiente } = calcularTotales(tatuaje);
                    return (
                      <div
                        key={tatuaje.idTatuaje}
                        className="rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-lg dark:border-dark-600"
                      >
                        {/* Header del Tatuaje */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {tatuaje.detalle || "Tatuaje sin descripci�n"}
                              </h3>
                              <Badge
                                variant="soft"
                                color={getEstadoPagoColor(tatuaje.estadoPago)}
                                className="border border-this-darker/20 dark:border-this-lighter/20"
                              >
                                {tatuaje.estadoPago}
                              </Badge>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
                              {tatuaje.artista && (
                                <span className="flex items-center gap-1">
                                  <UserIcon className="size-4" />
                                  {tatuaje.artista}
                                </span>
                              )}
                              {tatuaje.zonaTatuaje && (
                                <span className="flex items-center gap-1">
                                  <MapPinIcon className="size-4" />
                                  {tatuaje.zonaTatuaje}
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                Creado: {formatDate(tatuaje.fechaCreacion)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Resumen Financiero */}
                        <div className="mt-4 grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-4 dark:bg-dark-800">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                              Precio Total
                            </p>
                            <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                              {formatCurrency(precio)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                              Pagado
                            </p>
                            <p className="mt-1 text-lg font-bold text-success">
                              {formatCurrency(pagado)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                              Pendiente
                            </p>
                            <p className={`mt-1 text-lg font-bold ${pendiente > 0 ? "text-warning" : "text-gray-500"}`}>
                              {formatCurrency(pendiente)}
                            </p>
                          </div>
                        </div>

                        {/* Pagos */}
                        {tatuaje.pagos && tatuaje.pagos.length > 0 && (
                          <div className="mt-4">
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                              <CurrencyDollarIcon className="size-5" />
                              Historial de Pagos ({tatuaje.pagos.length})
                            </h4>
                            <div className="mt-3 space-y-2">
                              {tatuaje.pagos.map((pago) => (
                                <div
                                  key={pago.idPago}
                                  className="flex items-center justify-between rounded-lg bg-white p-3 dark:bg-dark-700"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-full bg-success/10">
                                      <CurrencyDollarIcon className="size-5 text-success" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {formatCurrency(pago.monto)}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {pago.formaPago || "No especificado"} " {formatDate(pago.fechaPago)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Citas */}
                        {tatuaje.citas && tatuaje.citas.length > 0 && (
                          <div className="mt-4">
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                              <CalendarIcon className="size-5" />
                              Citas Asociadas ({tatuaje.citas.length})
                            </h4>
                            <div className="mt-3 space-y-2">
                              {tatuaje.citas.map((cita) => (
                                <div
                                  key={cita.idCita}
                                  className="flex items-center justify-between rounded-lg bg-white p-3 dark:bg-dark-700"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-full bg-info/10">
                                      <CalendarIcon className="size-5 text-info" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {cita.titulo || "Cita sin t�tulo"}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatDateTime(cita.fechaInicio)}
                                        {cita.duracionMinutos && ` " ${cita.duracionMinutos} min`}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge
                                    variant="soft"
                                    color={getEstadoCitaColor(cita.estado)}
                                    className="border border-this-darker/20 dark:border-this-lighter/20"
                                  >
                                    {cita.estado}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Page>
  );
}
