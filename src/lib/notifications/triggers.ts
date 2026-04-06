/* ══════════════════════════════════════════════════════════════════════
   Notifications — Triggers métier
   Fonctions fire-and-forget appelées depuis les API routes après
   une action métier. Chaque trigger crée la notification appropriée
   si les préférences le permettent.
   ══════════════════════════════════════════════════════════════════════ */

import { createNotification } from "./service";

/**
 * Trigger : nouvelle commande créée.
 * Appelé depuis POST /api/orders après insert réussi.
 */
export async function triggerOrderNew(params: {
  userId: string;
  orderId: string;
  orderTitle: string;
  clientName?: string;
  amount?: number;
}) {
  const { userId, orderId, orderTitle, clientName, amount } = params;

  await createNotification({
    user_id: userId,
    type: "order_new",
    category: "orders",
    title: "Nouvelle commande reçue",
    message: clientName
      ? `${clientName} — ${orderTitle}${amount ? ` (${amount.toFixed(2)} €)` : ""}`
      : orderTitle,
    cta_label: "Voir la commande",
    cta_href: `/commandes`,
    entity_type: "order",
    entity_id: orderId,
    triggered_by: "system",
    idempotency_key: `order_new:${orderId}`,
    metadata: { clientName, amount },
  });
}

/**
 * Trigger : commande livrée (statut → delivered).
 * Appelé depuis PATCH /api/orders/[id] quand status = delivered.
 */
export async function triggerOrderDelivered(params: {
  userId: string;
  orderId: string;
  orderTitle: string;
  clientName?: string;
}) {
  const { userId, orderId, orderTitle, clientName } = params;

  await createNotification({
    user_id: userId,
    type: "order_delivered",
    category: "orders",
    title: "Commande livrée",
    message: clientName
      ? `${orderTitle} pour ${clientName} est marquée comme livrée.`
      : `${orderTitle} est marquée comme livrée.`,
    cta_label: "Voir la commande",
    cta_href: `/commandes`,
    entity_type: "order",
    entity_id: orderId,
    triggered_by: "system",
    idempotency_key: `order_delivered:${orderId}`,
  });
}

/**
 * Trigger : tâche créée avec échéance.
 * Crée un rappel pour le jour de l'échéance.
 */
export async function triggerTaskDue(params: {
  userId: string;
  taskId: string;
  taskTitle: string;
  dueDate: string;
}) {
  const { userId, taskId, taskTitle, dueDate } = params;
  const dateLabel = new Date(dueDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });

  await createNotification({
    user_id: userId,
    type: "task_due",
    category: "tasks",
    title: "Tâche à échéance",
    message: `« ${taskTitle} » arrive à échéance le ${dateLabel}.`,
    cta_label: "Voir la tâche",
    cta_href: `/taches/${taskId}`,
    entity_type: "task",
    entity_id: taskId,
    triggered_by: "system",
    idempotency_key: `task_due:${taskId}:${dueDate}`,
    metadata: { dueDate },
  });
}

/**
 * Trigger : suggestion de facturation.
 * Commande livrée mais non facturée.
 */
export async function triggerInvoiceSuggestion(params: {
  userId: string;
  orderId: string;
  orderTitle: string;
  clientName?: string;
}) {
  const { userId, orderId, orderTitle, clientName } = params;

  await createNotification({
    user_id: userId,
    type: "invoice_suggestion",
    category: "billing",
    title: "Facturation recommandée",
    message: clientName
      ? `La commande « ${orderTitle} » de ${clientName} est livrée mais pas encore facturée.`
      : `La commande « ${orderTitle} » est livrée mais pas encore facturée.`,
    cta_label: "Facturer maintenant",
    cta_href: `/facturation`,
    entity_type: "order",
    entity_id: orderId,
    triggered_by: "system",
    idempotency_key: `invoice_suggestion:${orderId}`,
  });
}
