/**
 * Cliente Form Page
 * Form for creating and editing clients
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Save, ArrowLeft, Users } from 'lucide-react';
import { Card, Button, Input, TextArea, Spinner } from '../../../../components/ui';
import { clienteService, type Cliente } from '../../../../services';

const ClienteForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = id !== 'new' && id !== undefined;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Cliente>({
    identificacion: '',
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    telefono: '',
    email: '',
    redes: '',
    condicionMedica: '',
    enfermedadPiel: '',
    deporte: '',
    referencia: '',
    observaciones: '',
  });

  useEffect(() => {
    if (isEditing) {
      loadCliente();
    }
  }, [id]);

  const loadCliente = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await clienteService.getClienteById(parseInt(id));
      // Format date for input
      if (data.fechaNacimiento) {
        data.fechaNacimiento = new Date(data.fechaNacimiento).toISOString().split('T')[0];
      }
      setFormData(data);
    } catch (error) {
      console.error('Error loading cliente:', error);
      navigate('/clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      if (isEditing && id) {
        await clienteService.actualizarCliente(parseInt(id), formData);
      } else {
        await clienteService.crearCliente(formData);
      }

      navigate('/clientes');
    } catch (error) {
      console.error('Error saving cliente:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
            <Users className="h-8 w-8" />
            {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {isEditing
              ? 'Actualiza la información del cliente'
              : 'Completa el formulario para agregar un nuevo cliente'}
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/clientes')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card variant="elevated">
          <Card.Header>
            <h2 className="text-xl font-semibold text-foreground">
              Información del Cliente
            </h2>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Identificación */}
              <Input
                label="Identificación"
                name="identificacion"
                value={formData.identificacion}
                onChange={handleChange}
                required
                maxLength={30}
              />

              {/* Nombre */}
              <Input
                label="Nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                maxLength={30}
              />

              {/* Apellido */}
              <Input
                label="Apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
                maxLength={30}
              />

              {/* Fecha de Nacimiento */}
              <Input
                label="Fecha de Nacimiento"
                name="fechaNacimiento"
                type="date"
                value={formData.fechaNacimiento as string}
                onChange={handleChange}
              />

              {/* Teléfono */}
              <Input
                label="Teléfono"
                name="telefono"
                type="tel"
                value={formData.telefono}
                onChange={handleChange}
                maxLength={20}
              />

              {/* Email */}
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                maxLength={60}
              />

              {/* Redes Sociales */}
              <Input
                label="Redes Sociales"
                name="redes"
                value={formData.redes}
                onChange={handleChange}
                maxLength={20}
                placeholder="@usuario"
              />

              {/* Deporte */}
              <Input
                label="Deporte"
                name="deporte"
                value={formData.deporte}
                onChange={handleChange}
                maxLength={20}
              />

              {/* Referencia */}
              <Input
                label="Referencia"
                name="referencia"
                value={formData.referencia}
                onChange={handleChange}
                maxLength={20}
                placeholder="¿Cómo nos conoció?"
              />

              {/* Condición Médica */}
              <Input
                label="Condición Médica"
                name="condicionMedica"
                value={formData.condicionMedica}
                onChange={handleChange}
                maxLength={50}
              />

              {/* Enfermedad de Piel */}
              <Input
                label="Enfermedad de Piel"
                name="enfermedadPiel"
                value={formData.enfermedadPiel}
                onChange={handleChange}
                maxLength={50}
              />

              {/* Observaciones */}
              <div className="md:col-span-2">
                <TextArea
                  label="Observaciones"
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  maxLength={60}
                  rows={3}
                />
              </div>
            </div>
          </Card.Body>
          <Card.Footer>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/clientes')}
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

export default ClienteForm;
