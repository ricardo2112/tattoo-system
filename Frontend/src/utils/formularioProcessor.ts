import type { RegistroTatuajeResponse } from "@/types/registroTatuaje";

/**
 * Procesa el HTML del formulario reemplazando los placeholders con los datos reales
 */
export const procesarFormulario = (
  htmlTemplate: string,
  data: RegistroTatuajeResponse
): string => {
  let html = htmlTemplate;

  // Datos del cliente
  const cliente = data.cliente;
  html = html.replace(/\{\{CLIENTE_NOMBRE\}\}/g, `${cliente.nombre} ${cliente.apellido}`);
  html = html.replace(/\{\{CLIENTE_CI\}\}/g, cliente.identificacion || "N/A");
  html = html.replace(
    /\{\{CLIENTE_FECHA_NACIMIENTO\}\}/g,
    cliente.fechaNacimiento
      ? new Date(cliente.fechaNacimiento).toLocaleDateString("es-EC", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A"
  );
  html = html.replace(/\{\{CLIENTE_TELEFONO\}\}/g, cliente.telefono || "N/A");
  html = html.replace(/\{\{CLIENTE_EMAIL\}\}/g, cliente.email || "N/A");
  html = html.replace(/\{\{CLIENTE_CONDICIONES_MEDICAS\}\}/g, cliente.condicionMedica || "Ninguna");
  html = html.replace(/\{\{CLIENTE_ENFERMEDADES_PIEL\}\}/g, cliente.enfermedadPiel || "Ninguna");
  html = html.replace(/\{\{CLIENTE_COMO_ENCONTRO\}\}/g, cliente.referencia || "N/A");
  html = html.replace(/\{\{CLIENTE_OBSERVACIONES\}\}/g, cliente.observaciones || "N/A");
  html = html.replace(
    /\{\{FECHA_AGENDAMIENTO\}\}/g,
    new Date().toLocaleDateString("es-EC", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  );

  // Datos del tutor (si es menor de edad)
  if (data.esMenorDeEdad && data.tutor) {
    const tutor = data.tutor;
    html = html.replace(/\{\{TUTOR_DISPLAY\}\}/g, "block");
    html = html.replace(/\{\{TUTOR_NOMBRE\}\}/g, `${tutor.nombre} ${tutor.apellido}`);
    html = html.replace(/\{\{TUTOR_CI\}\}/g, tutor.identificacion || "N/A");
    html = html.replace(/\{\{TUTOR_TELEFONO\}\}/g, "N/A"); // No tenemos teléfono del tutor en el modelo
    html = html.replace(/\{\{TUTOR_EMAIL\}\}/g, "N/A"); // No tenemos email del tutor en el modelo
    html = html.replace(/\{\{TUTOR_PARENTESCO\}\}/g, tutor.parentezco || "N/A");

    // Mostrar aviso de menor de edad
    html = html.replace(/\{\{MINOR_NOTICE_START\}\}/g, "");
    html = html.replace(/\{\{MINOR_NOTICE_END\}\}/g, "");

    // Información de firma
    html = html.replace(/\{\{NOMBRE_FIRMANTE\}\}/g, `${tutor.nombre} ${tutor.apellido}`);
    html = html.replace(/\{\{TIPO_FIRMANTE\}\}/g, "Tutor Legal");
    html = html.replace(
      /\{\{ACCION_CONSENTIMIENTO\}\}/g,
      "que mi tutelado reciba un tatuaje realizado"
    );
    html = html.replace(
      /\{\{NOTA_TUTOR\}\}/g,
      "El tutor legal es responsable de proporcionar los cuidados posteriores necesarios al menor."
    );
  } else {
    // Cliente mayor de edad
    html = html.replace(/\{\{TUTOR_DISPLAY\}\}/g, "none");
    html = html.replace(/\{\{TUTOR_NOMBRE\}\}/g, "");
    html = html.replace(/\{\{TUTOR_CI\}\}/g, "");
    html = html.replace(/\{\{TUTOR_TELEFONO\}\}/g, "");
    html = html.replace(/\{\{TUTOR_EMAIL\}\}/g, "");
    html = html.replace(/\{\{TUTOR_PARENTESCO\}\}/g, "");

    // Ocultar aviso de menor de edad
    html = html.replace(/\{\{MINOR_NOTICE_START\}\}/g, "<!--");
    html = html.replace(/\{\{MINOR_NOTICE_END\}\}/g, "-->");

    // Información de firma
    html = html.replace(/\{\{NOMBRE_FIRMANTE\}\}/g, `${cliente.nombre} ${cliente.apellido}`);
    html = html.replace(/\{\{TIPO_FIRMANTE\}\}/g, "Cliente");
    html = html.replace(/\{\{ACCION_CONSENTIMIENTO\}\}/g, "realizarme un tatuaje");
    html = html.replace(/\{\{NOTA_TUTOR\}\}/g, "");
  }

  // Datos del tatuaje
  const tatuaje = data.tatuaje;
  html = html.replace(/\{\{TIPO_SERVICIO\}\}/g, "TATUAJE");
  html = html.replace(/\{\{TIPO_SERVICIO_LOWER\}\}/g, "tatuaje");
  html = html.replace(/\{\{ARTISTA_NOMBRE\}\}/g, tatuaje.artista || "N/A");
  html = html.replace(/\{\{SERVICIO_DETALLE\}\}/g, tatuaje.detalle || "N/A");
  html = html.replace(/\{\{ZONA_CUERPO\}\}/g, tatuaje.zonaTatuaje || "N/A");
  html = html.replace(/\{\{FORMA_PAGO\}\}/g, data.pago?.formaPago || "Pendiente");

  // Datos de precio y pago
  const precioTotal = tatuaje.precio || 0;
  const abono = data.pago?.monto || 0;
  const saldo = precioTotal - abono;

  html = html.replace(/\{\{PRECIO_TOTAL\}\}/g, precioTotal.toFixed(2));
  html = html.replace(/\{\{ABONO\}\}/g, abono.toFixed(2));
  html = html.replace(/\{\{SALDO\}\}/g, saldo.toFixed(2));

  // Datos de la cita
  const cita = data.cita;
  html = html.replace(
    /\{\{FECHA_CITA\}\}/g,
    cita.fechaInicio
      ? new Date(cita.fechaInicio).toLocaleDateString("es-EC", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A"
  );
  html = html.replace(
    /\{\{HORA_CITA\}\}/g,
    cita.fechaInicio
      ? new Date(cita.fechaInicio).toLocaleTimeString("es-EC", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A"
  );

  return html;
};
