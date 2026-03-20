// ============================================================================
// Knowledge Base — Nova Customer Service Chatbot
// SaaS AI Customer Service Platform
// ============================================================================

// ---------------------------------------------------------------------------
// 1. KB — Structured knowledge base
// ---------------------------------------------------------------------------

export const KB = {
  plans: {
    basico: {
      name: "Basico",
      price: 99,
      currency: "MXN/mes",
      users: 3,
      storage: "5GB",
      support: "Email 48h",
      features: [
        "Chat IA ilimitado",
        "Widget web",
        "Reportes basicos",
        "Integraciones basicas (email)",
      ],
      ideal: "Equipos pequenos o emprendedores que inician",
    },
    pro: {
      name: "Pro",
      price: 199,
      currency: "MXN/mes",
      users: 10,
      storage: "50GB",
      support: "Prioritario 24h",
      features: [
        "Todo lo del Basico",
        "Integraciones avanzadas (Slack, Teams, Notion, Zapier, n8n)",
        "API access",
        "Reportes avanzados + exportacion",
        "Multicanal (Web, WhatsApp, Telegram)",
      ],
      ideal: "Empresas en crecimiento con equipo de 5-10",
    },
    enterprise: {
      name: "Enterprise",
      price: "Personalizado",
      users: "Ilimitados",
      storage: "Ilimitado",
      support: "Dedicado 4h + SLA 99.9%",
      features: [
        "Todo lo del Pro",
        "SSO + seguridad avanzada",
        "Account manager dedicado",
        "Onboarding personalizado (2 sesiones)",
        "Integraciones custom (Salesforce, SAP)",
        "White-label opcional",
      ],
      ideal: "Corporativos con +10 usuarios o necesidades enterprise",
    },
  },

  trial: {
    duration: "14 dias",
    creditCard: false,
    description:
      "Acceso completo a cualquier plan sin tarjeta de credito",
  },

  annualDiscount: "20% de descuento en pago anual (ahorras 2 meses)",

  company: {
    name: "Nova AI",
    tagline: "Atencion al cliente potenciada por inteligencia artificial",
    website: "https://nova-ai.com",
    founded: 2024,
    headquarters: "Ciudad de Mexico, Mexico",
    description:
      "Plataforma SaaS de atencion al cliente con IA que permite a las empresas automatizar, escalar y mejorar su soporte sin perder el toque humano.",
  },

  hours: {
    general: "Lunes a Viernes, 9:00 - 18:00 (hora centro de Mexico)",
    chat: "Lunes a Viernes, 9:00 - 22:00",
    emergencies: "24/7 para clientes Enterprise con SLA activo",
    holidays:
      "Servicio reducido en dias festivos nacionales de Mexico. Se comunican previamente por email.",
  },

  contact: {
    email: "soporte@nova-ai.com",
    sales: "ventas@nova-ai.com",
    phone: "+52 55 1234 5678",
    whatsapp: "+52 55 1234 5678",
    twitter: "@NovaAI_MX",
    linkedin: "linkedin.com/company/nova-ai-mx",
    helpCenter: "https://help.nova-ai.com",
    statusPage: "https://status.nova-ai.com",
  },

  integrations: {
    communication: [
      "Slack",
      "Microsoft Teams",
      "Discord",
      "Google Chat",
      "Zoom",
      "WhatsApp Business",
      "Telegram",
      "Facebook Messenger",
      "Instagram DM",
      "Line",
    ],
    crm: [
      "Salesforce",
      "HubSpot",
      "Pipedrive",
      "Zoho CRM",
      "Monday.com",
      "Freshsales",
    ],
    productivity: [
      "Notion",
      "Google Workspace",
      "Microsoft 365",
      "Airtable",
      "Trello",
      "Asana",
      "ClickUp",
      "Jira",
      "Linear",
      "Basecamp",
    ],
    automation: [
      "Zapier",
      "n8n",
      "Make (Integromat)",
      "Power Automate",
      "Workato",
    ],
    ecommerce: [
      "Shopify",
      "WooCommerce",
      "Magento",
      "TiendaNube",
      "MercadoLibre",
    ],
    analytics: [
      "Google Analytics",
      "Mixpanel",
      "Amplitude",
      "Segment",
      "Hotjar",
    ],
    payments: [
      "Stripe",
      "MercadoPago",
      "PayPal",
      "Conekta",
      "OpenPay",
    ],
    storage: [
      "Google Drive",
      "Dropbox",
      "OneDrive",
      "Box",
      "AWS S3",
    ],
    custom: {
      description: "API REST y Webhooks para cualquier integracion personalizada",
      documentation: "https://docs.nova-ai.com/api",
    },
  },

  security: {
    encryption: "AES-256 en reposo, TLS 1.3 en transito",
    certifications: ["SOC 2 Tipo II", "ISO 27001", "GDPR Compliant"],
    dataResidency: "Servidores en Mexico (AWS region Mexico City) y USA",
    sso: ["SAML 2.0", "OAuth 2.0", "OpenID Connect"],
    mfa: "Autenticacion de dos factores con TOTP, SMS o app autenticadora",
    audit: "Logs de auditoria completos con retencion de 12 meses",
    backups: "Backups automaticos diarios con retencion de 30 dias",
    penetrationTesting: "Pruebas de penetracion trimestrales por terceros",
    privacyPolicy: "https://nova-ai.com/privacidad",
    termsOfService: "https://nova-ai.com/terminos",
  },

  billing: {
    refund: {
      policy:
        "Reembolso completo dentro de los primeros 30 dias. Despues de 30 dias, reembolso proporcional al tiempo no utilizado.",
      process:
        "Solicitar por email a soporte@nova-ai.com o desde la plataforma en Configuracion > Facturacion > Solicitar reembolso.",
      timeline: "Se procesa en 5-10 dias habiles.",
    },
    cancellation: {
      policy:
        "Puedes cancelar en cualquier momento. Tu acceso continua hasta el final del periodo pagado.",
      process:
        "Ir a Configuracion > Facturacion > Cancelar suscripcion. Tambien puedes escribirnos a soporte@nova-ai.com.",
      dataRetention:
        "Tus datos se conservan 90 dias despues de la cancelacion. Puedes solicitar eliminacion inmediata.",
    },
    paymentMethods: [
      "Tarjeta de credito / debito (Visa, Mastercard, AMEX)",
      "Transferencia bancaria (SPEI)",
      "PayPal",
      "MercadoPago",
      "Facturacion por orden de compra (solo Enterprise)",
    ],
    fiscalData: {
      description:
        "Configura tu RFC, razon social y regimen fiscal para recibir facturas CFDI 4.0.",
      path: "Configuracion > Facturacion > Datos fiscales",
      support:
        "Si necesitas refacturacion, envianos los datos correctos a facturacion@nova-ai.com dentro de los 30 dias posteriores al cobro.",
    },
    invoices: {
      format: "CFDI 4.0 (Mexico) o invoice PDF (internacional)",
      delivery: "Se envian automaticamente por email al realizar el cobro",
      download: "Configuracion > Facturacion > Historial de facturas",
    },
  },
};

// ---------------------------------------------------------------------------
// 2. CONVERSATION_TREES — Decision trees per category
// ---------------------------------------------------------------------------

