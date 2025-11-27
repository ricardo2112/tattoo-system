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
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  ArrowsUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { GiSkullWithSyringe } from "react-icons/gi";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { useDisclosure } from "@/hooks/index";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { tatuajeService } from "@/services/tatuajeService";
import { clienteService } from "@/services/clienteService";
import type { Tatuaje } from "@/types/tatuaje";
import type { Cliente } from "@/types/cliente";

type SortField = "artista" | "cliente" | "precio" | "fechaCreacion" | "estadoPago";
type SortOrder = "asc" | "desc";

/**
 * Format currency
 */
const formatCurrency = (amount?: number): string => {
  if (!amount) return "N/A";
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-UY", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

/**
 * Get payment status badge color
 */
const getPaymentStatusColor = (status: string): "success" | "warning" | "error" | "info" => {
  switch (status.toLowerCase()) {
    case "pagado":
      return "success";
    case "pendiente":
      return "warning";
    case "parcial":
      return "info";
    default:
      return "error";
  }
};

/**
 * Tatuajes page
 * Manage tattoos and their information
 */
export default function Tatuajes() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isDeleteModalOpen, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);

  // Data states
  const [tatuajes, setTatuajes] = useState<Tatuaje[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTatuaje, setSelectedTatuaje] = useState<Tatuaje | null>(null);

  // Table states
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>("fechaCreacion");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tatuajesData, clientesData] = await Promise.all([
        tatuajeService.getAll(),
        clienteService.getAll(),
      ]);
      setTatuajes(tatuajesData);
      setClientes(clientesData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get client info
  const getClienteInfo = (idCliente: number) => {
    return clientes.find((c) => c.idCliente === idCliente);
  };

  // Filter and sort data
  const filteredAndSortedTatuajes = useMemo(() => {
    let filtered = tatuajes.filter((tatuaje) => {
      const searchLower = searchTerm.toLowerCase();
      const cliente = getClienteInfo(tatuaje.idCliente);
      const clienteName = cliente
        ? `${cliente.nombre || ""} ${cliente.apellido || ""}`.toLowerCase()
        : "";
      const artista = (tatuaje.artista || "").toLowerCase();
      const detalle = (tatuaje.detalle || "").toLowerCase();

      return (
        clienteName.includes(searchLower) ||
        artista.includes(searchLower) ||
        detalle.includes(searchLower)
      );
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number = "";
      let bValue: string | number = "";

      switch (sortField) {
        case "artista":
          aValue = a.artista || "";
          bValue = b.artista || "";
          break;
        case "cliente": {
          const clienteA = getClienteInfo(a.idCliente);
          const clienteB = getClienteInfo(b.idCliente);
          aValue = clienteA ? `${clienteA.nombre || ""} ${clienteA.apellido || ""}` : "";
          bValue = clienteB ? `${clienteB.nombre || ""} ${clienteB.apellido || ""}` : "";
          break;
        }
        case "precio":
          aValue = a.precio || 0;
          bValue = b.precio || 0;
          break;
        case "fechaCreacion":
          aValue = new Date(a.fechaCreacion).getTime();
          bValue = new Date(b.fechaCreacion).getTime();
          break;
        case "estadoPago":
          aValue = a.estadoPago || "";
          bValue = b.estadoPago || "";
          break;
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue);
      const bStr = String(bValue);

      if (sortOrder === "asc") {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });

    return filtered;
  }, [tatuajes, clientes, searchTerm, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTatuajes.length / itemsPerPage);
  const paginatedTatuajes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedTatuajes.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedTatuajes, currentPage, itemsPerPage]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Handle delete
  const handleDeleteClick = (tatuaje: Tatuaje) => {
    setSelectedTatuaje(tatuaje);
    openDeleteModal();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTatuaje) return;

    try {
      await tatuajeService.delete(selectedTatuaje.idTatuaje);
      await loadData();
      closeDeleteModal();
      setSelectedTatuaje(null);
    } catch (error) {
      console.error("Error deleting tatuaje:", error);
    }
  };

  // Handle view
  const handleView = (tatuaje: Tatuaje) => {
    navigate(`/modules/tatuajes/${tatuaje.idTatuaje}`);
  };

  // Handle edit
  const handleEdit = (tatuaje: Tatuaje) => {
    navigate(`/modules/tatuajes/editar/${tatuaje.idTatuaje}`);
  };

  // Handle new
  const handleNew = () => {
    navigate("/modules/tatuajes/nuevo");
  };

  // Sort icon component
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowsUpDownIcon className="ml-1 inline size-4 text-gray-400" />;
    }
    return sortOrder === "asc" ? (
      <ChevronUpIcon className="ml-1 inline size-4 text-blue-500" />
    ) : (
      <ChevronDownIcon className="ml-1 inline size-4 text-blue-500" />
    );
  };

  return (
    <Page title={t("modules.tattoos.title")}>
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar
              size={16}
              initialVariant="soft"
              initialColor="info"
              classNames={{
                display:
                  "border border-this-darker/20 dark:border-this-lighter/20",
              }}
            >
              <GiSkullWithSyringe className="size-9" />
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t("modules.tattoos.title")}
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {t("modules.tattoos.description")}
              </p>
            </div>
          </div>
          <Button className="py-3" onClick={handleNew} color="primary">
            <PlusIcon className="mr-2 size-5" />
            Nuevo Tatuaje
          </Button>
        </div>

        <Card className="overflow-hidden">
          {/* Search and filters */}
          <div className="border-b border-gray-150 bg-gray-50 p-6 dark:border-dark-600 dark:bg-dark-800">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-md flex-1">
                <Input
                  placeholder="Buscar por artista, cliente o detalle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  prefix={<MagnifyingGlassIcon className="size-4.5 text-gray-400" />}
                  className="w-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  Mostrar:
                </label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 dark:border-dark-600 dark:bg-dark-700 dark:text-gray-300 dark:hover:border-dark-500"
                >
                  <option value={10}>10 registros</option>
                  <option value={25}>25 registros</option>
                  <option value={50}>50 registros</option>
                  <option value={100}>100 registros</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="space-y-4 p-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex space-x-4">
                    <Skeleton className="h-12 w-full rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-800">
                  <tr>
                    <th
                      className="cursor-pointer px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-700"
                      onClick={() => handleSort("artista")}
                    >
                      Artista
                      <SortIcon field="artista" />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                      Detalle
                    </th>
                    <th
                      className="cursor-pointer px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-700"
                      onClick={() => handleSort("cliente")}
                    >
                      Cliente
                      <SortIcon field="cliente" />
                    </th>
                    <th
                      className="cursor-pointer px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-700"
                      onClick={() => handleSort("precio")}
                    >
                      Precio
                      <SortIcon field="precio" />
                    </th>
                    <th
                      className="cursor-pointer px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-700"
                      onClick={() => handleSort("estadoPago")}
                    >
                      Estado Pago
                      <SortIcon field="estadoPago" />
                    </th>
                    <th
                      className="cursor-pointer px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-700"
                      onClick={() => handleSort("fechaCreacion")}
                    >
                      Creación
                      <SortIcon field="fechaCreacion" />
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 bg-white dark:divide-dark-600 dark:bg-dark-700">
                  {paginatedTatuajes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <GiSkullWithSyringe className="mb-3 size-12 text-gray-300 dark:text-gray-600" />
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            No se encontraron tatuajes
                          </p>
                          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                            {searchTerm
                              ? "Intenta con otros términos de búsqueda"
                              : "Comienza agregando tu primer tatuaje"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedTatuajes.map((tatuaje) => {
                      const cliente = getClienteInfo(tatuaje.idCliente);
                      return (
                        <tr
                          key={tatuaje.idTatuaje}
                          className="transition-colors hover:bg-gray-50 dark:hover:bg-dark-600"
                        >
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {tatuaje.artista || (
                                <Badge
                                  variant="soft"
                                  color="error"
                                  className="border border-this-darker/20 dark:border-this-lighter/20"
                                >
                                  Sin artista
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-xs">
                              {tatuaje.detalle ? (
                                <div className="flex flex-col">
                                  <span className="truncate text-sm text-gray-900 dark:text-white">
                                    {tatuaje.detalle}
                                  </span>
                                  {tatuaje.zonaTatuaje && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      Zona: {tatuaje.zonaTatuaje}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <Badge
                                  variant="soft"
                                  color="error"
                                  className="border border-this-darker/20 dark:border-this-lighter/20"
                                >
                                  Sin detalle
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {cliente ? (
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {cliente.nombre} {cliente.apellido}
                                </span>
                                {cliente.telefono && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {cliente.telefono}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <Badge
                                variant="soft"
                                color="error"
                                className="border border-this-darker/20 dark:border-this-lighter/20"
                              >
                                Cliente no encontrado
                              </Badge>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(tatuaje.precio)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant="soft"
                              color={getPaymentStatusColor(tatuaje.estadoPago)}
                              className="border border-this-darker/20 dark:border-this-lighter/20"
                            >
                              {tatuaje.estadoPago || "Desconocido"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {formatDate(tatuaje.fechaCreacion)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                onClick={() => handleView(tatuaje)}
                                color="info"
                                variant="soft"
                                isIcon
                                className="size-9 rounded-full"
                                data-tooltip
                                data-tooltip-content="Ver detalles"
                                data-tooltip-variant="info"
                              >
                                <EyeIcon className="size-5" />
                              </Button>
                              <Button
                                onClick={() => handleEdit(tatuaje)}
                                color="primary"
                                variant="soft"
                                isIcon
                                className="size-9 rounded-full"
                                data-tooltip
                                data-tooltip-content="Editar"
                              >
                                <PencilIcon className="size-5" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteClick(tatuaje)}
                                color="error"
                                variant="soft"
                                isIcon
                                className="size-9 rounded-full"
                                data-tooltip
                                data-tooltip-content="Eliminar"
                                data-tooltip-variant="error"
                              >
                                <TrashIcon className="size-5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!loading && filteredAndSortedTatuajes.length > 0 && (
            <div className="border-t border-gray-150 bg-gray-50 px-6 py-4 dark:border-dark-600 dark:bg-dark-800">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Mostrando{" "}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  a{" "}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Math.min(currentPage * itemsPerPage, filteredAndSortedTatuajes.length)}
                  </span>{" "}
                  de{" "}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {filteredAndSortedTatuajes.length}
                  </span>{" "}
                  tatuajes
                </div>
                <Pagination
                  total={totalPages}
                  value={currentPage}
                  onChange={setCurrentPage}
                >
                  <PaginationFirst />
                  <PaginationPrevious />
                  <PaginationItems />
                  <PaginationNext />
                  <PaginationLast />
                </Pagination>
              </div>
            </div>
          )}
        </Card>
      </div>

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
              <ExclamationTriangleIcon className="mx-auto inline size-20 shrink-0 text-error" />

              <div className="mt-4">
                <DialogTitle
                  as="h3"
                  className="text-2xl font-semibold text-gray-800 dark:text-dark-100"
                >
                  ¿Eliminar Tatuaje?
                </DialogTitle>

                <p className="mt-3 text-gray-600 dark:text-gray-400">
                  ¿Estás seguro de que deseas eliminar este tatuaje
                  {selectedTatuaje?.detalle && (
                    <>
                      {" "}
                      <span className="font-semibold text-gray-800 dark:text-white">
                        "{selectedTatuaje.detalle}"
                      </span>
                    </>
                  )}
                  ? Esta acción no se puede deshacer.
                </p>

                <div className="mt-6 flex gap-3">
                  <Button
                    onClick={closeDeleteModal}
                    variant="outlined"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleDeleteConfirm}
                    color="error"
                    className="flex-1"
                  >
                    Eliminar
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
