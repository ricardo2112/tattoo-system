import { Page } from "@/components/shared/Page";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Input,
  Pagination,
  PaginationFirst,
  PaginationItems,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
  Skeleton,
} from "@/components/ui";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  XMarkIcon,
  TrashIcon,
  EyeIcon,
  LinkIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { DocumentDuplicateIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { useDisclosure } from "@/hooks/index";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formularioService } from "@/services/formularioService";
import type { Formulario, EventoFormulario } from "@/types/formulario";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

type FilterType = "all" | "active" | "inactive";

/**
 * Formularios page - Módulo de gestión de formularios HTML
 * Este módulo permite crear, editar y asignar formularios a eventos del sistema
 */
export default function Formularios() {
  const navigate = useNavigate();

  const [isDeleteModalOpen, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [isPreviewModalOpen, { open: openPreviewModal, close: closePreviewModal }] = useDisclosure(false);
  const [isAssignModalOpen, { open: openAssignModal, close: closeAssignModal }] = useDisclosure(false);

  // Data states
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [eventos, setEventos] = useState<EventoFormulario[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFormulario, setSelectedFormulario] = useState<Formulario | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter & Search states
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Assignment state
  const [selectedEventoId, setSelectedEventoId] = useState<number | null>(null);

  // Preview zoom state
  const [previewZoom, setPreviewZoom] = useState(100);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [formulariosData, eventosData] = await Promise.all([
        formularioService.getAll(),
        formularioService.getAllEventos(),
      ]);
      setFormularios(formulariosData);
      setEventos(eventosData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Error al cargar los formularios. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Filter formularios
  const filteredFormularios = useMemo(() => {
    let filtered = formularios;

    // Apply status filter
    if (filterType === "active") {
      filtered = filtered.filter((f) => f.activo);
    } else if (filterType === "inactive") {
      filtered = filtered.filter((f) => !f.activo);
    }

    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((formulario) => {
        const nombre = (formulario.nombreFormulario || "").toLowerCase();
        const descripcion = (formulario.descripcion || "").toLowerCase();
        return nombre.includes(searchLower) || descripcion.includes(searchLower);
      });
    }

    // Sort by creation date (newest first)
    return filtered.sort((a, b) =>
      new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
    );
  }, [formularios, filterType, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredFormularios.length / itemsPerPage);
  const paginatedFormularios = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredFormularios.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredFormularios, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, searchTerm, itemsPerPage]);

  // Get eventos asignados a un formulario
  const getEventosAsignados = (idFormulario: number): string[] => {
    return eventos
      .filter((e) => e.idFormulario === idFormulario)
      .map((e) => e.evento);
  };

  // Handle create new
  const handleCreateNew = () => {
    navigate("/modules/formularios/nuevo");
  };

  // Handle edit
  const handleEdit = (formulario: Formulario) => {
    navigate(`/modules/formularios/editar/${formulario.idFormulario}`);
  };

  // Handle delete click
  const handleDeleteClick = (formulario: Formulario) => {
    setSelectedFormulario(formulario);
    openDeleteModal();
  };

  // Handle preview
  const handlePreview = (formulario: Formulario) => {
    setSelectedFormulario(formulario);
    setPreviewZoom(100);
    openPreviewModal();
  };

  // Handle assign
  const handleAssign = (formulario: Formulario) => {
    setSelectedFormulario(formulario);
    setSelectedEventoId(null);
    setError(null);
    setSuccessMessage(null);
    openAssignModal();
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!selectedFormulario) return;

    try {
      setError(null);
      await formularioService.delete(selectedFormulario.idFormulario);
      await loadData();
      closeDeleteModal();
      setSelectedFormulario(null);
    } catch (err: any) {
      console.error("Error deleting formulario:", err);
      setError(err.response?.data?.message || "Error al eliminar el formulario.");
    }
  };

  // Handle assign formulario to evento
  const handleAssignConfirm = async () => {
    if (!selectedFormulario || !selectedEventoId) {
      setError("Por favor, selecciona un evento.");
      return;
    }

    try {
      setError(null);
      await formularioService.asignarFormularioAEvento(selectedEventoId, selectedFormulario.idFormulario);
      await loadData();
      closeAssignModal();
      setSelectedFormulario(null);
      setSelectedEventoId(null);

      // Mostrar mensaje de éxito
      setSuccessMessage("Formulario asignado exitosamente. El formulario anterior ha sido desactivado automáticamente.");
      setTimeout(() => setSuccessMessage(null), 5000); // Ocultar después de 5 segundos
    } catch (err: any) {
      console.error("Error assigning formulario:", err);
      setError(err.response?.data?.message || "Error al asignar el formulario.");
    }
  };

  // Format evento name for display
  const formatEventoName = (evento: string): string => {
    return evento
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Page title="Formularios">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar
              size={16}
              initialVariant="soft"
              initialColor="primary"
              classNames={{
                display: "border border-this-darker/20 dark:border-this-lighter/20",
              }}
            >
              <DocumentDuplicateIcon className="size-9" />
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Gestión de Formularios
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Crea y administra formularios HTML para eventos del sistema
              </p>
            </div>
          </div>
          <Button onClick={handleCreateNew} color="primary">
            <PlusIcon className="mr-2 size-5" />
            Nuevo Formulario
          </Button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
            <div className="flex items-center gap-3">
              <svg className="size-5 shrink-0 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="size-5 shrink-0 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Filters Section */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              {/* Status Filter Buttons */}
              {[
                { key: "all" as FilterType, label: "Todos" },
                { key: "active" as FilterType, label: "Activos" },
                { key: "inactive" as FilterType, label: "Inactivos" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilterType(key)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    filterType === key
                      ? "bg-primary-600 text-white dark:bg-primary-500"
                      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-dark-600 dark:bg-dark-700 dark:text-gray-300 dark:hover:bg-dark-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Search */}
            <Input
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<MagnifyingGlassIcon className="size-5 text-gray-400" />}
            />

            {/* Results Info */}
            <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-dark-600">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredFormularios.length === 0 ? (
                  "No se encontraron formularios"
                ) : (
                  <>
                    Mostrando <span className="font-semibold text-gray-900 dark:text-white">{filteredFormularios.length}</span>{" "}
                    {filteredFormularios.length === 1 ? "formulario" : "formularios"}
                  </>
                )}
              </p>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:border-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-dark-600 dark:bg-dark-700 dark:text-gray-300 dark:hover:border-dark-500"
              >
                <option value={6}>6 por página</option>
                <option value={12}>12 por página</option>
                <option value={24}>24 por página</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="mb-4 h-6 w-3/4 rounded" />
                <Skeleton className="mb-2 h-4 w-full rounded" />
                <Skeleton className="mb-4 h-4 w-2/3 rounded" />
                <Skeleton className="h-8 w-full rounded" />
              </Card>
            ))}
          </div>
        ) : paginatedFormularios.length === 0 ? (
          <Card className="py-16">
            <div className="flex flex-col items-center justify-center">
              <DocumentTextIcon className="mb-4 size-16 text-gray-300 dark:text-gray-600" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                No hay formularios
              </h3>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? "No se encontraron formularios con los filtros aplicados"
                  : "Aún no hay formularios registrados. Crea tu primer formulario."}
              </p>
              <Button onClick={handleCreateNew} color="primary" className="mt-6">
                <PlusIcon className="mr-2 size-5" />
                Nuevo Formulario
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paginatedFormularios.map((formulario) => {
                const eventosAsignados = getEventosAsignados(formulario.idFormulario);

                return (
                  <Card
                    key={formulario.idFormulario}
                    className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary-600/10"
                  >
                    {/* Card Header */}
                    <div className="relative border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white p-5 dark:border-dark-600 dark:from-dark-700 dark:to-dark-700/80">
                      <div className="mb-3 flex items-start justify-between">
                        <Badge
                          variant="soft"
                          color={formulario.activo ? "success" : "secondary"}
                          className="font-medium shadow-sm"
                        >
                          {formulario.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>

                      <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                        {formulario.nombreFormulario}
                      </h3>

                      {formulario.descripcion && (
                        <p className="line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                          {formulario.descripcion}
                        </p>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-5">
                      <div className="space-y-3">
                        {/* Fecha de creación */}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Creado:</span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {format(parseISO(formulario.fechaCreacion), "d 'de' MMMM, yyyy", { locale: es })}
                          </span>
                        </div>

                        {/* Eventos asignados */}
                        {eventosAsignados.length > 0 && (
                          <div className="rounded-lg bg-primary-50/50 p-3 dark:bg-primary-900/10">
                            <div className="mb-1 flex items-center gap-2">
                              <LinkIcon className="size-4 text-primary-600 dark:text-primary-400" />
                              <span className="text-xs font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300">
                                Eventos asignados
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {eventosAsignados.map((evento) => (
                                <Badge
                                  key={evento}
                                  variant="soft"
                                  color="primary"
                                  className="text-xs"
                                >
                                  {formatEventoName(evento)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-5 space-y-2">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handlePreview(formulario)}
                            color="secondary"
                            variant="soft"
                            className="flex-1 font-medium shadow-sm transition-all hover:shadow-md"
                          >
                            <EyeIcon className="mr-1.5 size-4" />
                            Vista Previa
                          </Button>
                          <Button
                            onClick={() => handleAssign(formulario)}
                            color="primary"
                            variant="soft"
                            className="flex-1 font-medium shadow-sm transition-all hover:shadow-md"
                          >
                            <LinkIcon className="mr-1.5 size-4" />
                            Asignar
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEdit(formulario)}
                            color="primary"
                            variant="outlined"
                            className="flex-1 font-medium"
                          >
                            <PencilIcon className="mr-1.5 size-4" />
                            Editar
                          </Button>
                          <Button
                            onClick={() => handleDeleteClick(formulario)}
                            color="error"
                            variant="outlined"
                            className="flex-1 font-medium"
                          >
                            <TrashIcon className="mr-1.5 size-4" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination total={totalPages} value={currentPage} onChange={setCurrentPage}>
                  <PaginationFirst />
                  <PaginationPrevious />
                  <PaginationItems />
                  <PaginationNext />
                  <PaginationLast />
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>

      {/* Preview Modal - MEJORADO */}
      <Transition appear show={isPreviewModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-[100] overflow-y-auto"
          onClose={closePreviewModal}
        >
          <div className="min-h-screen px-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
            </TransitionChild>

            <div className="fixed inset-0 flex items-center justify-center p-4">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="relative flex h-[95vh] w-full max-w-7xl flex-col rounded-2xl bg-white shadow-2xl dark:bg-dark-700">
                  {/* Header */}
                  <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4 dark:border-dark-600 dark:from-dark-700 dark:to-dark-700">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-primary-600 shadow-md dark:bg-primary-500">
                        <EyeIcon className="size-5 text-white" />
                      </div>
                      <div>
                        <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
                          Vista Previa: {selectedFormulario?.nombreFormulario}
                        </DialogTitle>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Los placeholders se muestran tal cual, serán reemplazados al generar el formulario
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Zoom Controls */}
                      <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-dark-600 dark:bg-dark-800">
                        <button
                          onClick={() => setPreviewZoom(Math.max(50, previewZoom - 10))}
                          className="rounded p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-600"
                          title="Reducir zoom"
                        >
                          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="min-w-[3rem] text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                          {previewZoom}%
                        </span>
                        <button
                          onClick={() => setPreviewZoom(Math.min(200, previewZoom + 10))}
                          className="rounded p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-600"
                          title="Aumentar zoom"
                        >
                          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setPreviewZoom(100)}
                          className="ml-1 rounded px-2 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20"
                        >
                          Reset
                        </button>
                      </div>

                      {/* Open in new tab */}
                      <button
                        onClick={() => {
                          const blob = new Blob([selectedFormulario?.cuerpoHtml || ""], { type: "text/html" });
                          const url = URL.createObjectURL(blob);
                          window.open(url, "_blank");
                        }}
                        className="flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white shadow-md transition-all hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
                        title="Abrir en nueva pestaña"
                      >
                        <ArrowTopRightOnSquareIcon className="size-4" />
                        <span className="hidden sm:inline">Abrir en nueva pestaña</span>
                      </button>

                      <button
                        onClick={closePreviewModal}
                        className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-600"
                      >
                        <XMarkIcon className="size-6" />
                      </button>
                    </div>
                  </div>

                  {/* Preview Content */}
                  <div className="scrollbar-sm flex-1 overflow-auto bg-gray-100 p-6 dark:bg-dark-800">
                    <div className="mx-auto" style={{ maxWidth: "210mm" }}>
                      <div
                        className="origin-top rounded-lg bg-white shadow-2xl transition-transform duration-200"
                        style={{
                          transform: `scale(${previewZoom / 100})`,
                          minHeight: "297mm",
                        }}
                      >
                        <iframe
                          srcDoc={selectedFormulario?.cuerpoHtml || ""}
                          className="size-full rounded-lg"
                          style={{
                            minHeight: "297mm",
                            border: "none",
                          }}
                          title="Vista previa del formulario"
                        />
                      </div>
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Assign Modal */}
      <Transition appear show={isAssignModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
          onClose={closeAssignModal}
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
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity dark:bg-black/50" />
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
            <DialogPanel className="scrollbar-sm relative flex max-w-2xl flex-col overflow-y-auto rounded-xl bg-white px-8 py-10 shadow-2xl transition-all duration-300 dark:bg-dark-700">
              <div className="mb-6 text-center">
                <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                  <LinkIcon className="size-10 text-primary-600 dark:text-primary-400" />
                </div>

                <DialogTitle as="h3" className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                  Asignar Formulario a Evento
                </DialogTitle>

                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Selecciona el evento al que deseas asignar el formulario{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {selectedFormulario?.nombreFormulario}
                  </span>
                </p>
              </div>

              {/* Advertencia de reglas de negocio */}
              <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Importante:</strong> Un formulario solo puede estar asignado a un evento a la vez. Si el evento ya tiene un formulario asignado, este será desactivado automáticamente.
                </p>
              </div>

              {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-800 dark:bg-red-900/20">
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="size-5 shrink-0 text-red-600 dark:text-red-400" />
                    <p className="text-sm leading-relaxed text-red-800 dark:text-red-200">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {eventos.map((evento) => {
                  const isAssigned = evento.idFormulario === selectedFormulario?.idFormulario;
                  const hasOtherFormulario = evento.idFormulario && evento.idFormulario !== selectedFormulario?.idFormulario;

                  return (
                    <button
                      key={evento.idEvento}
                      onClick={() => setSelectedEventoId(evento.idEvento)}
                      disabled={isAssigned}
                      className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                        selectedEventoId === evento.idEvento
                          ? "border-primary-600 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/20"
                          : isAssigned
                          ? "cursor-not-allowed border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20"
                          : hasOtherFormulario
                          ? "border-gray-200 bg-gray-50 hover:border-gray-300 dark:border-dark-600 dark:bg-dark-600/30 dark:hover:border-dark-500"
                          : "border-gray-200 bg-white hover:border-primary-300 dark:border-dark-600 dark:bg-dark-700 dark:hover:border-primary-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {formatEventoName(evento.evento)}
                            </span>
                            {isAssigned && (
                              <Badge variant="soft" color="success" className="text-xs">
                                Asignado
                              </Badge>
                            )}
                            {hasOtherFormulario && (
                              <Badge variant="soft" color="warning" className="text-xs">
                                Otro formulario
                              </Badge>
                            )}
                          </div>
                          {hasOtherFormulario && evento.formulario && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              Actualmente: {evento.formulario.nombreFormulario}
                            </p>
                          )}
                        </div>
                        <div
                          className={`size-5 rounded-full border-2 ${
                            selectedEventoId === evento.idEvento
                              ? "border-primary-600 bg-primary-600 dark:border-primary-400 dark:bg-primary-400"
                              : "border-gray-300 dark:border-dark-500"
                          }`}
                        >
                          {selectedEventoId === evento.idEvento && (
                            <div className="flex size-full items-center justify-center">
                              <div className="size-2 rounded-full bg-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex gap-3">
                <Button
                  onClick={closeAssignModal}
                  variant="outlined"
                  className="flex-1 font-medium"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAssignConfirm}
                  color="primary"
                  className="flex-1 font-medium"
                  disabled={!selectedEventoId}
                >
                  {selectedEventoId && eventos.find(e => e.idEvento === selectedEventoId)?.idFormulario
                    ? "Reemplazar Formulario"
                    : "Asignar Formulario"}
                </Button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>

      {/* Delete Confirmation Modal */}
      <Transition appear show={isDeleteModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
          onClose={closeDeleteModal}
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
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity dark:bg-black/50" />
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
            <DialogPanel className="scrollbar-sm relative flex max-w-md flex-col overflow-y-auto rounded-xl bg-white px-8 py-10 text-center shadow-2xl transition-all duration-300 dark:bg-dark-700">
              <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <TrashIcon className="size-10 text-red-600 dark:text-red-400" />
              </div>

              <div className="mt-6">
                <DialogTitle as="h3" className="text-2xl font-bold text-gray-900 dark:text-white">
                  ¿Eliminar Formulario?
                </DialogTitle>

                <p className="mt-4 text-base leading-relaxed text-gray-600 dark:text-gray-300">
                  ¿Estás seguro de que deseas eliminar el formulario{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {selectedFormulario?.nombreFormulario}
                  </span>
                  ?
                </p>

                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Esta acción no se puede deshacer y se desasignará de todos los eventos.
                </p>

                <div className="mt-8 flex gap-3">
                  <Button
                    onClick={closeDeleteModal}
                    variant="outlined"
                    className="flex-1 font-medium"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleDeleteConfirm}
                    color="error"
                    className="flex-1 font-medium"
                  >
                    Sí, eliminar
                  </Button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </Page>
  );
}
