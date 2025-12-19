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
  Textarea,
} from "@/components/ui";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  CalendarIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  MapPinIcon,
  XMarkIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { CalendarDaysIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { useDisclosure } from "@/hooks/index";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { citaService } from "@/services/citaService";
import type { Cita } from "@/types/cita";
import { format, parseISO, isToday, isBefore, isAfter, startOfToday, addMinutes } from "date-fns";
import { es } from "date-fns/locale";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { formatLocalISO, buildLocalDateTime } from "@/utils/dateUtils";

type FilterType = "today" | "past" | "future" | "all";

interface CitaFormData {
  titulo?: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin: string;
}

/**
 * Citas page - Módulo de gestión de citas de visita
 * Este módulo SOLO maneja citas de visita (consultas iniciales)
 * Las citas de servicio se crean desde el módulo de tatuajes
 */
export default function Citas() {
  const [isCreateModalOpen, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
  const [isEditModalOpen, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [isCancelModalOpen, { open: openCancelModal, close: closeCancelModal }] = useDisclosure(false);

  // Data states
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [filterType, setFilterType] = useState<FilterType>("today");
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Form state
  const [formData, setFormData] = useState<CitaFormData>({
    titulo: "Visita de Consulta",
    descripcion: "",
    fechaInicio: "",
    fechaFin: "",
  });

  // Estados separados para el DatePicker
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>("");
  const [horaInicio, setHoraInicio] = useState<string>("");
  const [horaFin, setHoraFin] = useState<string>("");

  const saveRef = useRef(null);

  // Sincronizar fechaSeleccionada, horaInicio y horaFin con formData
  useEffect(() => {
    if (fechaSeleccionada && horaInicio && horaFin) {
      const inicio = buildLocalDateTime(fechaSeleccionada, horaInicio);
      const fin = buildLocalDateTime(fechaSeleccionada, horaFin);

      setFormData(prev => ({
        ...prev,
        fechaInicio: formatLocalISO(inicio),
        fechaFin: formatLocalISO(fin),
      }));
    }
  }, [fechaSeleccionada, horaInicio, horaFin]);

  // Auto-actualizar hora de fin cuando cambia hora de inicio (30 minutos después)
  useEffect(() => {
    if (horaInicio && !horaFin && !selectedCita) {
      const [hours, minutes] = horaInicio.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes + 30;
      const newHour = Math.floor(totalMinutes / 60) % 24;
      const newMinutes = totalMinutes % 60;
      const newTime = `${String(newHour).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
      setHoraFin(newTime);
    }
  }, [horaInicio, horaFin, selectedCita]);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const citasData = await citaService.getAll();
      setCitas(citasData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Error al cargar las citas. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Filter citas by time
  const filterByTime = (cita: Cita): boolean => {
    const citaDate = parseISO(cita.fechaInicio);
    const today = startOfToday();

    switch (filterType) {
      case "today":
        return isToday(citaDate);
      case "past":
        return isBefore(citaDate, today) && !isToday(citaDate);
      case "future":
        return isAfter(citaDate, today);
      case "all":
        return true;
      default:
        return true;
    }
  };


  // Filter and search citas
  const filteredCitas = useMemo(() => {
    let filtered = citas.filter(filterByTime);

    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((cita) => {
        const titulo = (cita.titulo || "").toLowerCase();
        const descripcion = (cita.descripcion || "").toLowerCase();
        const zona = (cita.zona || "").toLowerCase();
        const estado = (cita.estado || "").toLowerCase();

        return (
          titulo.includes(searchLower) ||
          descripcion.includes(searchLower) ||
          zona.includes(searchLower) ||
          estado.includes(searchLower)
        );
      });
    }

    // Sort by date (closest first)
    return filtered.sort((a, b) =>
      new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime()
    );
  }, [citas, filterType, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredCitas.length / itemsPerPage);
  const paginatedCitas = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCitas.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCitas, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, searchTerm, itemsPerPage]);

  // Get badge color for estado
  const getEstadoBadgeColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "confirmada":
        return "info";
      case "cancelada":
        return "error";
      default:
        return "secondary";
    }
  };

  // Calculate duration in minutes from dates
  const calculateDuration = (inicio: string, fin: string): number => {
    const start = new Date(inicio);
    const end = new Date(fin);
    return Math.round((end.getTime() - start.getTime()) / 60000);
  };

  // Handle create new visit
  const handleCreateNewVisit = () => {
    const now = new Date();
    const roundedMinutes = Math.ceil(now.getMinutes() / 15) * 15;
    now.setMinutes(roundedMinutes);
    now.setSeconds(0);
    now.setMilliseconds(0);

    const endTime = addMinutes(now, 30); // 30 minutes by default

    // Inicializar estados separados para DatePicker
    setFechaSeleccionada(format(now, "yyyy-MM-dd"));
    setHoraInicio(format(now, "HH:mm"));
    setHoraFin(format(endTime, "HH:mm"));

    setFormData({
      titulo: "Visita de Consulta",
      descripcion: "",
      fechaInicio: "",
      fechaFin: "",
    });
    setSelectedCita(null);
    setError(null);
    openCreateModal();
  };

  // Handle edit
  const handleEdit = (cita: Cita) => {
    setSelectedCita(cita);

    const inicioDate = parseISO(cita.fechaInicio);
    const finDate = parseISO(cita.fechaFin);

    // Inicializar estados separados para DatePicker
    setFechaSeleccionada(format(inicioDate, "yyyy-MM-dd"));
    setHoraInicio(format(inicioDate, "HH:mm"));
    setHoraFin(format(finDate, "HH:mm"));

    setFormData({
      titulo: cita.titulo || "",
      descripcion: cita.descripcion || "",
      fechaInicio: "",
      fechaFin: "",
    });
    setError(null);
    openEditModal();
  };

  // Validate form
  const validateForm = (): string | null => {
    if (!formData.fechaInicio || !formData.fechaFin) {
      return "Por favor, completa las fechas de inicio y fin.";
    }

    const inicio = new Date(formData.fechaInicio);
    const fin = new Date(formData.fechaFin);

    if (inicio >= fin) {
      return "La fecha de inicio debe ser anterior a la fecha de fin.";
    }

    if (inicio.toDateString() !== fin.toDateString()) {
      return "La cita debe realizarse el mismo día.";
    }

    return null;
  };

  // Handle save
  const handleSave = async () => {
    try {
      setError(null);

      // Validar formulario
      const validationError = validateForm();
      if (validationError) {
        setError(validationError);
        return;
      }

      if (selectedCita) {
        await citaService.update(selectedCita.idCita, formData);
      } else {
        await citaService.create(formData);
      }
      await loadData();
      closeEditModal();
      closeCreateModal();
      resetForm();
    } catch (err: any) {
      console.error("Error saving cita:", err);
      setError(err.response?.data?.message || "Error al guardar la cita. Por favor, intenta de nuevo.");
    }
  };

  const handleCancelClick = (cita: Cita) => {
    setSelectedCita(cita);
    openCancelModal();
  };

  const handleCancelConfirm = async () => {
    if (!selectedCita) return;

    try {
      setError(null);
      // Update estado to "cancelada" - backend will handle Google Calendar deletion
      await citaService.update(selectedCita.idCita, { estado: "cancelada" });
      await loadData();
      closeCancelModal();
      setSelectedCita(null);
    } catch (err: any) {
      console.error("Error canceling cita:", err);
      setError(err.response?.data?.message || "Error al cancelar la cita.");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      titulo: "Visita de Consulta",
      descripcion: "",
      fechaInicio: "",
      fechaFin: "",
    });
    setFechaSeleccionada("");
    setHoraInicio("");
    setHoraFin("");
    setSelectedCita(null);
    setError(null);
  };

  return (
    <Page title="Citas de Visita">
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
              <CalendarDaysIcon className="size-9" />
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Gestión de Citas de Visita
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Administra las citas de consulta inicial. Las citas de servicio se crean desde Tatuajes.
              </p>
            </div>
          </div>
          <Button onClick={handleCreateNewVisit} color="primary">
            <PlusIcon className="mr-2 size-5" />
            Nueva Cita de Visita
          </Button>
        </div>

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
              {/* Time Filter Buttons */}
              {[
                { key: "today" as FilterType, label: "Hoy", icon: CalendarIcon },
                { key: "future" as FilterType, label: "Próximas", icon: ClockIcon },
                { key: "past" as FilterType, label: "Pasadas", icon: ClockIcon },
                { key: "all" as FilterType, label: "Todas", icon: CalendarDaysIcon },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setFilterType(key)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    filterType === key
                      ? "bg-primary-600 text-white dark:bg-primary-500"
                      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-dark-600 dark:bg-dark-700 dark:text-gray-300 dark:hover:bg-dark-600"
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Search */}
            <Input
              placeholder="Buscar por título, descripción o estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<MagnifyingGlassIcon className="size-5 text-gray-400" />}
            />

            {/* Results Info */}
            <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-dark-600">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredCitas.length === 0 ? (
                  "No se encontraron citas"
                ) : (
                  <>
                    Mostrando <span className="font-semibold text-gray-900 dark:text-white">{filteredCitas.length}</span>{" "}
                    {filteredCitas.length === 1 ? "cita" : "citas"}
                  </>
                )}
              </p>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:border-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-dark-600 dark:bg-dark-700 dark:text-gray-300 dark:hover:border-dark-500"
              >
                <option value={8}>8 por página</option>
                <option value={16}>16 por página</option>
                <option value={24}>24 por página</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="mb-4 h-6 w-3/4 rounded" />
                <Skeleton className="mb-2 h-4 w-full rounded" />
                <Skeleton className="mb-4 h-4 w-2/3 rounded" />
                <Skeleton className="h-8 w-full rounded" />
              </Card>
            ))}
          </div>
        ) : paginatedCitas.length === 0 ? (
          <Card className="py-16">
            <div className="flex flex-col items-center justify-center">
              <CalendarIcon className="mb-4 size-16 text-gray-300 dark:text-gray-600" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                No hay citas de visita
              </h3>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? "No se encontraron citas con los filtros aplicados"
                  : "Aún no hay citas registradas. Crea tu primera cita de visita."}
              </p>
              <Button onClick={handleCreateNewVisit} color="primary" className="mt-6">
                <PlusIcon className="mr-2 size-5" />
                Nueva Cita de Visita
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedCitas.map((cita) => {
                const citaDate = parseISO(cita.fechaInicio);
                const citaEndDate = parseISO(cita.fechaFin);
                const duracion = calculateDuration(cita.fechaInicio, cita.fechaFin);

                return (
                  <Card
                    key={cita.idCita}
                    className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary-600/10"
                  >
                    {/* Card Header */}
                    <div className="relative border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white p-5 dark:border-dark-600 dark:from-dark-700 dark:to-dark-700/80">
                      <div className="mb-3 flex items-start justify-between">
                        <Badge
                          variant="soft"
                          color={getEstadoBadgeColor(cita.estado)}
                          className="font-medium capitalize shadow-sm"
                        >
                          {cita.estado}
                        </Badge>
                      </div>

                      <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                        {cita.titulo || "Sin título"}
                      </h3>

                      {cita.descripcion && (
                        <p className="line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                          {cita.descripcion}
                        </p>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-5">
                      <div className="space-y-3">
                        {/* Date and Time */}
                        <div className="flex items-start gap-3 rounded-lg bg-primary-50/50 p-3 dark:bg-primary-900/10">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-600 shadow-md dark:bg-primary-500">
                            <CalendarIcon className="size-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {format(citaDate, "d 'de' MMMM, yyyy", { locale: es })}
                            </p>
                            <div className="mt-1 flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                              <ClockIcon className="size-3.5" />
                              <span>{format(citaDate, "HH:mm", { locale: es })} - {format(citaEndDate, "HH:mm", { locale: es })}</span>
                              <span className="ml-1 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-dark-600 dark:text-gray-300">
                                {duracion} min
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Zone */}
                        {cita.zona && (
                          <div className="flex items-center gap-2.5 text-sm">
                            <MapPinIcon className="size-4 shrink-0 text-gray-400" />
                            <p className="font-medium text-gray-700 dark:text-gray-300">{cita.zona}</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {cita.estado.toLowerCase() === "confirmada" ? (
                        <div className="mt-5 flex gap-2.5">
                          <Button
                            onClick={() => handleEdit(cita)}
                            color="primary"
                            variant="soft"
                            className="flex-1 font-medium shadow-sm transition-all hover:shadow-md"
                          >
                            <PencilIcon className="mr-1.5 size-4" />
                            Editar
                          </Button>

                          <Button
                            onClick={() => handleCancelClick(cita)}
                            color="error"
                            variant="soft"
                            className="flex-1 font-medium shadow-sm transition-all hover:shadow-md"
                          >
                            <XCircleIcon className="mr-1.5 size-4" />
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <div className="mt-5">
                          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-center dark:border-dark-600 dark:bg-dark-600/30">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Esta cita ha sido {cita.estado.toLowerCase()}
                            </p>
                          </div>
                        </div>
                      )}
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

      {/* Create/Edit Modal */}
      <Transition appear show={isCreateModalOpen || isEditModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
          onClose={isEditModalOpen ? closeEditModal : closeCreateModal}
          initialFocus={saveRef}
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
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur transition-opacity dark:bg-black/30" />
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
            <DialogPanel className="relative flex w-full max-w-2xl origin-top flex-col overflow-hidden rounded-xl bg-white shadow-2xl transition-all duration-300 dark:bg-dark-700">
              <div className="flex items-center justify-between border-b border-gray-200/80 bg-gradient-to-r from-primary-50 to-primary-100/50 px-6 py-5 dark:border-dark-600 dark:from-dark-700 dark:to-dark-600">
                <DialogTitle as="h3" className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary-600 shadow-md dark:bg-primary-500">
                    <CalendarIcon className="size-5 text-white" />
                  </div>
                  {selectedCita ? "Editar Cita de Visita" : "Nueva Cita de Visita"}
                </DialogTitle>
                <Button
                  onClick={isEditModalOpen ? closeEditModal : closeCreateModal}
                  variant="flat"
                  isIcon
                  className="size-9 rounded-full text-gray-600 transition-colors hover:bg-white/60 dark:text-gray-300 dark:hover:bg-dark-600"
                >
                  <XMarkIcon className="size-5" />
                </Button>
              </div>

              <div className="scrollbar-sm flex max-h-[70vh] flex-col overflow-y-auto px-8 py-8">
                {/* Error Alert in Modal */}
                {error && (
                  <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-800 dark:bg-red-900/20">
                    <div className="flex items-start gap-3">
                      <ExclamationTriangleIcon className="size-5 shrink-0 text-red-600 dark:text-red-400" />
                      <p className="text-sm leading-relaxed text-red-800 dark:text-red-200">{error}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <Input
                    label="Título"
                    placeholder="Ej: Visita de Consulta"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    required
                  />

                  <Textarea
                    label="Descripción"
                    placeholder="Detalles sobre la consulta: ideas de tatuaje, zona del cuerpo, etc."
                    rows={3}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  />

                  {/* Fecha de la Cita */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Fecha de la Cita <span className="text-red-500">*</span>
                    </label>
                    <DatePicker
                      value={fechaSeleccionada}
                      onChange={(date) => {
                        if (Array.isArray(date) && date.length > 0) {
                          const selectedDate = new Date(date[0]);
                          const formatted = selectedDate.toISOString().split('T')[0];
                          setFechaSeleccionada(formatted);
                        } else if (typeof date === 'string') {
                          const selectedDate = new Date(date);
                          const formatted = selectedDate.toISOString().split('T')[0];
                          setFechaSeleccionada(formatted);
                        }
                      }}
                      options={{
                        minDate: "today",
                        dateFormat: "Y-m-d",
                        locale: {
                          firstDayOfWeek: 1,
                        },
                      }}
                      placeholder="Seleccione la fecha de la cita..."
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Hora de Inicio */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Hora de Inicio <span className="text-red-500">*</span>
                      </label>
                      <DatePicker
                        value={horaInicio}
                        onChange={(time) => {
                          if (Array.isArray(time) && time.length > 0) {
                            const selectedTime = new Date(time[0]);
                            const formatted = `${String(selectedTime.getHours()).padStart(2, '0')}:${String(selectedTime.getMinutes()).padStart(2, '0')}`;
                            setHoraInicio(formatted);
                          } else if (typeof time === 'string') {
                            const selectedTime = new Date(time);
                            const formatted = `${String(selectedTime.getHours()).padStart(2, '0')}:${String(selectedTime.getMinutes()).padStart(2, '0')}`;
                            setHoraInicio(formatted);
                          }
                        }}
                        options={{
                          enableTime: true,
                          noCalendar: true,
                          dateFormat: "H:i",
                          time_24hr: true,
                        }}
                        placeholder="Seleccione hora de inicio..."
                      />
                    </div>

                    {/* Hora de Fin */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Hora de Fin <span className="text-red-500">*</span>
                      </label>
                      <DatePicker
                        value={horaFin}
                        onChange={(time) => {
                          if (Array.isArray(time) && time.length > 0) {
                            const selectedTime = new Date(time[0]);
                            const formatted = `${String(selectedTime.getHours()).padStart(2, '0')}:${String(selectedTime.getMinutes()).padStart(2, '0')}`;
                            setHoraFin(formatted);
                          } else if (typeof time === 'string') {
                            const selectedTime = new Date(time);
                            const formatted = `${String(selectedTime.getHours()).padStart(2, '0')}:${String(selectedTime.getMinutes()).padStart(2, '0')}`;
                            setHoraFin(formatted);
                          }
                        }}
                        options={{
                          enableTime: true,
                          noCalendar: true,
                          dateFormat: "H:i",
                          time_24hr: true,
                        }}
                        placeholder="Seleccione hora de fin..."
                      />
                      {horaInicio && horaFin && (
                        horaFin <= horaInicio ? (
                          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                            La hora de fin debe ser posterior a la hora de inicio
                          </p>
                        ) : (
                          <div className="mt-1 flex items-center gap-2">
                            <ClockIcon className="size-4 text-neutral-600 dark:text-neutral-400" />
                            <span className="text-xs text-neutral-700 dark:text-neutral-300">
                              Duración: {calculateDuration(formData.fechaInicio, formData.fechaFin)} minutos
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <Button
                    onClick={isEditModalOpen ? closeEditModal : closeCreateModal}
                    variant="outlined"
                    className="flex-1 font-medium"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    color="primary"
                    ref={saveRef}
                    className="flex-1 font-semibold shadow-md shadow-primary-600/20"
                  >
                    {selectedCita ? "Guardar Cambios" : "Crear Cita"}
                  </Button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>

      {/* Cancel Confirmation Modal */}
      <Transition appear show={isCancelModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
          onClose={closeCancelModal}
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
                <XCircleIcon className="size-12 text-red-600 dark:text-red-400" />
              </div>

              <div className="mt-6">
                <DialogTitle as="h3" className="text-2xl font-bold text-gray-900 dark:text-white">
                  ¿Cancelar Cita?
                </DialogTitle>

                <p className="mt-4 text-base leading-relaxed text-gray-600 dark:text-gray-300">
                  ¿Estás seguro de que deseas cancelar la cita{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {selectedCita?.titulo || "sin título"}
                  </span>
                  ?
                </p>

                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  La cita será removida de Google Calendar pero se mantendrá en el historial.
                </p>

                <div className="mt-8 flex gap-3">
                  <Button
                    onClick={closeCancelModal}
                    variant="outlined"
                    className="flex-1 font-medium"
                  >
                    No, mantener
                  </Button>
                  <Button
                    onClick={handleCancelConfirm}
                    color="error"
                    className="flex-1 font-medium"
                  >
                    Sí, cancelar cita
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
