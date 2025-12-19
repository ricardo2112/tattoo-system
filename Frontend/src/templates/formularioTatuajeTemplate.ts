/**
 * Plantilla HTML del formulario de consentimiento para tatuajes
 * Optimizada para impresión en formato A4 (210mm x 297mm)
 */
export const formularioTatuajeTemplate = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro de Cliente - TATTOO Z STUDIO</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        @page {
            size: A4;
            margin: 15mm;
        }

        @media print {
            .no-print {
                display: none !important;
            }
            body {
                margin: 0;
                padding: 0;
                width: 210mm;
            }
            .container {
                box-shadow: none;
                padding: 0;
                page-break-inside: avoid;
            }
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
            color: #333;
            font-size: 11pt;
            line-height: 1.4;
        }

        .container {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: white;
            padding: 15mm;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .header {
            text-align: center;
            border-bottom: 3px solid #000;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }

        .logo {
            font-size: 28px;
            font-weight: 700;
            letter-spacing: 2px;
            margin-bottom: 5px;
            color: #000;
        }

        .logo-subtitle {
            font-size: 12px;
            color: #666;
            margin-bottom: 8px;
        }

        .contact-info {
            font-size: 10px;
            color: #666;
            line-height: 1.5;
        }

        .title {
            text-align: center;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .section {
            margin-bottom: 18px;
            page-break-inside: avoid;
        }

        .no-page-break {
            page-break-inside: avoid;
        }

        .section-title {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            border-bottom: 2px solid #000;
            padding-bottom: 5px;
            margin-bottom: 12px;
            letter-spacing: 0.5px;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px 20px;
        }

        .info-item {
            display: flex;
            flex-direction: column;
        }

        .info-item.full-width {
            grid-column: 1 / -1;
        }

        .info-label {
            font-size: 9px;
            font-weight: 600;
            text-transform: uppercase;
            color: #666;
            margin-bottom: 3px;
            letter-spacing: 0.3px;
        }

        .info-value {
            font-size: 11px;
            color: #000;
            padding: 6px 0;
            border-bottom: 1px solid #ddd;
            min-height: 24px;
        }

        .conditions {
            margin-top: 15px;
            padding: 15px;
            background: #f9f9f9;
            border-left: 4px solid #000;
        }

        .conditions-title {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            margin-bottom: 10px;
            letter-spacing: 0.5px;
        }

        .conditions ul {
            list-style: none;
            padding: 0;
        }

        .conditions li {
            font-size: 9px;
            line-height: 1.5;
            margin-bottom: 8px;
            padding-left: 15px;
            position: relative;
            color: #333;
        }

        .conditions li:before {
            content: "•";
            position: absolute;
            left: 5px;
            font-weight: bold;
        }

        .consent {
            margin-top: 15px;
            padding: 15px;
            background: #f9f9f9;
            border: 1px solid #ddd;
        }

        .consent-text {
            font-size: 9px;
            line-height: 1.6;
            text-align: justify;
            color: #333;
        }

        .signature-section {
            margin-top: 25px;
            padding-top: 20px;
            border-top: 2px solid #000;
        }

        .signature-box {
            margin-top: 40px;
            text-align: center;
        }

        .signature-line {
            border-top: 2px solid #000;
            width: 300px;
            margin: 0 auto 8px;
        }

        .signature-label {
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .footer {
            margin-top: 30px;
            text-align: right;
            font-size: 9px;
            color: #666;
            line-height: 1.5;
        }

        .price-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 0;
            border-bottom: 1px solid #ddd;
        }

        .price-row.total {
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
            font-weight: 700;
            margin-top: 8px;
            padding-top: 10px;
        }

        .note {
            font-style: italic;
            color: #666;
            font-size: 9px;
            margin-top: 8px;
        }

        .minor-notice {
            background: #fff3cd;
            border: 2px solid #ffc107;
            padding: 12px;
            margin-bottom: 15px;
            border-radius: 4px;
        }

        .minor-notice-text {
            font-size: 10px;
            font-weight: 600;
            color: #856404;
            text-align: center;
        }

        .tutor-section {
            display: {{TUTOR_DISPLAY}};
            margin-bottom: 18px;
            padding: 15px;
            background: #e3f2fd;
            border-left: 4px solid #2196F3;
            page-break-inside: avoid;
        }

        .conditions, .consent {
            page-break-inside: avoid;
        }

        .signature-section {
            page-break-inside: avoid;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">TATTOO Z STUDIO</div>
            <div class="logo-subtitle">Estudio Profesional de Tatuajes</div>
            <div class="contact-info">
                Telf: 099 8 944 682<br>
                www.tattoozstudio.com<br>
                Av. De los Shyris y Telégrafo
            </div>
        </div>

        <!-- Title -->
        <div class="title">Registro de Cliente {{TIPO_SERVICIO}}</div>

        <!-- Aviso si es menor de edad -->
        {{MINOR_NOTICE_START}}
        <div class="minor-notice">
            <div class="minor-notice-text">⚠️ CLIENTE MENOR DE EDAD - REQUIERE AUTORIZACIÓN DE TUTOR LEGAL</div>
        </div>
        {{MINOR_NOTICE_END}}

        <!-- Información del Cliente -->
        <div class="section">
            <div class="section-title">Información del Cliente</div>
            <div class="info-grid">
                <div class="info-item full-width">
                    <div class="info-label">Nombre y Apellido</div>
                    <div class="info-value">{{CLIENTE_NOMBRE}}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">C.I./Pasaporte</div>
                    <div class="info-value">{{CLIENTE_CI}}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Fecha de Nacimiento</div>
                    <div class="info-value">{{CLIENTE_FECHA_NACIMIENTO}}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Teléfono</div>
                    <div class="info-value">{{CLIENTE_TELEFONO}}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Email</div>
                    <div class="info-value">{{CLIENTE_EMAIL}}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Condiciones Médicas</div>
                    <div class="info-value">{{CLIENTE_CONDICIONES_MEDICAS}}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Enfermedades de la Piel</div>
                    <div class="info-value">{{CLIENTE_ENFERMEDADES_PIEL}}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">¿Cómo nos Encontraste?</div>
                    <div class="info-value">{{CLIENTE_COMO_ENCONTRO}}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Fecha de Agendamiento</div>
                    <div class="info-value">{{FECHA_AGENDAMIENTO}}</div>
                </div>
                <div class="info-item full-width">
                    <div class="info-label">Observaciones</div>
                    <div class="info-value">{{CLIENTE_OBSERVACIONES}}</div>
                </div>
            </div>
        </div>

        <!-- Información del Tutor (si es menor de edad) -->
        <div class="tutor-section">
            <div class="section-title">Información del Tutor Legal</div>
            <div class="info-grid">
                <div class="info-item full-width">
                    <div class="info-label">Nombre y Apellido del Tutor</div>
                    <div class="info-value">{{TUTOR_NOMBRE}}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">C.I./Pasaporte</div>
                    <div class="info-value">{{TUTOR_CI}}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Teléfono</div>
                    <div class="info-value">{{TUTOR_TELEFONO}}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Email</div>
                    <div class="info-value">{{TUTOR_EMAIL}}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Parentesco</div>
                    <div class="info-value">{{TUTOR_PARENTESCO}}</div>
                </div>
            </div>
        </div>

        <!-- Detalles del Servicio -->
        <div class="section">
            <div class="section-title">Detalles del {{TIPO_SERVICIO}}</div>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Artista</div>
                    <div class="info-value">{{ARTISTA_NOMBRE}}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Forma de Pago</div>
                    <div class="info-value">{{FORMA_PAGO}}</div>
                </div>
                <div class="info-item full-width">
                    <div class="info-label">Detalle</div>
                    <div class="info-value">{{SERVICIO_DETALLE}}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Zona del Cuerpo</div>
                    <div class="info-value">{{ZONA_CUERPO}}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Fecha de la Cita</div>
                    <div class="info-value">{{FECHA_CITA}}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Hora de la Cita</div>
                    <div class="info-value">{{HORA_CITA}}</div>
                </div>
            </div>

            <!-- Información de Precios -->
            <div style="margin-top: 20px;">
                <div class="price-row">
                    <span class="info-label">Precio Total:</span>
                    <span class="info-value" style="border: none; font-weight: 600;">\${{PRECIO_TOTAL}}</span>
                </div>
                <div class="price-row">
                    <span class="info-label">Abono:</span>
                    <span class="info-value" style="border: none; font-weight: 600;">\${{ABONO}}</span>
                </div>
                <div class="price-row total">
                    <span>Saldo Pendiente:</span>
                    <span>\${{SALDO}}</span>
                </div>
            </div>
        </div>

        <!-- Condiciones -->
        <div class="conditions">
            <div class="conditions-title">Condiciones</div>
            <ul>
                <li>Se permite máximo un acompañante a la sesión de {{TIPO_SERVICIO_LOWER}}.</li>
                <li>No consumir bebidas alcohólicas ni estupefacientes antes ni durante la sesión.</li>
                <li>La fecha de la cita es fija y debe ser puntual en el horario debido al itinerario de los artistas.</li>
                <li>Si desea aplazar su cita debe anticiparlo 3 días ANTES, en caso de no asistir a la cita o reagendar más de 2 veces PERDERÁ su abono, para reprogramar deberá abonar de nuevo, la inasistencia a la cita pautada con fecha y hora ocasiona que el artista pierda su día de trabajo. Los abonos NO son reembolsables.</li>
                <li>El abono es para reservar la cita con validez hasta 3 meses sobre el diseño acordado con el artista y la entrega del boceto será el día de la cita pactada, cualquier cambio se realiza sobre el mismo diseño no sobre otra idea.</li>
            </ul>
        </div>

        <!-- Consentimiento -->
        <div class="consent">
            <div class="consent-text">
                Yo, <strong>{{NOMBRE_FIRMANTE}}</strong>, persona mayor de edad, en plena posesión de mis facultades mentales y voluntariamente ACEPTO y APRUEBO {{ACCION_CONSENTIMIENTO}} de manera estéril y segura por un artista profesional, dándome la información de cuidado, mantenimiento y riesgos del {{TIPO_SERVICIO_LOWER}} (prohibido áreas húmedas, alimentos y bebidas preindicadas, limpieza específica y/o contaminación cruzada) el cual queda bajo mi responsabilidad al salir del establecimiento.
            </div>
            <div class="note">{{NOTA_TUTOR}}</div>
        </div>

        <!-- Firma -->
        <div class="signature-section">
            <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-label">Firma del {{TIPO_FIRMANTE}}</div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <strong>TATTOO Z STUDIO</strong><br>
            Av. De los Shyris y Telégrafo<br>
            www.tattoozstudio.com<br>
            Telf: 099 8 944 682
        </div>
    </div>
</body>
</html>`;
