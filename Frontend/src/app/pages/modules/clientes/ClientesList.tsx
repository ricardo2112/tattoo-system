/**
 * Clientes List Page
 * Displays a table of all clients with CRUD operations
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, Plus, Edit2, Trash2, Mail, Phone } from 'lucide-react';
import { Card, Table, Button, Badge, Spinner, Modal } from '../../../../components/ui';
import type { Column } from '../../../../components/ui';
import { clienteService, type Cliente } from '../../../../services';

const ClientesList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      setLoading(true);
      const data = await clienteService.getAllClientes();
      setClientes(data);
    } catch (error) {
      console.error('Error loading clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCliente?.idCliente) return;

    try {
      setDeleting(true);
      await clienteService.eliminarCliente(selectedCliente.idCliente);
      setDeleteModalOpen(false);
      setSelectedCliente(null);
      loadClientes();
    } catch (error) {
      console.error('Error deleting cliente:', error);
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<Cliente>[] = [
    {
      key: 'identificacion',
      header: 'Identificación',
      render: (item) => (
        <div className="font-medium text-foreground">{item.identificacion}</div>
      ),
      sortable: true,
    },
    {
      key: 'nombre',
      header: 'Nombre Completo',
      render: (item) => (
        <div>
          <div className="font-medium text-foreground">
            {item.nombre} {item.apellido}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'email',
      header: 'Contacto',
      render: (item) => (
        <div className="space-y-1">
          {item.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{item.email}</span>
            </div>
          )}
          {item.telefono && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{item.telefono}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'fechaNacimiento',
      header: 'Fecha de Nacimiento',
      render: (item) => (
        <span className="text-muted-foreground">
          {item.fechaNacimiento
            ? new Date(item.fechaNacimiento).toLocaleDateString()
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
            onClick={() => navigate(`/clientes/edit/${item.idCliente}`)}
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
            <Users className="h-8 w-8" />
            Clientes
          </h1>
          <p className="mt-1 text-muted-foreground">
            Gestiona la información de tus clientes
          </p>
        </div>
        <Button onClick={() => navigate('/clientes/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Clientes Table */}
      <Card variant="elevated">
        <Card.Body>
          {clientes.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium text-foreground">
                No hay clientes
              </h3>
              <p className="mt-2 text-muted-foreground">
                Comienza agregando tu primer cliente
              </p>
              <Button className="mt-4" onClick={() => navigate('/clientes/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Cliente
              </Button>
            </div>
          ) : (
            <Table<Cliente>
              columns={columns}
              data={clientes}
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
        title="Eliminar Cliente"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            ¿Estás seguro de que deseas eliminar al cliente{' '}
            <span className="font-semibold text-foreground">
              {selectedCliente?.nombre} {selectedCliente?.apellido}
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

export default ClientesList;
