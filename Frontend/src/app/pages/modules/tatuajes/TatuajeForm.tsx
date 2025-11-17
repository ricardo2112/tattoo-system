/**
 * Tatuaje Form Page
 * Form for creating and editing tattoos
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Save, ArrowLeft, Layers } from 'lucide-react';
import { Card, Button, Input, TextArea, Select, Spinner } from '../../../../components/ui';
import { tatuajeService, type Tatuaje, clienteService, type Cliente } from '../../../../services';

const TatuajeForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = id !== 'new' && id !== undefined;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [formData, setFormData] = useState<Tatuaje>({
    idCliente: 0,
    artista: '',
    detalle: '',
    precio: 0,
    zonaTatuaje: '',
    imagen: '',
    estadoPago: 'parcial',
    registradoPor: 1, // Default user ID
  });

  useEffect(() => {
    loadClientes();
    if (isEditing) {
      loadTatuaje();
    }
  }, [id]);

  const loadClientes = async () => {
    try {
      const data = await clienteService.getAllClientes();
      setClientes(data);
    } catch (error) {
      console.error('Error loading clientes:', error);
    }
  };

  const loadTatuaje = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await tatuajeService.getTatuajeById(parseInt(id));
      setFormData(data);
    } catch (error) {
      console.error('Error loading tatuaje:', error);
      navigate('/tatuajes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.idCliente === 0) {
      alert('Por favor selecciona un cliente');
      return;
    }

    try {
      setSaving(true);

      if (isEditing && id) {
        await tatuajeService.actualizarTatuaje(parseInt(id), formData);
      } else {
        await tatuajeService.crearTatuaje(formData);
      }

      navigate('/tatuajes');
    } catch (error) {
      console.error('Error saving tatuaje:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'precio' || name === 'idCliente' ? parseFloat(value) || 0 : value,
    }));
  };

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
            {isEditing ? 'Editar Tatuaje' : 'Nuevo Tatuaje'}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {isEditing
              ? 'Actualiza la información del tatuaje'
              : 'Completa el formulario para agregar un nuevo tatuaje'}
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/tatuajes')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card variant="elevated">
          <Card.Header>
            <h2 className="text-xl font-semibold text-foreground">
              Información del Tatuaje
            </h2>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cliente */}
              <Select
                label="Cliente"
                name="idCliente"
                value={formData.idCliente.toString()}
                onChange={handleChange}
                required
              >
                <option value="0">Seleccionar cliente...</option>
                {clientes.map((cliente) => (
                  <option key={cliente.idCliente} value={cliente.idCliente}>
                    {cliente.nombre} {cliente.apellido}
                  </option>
                ))}
              </Select>

              {/* Artista */}
              <Input
                label="Artista"
                name="artista"
                value={formData.artista}
                onChange={handleChange}
                maxLength={30}
              />

              {/* Zona del Tatuaje */}
              <Input
                label="Zona del Tatuaje"
                name="zonaTatuaje"
                value={formData.zonaTatuaje}
                onChange={handleChange}
                maxLength={20}
                placeholder="Ej: Brazo, Espalda, etc."
              />

              {/* Precio */}
              <Input
                label="Precio"
                name="precio"
                type="number"
                step="0.01"
                min="0"
                value={formData.precio}
                onChange={handleChange}
              />

              {/* Estado de Pago */}
              <Select
                label="Estado de Pago"
                name="estadoPago"
                value={formData.estadoPago}
                onChange={handleChange}
                required
              >
                <option value="pendiente">Pendiente</option>
                <option value="parcial">Parcial</option>
                <option value="completo">Completo</option>
              </Select>

              {/* Imagen URL */}
              <Input
                label="URL de Imagen"
                name="imagen"
                value={formData.imagen}
                onChange={handleChange}
                maxLength={300}
                placeholder="https://ejemplo.com/imagen.jpg"
              />

              {/* Detalle */}
              <div className="md:col-span-2">
                <TextArea
                  label="Detalle"
                  name="detalle"
                  value={formData.detalle}
                  onChange={handleChange}
                  maxLength={50}
                  rows={3}
                  placeholder="Descripción del tatuaje..."
                />
              </div>
            </div>
          </Card.Body>
          <Card.Footer>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/tatuajes')}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? 'Actualizar' : 'Guardar'}
                  </>
                )}
              </Button>
            </div>
          </Card.Footer>
        </Card>
      </form>
    </div>
  );
};

export default TatuajeForm;
