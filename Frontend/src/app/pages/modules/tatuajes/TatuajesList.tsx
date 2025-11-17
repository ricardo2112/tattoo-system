/**
 * Tatuajes List Page
 * Displays a table of all tattoos with CRUD operations
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layers, Plus, Edit2, Trash2, DollarSign } from 'lucide-react';
import { Card, Table, Button, Badge, Spinner, Modal } from '../../../../components/ui';
import type { Column } from '../../../../components/ui';
import { tatuajeService, type Tatuaje, clienteService, type Cliente } from '../../../../services';

interface TatuajeWithCliente extends Tatuaje {
  clienteNombre?: string;
}

const TatuajesList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tatuajes, setTatuajes] = useState<TatuajeWithCliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTatuaje, setSelectedTatuaje] = useState<TatuajeWithCliente | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadTatuajes();
  }, []);

  const loadTatuajes = async () => {
    try {
      setLoading(true);
      const data = await tatuajeService.getAllTatuajes();

      // Load client names
      const tatuajesWithClientes = await Promise.all(
        data.map(async (tatuaje) => {
          try {
            const cliente = await clienteService.getClienteById(tatuaje.idCliente);
            return {
              ...tatuaje,
              clienteNombre: `${cliente.nombre} ${cliente.apellido}`,
            };
          } catch {
            return {
              ...tatuaje,
              clienteNombre: 'Desconocido',
            };
          }
        })
      );

      setTatuajes(tatuajesWithClientes);
    } catch (error) {
      console.error('Error loading tatuajes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (tatuaje: TatuajeWithCliente) => {
    setSelectedTatuaje(tatuaje);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedTatuaje?.idTatuaje) return;

    try {
      setDeleting(true);
      await tatuajeService.eliminarTatuaje(selectedTatuaje.idTatuaje);
      setDeleteModalOpen(false);
      setSelectedTatuaje(null);
      loadTatuajes();
    } catch (error) {
      console.error('Error deleting tatuaje:', error);
    } finally {
      setDeleting(false);
    }
  };

  const getEstadoPagoBadge = (estado: string = 'parcial') => {
    const variants = {
      completo: 'success',
      parcial: 'warning',
      pendiente: 'danger',
    } as const;

    return (
      <Badge variant={variants[estado as keyof typeof variants] || 'default'}>
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </Badge>
    );
  };

  const columns: Column<TatuajeWithCliente>[] = [
    {
      key: 'idTatuaje',
      header: 'ID',
      render: (item) => (
        <div className="font-medium text-foreground">#{item.idTatuaje}</div>
      ),
      sortable: true,
    },
    {
      key: 'clienteNombre',
      header: 'Cliente',
      render: (item) => (
        <div className="font-medium text-foreground">{item.clienteNombre}</div>
      ),
      sortable: true,
    },
    {
      key: 'detalle',
      header: 'Detalle',
      render: (item) => (
        <div>
          <div className="font-medium text-foreground">{item.detalle || '-'}</div>
          <div className="text-sm text-muted-foreground">
            {item.zonaTatuaje && `Zona: ${item.zonaTatuaje}`}
          </div>
        </div>
      ),
    },
    {
      key: 'artista',
      header: 'Artista',
      render: (item) => (
        <span className="text-muted-foreground">{item.artista || '-'}</span>
      ),
      sortable: true,
    },
    {
      key: 'precio',
      header: 'Precio',
      render: (item) => (
        <div className="flex items-center gap-1">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-foreground">
            {item.precio ? item.precio.toFixed(2) : '-'}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'estadoPago',
      header: 'Estado de Pago',
      render: (item) => getEstadoPagoBadge(item.estadoPago),
      sortable: true,
    },
    {
      key: 'fechaCreacion',
      header: 'Fecha',
      render: (item) => (
        <span className="text-muted-foreground text-sm">
          {item.fechaCreacion
            ? new Date(item.fechaCreacion).toLocaleDateString()
            : '-'}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (item) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/tatuajes/edit/${item.idTatuaje}`)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDelete(item)}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Layers className="h-8 w-8" />
            Tatuajes
          </h1>
          <p className="mt-1 text-muted-foreground">
            Gestiona los tatuajes y sus detalles
          </p>
        </div>
        <Button onClick={() => navigate('/tatuajes/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Tatuaje
        </Button>
      </div>

      {/* Tatuajes Table */}
      <Card variant="elevated">
        <Card.Body>
          {tatuajes.length === 0 ? (
            <div className="py-12 text-center">
              <Layers className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium text-foreground">
                No hay tatuajes
              </h3>
              <p className="mt-2 text-muted-foreground">
                Comienza agregando tu primer tatuaje
              </p>
              <Button className="mt-4" onClick={() => navigate('/tatuajes/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Tatuaje
              </Button>
            </div>
          ) : (
            <Table<TatuajeWithCliente>
              columns={columns}
              data={tatuajes}
              sortable
              hoverable
            />
          )}
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => !deleting && setDeleteModalOpen(false)}
        title="Eliminar Tatuaje"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            ¿Estás seguro de que deseas eliminar el tatuaje{' '}
            <span className="font-semibold text-foreground">
              #{selectedTatuaje?.idTatuaje}
            </span>
            ? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? <Spinner size="sm" /> : 'Eliminar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TatuajesList;
