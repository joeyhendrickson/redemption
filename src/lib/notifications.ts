import { getAppUrl } from "@/lib/app-url";
import { db } from "@/lib/db";
import { newServiceRequestAdminEmail, sendEmail } from "@/lib/email";

type NewServiceRequestNotification = {
  id: string;
  referenceNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  serviceCategory: string;
  title: string;
  description: string;
  urgencyLevel: string;
  serviceAddress: string;
  city: string;
  state: string;
  zipCode: string;
  isEmergencyFlagged: boolean;
};

export async function notifyAdminsOfNewServiceRequest(
  request: NewServiceRequestNotification,
  incomingRequest?: Request,
) {
  const admins = await db.user.findMany({
    where: { role: "ADMIN", isActive: true },
    select: { email: true },
  });

  const adminEmails = [...new Set(admins.map((admin) => admin.email.toLowerCase()).filter(Boolean))];
  if (!adminEmails.length) {
    console.warn("[service-request:admin-notify-skipped] No active admin emails found.");
    return { success: false as const, error: "No active admin emails found." };
  }

  const adminUrl = `${getAppUrl(incomingRequest)}/admin/requests/${request.id}`;
  const emailContent = newServiceRequestAdminEmail({
    referenceNumber: request.referenceNumber,
    customerName: `${request.firstName} ${request.lastName}`,
    email: request.email,
    phone: request.phone,
    serviceCategory: request.serviceCategory,
    title: request.title,
    description: request.description,
    urgencyLevel: request.urgencyLevel,
    serviceAddress: request.serviceAddress,
    city: request.city,
    state: request.state,
    zipCode: request.zipCode,
    isEmergencyFlagged: request.isEmergencyFlagged,
    adminUrl,
  });

  const result = await sendEmail({
    to: adminEmails,
    subject: emailContent.subject,
    html: emailContent.html,
  });

  if (!result.success) {
    console.error("[service-request:admin-notify-failed]", result.error);
  }

  return result;
}
