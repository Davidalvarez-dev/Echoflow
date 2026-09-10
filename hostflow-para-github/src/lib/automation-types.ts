export const AUTOMATION_TRIGGERS = [
  "OPPORTUNITY_CREATED",
  "OPPORTUNITY_STAGE_CHANGED",
  "QUOTE_SENT",
  "PAYMENT_RECEIVED",
  "CHECK_IN_DATE_REACHED",
] as const;

export const AUTOMATION_ACTIONS = ["MOVE_STAGE", "SET_STATUS", "SEND_MESSAGE", "CREATE_TASK"] as const;

export type AutomationTrigger = (typeof AUTOMATION_TRIGGERS)[number];
export type AutomationActionType = (typeof AUTOMATION_ACTIONS)[number];

export const triggerMeta: Record<AutomationTrigger, { label: string; description: string; group: string }> = {
  OPPORTUNITY_CREATED: { label: "Oportunidad creada", description: "Cuando entra una nueva solicitud.", group: "Oportunidades" },
  OPPORTUNITY_STAGE_CHANGED: { label: "Etapa de oportunidad cambiada", description: "Cuando se mueve una oportunidad dentro del pipeline.", group: "Oportunidades" },
  QUOTE_SENT: { label: "Cotización enviada", description: "Cuando se envía una cotización al huésped.", group: "Cotizaciones" },
  PAYMENT_RECEIVED: { label: "Pago recibido", description: "Stripe, transferencia confirmada o depósito registrado.", group: "Pagos" },
  CHECK_IN_DATE_REACHED: { label: "Llegó la fecha de check-in", description: "Al comenzar la estancia del huésped.", group: "Estancias" },
};

export const actionMeta: Record<AutomationActionType, { label: string; description: string }> = {
  MOVE_STAGE: { label: "Mover a etapa", description: "Actualiza la columna del pipeline." },
  SET_STATUS: { label: "Actualizar estado", description: "Marca la oportunidad como abierta, ganada, perdida o abandonada." },
  SEND_MESSAGE: { label: "Enviar mensaje", description: "Registra un mensaje automático en la conversación." },
  CREATE_TASK: { label: "Crear tarea", description: "Deja una tarea operativa en el historial." },
};

export function isAutomationTrigger(value: string): value is AutomationTrigger { return AUTOMATION_TRIGGERS.includes(value as AutomationTrigger); }
export function isAutomationAction(value: string): value is AutomationActionType { return AUTOMATION_ACTIONS.includes(value as AutomationActionType); }
