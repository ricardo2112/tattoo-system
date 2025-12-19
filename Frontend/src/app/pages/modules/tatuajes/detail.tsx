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
  PlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PrinterIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import { FaUser } from "react-icons/fa6";
import { IoBody } from "react-icons/io5";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { tatuajeService } from "@/services/tatuajeService";
import { clienteService } from "@/services/clienteService";
import { useDisclosure } from "@/hooks";
import { RegistrarPagoModal } from "./components/RegistrarPagoModal";
import { procesarFormulario } from "@/utils/formularioProcessor";
import { formularioTatuajeTemplate } from "@/templates/formularioTatuajeTemplate";
import { generarPDFFormulario } from "@/utils/pdfGenerator";
import type { Tatuaje } from "@/types/tatuaje";
import type { Cliente } from "@/types/cliente";
import type { Pago } from "@/types/pago";
import type { Cita } from "@/types/cita";
import type { RegistroTatuajeResponse } from "@/types/registroTatuaje";

interface TatuajeWithDetails extends Tatuaje {
  cliente?: Cliente;
  pagos?: Pago[];
  citas?: Cita[];
}

export default function TatuajeDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [tatuaje, setTatuaje] = useState<TatuajeWithDetails | null>(null);
  const [isModalOpen, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    loadTatuajeData();
  }, [id]);

  const loadTatuajeData = async () => {
    try {
      setLoading(true);

      if (!id) {
        navigate("/modules/tatuajes");
        return;
      }

      const tatuajeId = parseInt(id);

      // Cargar tatuaje
      const tatuajeData = await tatuajeService.getById(tatuajeId);

      // Cargar detalles relacionados
      const [cliente, pagos, citas] = await Promise.all([
        clienteService.getById(tatuajeData.idCliente),
        tatuajeService.getPagosByTatuajeId(tatuajeId),
        tatuajeService.getCitasByTatuajeId(tatuajeId),
      ]);

      setTatuaje({
        ...tatuajeData,
        cliente,
        pagos,
        citas,
      });
    } catch (error) {
      console.error("Error loading tatuaje data:", error);
      navigate("/modules/tatuajes");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/modules/tatuajes");
  };

  const handleEdit = () => {
    if (tatuaje) {
      navigate(`/modules/tatuajes/editar/${id}`);
    }
  };

  const handleAddPayment = () => {
    openModal();
  };

  const handlePaymentSuccess = () => {
    loadTatuajeData();
  };

  // Función para generar el HTML del formulario
  const getFormularioHtml = (): string => {
    if (!tatuaje || !tatuaje.cliente) return "";

    // Construir un objeto RegistroTatuajeResponse con los datos del tatuaje
    const registroResponse: RegistroTatuajeResponse = {
      cliente: tatuaje.cliente,
      tatuaje: tatuaje,
      pago: tatuaje.pagos?.[0] || null,
      cita: tatuaje.citas?.[0] || ({} as any),
      esMenorDeEdad: false, // Puedes calcular esto basándote en la fecha de nacimiento
      mensaje: "",
    };

    return procesarFormulario(formularioTatuajeTemplate, registroResponse);
  };

  // Función para imprimir el formulario
  const handlePrintFormulario = () => {
    const htmlContent = getFormularioHtml();
    if (!htmlContent) return;

    // Crear un iframe temporal
    const printFrame = document.createElement("iframe");
    printFrame.style.position = "absolute";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "none";
    document.body.appendChild(printFrame);

    const iframeDoc = printFrame.contentDocument || printFrame.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();

      // Esperar a que se cargue el contenido antes de imprimir
      printFrame.onload = () => {
        printFrame.contentWindow?.print();
        // Remover el iframe después de imprimir
        setTimeout(() => {
          document.body.removeChild(printFrame);
        }, 1000);
      };

      // Fallback si onload no se dispara
      setTimeout(() => {
        if (document.body.contains(printFrame)) {
          printFrame.contentWindow?.print();
          setTimeout(() => {
            if (document.body.contains(printFrame)) {
              document.body.removeChild(printFrame);
            }
          }, 1000);
        }
      }, 500);
    }
  };

  // Función para descargar el formulario como PDF
  const handleDownloadPDF = () => {
    const htmlContent = getFormularioHtml();
    if (!htmlContent) return;

    setIsGeneratingPDF(true);

    try {
      // Generar nombre de archivo
      const clienteName = tatuaje?.cliente
        ? `${tatuaje.cliente.nombre}_${tatuaje.cliente.apellido}`
        : "Cliente";
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      const fileName = `Formulario_Consentimiento_${clienteName}_${dateStr}_${timeStr}.pdf`;

      // Generar PDF con texto seleccionable usando la función personalizada
      const pdf = generarPDFFormulario(htmlContent);
      pdf.save(fileName);

    } catch (error: any) {
      console.error("Error al generar PDF:", error);
      console.error("Error stack:", error?.stack);
      console.error("Error message:", error?.message);
      alert(`Ocurrió un error al generar el PDF: ${error?.message || 'Error desconocido'}`);
    } finally {
      setIsGeneratingPDF(false);
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

  const getEstadoPagoColor = (
    estado: string
  ): "success" | "warning" | "error" | "neutral" => {
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

  const getEstadoCitaColor = (
    estado: string
  ): "success" | "warning" | "error" | "info" | "neutral" => {
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
  const calcularTotales = () => {
    if (!tatuaje) return { precio: 0, pagado: 0, pendiente: 0 };
    const precio = tatuaje.precio || 0;
    const pagado = tatuaje.pagos?.reduce((sum, pago) => sum + pago.monto, 0) || 0;
    const pendiente = precio - pagado;
    return { precio, pagado, pendiente };
  };

  const { precio, pagado, pendiente } = calcularTotales();
  const hasPendingPayments = pendiente > 0;

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

  if (!tatuaje) {
    return null;
  }

  return (
    <Page title={tatuaje.detalle || `Tatuaje #${tatuaje.idTatuaje}`}>
      {/* Modal de Registro de Pago */}
      {tatuaje && (
        <RegistrarPagoModal
          isOpen={isModalOpen}
          onClose={closeModal}
          idTatuaje={tatuaje.idTatuaje}
          onSuccess={handlePaymentSuccess}
          montoPendiente={pendiente}
        />
      )}

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
              data-tooltip-content="Volver a tatuajes"
            >
              <ArrowLeftIcon className="size-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {tatuaje.detalle || "Tatuaje sin descripci�n"}
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Detalle del servicio de tatuaje
              </p>
            </div>
          </div>
          <Button onClick={handleEdit} color="primary" className="py-3">
            <PencilIcon className="size-5 mr-2" />
            Editar Tatuaje
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Información del Tatuaje - Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="flex flex-col items-center border-b border-gray-150 pb-6 dark:border-dark-600">
                <div className="flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg">
                  <IoBody className="size-12 text-white" />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white text-center">
                  {tatuaje.detalle || "Sin descripción"}
                </h2>
                <Badge
                  variant="soft"
                  color={getEstadoPagoColor(tatuaje.estadoPago)}
                  className="mt-2 border border-this-darker/20 dark:border-this-lighter/20"
                >
                  {tatuaje.estadoPago}
                </Badge>
              </div>

              <div className="mt-6 space-y-4">
                {/* Artista */}
                {tatuaje.artista && (
                  <div className="flex items-start gap-3">
                    <FaUser className="size-5 mt-0.5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Artista
                      </p>
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                        {tatuaje.artista}
                      </p>
                    </div>
                  </div>
                )}

                {/* Zona */}
                {tatuaje.zonaTatuaje && (
                  <div className="flex items-start gap-3">
                    <IoBody className="size-5 mt-0.5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Zona del Cuerpo
                      </p>
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                        {tatuaje.zonaTatuaje}
                      </p>
                    </div>
                  </div>
                )}

                {/* Fecha de Creación */}
                <div className="flex items-start gap-3">
                  <CalendarIcon className="size-5 mt-0.5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Fecha de Registro
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(tatuaje.fechaCreacion)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Resumen Financiero */}
              <div className="mt-6 border-t border-gray-150 pt-6 dark:border-dark-600">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Resumen Financiero
                </h3>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Precio Total
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(precio)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Pagado
                    </span>
                    <span className="text-lg font-bold text-success">
                      {formatCurrency(pagado)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Pendiente
                    </span>
                    <span
                      className={`text-lg font-bold ${
                        pendiente > 0 ? "text-warning" : "text-gray-500"
                      }`}
                    >
                      {formatCurrency(pendiente)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-dark-700">
                    <div
                      className="h-full bg-gradient-to-r from-success-500 to-success-600 transition-all duration-300"
                      style={{
                        width: `${precio > 0 ? (pagado / precio) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                    {precio > 0
                      ? `${Math.round((pagado / precio) * 100)}% completado`
                      : "Sin precio establecido"}
                  </p>
                </div>
              </div>
            </Card>

            {/* Botones de Formulario de Consentimiento */}
            <div className="mt-4 space-y-3">
              <Button
                onClick={handlePrintFormulario}
                variant="outlined"
                color="primary"
                className="w-full flex items-center justify-center gap-2 py-3"
              >
                <PrinterIcon className="size-5" />
                Imprimir Consentimiento
              </Button>
              <Button
                onClick={handleDownloadPDF}
                variant="filled"
                color="primary"
                className="w-full flex items-center justify-center gap-2 py-3"
                disabled={isGeneratingPDF}
              >
                <DocumentArrowDownIcon className="size-5" />
                {isGeneratingPDF ? "Generando PDF..." : "Descargar Consentimiento"}
              </Button>
            </div>
          </div>

          {/* Detalles del Tatuaje - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Alerta de Pago Pendiente */}
            {hasPendingPayments && (
              <Card className="border-l-4 border-l-warning bg-warning/5 p-6 dark:bg-warning/10">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <ExclamationTriangleIcon className="size-6 text-warning" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Pago Pendiente
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Este tatuaje tiene un saldo pendiente de{" "}
                        <span className="font-bold text-warning">
                          {formatCurrency(pendiente)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleAddPayment}
                    color="warning"
                    className="py-2 shrink-0"
                  >
                    <PlusIcon className="size-5 mr-2" />
                    Registrar Pago
                  </Button>
                </div>
              </Card>
            )}

            {/* Informaci�n del Cliente */}
            {tatuaje.cliente && (
              <Card className="p-6">
                <div className="flex items-center justify-between border-b border-gray-150 pb-4 dark:border-dark-600">
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
                    <UserIcon className="size-6" />
                    Información del Cliente
                  </h2>
                  <Button
                    onClick={() => {
                      // Generar slug para navegar al cliente
                      const slug = `${tatuaje.cliente?.nombre || ""} ${tatuaje.cliente?.apellido || ""}`
                        .trim()
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/\s+/g, "-")
                        .replace(/[^\w-]+/g, "")
                        .replace(/--+/g, "-")
                        .replace(/^-+|-+$/g, "");
                      navigate(`/modules/clientes/${slug}`);
                    }}
                    variant="outlined"
                    className="py-2"
                  >
                    Ver Perfil Completo
                  </Button>
                </div>

                <div className="mt-6 flex items-start gap-6">
                  <Avatar
                    size={16}
                    initialVariant="soft"
                    initialColor="primary"
                    classNames={{
                      initial:
                        "border border-this-darker/20 dark:border-this-lighter/20 text-2xl font-bold",
                    }}
                  >
                    {tatuaje.cliente.nombre?.[0]}
                    {tatuaje.cliente.apellido?.[0]}
                  </Avatar>
                  <div className="flex-1 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Nombre Completo
                      </p>
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                        {tatuaje.cliente.nombre} {tatuaje.cliente.apellido}
                      </p>
                    </div>
                    {tatuaje.cliente.telefono && (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Teléfono
                        </p>
                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                          {tatuaje.cliente.telefono}
                        </p>
                      </div>
                    )}
                    {tatuaje.cliente.email && (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Email
                        </p>
                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white break-all">
                          {tatuaje.cliente.email}
                        </p>
                      </div>
                    )}
                    {tatuaje.cliente.redes && (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Instagram
                        </p>
                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                          @{tatuaje.cliente.redes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Historial de Pagos */}
            <Card className="p-6">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
                <CurrencyDollarIcon className="size-6" />
                Historial de Pagos
              </h2>
              {!tatuaje.pagos || tatuaje.pagos.length === 0 ? (
                <div className="mt-6 text-center py-12">
                  <CurrencyDollarIcon className="mx-auto size-12 text-gray-300 dark:text-gray-600" />
                  <p className="mt-4 text-gray-500 dark:text-gray-400">
                    No hay pagos registrados para este tatuaje
                  </p>
                  {hasPendingPayments && (
                    <Button
                      onClick={handleAddPayment}
                      color="primary"
                      className="mt-4"
                    >
                      <PlusIcon className="size-5 mr-2" />
                      Registrar Primer Pago
                    </Button>
                  )}
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {tatuaje.pagos.map((pago, index) => (
                    <div
                      key={pago.idPago}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-all hover:shadow-md dark:border-dark-600"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex size-12 items-center justify-center rounded-full bg-success/10">
                          <CheckCircleIcon className="size-6 text-success" />
                        </div>
                        <div>
                          <p className="text-base font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(pago.monto)}
                          </p>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {pago.formaPago || "No especificado"} "{" "}
                            {formatDate(pago.fechaPago)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="soft" color="neutral">
                        Pago No. {(tatuaje.pagos?.length || 0) - index}
                      </Badge>
                    </div>
                  ))}

                  {/* Total Pagado */}
                  <div className="mt-4 rounded-lg bg-success/5 p-4 dark:bg-success/10">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Total Pagado
                      </span>
                      <span className="text-xl font-bold text-success">
                        {formatCurrency(pagado)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Historial de Citas */}
            <Card className="p-6">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
                <CalendarIcon className="size-6" />
                Historial de Citas
              </h2>
              {!tatuaje.citas || tatuaje.citas.length === 0 ? (
                <div className="mt-6 text-center py-12">
                  <CalendarIcon className="mx-auto size-12 text-gray-300 dark:text-gray-600" />
                  <p className="mt-4 text-gray-500 dark:text-gray-400">
                    No hay citas registradas para este tatuaje
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {tatuaje.citas.map((cita) => (
                    <div
                      key={cita.idCita}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-all hover:shadow-md dark:border-dark-600"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className={`flex size-12 items-center justify-center rounded-full ${
                            cita.estado.toLowerCase() === "completada"
                              ? "bg-success/10"
                              : cita.estado.toLowerCase() === "confirmada"
                                ? "bg-info/10"
                                : cita.estado.toLowerCase() === "cancelada"
                                  ? "bg-error/10"
                                  : "bg-warning/10"
                          }`}
                        >
                          <CalendarIcon
                            className={`size-6 ${
                              cita.estado.toLowerCase() === "completada"
                                ? "text-success"
                                : cita.estado.toLowerCase() === "confirmada"
                                  ? "text-info"
                                  : cita.estado.toLowerCase() === "cancelada"
                                    ? "text-error"
                                    : "text-warning"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-base font-semibold text-gray-900 dark:text-white">
                            {cita.titulo || "Cita sin t�tulo"}
                          </p>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {formatDateTime(cita.fechaInicio)}
                            {cita.duracionMinutos && ` " ${cita.duracionMinutos} min`}
                            {cita.zona && ` " ${cita.zona}`}
                          </p>
                          {cita.descripcion && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {cita.descripcion}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant="soft"
                        color={getEstadoCitaColor(cita.estado)}
                        className="border border-this-darker/20 dark:border-this-lighter/20 shrink-0"
                      >
                        {cita.estado}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Page>
  );
}