import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serviceRequestSchema } from "@/lib/validations";
import { generateReferenceNumber, detectEmergency } from "@/lib/utils/helpers";
import { sendEmail, serviceRequestConfirmationEmail } from "@/lib/email";
import { inferFileCategory, uploadFileRecord, validateUploadFile } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const payloadRaw = formData.get("payload");

    if (!payloadRaw || typeof payloadRaw !== "string") {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const parsed = serviceRequestSchema.safeParse(JSON.parse(payloadRaw));
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation failed" }, { status: 400 });
    }

    const data = parsed.data;
    const referenceNumber = generateReferenceNumber("REQ");
    const isEmergencyFlagged =
      data.urgencyLevel === "EMERGENCY_REVIEW" ||
      detectEmergency(data.description, data.safetyConcern);

    const existingUser = await db.user.findUnique({ where: { email: data.email } });

    const serviceRequest = await db.serviceRequest.create({
      data: {
        referenceNumber,
        customerId: existingUser?.id,
        status: "NEW",
        priority: data.urgencyLevel,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        preferredContact: data.preferredContact,
        serviceAddress: data.serviceAddress,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        propertyType: data.propertyType,
        customerRelationship: data.customerRelationship,
        serviceCategory: data.serviceCategory,
        title: data.title,
        description: data.description,
        requestedCompletionDate: data.requestedCompletionDate
          ? new Date(data.requestedCompletionDate)
          : undefined,
        preferredDates: data.preferredDates ?? [],
        urgencyLevel: data.urgencyLevel,
        safetyConcern: data.safetyConcern,
        utilitiesShutoff: data.utilitiesShutoff,
        petsPresent: data.petsPresent,
        accessInstructions: data.accessInstructions,
        budgetRange: data.budgetRange,
        referralSource: data.referralSource,
        contactPermission: data.contactPermission,
        termsAccepted: data.termsAccepted,
        conditionalAnswers: (data.conditionalAnswers ?? {}) as object,
        isEmergencyFlagged,
      },
    });

    const files = formData.getAll("files") as File[];
    for (const file of files) {
      const validation = validateUploadFile(file);
      if (!validation.ok) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const fileUrl = await uploadFileRecord({
        folder: `service-requests/${serviceRequest.id}`,
        file,
        buffer,
      });

      await db.file.create({
        data: {
          serviceRequestId: serviceRequest.id,
          fileName: file.name,
          fileUrl,
          fileSize: file.size,
          mimeType: file.type,
          category: inferFileCategory(file.type),
        },
      });
    }

    const activateUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/register?email=${encodeURIComponent(data.email)}&request=${serviceRequest.id}`;
    const emailContent = serviceRequestConfirmationEmail({
      name: data.firstName,
      referenceNumber,
      activateUrl: existingUser ? undefined : activateUrl,
    });

    const emailResult = await sendEmail({
      to: data.email,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    if (!emailResult.success) {
      console.error("[service-request:confirmation-email-failed]", emailResult.error);
    }

    if (!existingUser) {
      await db.serviceRequest.update({
        where: { id: serviceRequest.id },
        data: { accountInviteSent: true },
      });
    }

    return NextResponse.json({
      id: serviceRequest.id,
      referenceNumber,
      isEmergencyFlagged,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to submit service request" }, { status: 500 });
  }
}