export const CONVERSATION_TREES = {
  // =========================================================================
  // VENTAS — ~15 nodes
  // =========================================================================
  VENTAS: {
    ventas_root: {
      id: "ventas_root",
      text: "Hola, soy Nova. Que te gustaria saber sobre nuestra plataforma?",
      options: [
        { label: "Ver planes y precios", nextId: "ventas_planes" },
        { label: "Prueba gratuita", nextId: "ventas_trial" },
        { label: "Descuentos disponibles", nextId: "ventas_descuentos" },
        { label: "Agendar una demo", nextId: "ventas_demo" },
      ],
      freeTextHint: "Puedes preguntarme sobre precios, planes, demos o pruebas gratuitas.",
    },

    ventas_planes: {
      id: "ventas_planes",
      text:
        "Tenemos 3 planes para adaptarnos a tu equipo:\n\n" +
        "**Basico** — $99 MXN/mes\n" +
        "3 usuarios | 5GB | Chat IA ilimitado, widget web, reportes basicos\n\n" +
        "**Pro** — $199 MXN/mes\n" +
        "10 usuarios | 50GB | Integraciones avanzadas, multicanal, API access\n\n" +
        "**Enterprise** — Precio personalizado\n" +
        "Usuarios ilimitados | SSO, account manager, white-label\n\n" +
        "Sobre cual te gustaria mas informacion?",
      options: [
        { label: "Mas info del Basico", nextId: "ventas_plan_basico" },
        { label: "Mas info del Pro", nextId: "ventas_plan_pro" },
        { label: "Mas info del Enterprise", nextId: "ventas_plan_enterprise" },
        { label: "Comparar planes", nextId: "ventas_comparar" },
      ],
    },

    ventas_plan_basico: {
      id: "ventas_plan_basico",
      text:
        "**Plan Basico — $99 MXN/mes**\n\n" +
        "Ideal para: equipos pequenos o emprendedores que inician.\n\n" +
        "Incluye:\n" +
        "- Hasta 3 usuarios\n" +
        "- 5GB de almacenamiento\n" +
        "- Chat IA ilimitado\n" +
        "- Widget web personalizable\n" +
        "- Reportes basicos\n" +
        "- Integraciones basicas (email)\n" +
        "- Soporte por email (respuesta en 48h)\n\n" +
        "Con pago anual ahorras 20% ($79 MXN/mes).\n\n" +
        "Te gustaria iniciar tu prueba gratuita de 14 dias?",
      options: [
        { label: "Iniciar prueba gratuita", nextId: "ventas_trial" },
        { label: "Ver otros planes", nextId: "ventas_planes" },
        { label: "Hablar con ventas", nextId: "ventas_demo" },
      ],
    },

    ventas_plan_pro: {
      id: "ventas_plan_pro",
      text:
        "**Plan Pro — $199 MXN/mes**\n\n" +
        "Ideal para: empresas en crecimiento con equipo de 5-10 personas.\n\n" +
        "Incluye todo lo del Basico mas:\n" +
        "- Hasta 10 usuarios\n" +
        "- 50GB de almacenamiento\n" +
        "- Integraciones avanzadas (Slack, Teams, Notion, Zapier, n8n)\n" +
        "- API access completo\n" +
        "- Reportes avanzados + exportacion\n" +
        "- Multicanal (Web, WhatsApp, Telegram)\n" +
        "- Soporte prioritario (respuesta en 24h)\n\n" +
        "Con pago anual ahorras 20% ($159 MXN/mes).\n\n" +
        "Es nuestro plan mas popular. Te gustaria probarlo?",
      options: [
        { label: "Iniciar prueba gratuita", nextId: "ventas_trial" },
        { label: "Ver otros planes", nextId: "ventas_planes" },
        { label: "Hablar con ventas", nextId: "ventas_demo" },
      ],
    },

    ventas_plan_enterprise: {
      id: "ventas_plan_enterprise",
      text:
        "**Plan Enterprise — Precio personalizado**\n\n" +
        "Ideal para: corporativos con +10 usuarios o necesidades especificas.\n\n" +
        "Incluye todo lo del Pro mas:\n" +
        "- Usuarios ilimitados\n" +
        "- Almacenamiento ilimitado\n" +
        "- SSO + seguridad avanzada (SAML 2.0, OAuth 2.0)\n" +
        "- Account manager dedicado\n" +
        "- Onboarding personalizado (2 sesiones)\n" +
        "- Integraciones custom (Salesforce, SAP)\n" +
        "- White-label opcional\n" +
        "- SLA 99.9% con soporte dedicado (respuesta en 4h)\n\n" +
        "Para cotizar, necesitamos agendar una llamada rapida con nuestro equipo.",
      options: [
        { label: "Agendar llamada", nextId: "ventas_demo" },
        { label: "Enviar email a ventas", nextId: "ventas_email" },
        { label: "Ver otros planes", nextId: "ventas_planes" },
      ],
    },

    ventas_comparar: {
      id: "ventas_comparar",
      text:
        "**Comparativa de planes:**\n\n" +
        "| Caracteristica        | Basico ($99) | Pro ($199) | Enterprise  |\n" +
        "|----------------------|-------------|-----------|-------------|\n" +
        "| Usuarios             | 3           | 10        | Ilimitados  |\n" +
        "| Almacenamiento       | 5GB         | 50GB      | Ilimitado   |\n" +
        "| Chat IA              | Ilimitado   | Ilimitado | Ilimitado   |\n" +
        "| Multicanal           | Solo web    | Web+WA+TG | Todos       |\n" +
        "| Integraciones        | Email       | 50+       | Custom      |\n" +
        "| API Access           | No          | Si        | Si          |\n" +
        "| SSO                  | No          | No        | Si          |\n" +
        "| Soporte              | Email 48h   | 24h       | 4h + SLA    |\n" +
        "| White-label          | No          | No        | Opcional    |\n\n" +
        "Todos los planes incluyen prueba gratuita de 14 dias.",
      options: [
        { label: "Iniciar prueba gratuita", nextId: "ventas_trial" },
        { label: "Mas info de un plan", nextId: "ventas_planes" },
        { label: "Hablar con ventas", nextId: "ventas_demo" },
      ],
    },

    ventas_trial: {
      id: "ventas_trial",
      text:
        "Nuestra prueba gratuita incluye:\n\n" +
        "- 14 dias de acceso completo\n" +
        "- No se requiere tarjeta de credito\n" +
        "- Puedes probar cualquier plan (Basico, Pro o Enterprise)\n" +
        "- Sin compromiso, cancela cuando quieras\n" +
        "- Tus datos se conservan si decides contratar\n\n" +
        "Registrate en: https://nova-ai.com/trial",
      solution:
        "Registrate en https://nova-ai.com/trial para iniciar tu prueba de 14 dias sin tarjeta de credito.",
      options: [
        { label: "Tengo dudas antes de registrarme", nextId: "ventas_root" },
        { label: "Agendar demo primero", nextId: "ventas_demo" },
      ],
    },

    ventas_descuentos: {
      id: "ventas_descuentos",
      text:
        "Tenemos estas opciones de descuento:\n\n" +
        "**Pago anual:** 20% de descuento (ahorras 2 meses)\n" +
        "- Basico: $79 MXN/mes en lugar de $99\n" +
        "- Pro: $159 MXN/mes en lugar de $199\n\n" +
        "**Equipos grandes (5+ usuarios):** Contactanos para un precio especial.\n\n" +
        "**Startups:** Programa especial con hasta 50% de descuento. Aplica si tienes menos de 2 anos y fondeo menor a $5M USD.\n\n" +
        "**ONGs y educacion:** 30% de descuento permanente con documentacion.",
      options: [
        { label: "Aplicar descuento anual", nextId: "ventas_trial" },
        { label: "Soy startup", nextId: "ventas_demo" },
        { label: "ONG / educacion", nextId: "ventas_demo" },
        { label: "Equipo grande", nextId: "ventas_demo" },
      ],
    },

    ventas_demo: {
      id: "ventas_demo",
      text:
        "Me encantaria conectarte con nuestro equipo de ventas.\n\n" +
        "Dejame tu email y te contactamos en menos de 24 horas para agendar una demo personalizada de 30 minutos.\n\n" +
        "Tambien puedes:\n" +
        "- Escribir directamente a ventas@nova-ai.com\n" +
        "- Llamar al +52 55 1234 5678 (L-V 9-18h)\n" +
        "- Agendar en: https://nova-ai.com/demo",
      solution:
        "Agenda tu demo en https://nova-ai.com/demo o escribe a ventas@nova-ai.com. Te contactamos en 24h.",
      freeTextHint: "Escribe tu email para que te contactemos.",
    },

    ventas_email: {
      id: "ventas_email",
      text:
        "Puedes escribir directamente a nuestro equipo de ventas:\n\n" +
        "Email: ventas@nova-ai.com\n\n" +
        "Incluye:\n" +
        "- Nombre de tu empresa\n" +
        "- Numero aproximado de usuarios\n" +
        "- Integraciones que necesitas\n" +
        "- Cualquier requisito especial\n\n" +
        "Te respondemos en menos de 24 horas habiles.",
      solution: "Escribe a ventas@nova-ai.com con los datos de tu empresa. Respuesta en 24h.",
    },
  },

  // =========================================================================
  // SOPORTE — ~25 nodes
  // =========================================================================
  SOPORTE: {
    soporte_root: {
      id: "soporte_root",
      text: "Lamento que tengas un problema. Vamos a resolverlo juntos. Que esta pasando?",
      options: [
        { label: "No puedo iniciar sesion", nextId: "soporte_login" },
        { label: "La plataforma va lenta", nextId: "soporte_lento" },
        { label: "Error en una funcion", nextId: "soporte_error" },
        { label: "Configurar una integracion", nextId: "soporte_integracion" },
        { label: "Otro problema", nextId: "soporte_otro" },
      ],
      freeTextHint: "Describe tu problema y te ayudo a encontrar la solucion.",
    },

    // --- Login ---
    soporte_login: {
      id: "soporte_login",
      text: "Problemas para iniciar sesion. Cual de estos describe mejor tu caso?",
      options: [
        { label: "Olvide mi contrasena", nextId: "soporte_login_password" },
        { label: "Mi cuenta esta bloqueada", nextId: "soporte_login_bloqueada" },
        { label: "Problemas con 2FA", nextId: "soporte_login_2fa" },
      ],
    },

    soporte_login_password: {
      id: "soporte_login_password",
      text: "Entendido, vamos a recuperar tu contrasena.",
      solution:
        "Para recuperar tu contrasena:\n\n" +
        "1. Ve a https://nova-ai.com/login\n" +
        "2. Haz click en 'Olvide mi contrasena'\n" +
        "3. Ingresa tu email registrado\n" +
        "4. Revisa tu bandeja de entrada Y la carpeta de spam\n" +
        "5. Haz click en el enlace del email (valido por 24 horas)\n" +
        "6. Crea una nueva contrasena (minimo 8 caracteres, una mayuscula, un numero)\n\n" +
        "Si no recibes el email en 5 minutos, verifica que el email sea el correcto o contactanos en soporte@nova-ai.com.",
      options: [
        { label: "No recibo el email", nextId: "soporte_login_noemail" },
        { label: "Problema resuelto", nextId: "soporte_resuelto" },
      ],
    },

    soporte_login_noemail: {
      id: "soporte_login_noemail",
      text: "Si no recibes el email de recuperacion:",
      solution:
        "Pasos adicionales si no llega el email:\n\n" +
        "1. Espera al menos 5 minutos\n" +
        "2. Revisa la carpeta de spam/correo no deseado\n" +
        "3. Verifica que el email sea el que usaste al registrarte\n" +
        "4. Agrega soporte@nova-ai.com a tus contactos e intenta de nuevo\n" +
        "5. Si usas correo corporativo, pide a tu equipo de TI que revise los filtros\n\n" +
        "Si nada funciona, escribenos a soporte@nova-ai.com con el asunto 'Recuperacion de contrasena' e incluye tu nombre completo y email de registro.",
    },

    soporte_login_bloqueada: {
      id: "soporte_login_bloqueada",
      text: "Tu cuenta se bloquea tras 5 intentos fallidos de inicio de sesion.",
      solution:
        "Cuenta bloqueada por intentos fallidos:\n\n" +
        "1. Espera 30 minutos — el bloqueo se levanta automaticamente\n" +
        "2. Asegurate de usar el email y contrasena correctos\n" +
        "3. Si no recuerdas tu contrasena, usa la opcion de recuperar\n\n" +
        "Para desbloqueo inmediato:\n" +
        "- Escribe a soporte@nova-ai.com desde el email de tu cuenta\n" +
        "- O llama al +52 55 1234 5678 (L-V 9-18h)\n\n" +
        "Tip: Activa la autenticacion de 2 factores para mayor seguridad.",
      options: [
        { label: "Necesito desbloqueo inmediato", nextId: "escalamiento_root" },
        { label: "Problema resuelto", nextId: "soporte_resuelto" },
      ],
    },

    soporte_login_2fa: {
      id: "soporte_login_2fa",
      text: "Entendido, problemas con la verificacion en dos pasos.",
      solution:
        "Si no puedes acceder con 2FA:\n\n" +
        "1. Usa uno de tus codigos de respaldo (se te dieron al activar 2FA)\n" +
        "2. Los codigos de respaldo estan en el PDF/archivo que descargaste al configurar 2FA\n" +
        "3. Cada codigo de respaldo es de un solo uso\n\n" +
        "Si no tienes codigos de respaldo:\n" +
        "- Escribe a soporte@nova-ai.com desde el email de tu cuenta\n" +
        "- Incluye una identificacion oficial para verificar tu identidad\n" +
        "- Desactivaremos el 2FA en 24-48 horas habiles\n\n" +
        "Tip: Al reactivar 2FA, guarda los codigos de respaldo en un lugar seguro.",
      options: [
        { label: "No tengo codigos de respaldo", nextId: "escalamiento_root" },
        { label: "Problema resuelto", nextId: "soporte_resuelto" },
      ],
    },

    // --- Lento ---
    soporte_lento: {
      id: "soporte_lento",
      text: "Entiendo que la plataforma va lenta. Donde notas la lentitud?",
      options: [
        { label: "Todo va lento", nextId: "soporte_lento_todo" },
        { label: "Solo una seccion especifica", nextId: "soporte_lento_seccion" },
      ],
    },

    soporte_lento_todo: {
      id: "soporte_lento_todo",
      text: "Cuando todo va lento, generalmente es un problema del navegador o la conexion.",
      solution:
        "Pasos para mejorar el rendimiento:\n\n" +
        "1. Limpia la cache del navegador (Ctrl+Shift+Delete)\n" +
        "2. Prueba en modo incognito (Ctrl+Shift+N en Chrome)\n" +
        "3. Desactiva extensiones del navegador temporalmente\n" +
        "4. Prueba en otro navegador (Chrome, Firefox, Edge)\n" +
        "5. Verifica tu conexion a internet en https://fast.com\n" +
        "6. Cierra pestanas innecesarias (cada una consume memoria)\n\n" +
        "Navegadores recomendados: Chrome 90+, Firefox 90+, Edge 90+, Safari 15+.\n\n" +
        "Si el problema persiste despues de estos pasos, revisa nuestro status: https://status.nova-ai.com",
      options: [
        { label: "Sigue lento", nextId: "escalamiento_root" },
        { label: "Problema resuelto", nextId: "soporte_resuelto" },
      ],
    },

    soporte_lento_seccion: {
      id: "soporte_lento_seccion",
      text: "Si solo una seccion va lenta, puede ser un problema puntual.",
      solution:
        "Cuando solo una seccion esta lenta:\n\n" +
        "1. Revisa nuestro status en https://status.nova-ai.com para ver si hay incidencias\n" +
        "2. Recarga la pagina con Ctrl+Shift+R (recarga sin cache)\n" +
        "3. Si es la seccion de reportes, intenta reducir el rango de fechas\n" +
        "4. Si es el chat, verifica que no haya muchas conversaciones abiertas\n\n" +
        "Si el problema persiste, reportalo para que lo investiguemos:\n" +
        "- Que seccion es lenta\n" +
        "- Desde cuando ocurre\n" +
        "- Tu navegador y sistema operativo\n\n" +
        "Envialo a soporte@nova-ai.com o desde la plataforma: Ayuda > Reportar problema.",
      options: [
        { label: "Reportar problema", nextId: "escalamiento_root" },
        { label: "Problema resuelto", nextId: "soporte_resuelto" },
      ],
    },

    // --- Error ---
    soporte_error: {
      id: "soporte_error",
      text: "Que tipo de error estas experimentando?",
      options: [
        { label: "Error al exportar datos", nextId: "soporte_error_export" },
        { label: "Error en el chat widget", nextId: "soporte_error_widget" },
        { label: "Error en reportes", nextId: "soporte_error_reportes" },
      ],
    },

    soporte_error_export: {
      id: "soporte_error_export",
      text: "Los errores de exportacion suelen ser por el tamano del archivo.",
      solution:
        "Solucion para errores de exportacion:\n\n" +
        "1. Verifica el tamano — el limite es 100,000 filas por exportacion\n" +
        "2. Si es muy grande, divide la exportacion por rangos de fecha\n" +
        "3. Prueba con formato CSV en lugar de Excel (es mas ligero)\n" +
        "4. Asegurate de tener espacio en tu almacenamiento\n\n" +
        "Para exportar:\n" +
        "- Ve a la seccion que deseas exportar\n" +
        "- Click en el icono de descarga (esquina superior derecha)\n" +
        "- Selecciona formato: CSV o Excel\n" +
        "- Si falla, reduce los filtros aplicados\n\n" +
        "Limite de almacenamiento: Basico 5GB, Pro 50GB, Enterprise ilimitado.\n" +
        "Revisa tu uso en Configuracion > Almacenamiento.",
      options: [
        { label: "Sigue fallando", nextId: "escalamiento_root" },
        { label: "Problema resuelto", nextId: "soporte_resuelto" },
      ],
    },

    soporte_error_widget: {
      id: "soporte_error_widget",
      text: "Revisemos la configuracion de tu widget de chat.",
      solution:
        "Solucion para errores del widget de chat:\n\n" +
        "1. Verifica el codigo de insercion:\n" +
        "   - Ve a Configuracion > Widget > Codigo de insercion\n" +
        "   - Copia el snippet actualizado\n" +
        "   - Pegalo justo antes de </body> en tu sitio\n\n" +
        "2. Errores comunes:\n" +
        "   - Codigo duplicado: verifica que solo haya UNA instancia del snippet\n" +
        "   - Cache: limpia la cache de tu sitio/CDN\n" +
        "   - HTTPS: tu sitio debe usar HTTPS para que el widget funcione\n" +
        "   - CSP: si usas Content Security Policy, agrega *.nova-ai.com a la whitelist\n\n" +
        "3. Prueba el widget:\n" +
        "   - Abre tu sitio en modo incognito\n" +
        "   - Revisa la consola del navegador (F12) para errores\n" +
        "   - Verifica que el dominio de tu sitio este registrado en Configuracion > Widget > Dominios permitidos",
      options: [
        { label: "Sigue sin funcionar", nextId: "escalamiento_root" },
        { label: "Problema resuelto", nextId: "soporte_resuelto" },
      ],
    },

    soporte_error_reportes: {
      id: "soporte_error_reportes",
      text: "Los reportes pueden fallar por filtros o volumen de datos.",
      solution:
        "Solucion para errores en reportes:\n\n" +
        "1. Limpia todos los filtros aplicados y recarga la pagina\n" +
        "2. Selecciona un rango de fechas mas corto (maximo 90 dias recomendado)\n" +
        "3. Si necesitas datos de mas de 90 dias, exporta en formato CSV\n" +
        "4. Verifica tu plan:\n" +
        "   - Basico: reportes basicos (ultimos 30 dias)\n" +
        "   - Pro/Enterprise: reportes avanzados (historico completo)\n\n" +
        "Si el error persiste:\n" +
        "- Anota el mensaje de error exacto\n" +
        "- Toma un screenshot\n" +
        "- Reportalo en Ayuda > Reportar problema o a soporte@nova-ai.com",
      options: [
        { label: "Sigue fallando", nextId: "escalamiento_root" },
        { label: "Problema resuelto", nextId: "soporte_resuelto" },
      ],
    },

    // --- Integraciones ---
    soporte_integracion: {
      id: "soporte_integracion",
      text: "Que integracion necesitas configurar?",
      options: [
        { label: "Slack", nextId: "soporte_int_slack" },
        { label: "Microsoft Teams", nextId: "soporte_int_teams" },
        { label: "Notion", nextId: "soporte_int_notion" },
        { label: "Zapier / n8n", nextId: "soporte_int_zapier" },
        { label: "WhatsApp / Telegram", nextId: "soporte_int_whatsapp" },
      ],
      freeTextHint: "Escribe el nombre de la integracion que necesitas.",
    },

    soporte_int_slack: {
      id: "soporte_int_slack",
      text: "Te guio paso a paso para conectar Slack.",
      solution:
        "Configurar integracion con Slack:\n\n" +
        "1. Ve a Configuracion > Integraciones > Slack\n" +
        "2. Click en 'Conectar con Slack'\n" +
        "3. Se abrira una ventana de autorizacion de Slack\n" +
        "4. Selecciona tu workspace\n" +
        "5. Autoriza los permisos solicitados\n" +
        "6. Selecciona el canal donde quieres recibir notificaciones\n" +
        "7. Configura que eventos notificar (nuevas conversaciones, escalamientos, etc.)\n" +
        "8. Haz click en 'Guardar'\n\n" +
        "Requisitos:\n" +
        "- Plan Pro o Enterprise\n" +
        "- Ser admin del workspace de Slack\n" +
        "- Permisos: channels:read, chat:write, users:read\n\n" +
        "Documentacion completa: https://docs.nova-ai.com/integraciones/slack",
      options: [
        { label: "No me deja autorizar", nextId: "escalamiento_root" },
        { label: "Listo, funciona", nextId: "soporte_resuelto" },
      ],
    },

    soporte_int_teams: {
      id: "soporte_int_teams",
      text: "Te guio para conectar Microsoft Teams.",
      solution:
        "Configurar integracion con Microsoft Teams:\n\n" +
        "1. Ve a Configuracion > Integraciones > Microsoft Teams\n" +
        "2. Click en 'Conectar con Teams'\n" +
        "3. Inicia sesion con tu cuenta Microsoft corporativa\n" +
        "4. Autoriza la aplicacion Nova AI en tu tenant\n" +
        "5. Selecciona el equipo y canal para notificaciones\n" +
        "6. Configura los eventos a notificar\n" +
        "7. Guarda la configuracion\n\n" +
        "Requisitos:\n" +
        "- Plan Pro o Enterprise\n" +
        "- Cuenta Microsoft 365 con permisos de admin o aprobacion del admin\n" +
        "- Si tu org requiere aprobacion de apps, solicita a tu admin de TI que apruebe 'Nova AI'\n\n" +
        "Documentacion: https://docs.nova-ai.com/integraciones/teams",
      options: [
        { label: "Mi admin no aprueba la app", nextId: "escalamiento_root" },
        { label: "Listo, funciona", nextId: "soporte_resuelto" },
      ],
    },

    soporte_int_notion: {
      id: "soporte_int_notion",
      text: "Asi conectas Notion con Nova AI.",
      solution:
        "Configurar integracion con Notion:\n\n" +
        "1. Ve a Configuracion > Integraciones > Notion\n" +
        "2. Click en 'Conectar con Notion'\n" +
        "3. Autoriza el acceso en la ventana de Notion\n" +
        "4. Selecciona las paginas/bases de datos que quieres compartir\n" +
        "5. Configura la sincronizacion:\n" +
        "   - Crear pagina por cada conversacion resuelta\n" +
        "   - Sincronizar base de conocimiento\n" +
        "   - Exportar metricas semanales\n" +
        "6. Guarda la configuracion\n\n" +
        "Requisitos:\n" +
        "- Plan Pro o Enterprise\n" +
        "- Ser admin del workspace de Notion\n\n" +
        "Documentacion: https://docs.nova-ai.com/integraciones/notion",
      options: [
        { label: "Tengo un error", nextId: "escalamiento_root" },
        { label: "Listo, funciona", nextId: "soporte_resuelto" },
      ],
    },

    soporte_int_zapier: {
      id: "soporte_int_zapier",
      text: "Asi conectas Zapier o n8n con Nova AI.",
      solution:
        "Configurar integracion con Zapier / n8n:\n\n" +
        "**Zapier:**\n" +
        "1. Ve a Configuracion > Integraciones > API\n" +
        "2. Genera una API Key\n" +
        "3. En Zapier, busca 'Nova AI' en las apps\n" +
        "4. Conecta usando tu API Key\n" +
        "5. Configura tus Zaps (triggers: nueva conversacion, conversacion resuelta, etc.)\n\n" +
        "**n8n:**\n" +
        "1. Ve a Configuracion > Integraciones > API\n" +
        "2. Genera una API Key\n" +
        "3. En n8n, usa el nodo HTTP Request o busca el nodo de Nova AI en la comunidad\n" +
        "4. URL base: https://api.nova-ai.com/v1/\n" +
        "5. Autenticacion: Bearer Token con tu API Key\n\n" +
        "Requisitos:\n" +
        "- Plan Pro o Enterprise\n" +
        "- API Key activa\n\n" +
        "Documentacion API: https://docs.nova-ai.com/api",
      options: [
        { label: "Necesito ayuda con mi workflow", nextId: "escalamiento_root" },
        { label: "Listo, funciona", nextId: "soporte_resuelto" },
      ],
    },

    soporte_int_whatsapp: {
      id: "soporte_int_whatsapp",
      text: "Te explico como activar WhatsApp y Telegram.",
      solution:
        "Configurar WhatsApp Business y/o Telegram:\n\n" +
        "**WhatsApp Business:**\n" +
        "1. Ve a Configuracion > Canales > WhatsApp\n" +
        "2. Necesitas una cuenta de WhatsApp Business API (via Meta Business)\n" +
        "3. Conecta tu numero verificado de WhatsApp Business\n" +
        "4. Configura el mensaje de bienvenida y horarios\n" +
        "5. Las conversaciones de WhatsApp aparecen en tu bandeja unificada\n\n" +
        "**Telegram:**\n" +
        "1. Ve a Configuracion > Canales > Telegram\n" +
        "2. Crea un bot en Telegram con @BotFather\n" +
        "3. Copia el token del bot\n" +
        "4. Pegalo en Nova AI y guarda\n" +
        "5. Tu bot de Telegram ahora responde con la IA de Nova\n\n" +
        "Requisitos:\n" +
        "- Plan Pro o Enterprise\n" +
        "- WhatsApp: cuenta de Meta Business verificada\n" +
        "- Telegram: bot creado con @BotFather\n\n" +
        "Documentacion: https://docs.nova-ai.com/integraciones/canales",
      options: [
        { label: "Necesito ayuda con la verificacion", nextId: "escalamiento_root" },
        { label: "Listo, funciona", nextId: "soporte_resuelto" },
      ],
    },

    // --- Otro / Resuelto ---
    soporte_otro: {
      id: "soporte_otro",
      text:
        "Descríbeme tu problema con el mayor detalle posible y lo revisamos:\n\n" +
        "- Que estabas intentando hacer?\n" +
        "- Que mensaje de error ves (si aplica)?\n" +
        "- Desde cuando ocurre?\n" +
        "- Que navegador y dispositivo usas?\n\n" +
        "Con esta informacion puedo ayudarte mejor o escalarlo al equipo tecnico.",
      freeTextHint: "Describe tu problema aqui.",
      options: [
        { label: "Prefiero hablar con un humano", nextId: "escalamiento_root" },
      ],
    },

    soporte_resuelto: {
      id: "soporte_resuelto",
      text:
        "Me alegra que se haya resuelto! Si necesitas algo mas, estoy aqui.\n\n" +
        "Te invito a calificar tu experiencia para seguir mejorando.",
      solution: "Problema resuelto. Gracias por contactarnos.",
    },
  },

  // =========================================================================
  // FACTURACION — ~15 nodes
  // =========================================================================
  FACTURACION: {
    facturacion_root: {
      id: "facturacion_root",
      text: "Que necesitas respecto a facturacion o pagos?",
      options: [
        { label: "Ver o descargar facturas", nextId: "facturacion_ver" },
        { label: "Cambiar metodo de pago", nextId: "facturacion_pago" },
        { label: "Solicitar reembolso", nextId: "facturacion_reembolso" },
        { label: "Cambiar de plan", nextId: "facturacion_cambiar_plan" },
        { label: "Cancelar suscripcion", nextId: "facturacion_cancelar" },
        { label: "Configurar datos fiscales", nextId: "facturacion_fiscal" },
        { label: "Cobro no reconocido", nextId: "facturacion_cobro" },
      ],
      freeTextHint: "Escribe tu duda sobre facturacion, pagos o planes.",
    },

    facturacion_ver: {
      id: "facturacion_ver",
      text: "Asi puedes ver y descargar tus facturas.",
      solution:
        "Para ver y descargar tus facturas:\n\n" +
        "1. Inicia sesion en https://nova-ai.com\n" +
        "2. Ve a Configuracion > Facturacion > Historial de facturas\n" +
        "3. Veras la lista de todas tus facturas con fecha y monto\n" +
        "4. Click en el icono de descarga para obtener:\n" +
        "   - PDF de la factura\n" +
        "   - XML del CFDI (si tienes datos fiscales configurados)\n\n" +
        "Las facturas se generan automaticamente al momento del cobro y se envian por email.\n\n" +
        "Si necesitas una factura que no aparece, contactanos en facturacion@nova-ai.com.",
    },

    facturacion_pago: {
      id: "facturacion_pago",
      text: "Te explico como cambiar tu metodo de pago.",
      solution:
        "Para cambiar tu metodo de pago:\n\n" +
        "1. Ve a Configuracion > Facturacion > Metodo de pago\n" +
        "2. Click en 'Cambiar metodo de pago'\n" +
        "3. Opciones disponibles:\n" +
        "   - Tarjeta de credito/debito (Visa, Mastercard, AMEX)\n" +
        "   - PayPal\n" +
        "   - MercadoPago\n" +
        "   - Transferencia SPEI (se genera referencia unica)\n" +
        "4. Ingresa los nuevos datos y confirma\n" +
        "5. Se realiza un cargo de verificacion de $1 MXN (se revierte inmediatamente)\n\n" +
        "El cambio aplica a partir del proximo ciclo de facturacion.\n" +
        "Enterprise: tambien acepta facturacion por orden de compra.",
    },

    facturacion_reembolso: {
      id: "facturacion_reembolso",
      text: "Nuestra politica de reembolsos es la siguiente:",
      solution:
        "Politica de reembolso:\n\n" +
        "- Primeros 30 dias: reembolso completo, sin preguntas\n" +
        "- Despues de 30 dias: reembolso proporcional al tiempo no utilizado\n\n" +
        "Como solicitar:\n" +
        "1. Ve a Configuracion > Facturacion > Solicitar reembolso\n" +
        "2. Selecciona el cobro que deseas reembolsar\n" +
        "3. Indica el motivo (nos ayuda a mejorar)\n" +
        "4. Confirma la solicitud\n\n" +
        "Tambien puedes escribir a soporte@nova-ai.com con:\n" +
        "- Email de tu cuenta\n" +
        "- Fecha y monto del cobro\n" +
        "- Motivo de la solicitud\n\n" +
        "Tiempo de procesamiento: 5-10 dias habiles.\n" +
        "El reembolso se aplica al mismo metodo de pago original.",
      options: [
        { label: "Solicitar reembolso ahora", nextId: "escalamiento_root" },
        { label: "Entendido, gracias", nextId: "facturacion_root" },
      ],
    },

    facturacion_cambiar_plan: {
      id: "facturacion_cambiar_plan",
      text: "Puedes cambiar de plan en cualquier momento.",
      solution:
        "Para cambiar de plan:\n\n" +
        "**Upgrade (subir de plan):**\n" +
        "1. Ve a Configuracion > Facturacion > Cambiar plan\n" +
        "2. Selecciona el nuevo plan\n" +
        "3. Se cobra la diferencia proporcional al tiempo restante del ciclo actual\n" +
        "4. Las nuevas funciones se activan inmediatamente\n\n" +
        "**Downgrade (bajar de plan):**\n" +
        "1. Ve a Configuracion > Facturacion > Cambiar plan\n" +
        "2. Selecciona el plan inferior\n" +
        "3. El cambio aplica al inicio del proximo ciclo\n" +
        "4. Verifica que no excedas los limites del nuevo plan (usuarios, storage)\n\n" +
        "**Enterprise:** Contacta a tu account manager o escribe a ventas@nova-ai.com.",
      options: [
        { label: "Quiero hacer upgrade", nextId: "ventas_planes" },
        { label: "Quiero hacer downgrade", nextId: "facturacion_downgrade_confirm" },
      ],
    },

    facturacion_downgrade_confirm: {
      id: "facturacion_downgrade_confirm",
      text:
        "Antes de bajar de plan, verifica lo siguiente:\n\n" +
        "- Numero de usuarios activos (Basico: max 3)\n" +
        "- Almacenamiento utilizado (Basico: max 5GB)\n" +
        "- Integraciones activas (Basico: solo email)\n\n" +
        "Si excedes los limites del nuevo plan, necesitaras ajustar antes del cambio.",
      solution:
        "Para hacer downgrade: Configuracion > Facturacion > Cambiar plan. El cambio aplica al siguiente ciclo. Ajusta usuarios/storage antes si excedes los limites.",
    },

    facturacion_cancelar: {
      id: "facturacion_cancelar",
      text:
        "Lamentamos que consideres cancelar. Antes de hacerlo, te puedo ofrecer:\n\n" +
        "- **Pausa temporal:** Congela tu cuenta hasta 3 meses sin cobro\n" +
        "- **Downgrade:** Cambia a un plan mas economico\n" +
        "- **Descuento:** Puedo ofrecerte 30% de descuento por 3 meses\n\n" +
        "Que prefieres?",
      options: [
        { label: "Pausar mi cuenta", nextId: "facturacion_pausar" },
        { label: "Cambiar a plan mas barato", nextId: "facturacion_cambiar_plan" },
        { label: "Me interesa el descuento", nextId: "facturacion_descuento_retencion" },
        { label: "Quiero cancelar de todas formas", nextId: "facturacion_cancelar_confirm" },
      ],
    },

    facturacion_pausar: {
      id: "facturacion_pausar",
      text: "La pausa temporal es una buena opcion si planeas volver.",
      solution:
        "Para pausar tu cuenta:\n\n" +
        "1. Ve a Configuracion > Facturacion > Pausar suscripcion\n" +
        "2. Selecciona la duracion (1, 2 o 3 meses)\n" +
        "3. No se realizaran cobros durante la pausa\n" +
        "4. Tus datos se conservan intactos\n" +
        "5. Al terminar la pausa, tu plan se reactiva automaticamente\n\n" +
        "Puedes reactivar antes de tiempo desde la misma seccion.",
    },

    facturacion_descuento_retencion: {
      id: "facturacion_descuento_retencion",
      text: "Excelente decision.",
      solution:
        "Te aplicamos un 30% de descuento por los proximos 3 meses.\n\n" +
        "Para activarlo, contacta a nuestro equipo:\n" +
        "- Email: soporte@nova-ai.com (menciona 'descuento retencion')\n" +
        "- O llama al +52 55 1234 5678\n\n" +
        "El descuento se aplica automaticamente en tus proximos 3 cobros.",
    },

    facturacion_cancelar_confirm: {
      id: "facturacion_cancelar_confirm",
      text: "Entendido, respetamos tu decision.",
      solution:
        "Para cancelar tu suscripcion:\n\n" +
        "1. Ve a Configuracion > Facturacion > Cancelar suscripcion\n" +
        "2. Selecciona el motivo de cancelacion\n" +
        "3. Confirma la cancelacion\n\n" +
        "Importante:\n" +
        "- Tu acceso continua hasta el final del periodo pagado\n" +
        "- Tus datos se conservan 90 dias despues de la cancelacion\n" +
        "- Puedes solicitar eliminacion inmediata de datos si lo prefieres\n" +
        "- Puedes reactivar en cualquier momento dentro de los 90 dias\n\n" +
        "Si cambias de opinion, estamos aqui para ayudarte.",
    },

    facturacion_fiscal: {
      id: "facturacion_fiscal",
      text: "Te explico como configurar tus datos fiscales.",
      solution:
        "Para configurar tus datos fiscales (CFDI 4.0):\n\n" +
        "1. Ve a Configuracion > Facturacion > Datos fiscales\n" +
        "2. Ingresa:\n" +
        "   - RFC (con homoclave)\n" +
        "   - Razon social (tal como aparece en tu constancia del SAT)\n" +
        "   - Regimen fiscal\n" +
        "   - Codigo postal fiscal\n" +
        "   - Uso del CFDI (generalmente 'Gastos en general')\n" +
        "   - Email para recibir la factura\n" +
        "3. Guarda los cambios\n\n" +
        "Las futuras facturas se emitiran con estos datos.\n" +
        "Para refacturar cobros anteriores (hasta 30 dias), escribe a facturacion@nova-ai.com.",
    },

    facturacion_cobro: {
      id: "facturacion_cobro",
      text:
        "Lamento la situacion. Vamos a investigar el cobro no reconocido.\n\n" +
        "Necesito que me proporciones:\n" +
        "- Fecha del cobro\n" +
        "- Monto exacto\n" +
        "- Ultimos 4 digitos de la tarjeta (si aplica)\n" +
        "- Email de tu cuenta Nova AI\n\n" +
        "Con esa info lo escalamos al equipo de pagos.",
      freeTextHint: "Ingresa los detalles del cobro no reconocido.",
      options: [
        { label: "Hablar con un agente ahora", nextId: "escalamiento_root" },
      ],
    },
  },

  // =========================================================================
  // ESCALAMIENTO — ~5 nodes
  // =========================================================================
  ESCALAMIENTO: {
    escalamiento_root: {
      id: "escalamiento_root",
      text:
        "Entiendo, te conecto con un agente humano. Como prefieres que te contactemos?",
      options: [
        { label: "Llamar ahora", nextId: "escalamiento_llamar" },
        { label: "Que me contacten", nextId: "escalamiento_contactar" },
        { label: "Enviar email directo", nextId: "escalamiento_email" },
      ],
    },

    escalamiento_llamar: {
      id: "escalamiento_llamar",
      text: "Puedes llamarnos ahora mismo.",
      solution:
        "Llamanos al: +52 55 1234 5678\n\n" +
        "Horario de atencion telefonica:\n" +
        "- Lunes a Viernes: 9:00 - 18:00 (hora centro de Mexico)\n" +
        "- Tiempo promedio de espera: 2 minutos\n\n" +
        "Clientes Enterprise: linea directa 24/7 proporcionada por tu account manager.\n\n" +
        "Si llamas fuera de horario, deja un mensaje de voz y te devolvemos la llamada al siguiente dia habil.",
    },

    escalamiento_contactar: {
      id: "escalamiento_contactar",
      text:
        "Dejame tu informacion y un agente te contactara en las proximas 2 horas habiles.\n\n" +
        "Necesito:\n" +
        "- Tu nombre\n" +
        "- Email o telefono de contacto\n" +
        "- Breve descripcion del tema",
      solution:
        "Un agente te contactara en las proximas 2 horas habiles. Si es urgente, llama al +52 55 1234 5678.",
      freeTextHint: "Escribe tu nombre, email/telefono y descripcion del problema.",
    },

    escalamiento_email: {
      id: "escalamiento_email",
      text: "Envia un email directo a nuestro equipo.",
      solution:
        "Escribe a: soporte@nova-ai.com\n\n" +
        "Para una respuesta mas rapida, incluye:\n" +
        "- Asunto claro y descriptivo\n" +
        "- Email de tu cuenta Nova AI\n" +
        "- Descripcion detallada del problema\n" +
        "- Screenshots si aplica\n" +
        "- Tu plan actual\n\n" +
        "Tiempos de respuesta:\n" +
        "- Basico: 48 horas\n" +
        "- Pro: 24 horas\n" +
        "- Enterprise: 4 horas (con SLA)",
    },
  },
};

