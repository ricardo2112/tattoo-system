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
import {UsersIcon} from "@heroicons/react/24/solid";
import { SiWhatsapp, SiInstagram } from "react-icons/si";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { useDisclosure } from "@/hooks/index";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { clienteService } from "@/services/clienteService";
import { countryService } from "@/services/countryService";
import { calcularEdad } from "@/utils/edad";
import type { Cliente } from "@/types/cliente";
import type { Country } from "@/types/country";
import { GiTripleSkulls } from "react-icons/gi";

type SortField = "identificacion" | "nombre" | "apellido" | "telefono" | "nacionalidad";
type SortOrder = "asc" | "desc";

/**
 * Generate a slug from cliente name
 */
const generateClienteSlug = (cliente: Cliente): string => {
  const fullName = `${cliente.nombre || ""} ${cliente.apellido || ""}`.trim();
  return fullName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^\w-]+/g, "") // Remove non-word chars
    .replace(/--+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
};

/**
 * Clientes page
 * Manage clients and their information
 */
export default function Clientes() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isDeleteModalOpen, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);

  // Data states
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  // Modal states
  const [modalStatus, setModalStatus] = useState<"warning" | "error">("warning");
  const [modalMessage, setModalMessage] = useState("");

  // Table states
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>("nombre");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [clientesData, countriesData] = await Promise.all([
        clienteService.getAll(),
        countryService.getAll(),
      ]);
      setClientes(clientesData);
      setCountries(countriesData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get country info
  const getCountryInfo = (alpha2Code?: string) => {
    if (!alpha2Code) return null;
    return countries.find((c) => c.alpha2Code === alpha2Code);
  };

  // Filter and sort data
  const filteredAndSortedClientes = useMemo(() => {
    let filtered = clientes.filter((cliente) => {
      const searchLower = searchTerm.toLowerCase();
      const fullName = `${cliente.nombre || ""} ${cliente.apellido || ""}`.toLowerCase();
      const identificacion = (cliente.identificacion || "").toLowerCase();

      return fullName.includes(searchLower) || identificacion.includes(searchLower);
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue = "";
      let bValue = "";

      switch (sortField) {
        case "identificacion":
          aValue = a.identificacion || "";
          bValue = b.identificacion || "";
          break;
        case "nombre":
          aValue = a.nombre || "";
          bValue = b.nombre || "";
          break;
        case "apellido":
          aValue = a.apellido || "";
          bValue = b.apellido || "";
          break;
        case "telefono":
          aValue = a.telefono || "";
          bValue = b.telefono || "";
          break;
        case "nacionalidad":
          aValue = a.nacionalidad || "";
          bValue = b.nacionalidad || "";
          break;
      }

      if (sortOrder === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    return filtered;
  }, [clientes, searchTerm, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedClientes.length / itemsPerPage);
  const paginatedClientes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedClientes.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedClientes, currentPage, itemsPerPage]);

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
  const handleDeleteClick = async (cliente: Cliente) => {
    setSelectedCliente(cliente);

    // Verificar si el cliente tiene tatuajes
    try {
      const { tatuajeService } = await import("@/services/tatuajeService");
      const clienteTatuajes = await tatuajeService.getByClienteId(cliente.idCliente);

      if (clienteTatuajes.length > 0) {
        // Cliente tiene tatuajes, mostrar mensaje de error
        setModalMessage(`No se puede eliminar el cliente ${cliente.nombre} ${cliente.apellido} porque tiene ${clienteTatuajes.length} servicio(s) de tatuaje asociado(s). Por favor, elimine primero los servicios antes de eliminar el cliente.`);
        setModalStatus("error");
        openDeleteModal();
        return;
      }

      // No tiene tatuajes, mostrar confirmación
      setModalMessage("");
      setModalStatus("warning");
      openDeleteModal();
    } catch (error) {
      console.error("Error al verificar tatuajes:", error);
      setModalMessage("Error al verificar los servicios del cliente");
      setModalStatus("error");
      openDeleteModal();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCliente || modalStatus === "error") return;

    try {
      await clienteService.delete(selectedCliente.idCliente);
      await loadData();
      closeDeleteModal();
      setSelectedCliente(null);
    } catch (error) {
      console.error("Error deleting cliente:", error);
      setModalMessage("Error al eliminar el cliente");
      setModalStatus("error");
    }
  };

  // Handle view
  const handleView = (cliente: Cliente) => {
    const slug = generateClienteSlug(cliente);
    navigate(`/modules/clientes/${slug}`);
  };

  // Handle edit
  const handleEdit = (cliente: Cliente) => {
    const slug = generateClienteSlug(cliente);
    navigate(`/modules/clientes/editar/${slug}`);
  };

  // Handle new
  const handleNew = () => {
    navigate("/modules/clientes/nuevo");
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
    <Page title={t("modules.clients.title")}>
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
              <GiTripleSkulls  className="size-9" />
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t("modules.clients.title")}
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {t("modules.clients.description")}
              </p>
            </div>
          </div>
          <Button className = "py-3" onClick={handleNew} color="primary">
            <PlusIcon className="size-5 mr-2" />
            {t("modules.clients.newClient")}
          </Button>
        </div>

        <Card className="overflow-hidden">
          {/* Search and filters */}
          <div className="border-b border-gray-150 bg-gray-50 p-6 dark:border-dark-600 dark:bg-dark-800">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 max-w-md">
                <Input
                  placeholder={t("modules.clients.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  prefix={<MagnifyingGlassIcon className="size-4.5 text-gray-400" />}
                  className="w-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  {t("modules.clients.show")}
                </label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 dark:border-dark-600 dark:bg-dark-700 dark:text-gray-300 dark:hover:border-dark-500"
                >
                  <option value={10}>10 {t("modules.clients.records")}</option>
                  <option value={25}>25 {t("modules.clients.records")}</option>
                  <option value={50}>50 {t("modules.clients.records")}</option>
                  <option value={100}>100 {t("modules.clients.records")}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 space-y-4">
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
                      onClick={() => handleSort("identificacion")}
                    >
                      {t("modules.clients.table.idPassport")}
                      <SortIcon field="identificacion" />
                    </th>
                    <th
                      className="cursor-pointer px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-700"
                      onClick={() => handleSort("nombre")}
                    >
                      {t("modules.clients.table.client")}
                      <SortIcon field="nombre" />
                    </th>
                    <th
                      className="cursor-pointer px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-700"
                      onClick={() => handleSort("telefono")}
                    >
                      {t("modules.clients.table.contact")}
                      <SortIcon field="telefono" />
                    </th>
                    <th
                      className="cursor-pointer px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-700"
                      onClick={() => handleSort("nacionalidad")}
                    >
                      {t("modules.clients.table.nationality")}
                      <SortIcon field="nacionalidad" />
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                      {t("modules.clients.table.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 bg-white dark:divide-dark-600 dark:bg-dark-700">
                  {paginatedClientes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <UsersIcon className="mb-3 size-12 text-gray-300 dark:text-gray-600" />
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {t("modules.clients.empty.noClients")}
                          </p>
                          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                            {searchTerm
                              ? t("modules.clients.empty.tryOtherSearch")
                              : t("modules.clients.empty.addFirstClient")}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedClientes.map((cliente) => {
                      const country = getCountryInfo(cliente.nacionalidad);
                      return (
                        <tr
                          key={cliente.idCliente}
                          className="transition-colors hover:bg-gray-50 dark:hover:bg-dark-600"
                        >
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {cliente.identificacion ||
                                <Badge
                                    variant="soft"
                                    color="error"
                                    className="border border-this-darker/20 dark:border-this-lighter/20"
                                    >
                                    {t("modules.clients.status.notRegistered")}
                                </Badge>
                              }
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {cliente.nombre} {cliente.apellido}
                              </span>
                              {cliente.fechaNacimiento && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {t("modules.clients.table.age")}: {calcularEdad(cliente.fechaNacimiento)} {t("modules.clients.table.years")}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              {cliente.telefono && (
                                <a
                                  href={`https://wa.me/${cliente.telefono.replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group flex items-center gap-2 text-sm text-gray-700 transition-colors hover:text-green-600 dark:text-gray-300 dark:hover:text-green-500"
                                  data-tooltip
                                  data-tooltip-content="Abrir en WhatsApp"
                                >
                                  <SiWhatsapp className="size-4 text-green-600 transition-transform group-hover:scale-110" />
                                  <span className="group-hover:underline">{cliente.telefono}</span>
                                </a>
                              )}
                              {cliente.redes && (
                                <a
                                  href={`https://instagram.com/${cliente.redes.replace("@", "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group flex items-center gap-2 text-sm text-gray-700 transition-colors hover:text-pink-600 dark:text-gray-300 dark:hover:text-pink-500"
                                  data-tooltip
                                  data-tooltip-content="Abrir en Instagram"
                                >
                                  <SiInstagram className="size-4 text-pink-600 transition-transform group-hover:scale-110" />
                                  <span className="group-hover:underline">@{cliente.redes}</span>
                                </a>
                              )}
                              {!cliente.telefono && !cliente.redes && (
                                <span className="text-sm text-gray-400">
                                  <Badge
                                    variant="soft"
                                    color="error"
                                    className="border border-this-darker/20 dark:border-this-lighter/20"
                                    >
                                    {t("modules.clients.status.notRegistered")}
                                  </Badge>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {country ? (
                              <div className="flex items-center gap-2">
                                <img
                                  src={country.flags.svg}
                                  alt={country.name}
                                  className="h-5 w-7 rounded object-cover shadow-sm"
                                  data-tooltip
                                  data-tooltip-content={country.name}
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {country.alpha3Code}
                                </span>
                              </div>
                            ) : cliente.nacionalidad ? (
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {cliente.nacionalidad}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">
                                <Badge
                                  variant="soft"
                                  color="error"
                                  className="border border-this-darker/20 dark:border-this-lighter/20"
                                  >
                                {t("modules.clients.status.notRegistered")}
                              </Badge>
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                onClick={() => handleView(cliente)}
                                color="info"
                                variant="soft"
                                isIcon
                                className="size-9 rounded-full"
                                data-tooltip
                                data-tooltip-content={t("modules.clients.actions.viewDetails")}
                                data-tooltip-variant="info"
                              >
                                <EyeIcon className="size-5" />
                              </Button>
                              <Button
                                onClick={() => handleEdit(cliente)}
                                color="primary"
                                variant="soft"
                                isIcon
                                className="size-9 rounded-full"
                                data-tooltip
                                data-tooltip-content={t("modules.clients.actions.edit")}
                              >
                                <PencilIcon className="size-5" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteClick(cliente)}
                                color="error"
                                variant="soft"
                                isIcon
                                className="size-9 rounded-full"
                                data-tooltip
                                data-tooltip-content={t("modules.clients.actions.delete")}
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
          {!loading && filteredAndSortedClientes.length > 0 && (
            <div className="border-t border-gray-150 bg-gray-50 px-6 py-4 dark:border-dark-600 dark:bg-dark-800">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t("modules.clients.pagination.showing")}{" "}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  {t("modules.clients.pagination.to")}{" "}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Math.min(currentPage * itemsPerPage, filteredAndSortedClientes.length)}
                  </span>{" "}
                  {t("modules.clients.pagination.of")}{" "}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {filteredAndSortedClientes.length}
                  </span>{" "}
                  {t("modules.clients.pagination.clients")}
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
          onClose={modalStatus === "error" ? closeDeleteModal : () => {}}
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
              <ExclamationTriangleIcon
                className={`mx-auto inline size-20 shrink-0 ${
                  modalStatus === "error" ? "text-error" : "text-warning"
                }`}
              />

              <div className="mt-4">
                <DialogTitle
                  as="h3"
                  className="text-2xl font-semibold text-gray-800 dark:text-dark-100"
                >
                  {modalStatus === "error"
                    ? "No se puede eliminar"
                    : t("modules.clients.deleteModal.title")}
                </DialogTitle>

                <p className="mt-3 text-gray-600 dark:text-gray-400">
                  {modalMessage || (
                    <>
                      {t("modules.clients.deleteModal.message")}{" "}
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {selectedCliente?.nombre} {selectedCliente?.apellido}
                      </span>
                      {t("modules.clients.deleteModal.warning")}
                    </>
                  )}
                </p>

                <div className="mt-6 flex gap-3">
                  {modalStatus === "error" ? (
                    <Button
                      onClick={closeDeleteModal}
                      color="primary"
                      className="flex-1"
                    >
                      Entendido
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={closeDeleteModal}
                        variant="outlined"
                        className="flex-1"
                      >
                        {t("modules.clients.deleteModal.cancel")}
                      </Button>
                      <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        className="flex-1"
                      >
                        {t("modules.clients.deleteModal.confirm")}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </Page>
  );
}