// ---------------------------------------------------------------------------
// 3. SOLUTION_INDEX — Flat array for free-text matching
// ---------------------------------------------------------------------------

export const SOLUTION_INDEX = [
  // === SOPORTE — Login ===
  {
    keywords: ["contrasena", "password", "clave", "olvide", "no recuerdo", "recuperar", "reset", "restablecer", "olvidada", "cambiar clave", "contrasenya"],
    solution:
      "Para recuperar tu contrasena:\n\n" +
      "1. Ve a la pagina de login\n" +
      "2. Click en 'Olvidaste tu contrasena?'\n" +
      "3. Ingresa tu email registrado\n" +
      "4. Revisa tu bandeja de entrada Y spam\n" +
      "5. Click en el enlace (valido 24h)\n" +
      "6. Crea una nueva contrasena segura\n\n" +
      "Si no recibes el email en 5 minutos, verifica que el email sea correcto o contactanos.",
    category: "SOPORTE",
    nodeId: "soporte_login_password",
  },
  {
    keywords: ["bloqueada", "bloqueado", "cuenta bloqueada", "no puedo entrar", "acceso bloqueado", "locked", "bloqueo"],
    solution:
      "Tu cuenta se bloquea tras 5 intentos fallidos.\n\n" +
      "1. Espera 30 minutos — se desbloquea automaticamente\n" +
      "2. Si necesitas acceso inmediato, escribe a soporte@nova-ai.com\n" +
      "3. O llama al +52 55 1234 5678",
    category: "SOPORTE",
    nodeId: "soporte_login_bloqueada",
  },
  {
    keywords: ["2fa", "dos factores", "two factor", "autenticacion", "codigo", "authenticator", "verificacion", "otp", "totp"],
    solution:
      "Si no puedes acceder con 2FA:\n\n" +
      "1. Usa un codigo de respaldo (se dieron al activar 2FA)\n" +
      "2. Si no tienes codigos, escribe a soporte@nova-ai.com con identificacion oficial\n" +
      "3. Desactivamos el 2FA en 24-48h habiles",
    category: "SOPORTE",
    nodeId: "soporte_login_2fa",
  },
  {
    keywords: ["iniciar sesion", "login", "entrar", "acceder", "no puedo entrar", "acceso", "ingresar", "log in", "signin"],
    solution:
      "Problemas para iniciar sesion? Estas son las causas mas comunes:\n\n" +
      "1. Contrasena incorrecta: usa 'Olvide mi contrasena' para recuperarla\n" +
      "2. Cuenta bloqueada: espera 30 min tras 5 intentos fallidos\n" +
      "3. Problemas con 2FA: usa codigos de respaldo\n\n" +
      "Si nada funciona, contactanos en soporte@nova-ai.com.",
    category: "SOPORTE",
    nodeId: "soporte_login",
  },

  // === SOPORTE — Rendimiento ===
  {
    keywords: ["lento", "lenta", "tarda", "slow", "carga", "rendimiento", "performance", "rapido", "velocidad", "demora"],
    solution:
      "Si la plataforma va lenta:\n\n" +
      "1. Limpia cache del navegador (Ctrl+Shift+Delete)\n" +
      "2. Prueba en modo incognito\n" +
      "3. Desactiva extensiones del navegador\n" +
      "4. Prueba otro navegador\n" +
      "5. Verifica tu conexion en https://fast.com\n\n" +
      "Status de la plataforma: https://status.nova-ai.com",
    category: "SOPORTE",
    nodeId: "soporte_lento_todo",
  },
  {
    keywords: ["caido", "caida", "no funciona", "down", "offline", "error 500", "error 502", "error 503", "servidor"],
    solution:
      "Si la plataforma no funciona:\n\n" +
      "1. Revisa el status en https://status.nova-ai.com\n" +
      "2. Si hay incidencia reportada, estamos trabajando en ello\n" +
      "3. Si no hay incidencia, prueba: limpiar cache, modo incognito, otro navegador\n" +
      "4. Reporta el problema a soporte@nova-ai.com",
    category: "SOPORTE",
    nodeId: "soporte_lento_seccion",
  },

  // === SOPORTE — Errores ===
  {
    keywords: ["exportar", "export", "descargar datos", "bajar datos", "csv", "excel", "xlsx"],
    solution:
      "Para errores de exportacion:\n\n" +
      "1. Limite: 100,000 filas por exportacion\n" +
      "2. Divide por rangos de fecha si es muy grande\n" +
      "3. Usa CSV en lugar de Excel (mas ligero)\n" +
      "4. Verifica tu espacio en Configuracion > Almacenamiento\n\n" +
      "Ruta: seccion deseada > icono descarga > seleccionar formato",
    category: "SOPORTE",
    nodeId: "soporte_error_export",
  },
  {
    keywords: ["widget", "chat widget", "embed", "insertar", "codigo embed", "snippet", "chat en mi web", "boton de chat"],
    solution:
      "Para errores del widget:\n\n" +
      "1. Ve a Configuracion > Widget > Codigo de insercion\n" +
      "2. Copia el snippet actualizado\n" +
      "3. Pegalo antes de </body> en tu sitio\n" +
      "4. Verifica: solo UNA instancia, HTTPS activo, dominio registrado\n" +
      "5. Revisa la consola (F12) para errores\n\n" +
      "Documentacion: https://docs.nova-ai.com/widget",
    category: "SOPORTE",
    nodeId: "soporte_error_widget",
  },
  {
    keywords: ["reportes", "reporte", "report", "dashboard", "metricas", "analytics", "graficas", "estadisticas"],
    solution:
      "Para errores en reportes:\n\n" +
      "1. Limpia todos los filtros y recarga\n" +
      "2. Usa rango de max 90 dias\n" +
      "3. Para datos historicos, exporta en CSV\n" +
      "4. Plan Basico: solo ultimos 30 dias\n\n" +
      "Si persiste: anota el error, toma screenshot, reporta en Ayuda > Reportar problema",
    category: "SOPORTE",
    nodeId: "soporte_error_reportes",
  },
  {
    keywords: ["error", "falla", "fallo", "bug", "problema", "no jala", "no sirve", "roto", "broken", "crash"],
    solution:
      "Si tienes un error en la plataforma:\n\n" +
      "1. Recarga la pagina (Ctrl+Shift+R)\n" +
      "2. Prueba en modo incognito\n" +
      "3. Revisa https://status.nova-ai.com\n\n" +
      "Si persiste, reportalo en Ayuda > Reportar problema o a soporte@nova-ai.com con:\n" +
      "- Descripcion del error\n" +
      "- Screenshot\n" +
      "- Navegador y SO que usas",
    category: "SOPORTE",
    nodeId: "soporte_error",
  },

  // === SOPORTE — Integraciones ===
  {
    keywords: ["slack", "conectar slack", "integracion slack", "notificaciones slack"],
    solution:
      "Para conectar Slack:\n\n" +
      "1. Configuracion > Integraciones > Slack\n" +
      "2. Click 'Conectar con Slack'\n" +
      "3. Autoriza en la ventana de Slack\n" +
      "4. Selecciona el canal\n" +
      "5. Configura eventos y guarda\n\n" +
      "Requiere: Plan Pro+ y ser admin del workspace.",
    category: "SOPORTE",
    nodeId: "soporte_int_slack",
  },
  {
    keywords: ["teams", "microsoft teams", "conectar teams", "office 365"],
    solution:
      "Para conectar Microsoft Teams:\n\n" +
      "1. Configuracion > Integraciones > Microsoft Teams\n" +
      "2. Click 'Conectar con Teams'\n" +
      "3. Inicia sesion con cuenta Microsoft corporativa\n" +
      "4. Autoriza la app y selecciona equipo/canal\n" +
      "5. Configura eventos y guarda\n\n" +
      "Requiere: Plan Pro+ y cuenta Microsoft 365.",
    category: "SOPORTE",
    nodeId: "soporte_int_teams",
  },
  {
    keywords: ["notion", "conectar notion", "integracion notion"],
    solution:
      "Para conectar Notion:\n\n" +
      "1. Configuracion > Integraciones > Notion\n" +
      "2. Click 'Conectar con Notion'\n" +
      "3. Autoriza y selecciona paginas/bases de datos\n" +
      "4. Configura sincronizacion y guarda\n\n" +
      "Requiere: Plan Pro+ y ser admin del workspace Notion.",
    category: "SOPORTE",
    nodeId: "soporte_int_notion",
  },
  {
    keywords: ["zapier", "n8n", "automatizacion", "automation", "make", "integromat", "workflow", "zap"],
    solution:
      "Para conectar Zapier o n8n:\n\n" +
      "1. Configuracion > Integraciones > API\n" +
      "2. Genera una API Key\n" +
      "3. Zapier: busca 'Nova AI' en apps. n8n: usa HTTP Request\n" +
      "4. URL: https://api.nova-ai.com/v1/\n" +
      "5. Auth: Bearer Token con tu API Key\n\n" +
      "Docs: https://docs.nova-ai.com/api",
    category: "SOPORTE",
    nodeId: "soporte_int_zapier",
  },
  {
    keywords: ["whatsapp", "wa", "wpp", "whats", "whatsap"],
    solution:
      "Para conectar WhatsApp Business:\n\n" +
      "1. Configuracion > Canales > WhatsApp\n" +
      "2. Conecta tu numero de WhatsApp Business API\n" +
      "3. Configura mensaje de bienvenida y horarios\n\n" +
      "Requiere: Plan Pro+, cuenta Meta Business verificada.\n" +
      "Docs: https://docs.nova-ai.com/integraciones/canales",
    category: "SOPORTE",
    nodeId: "soporte_int_whatsapp",
  },
  {
    keywords: ["telegram", "bot telegram", "conectar telegram"],
    solution:
      "Para conectar Telegram:\n\n" +
      "1. Crea un bot con @BotFather en Telegram\n" +
      "2. Copia el token\n" +
      "3. Configuracion > Canales > Telegram\n" +
      "4. Pega el token y guarda\n\n" +
      "Requiere: Plan Pro+.\n" +
      "Docs: https://docs.nova-ai.com/integraciones/canales",
    category: "SOPORTE",
    nodeId: "soporte_int_whatsapp",
  },
  {
    keywords: ["integracion", "integrar", "conectar", "integration", "api", "webhook", "webhooks"],
    solution:
      "Ofrecemos 50+ integraciones:\n\n" +
      "- Comunicacion: Slack, Teams, Discord, WhatsApp, Telegram\n" +
      "- CRM: Salesforce, HubSpot, Pipedrive\n" +
      "- Productividad: Notion, Airtable, Jira, Trello\n" +
      "- Automatizacion: Zapier, n8n, Make\n" +
      "- Ecommerce: Shopify, WooCommerce\n" +
      "- API REST y Webhooks para custom\n\n" +
      "Configura en: Configuracion > Integraciones\n" +
      "Docs: https://docs.nova-ai.com/api",
    category: "SOPORTE",
    nodeId: "soporte_integracion",
  },
  {
    keywords: ["salesforce", "conectar salesforce", "crm"],
    solution:
      "La integracion con Salesforce esta disponible en el plan Enterprise.\n\n" +
      "Incluye sincronizacion bidireccional de contactos, tickets y metricas.\n" +
      "Tu account manager te ayuda con la configuracion.\n\n" +
      "Contacta a ventas@nova-ai.com para mas informacion.",
    category: "SOPORTE",
    nodeId: "soporte_integracion",
  },
  {
    keywords: ["hubspot", "conectar hubspot"],
    solution:
      "Para conectar HubSpot:\n\n" +
      "1. Configuracion > Integraciones > HubSpot\n" +
      "2. Autoriza con tu cuenta HubSpot\n" +
      "3. Selecciona que datos sincronizar (contactos, deals, tickets)\n" +
      "4. Guarda la configuracion\n\n" +
      "Requiere: Plan Pro+.\n" +
      "Docs: https://docs.nova-ai.com/integraciones/hubspot",
    category: "SOPORTE",
    nodeId: "soporte_integracion",
  },

  // === VENTAS — Planes ===
  {
    keywords: ["precio", "precios", "costo", "costos", "cuanto cuesta", "cuanto vale", "tarifa", "pricing", "price"],
    solution:
      "Nuestros planes:\n\n" +
      "- Basico: $99 MXN/mes (3 usuarios, 5GB)\n" +
      "- Pro: $199 MXN/mes (10 usuarios, 50GB)\n" +
      "- Enterprise: Personalizado (ilimitado)\n\n" +
      "20% descuento en pago anual. Prueba gratis 14 dias sin tarjeta.\n" +
      "Mas info: https://nova-ai.com/precios",
    category: "VENTAS",
    nodeId: "ventas_planes",
  },
  {
    keywords: ["plan basico", "basico", "plan economico", "plan barato", "plan inicial", "starter"],
    solution:
      "Plan Basico — $99 MXN/mes:\n\n" +
      "- 3 usuarios\n" +
      "- 5GB almacenamiento\n" +
      "- Chat IA ilimitado + widget web\n" +
      "- Reportes basicos\n" +
      "- Soporte email 48h\n\n" +
      "Ideal para emprendedores. Pago anual: $79/mes.\n" +
      "Prueba gratis: https://nova-ai.com/trial",
    category: "VENTAS",
    nodeId: "ventas_plan_basico",
  },
  {
    keywords: ["plan pro", "pro", "plan medio", "plan intermedio", "profesional"],
    solution:
      "Plan Pro — $199 MXN/mes:\n\n" +
      "- 10 usuarios\n" +
      "- 50GB almacenamiento\n" +
      "- Todo del Basico + integraciones avanzadas\n" +
      "- API access, multicanal, reportes avanzados\n" +
      "- Soporte prioritario 24h\n\n" +
      "Nuestro plan mas popular. Pago anual: $159/mes.\n" +
      "Prueba gratis: https://nova-ai.com/trial",
    category: "VENTAS",
    nodeId: "ventas_plan_pro",
  },
  {
    keywords: ["enterprise", "corporativo", "plan grande", "plan empresarial", "plan completo", "ilimitado"],
    solution:
      "Plan Enterprise — Precio personalizado:\n\n" +
      "- Usuarios y storage ilimitados\n" +
      "- SSO, account manager, white-label\n" +
      "- Integraciones custom (Salesforce, SAP)\n" +
      "- SLA 99.9%, soporte dedicado 4h\n\n" +
      "Agenda llamada: https://nova-ai.com/demo\n" +
      "Email: ventas@nova-ai.com",
    category: "VENTAS",
    nodeId: "ventas_plan_enterprise",
  },
  {
    keywords: ["comparar", "comparacion", "diferencia", "diferencias", "que plan", "cual plan", "versus", "vs"],
    solution:
      "Comparativa rapida:\n\n" +
      "Basico ($99): 3 users, 5GB, email, reportes basicos\n" +
      "Pro ($199): 10 users, 50GB, 50+ integraciones, multicanal, API\n" +
      "Enterprise: ilimitado, SSO, white-label, SLA 99.9%\n\n" +
      "Todos incluyen chat IA ilimitado y prueba gratis de 14 dias.",
    category: "VENTAS",
    nodeId: "ventas_comparar",
  },
  {
    keywords: ["prueba", "trial", "probar", "gratis", "free", "demo gratuita", "periodo prueba", "test"],
    solution:
      "Prueba gratuita de 14 dias:\n\n" +
      "- Acceso completo a cualquier plan\n" +
      "- No requiere tarjeta de credito\n" +
      "- Sin compromiso\n\n" +
      "Registrate: https://nova-ai.com/trial",
    category: "VENTAS",
    nodeId: "ventas_trial",
  },
  {
    keywords: ["descuento", "descuentos", "oferta", "promo", "promocion", "rebaja", "ahorro", "discount", "coupon", "cupon"],
    solution:
      "Descuentos disponibles:\n\n" +
      "- Pago anual: 20% off (ahorras 2 meses)\n" +
      "- Equipos 5+: precio especial\n" +
      "- Startups (<2 anos, <$5M fondeo): hasta 50% off\n" +
      "- ONGs/educacion: 30% permanente\n\n" +
      "Contacta ventas@nova-ai.com para aplicar.",
    category: "VENTAS",
    nodeId: "ventas_descuentos",
  },
  {
    keywords: ["demo", "demostracion", "presentacion", "llamada", "agendar", "reunion", "cita", "meeting"],
    solution:
      "Agenda una demo personalizada de 30 min:\n\n" +
      "- Web: https://nova-ai.com/demo\n" +
      "- Email: ventas@nova-ai.com\n" +
      "- Tel: +52 55 1234 5678\n\n" +
      "Te contactamos en menos de 24h.",
    category: "VENTAS",
    nodeId: "ventas_demo",
  },

  // === FACTURACION ===
  {
    keywords: ["factura", "facturas", "invoice", "cfdi", "xml", "pdf factura", "descargar factura", "ver factura"],
    solution:
      "Para ver/descargar facturas:\n\n" +
      "Configuracion > Facturacion > Historial de facturas\n\n" +
      "Descargas disponibles: PDF e XML (CFDI 4.0 si tienes datos fiscales).\n" +
      "Se envian automaticamente por email al cobrar.\n" +
      "Refacturacion: facturacion@nova-ai.com (hasta 30 dias).",
    category: "FACTURACION",
    nodeId: "facturacion_ver",
  },
  {
    keywords: ["metodo de pago", "cambiar tarjeta", "tarjeta", "forma de pago", "pagar", "payment", "pago"],
    solution:
      "Para cambiar metodo de pago:\n\n" +
      "Configuracion > Facturacion > Metodo de pago\n\n" +
      "Aceptamos: tarjeta (Visa, MC, AMEX), PayPal, MercadoPago, SPEI.\n" +
      "Enterprise: facturacion por orden de compra.\n" +
      "El cambio aplica al proximo ciclo.",
    category: "FACTURACION",
    nodeId: "facturacion_pago",
  },
  {
    keywords: ["reembolso", "refund", "devolucion", "devolver dinero", "me cobraron", "reintegro"],
    solution:
      "Politica de reembolso:\n\n" +
      "- Primeros 30 dias: reembolso completo\n" +
      "- Despues: proporcional al tiempo no usado\n\n" +
      "Solicitar: Configuracion > Facturacion > Solicitar reembolso\n" +
      "O email a soporte@nova-ai.com\n" +
      "Tiempo: 5-10 dias habiles.",
    category: "FACTURACION",
    nodeId: "facturacion_reembolso",
  },
  {
    keywords: ["cambiar plan", "upgrade", "downgrade", "subir plan", "bajar plan", "mejorar plan", "cambiar suscripcion"],
    solution:
      "Para cambiar de plan:\n\n" +
      "Configuracion > Facturacion > Cambiar plan\n\n" +
      "- Upgrade: se activa inmediatamente, cobro proporcional\n" +
      "- Downgrade: aplica al proximo ciclo, verifica limites\n" +
      "- Enterprise: contacta a tu account manager",
    category: "FACTURACION",
    nodeId: "facturacion_cambiar_plan",
  },
  {
    keywords: ["cancelar", "cancelo", "cancelacion", "dar de baja", "baja", "cancel", "dejar", "desuscribir"],
    solution:
      "Para cancelar:\n\n" +
      "Configuracion > Facturacion > Cancelar suscripcion\n\n" +
      "- Acceso hasta fin del periodo pagado\n" +
      "- Datos conservados 90 dias\n" +
      "- Puedes reactivar en esos 90 dias\n\n" +
      "Alternativas: pausa hasta 3 meses, downgrade, o descuento de retencion.",
    category: "FACTURACION",
    nodeId: "facturacion_cancelar",
  },
  {
    keywords: ["rfc", "datos fiscales", "fiscal", "razon social", "regimen", "sat", "constancia fiscal"],
    solution:
      "Para configurar datos fiscales (CFDI 4.0):\n\n" +
      "Configuracion > Facturacion > Datos fiscales\n\n" +
      "Ingresa: RFC, razon social, regimen fiscal, CP fiscal, uso CFDI.\n" +
      "Refacturacion hasta 30 dias: facturacion@nova-ai.com",
    category: "FACTURACION",
    nodeId: "facturacion_fiscal",
  },
  {
    keywords: ["cobro no reconocido", "fraude", "cargo no reconocido", "no autorice", "cobro indebido", "doble cobro"],
    solution:
      "Para cobros no reconocidos:\n\n" +
      "Contactanos de inmediato:\n" +
      "- Email: soporte@nova-ai.com\n" +
      "- Tel: +52 55 1234 5678\n\n" +
      "Incluye: fecha del cobro, monto, ultimos 4 digitos de tarjeta, email de tu cuenta.\n" +
      "Lo investigamos en 24-48h habiles.",
    category: "FACTURACION",
    nodeId: "facturacion_cobro",
  },
  {
    keywords: ["pausar", "pausa", "congelar", "suspender", "freeze", "detener cuenta"],
    solution:
      "Para pausar tu cuenta:\n\n" +
      "Configuracion > Facturacion > Pausar suscripcion\n\n" +
      "- Duracion: 1, 2 o 3 meses\n" +
      "- Sin cobros durante la pausa\n" +
      "- Datos intactos\n" +
      "- Se reactiva automaticamente o antes si lo deseas",
    category: "FACTURACION",
    nodeId: "facturacion_pausar",
  },

  // === ESCALAMIENTO ===
  {
    keywords: ["humano", "agente", "persona", "hablar con alguien", "representante", "operador", "asesor", "ejecutivo"],
    solution:
      "Te conecto con un agente humano:\n\n" +
      "- Llamar: +52 55 1234 5678 (L-V 9-18h)\n" +
      "- Email: soporte@nova-ai.com\n" +
      "- WhatsApp: +52 55 1234 5678\n\n" +
      "Tambien puedo solicitar que te contacten en las proximas 2 horas habiles.",
    category: "ESCALAMIENTO",
    nodeId: "escalamiento_root",
  },
  {
    keywords: ["telefono", "llamar", "llamada", "numero", "phone", "cel", "celular"],
    solution:
      "Nuestro telefono: +52 55 1234 5678\n\n" +
      "Horario: Lunes a Viernes, 9:00 - 18:00 (hora centro Mexico)\n" +
      "Enterprise: linea 24/7 via account manager.",
    category: "ESCALAMIENTO",
    nodeId: "escalamiento_llamar",
  },
  {
    keywords: ["email", "correo", "mail", "escribir", "contacto", "contactar"],
    solution:
      "Nuestros emails de contacto:\n\n" +
      "- Soporte: soporte@nova-ai.com\n" +
      "- Ventas: ventas@nova-ai.com\n" +
      "- Facturacion: facturacion@nova-ai.com\n\n" +
      "Tiempos: Basico 48h, Pro 24h, Enterprise 4h.",
    category: "ESCALAMIENTO",
    nodeId: "escalamiento_email",
  },

  // === SOPORTE — General ===
  {
    keywords: ["navegador", "browser", "chrome", "firefox", "safari", "edge", "compatible", "compatibilidad"],
    solution:
      "Navegadores compatibles:\n\n" +
      "- Chrome 90+\n" +
      "- Firefox 90+\n" +
      "- Edge 90+\n" +
      "- Safari 15+\n\n" +
      "Recomendamos Chrome para la mejor experiencia.\n" +
      "No soportamos Internet Explorer.",
    category: "SOPORTE",
    nodeId: "soporte_lento_todo",
  },
  {
    keywords: ["notificacion", "notificaciones", "alerta", "alertas", "aviso", "avisos", "notification"],
    solution:
      "Para configurar notificaciones:\n\n" +
      "1. Ve a Configuracion > Notificaciones\n" +
      "2. Selecciona canales: email, push, Slack, Teams\n" +
      "3. Elige eventos: nuevas conversaciones, escalamientos, reportes\n" +
      "4. Configura horarios de 'No molestar'\n\n" +
      "Si no recibes notificaciones, verifica tu spam y la configuracion de tu navegador.",
    category: "SOPORTE",
    nodeId: "soporte_root",
  },
  {
    keywords: ["personalizar", "customizar", "marca", "branding", "logo", "colores", "white label", "whitelabel"],
    solution:
      "Personalizacion de la plataforma:\n\n" +
      "- Widget: Configuracion > Widget > Apariencia (logo, colores, posicion)\n" +
      "- White-label: disponible solo en plan Enterprise\n" +
      "- Mensajes: Configuracion > Chatbot > Mensajes predeterminados\n\n" +
      "Para white-label completo, contacta ventas@nova-ai.com.",
    category: "SOPORTE",
    nodeId: "soporte_root",
  },
  {
    keywords: ["usuario", "usuarios", "agregar usuario", "invitar", "nuevo usuario", "equipo", "miembro", "team"],
    solution:
      "Para gestionar usuarios:\n\n" +
      "1. Ve a Configuracion > Equipo > Invitar usuario\n" +
      "2. Ingresa el email del nuevo miembro\n" +
      "3. Asigna un rol: Admin, Agente, Viewer\n" +
      "4. El invitado recibe un email para unirse\n\n" +
      "Limites: Basico 3, Pro 10, Enterprise ilimitados.\n" +
      "Uso actual: Configuracion > Equipo.",
    category: "SOPORTE",
    nodeId: "soporte_root",
  },

  // === SEGURIDAD ===
  {
    keywords: ["seguridad", "seguro", "security", "datos", "privacidad", "privacy", "encriptacion", "encryption", "gdpr"],
    solution:
      "Seguridad en Nova AI:\n\n" +
      "- Encriptacion AES-256 en reposo, TLS 1.3 en transito\n" +
      "- Certificaciones: SOC 2 Tipo II, ISO 27001, GDPR\n" +
      "- Servidores en Mexico (AWS) y USA\n" +
      "- SSO: SAML 2.0, OAuth 2.0, OpenID Connect\n" +
      "- MFA, audit logs, backups diarios\n" +
      "- Pen testing trimestral\n\n" +
      "Mas info: https://nova-ai.com/seguridad",
    category: "SOPORTE",
    nodeId: "soporte_root",
  },
  {
    keywords: ["sso", "saml", "oauth", "single sign on", "inicio sesion unico"],
    solution:
      "SSO disponible en plan Enterprise:\n\n" +
      "- SAML 2.0\n" +
      "- OAuth 2.0\n" +
      "- OpenID Connect\n\n" +
      "Configuracion con ayuda de tu account manager.\n" +
      "Contacta ventas@nova-ai.com para activar.",
    category: "SOPORTE",
    nodeId: "soporte_root",
  },

  // === GENERAL / INFO ===
  {
    keywords: ["horario", "horarios", "atencion", "cuando", "hora", "abierto", "disponible", "hours"],
    solution:
      "Horarios de atencion:\n\n" +
      "- General: L-V 9:00 - 18:00 (hora centro Mexico)\n" +
      "- Chat: L-V 9:00 - 22:00\n" +
      "- Enterprise: 24/7 con SLA\n\n" +
      "Festivos: servicio reducido (se notifica por email).",
    category: "ESCALAMIENTO",
    nodeId: "escalamiento_llamar",
  },
  {
    keywords: ["que es", "que hace", "para que sirve", "que ofrece", "sobre ustedes", "about", "informacion", "plataforma"],
    solution:
      "Nova AI es una plataforma SaaS de atencion al cliente con IA.\n\n" +
      "Permite:\n" +
      "- Automatizar respuestas con chatbot IA\n" +
      "- Multicanal: web, WhatsApp, Telegram, email\n" +
      "- 50+ integraciones\n" +
      "- Reportes y metricas de atencion\n" +
      "- Escalamiento a agentes humanos\n\n" +
      "Web: https://nova-ai.com | Prueba gratis: https://nova-ai.com/trial",
    category: "VENTAS",
    nodeId: "ventas_root",
  },
  {
    keywords: ["como funciona", "how it works", "como empezar", "getting started", "tutorial", "guia"],
    solution:
      "Como empezar con Nova AI:\n\n" +
      "1. Registrate en https://nova-ai.com/trial (gratis, sin tarjeta)\n" +
      "2. Configura tu chatbot (5 minutos)\n" +
      "3. Inserta el widget en tu sitio web\n" +
      "4. Conecta tus canales (WhatsApp, Telegram, etc.)\n" +
      "5. Configura integraciones (Slack, CRM, etc.)\n\n" +
      "Guia completa: https://docs.nova-ai.com/getting-started",
    category: "VENTAS",
    nodeId: "ventas_root",
  },

  // === Misc / Edge cases ===
  {
    keywords: ["gracias", "thanks", "thank you", "genial", "excelente", "perfecto", "ok", "vale", "chido", "chingon"],
    solution:
      "De nada! Si necesitas algo mas, estoy aqui para ayudarte.\n\n" +
      "Te invito a calificar tu experiencia para seguir mejorando.",
    category: "SOPORTE",
    nodeId: "soporte_resuelto",
  },
  {
    keywords: ["hola", "hello", "hi", "hey", "buenas", "buen dia", "buenos dias", "que onda", "saludos"],
    solution:
      "Hola! Soy Nova, tu asistente virtual. En que puedo ayudarte hoy?\n\n" +
      "Puedo ayudarte con:\n" +
      "- Informacion sobre planes y precios\n" +
      "- Soporte tecnico\n" +
      "- Facturacion y pagos\n" +
      "- Conectarte con un agente humano",
    category: "VENTAS",
    nodeId: "ventas_root",
  },
  {
    keywords: ["queja", "reclamo", "reclamar", "molesto", "enojado", "mal servicio", "pesimo", "complaint"],
    solution:
      "Lamento mucho la experiencia. Tu opinion es muy importante para nosotros.\n\n" +
      "Para atender tu queja de forma prioritaria:\n" +
      "- Email: soporte@nova-ai.com (asunto: QUEJA)\n" +
      "- Tel: +52 55 1234 5678\n\n" +
      "Un supervisor revisara tu caso en las proximas 4 horas habiles.",
    category: "ESCALAMIENTO",
    nodeId: "escalamiento_root",
  },
  {
    keywords: ["shopify", "tienda", "ecommerce", "woocommerce", "tiendanube", "mercadolibre"],
    solution:
      "Integraciones de ecommerce disponibles:\n\n" +
      "- Shopify\n" +
      "- WooCommerce\n" +
      "- Magento\n" +
      "- TiendaNube\n" +
      "- MercadoLibre\n\n" +
      "Configura en: Configuracion > Integraciones > Ecommerce\n" +
      "Requiere: Plan Pro+",
    category: "SOPORTE",
    nodeId: "soporte_integracion",
  },
  {
    keywords: ["stripe", "mercadopago", "paypal", "conekta", "openpay", "pasarela de pago"],
    solution:
      "Pasarelas de pago soportadas:\n\n" +
      "- Stripe, MercadoPago, PayPal, Conekta, OpenPay\n\n" +
      "Para pagos de tu suscripcion Nova AI, aceptamos tarjeta, PayPal, MercadoPago y SPEI.\n" +
      "Configura en: Configuracion > Facturacion > Metodo de pago",
    category: "FACTURACION",
    nodeId: "facturacion_pago",
  },
  {
    keywords: ["backup", "respaldo", "backups", "copias de seguridad", "restaurar", "recuperar datos"],
    solution:
      "Backups en Nova AI:\n\n" +
      "- Backups automaticos diarios\n" +
      "- Retencion de 30 dias\n" +
      "- Para restaurar datos, contacta soporte@nova-ai.com\n" +
      "- Despues de cancelar, datos conservados 90 dias\n\n" +
      "Enterprise: backups personalizados disponibles.",
    category: "SOPORTE",
    nodeId: "soporte_root",
  },
  {
    keywords: ["app", "aplicacion", "movil", "mobile", "celular", "ios", "android", "telefono app"],
    solution:
      "Actualmente Nova AI funciona como aplicacion web responsive.\n\n" +
      "Puedes acceder desde cualquier navegador movil y funciona perfectamente.\n" +
      "Tip: agrega a tu pantalla de inicio para experiencia tipo app.\n\n" +
      "App nativa para iOS/Android: en desarrollo, proximamente 2025.",
    category: "SOPORTE",
    nodeId: "soporte_root",
  },
  {
    keywords: ["idioma", "idiomas", "language", "ingles", "english", "espanol", "multilingual", "multilenguaje"],
    solution:
      "Idiomas soportados por el chatbot IA:\n\n" +
      "- Espanol (predeterminado)\n" +
      "- Ingles\n" +
      "- Portugues\n" +
      "- Frances\n\n" +
      "El chatbot detecta automaticamente el idioma del usuario.\n" +
      "Configura en: Configuracion > Chatbot > Idiomas.",
    category: "SOPORTE",
    nodeId: "soporte_root",
  },
  {
    keywords: ["limite", "limites", "restriccion", "maximo", "cuota", "quota", "almacenamiento", "storage"],
    solution:
      "Limites por plan:\n\n" +
      "Basico: 3 usuarios, 5GB storage, 30 dias reportes\n" +
      "Pro: 10 usuarios, 50GB storage, historico completo\n" +
      "Enterprise: sin limites\n\n" +
      "Revisa tu uso en: Configuracion > Uso y limites.\n" +
      "Para ampliar, considera un upgrade de plan.",
    category: "VENTAS",
    nodeId: "ventas_comparar",
  },
  {
    keywords: ["sla", "uptime", "disponibilidad", "garantia", "tiempo activo"],
    solution:
      "SLA y disponibilidad:\n\n" +
      "- Uptime historico: 99.95%\n" +
      "- SLA garantizado: 99.9% (solo Enterprise)\n" +
      "- Status en tiempo real: https://status.nova-ai.com\n" +
      "- Notificaciones de incidencias por email\n\n" +
      "Enterprise incluye creditos por incumplimiento del SLA.",
    category: "SOPORTE",
    nodeId: "soporte_root",
  },
  {
    keywords: ["migrar", "migracion", "importar", "mover datos", "transfer", "cambiar plataforma"],
    solution:
      "Migracion a Nova AI:\n\n" +
      "- Importa datos via CSV o API\n" +
      "- Plan Pro: migracion asistida por documentacion\n" +
      "- Enterprise: migracion guiada por tu account manager (incluye 2 sesiones de onboarding)\n\n" +
      "Guia: https://docs.nova-ai.com/migracion\n" +
      "Ayuda: soporte@nova-ai.com",
    category: "VENTAS",
    nodeId: "ventas_plan_enterprise",
  },
  {
    keywords: ["onboarding", "capacitacion", "training", "aprender", "curso", "tutorial avanzado"],
    solution:
      "Recursos de aprendizaje:\n\n" +
      "- Documentacion: https://docs.nova-ai.com\n" +
      "- Video tutoriales: https://nova-ai.com/academy\n" +
      "- Webinars mensuales gratuitos\n" +
      "- Enterprise: 2 sesiones de onboarding personalizado\n\n" +
      "Pregunta a soporte@nova-ai.com por la proxima sesion grupal.",
    category: "VENTAS",
    nodeId: "ventas_root",
  },
  {
    keywords: ["documentacion", "docs", "api docs", "referencia api", "endpoints", "swagger"],
    solution:
      "Documentacion disponible:\n\n" +
      "- General: https://docs.nova-ai.com\n" +
      "- API Reference: https://docs.nova-ai.com/api\n" +
      "- Integraciones: https://docs.nova-ai.com/integraciones\n" +
      "- Widget: https://docs.nova-ai.com/widget\n" +
      "- Changelog: https://docs.nova-ai.com/changelog\n\n" +
      "API requiere plan Pro o Enterprise.",
    category: "SOPORTE",
    nodeId: "soporte_root",
  },
  {
    keywords: ["chatbot", "bot", "ia", "inteligencia artificial", "ai", "machine learning", "modelo"],
    solution:
      "Nuestro chatbot IA:\n\n" +
      "- Potenciado por modelos de lenguaje avanzados\n" +
      "- Aprende de tus conversaciones (con tu permiso)\n" +
      "- Responde en segundos, 24/7\n" +
      "- Escalamiento automatico a humanos cuando es necesario\n" +
      "- Personalizable: tono, reglas, base de conocimiento\n\n" +
      "Configura en: Configuracion > Chatbot",
    category: "VENTAS",
    nodeId: "ventas_root",
  },
  {
    keywords: ["multicanal", "canales", "omnicanal", "omnichannel", "channels"],
    solution:
      "Canales disponibles:\n\n" +
      "- Web (widget embebido)\n" +
      "- WhatsApp Business\n" +
      "- Telegram\n" +
      "- Facebook Messenger\n" +
      "- Instagram DM\n" +
      "- Email\n\n" +
      "Basico: solo web. Pro+: todos los canales.\n" +
      "Bandeja unificada para gestionar todo desde un lugar.",
    category: "VENTAS",
    nodeId: "ventas_plan_pro",
  },
  {
    keywords: ["status", "estado", "incidencia", "mantenimiento", "maintenance"],
    solution:
      "Estado de la plataforma:\n\n" +
      "Revisa en tiempo real: https://status.nova-ai.com\n\n" +
      "Suscribete a notificaciones de incidencias desde la pagina de status.\n" +
      "Mantenimientos programados se notifican con 48h de anticipacion por email.",
    category: "SOPORTE",
    nodeId: "soporte_lento_seccion",
  },
  {
    keywords: ["eliminar cuenta", "borrar cuenta", "delete account", "eliminar datos", "borrar datos", "derecho al olvido"],
    solution:
      "Para eliminar tu cuenta y datos:\n\n" +
      "1. Cancela tu suscripcion primero\n" +
      "2. Escribe a soporte@nova-ai.com solicitando eliminacion\n" +
      "3. Confirmaremos por email\n" +
      "4. Eliminacion en 5 dias habiles\n\n" +
      "IMPORTANTE: esta accion es irreversible. Descarga tus datos antes.",
    category: "FACTURACION",
    nodeId: "facturacion_cancelar_confirm",
  },
  {
    keywords: ["rol", "roles", "permisos", "admin", "administrador", "agente", "viewer", "acceso"],
    solution:
      "Roles disponibles:\n\n" +
      "- Admin: acceso total, gestion de equipo y facturacion\n" +
      "- Agente: atencion a clientes, ver reportes propios\n" +
      "- Viewer: solo lectura, ver reportes\n\n" +
      "Configura en: Configuracion > Equipo > Editar rol.\n" +
      "Solo admins pueden cambiar roles.",
    category: "SOPORTE",
    nodeId: "soporte_root",
  },
  {
    keywords: ["power automate", "microsoft power", "flow"],
    solution:
      "Integracion con Power Automate:\n\n" +
      "1. Configuracion > Integraciones > API\n" +
      "2. Genera API Key\n" +
      "3. En Power Automate, usa conector HTTP\n" +
      "4. URL: https://api.nova-ai.com/v1/\n" +
      "5. Auth: Bearer Token\n\n" +
      "Requiere: Plan Pro+.\n" +
      "Docs: https://docs.nova-ai.com/api",
    category: "SOPORTE",
    nodeId: "soporte_int_zapier",
  },
  {
    keywords: ["jira", "linear", "asana", "trello", "clickup", "project management", "gestion proyectos"],
    solution:
      "Integraciones de gestion de proyectos:\n\n" +
      "- Jira, Linear, Asana, Trello, ClickUp, Basecamp\n\n" +
      "Sincroniza tickets de soporte con tus herramientas de proyecto.\n" +
      "Configura en: Configuracion > Integraciones > Productividad.\n" +
      "Requiere: Plan Pro+.",
    category: "SOPORTE",
    nodeId: "soporte_integracion",
  },
  {
    keywords: ["google", "gmail", "google workspace", "google drive", "google analytics"],
    solution:
      "Integraciones Google disponibles:\n\n" +
      "- Google Workspace (Calendar, Drive, Docs)\n" +
      "- Google Analytics\n" +
      "- Google Chat\n" +
      "- Google Drive (almacenamiento)\n\n" +
      "Configura en: Configuracion > Integraciones.\n" +
      "Requiere: Plan Pro+.",
    category: "SOPORTE",
    nodeId: "soporte_integracion",
  },
  {
    keywords: ["discord", "conectar discord"],
    solution:
      "Para conectar Discord:\n\n" +
      "1. Configuracion > Integraciones > Discord\n" +
      "2. Autoriza el bot de Nova AI en tu servidor\n" +
      "3. Selecciona canales para notificaciones\n" +
      "4. Configura eventos y guarda\n\n" +
      "Requiere: Plan Pro+ y permisos de admin en Discord.",
    category: "SOPORTE",
    nodeId: "soporte_integracion",
  },
  {
    keywords: ["airtable", "base de datos", "database"],
    solution:
      "Para conectar Airtable:\n\n" +
      "1. Configuracion > Integraciones > Airtable\n" +
      "2. Autoriza con tu cuenta Airtable\n" +
      "3. Selecciona bases y tablas a sincronizar\n" +
      "4. Configura mapeo de campos\n\n" +
      "Requiere: Plan Pro+.\n" +
      "Docs: https://docs.nova-ai.com/integraciones/airtable",
    category: "SOPORTE",
    nodeId: "soporte_integracion",
  },
];
