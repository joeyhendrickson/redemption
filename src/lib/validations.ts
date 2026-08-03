import { z } from "zod";

export const serviceRequestSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Phone number is required"),
  preferredContact: z.enum(["EMAIL", "PHONE", "TEXT"]),
  serviceAddress: z.string().min(1, "Service address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1),
  zipCode: z.string().min(5, "ZIP code is required"),
  propertyType: z.enum([
    "SINGLE_FAMILY",
    "MULTI_FAMILY",
    "CONDO",
    "TOWNHOME",
    "APARTMENT",
    "COMMERCIAL",
    "OTHER",
  ]),
  customerRelationship: z.enum(["OWNER", "RENTER", "PROPERTY_MANAGER", "OTHER"]),
  serviceCategory: z.string().min(1, "Service category is required"),
  title: z.string().min(3, "Request title is required"),
  description: z.string().min(10, "Please describe the work needed"),
  requestedCompletionDate: z.string().optional(),
  preferredDates: z.array(z.string()).optional(),
  urgencyLevel: z.enum(["LOW", "NORMAL", "HIGH", "URGENT", "EMERGENCY_REVIEW"]),
  safetyConcern: z.boolean(),
  utilitiesShutoff: z.boolean(),
  petsPresent: z.boolean(),
  accessInstructions: z.string().optional(),
  budgetRange: z.string().optional(),
  referralSource: z.string().optional(),
  contactPermission: z.boolean().refine((value) => value === true, {
    message: "Contact permission is required",
  }),
  termsAccepted: z.boolean().refine((value) => value === true, {
    message: "You must accept the terms",
  }),
  conditionalAnswers: z.record(z.string(), z.unknown()).optional(),
});

export const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  serviceRequestId: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

export const resetPasswordSchema = z
  .object({
    email: z.string().email("Enter a valid email address."),
    code: z
      .string()
      .trim()
      .min(6, "Enter the 6-digit code from your email.")
      .max(8, "Enter the 6-digit code from your email."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm your new password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10),
});

export const messageSchema = z
  .object({
    serviceRequestId: z.string().optional(),
    jobId: z.string().optional(),
    parentMessageId: z.string().optional(),
    subject: z.string().optional(),
    body: z.string().min(1, "Message is required"),
    visibility: z.enum(["CUSTOMER", "CONTRACTOR", "INTERNAL", "ADMIN_CONTRACTOR"]).optional(),
  })
  .refine((data) => data.serviceRequestId || data.jobId || data.parentMessageId, {
    message: "Link the message to a request, job, or existing thread",
  });

export type MessageInput = z.infer<typeof messageSchema>;

export const estimateSchema = z.object({
  serviceRequestId: z.string().min(1),
  title: z.string().min(3),
  description: z.string().optional(),
  laborCost: z.coerce.number().min(0),
  materialsCost: z.coerce.number().min(0),
  validUntil: z.string().optional(),
});

export const estimateDecisionSchema = z.object({
  note: z.string().optional(),
});

export type EstimateInput = z.infer<typeof estimateSchema>;

export const assignContractorSchema = z.object({
  contractorId: z.string().min(1),
});

export const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  weight: z.coerce.number().int().min(1).max(100).optional(),
  estimatedHours: z.coerce.number().min(0).optional(),
  materialsRequired: z.string().optional(),
});

export const taskUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "BLOCKED", "COMPLETED", "CANCELLED"]).optional(),
  progressPercentage: z.coerce.number().int().min(0).max(100).optional(),
  weight: z.coerce.number().int().min(1).max(100).optional(),
  estimatedHours: z.coerce.number().min(0).optional(),
  actualHours: z.coerce.number().min(0).optional(),
  materialsRequired: z.string().optional(),
  blockerReason: z.string().optional(),
});

export const jobUpdateSchema = z.object({
  status: z.enum([
    "DRAFT",
    "UNASSIGNED",
    "ASSIGNED",
    "SCHEDULED",
    "CONFIRMED",
    "IN_PROGRESS",
    "PAUSED",
    "WAITING_ON_CUSTOMER",
    "WAITING_ON_MATERIALS",
    "CHANGE_APPROVAL_NEEDED",
    "QUALITY_REVIEW",
    "COMPLETED",
    "CLOSED",
    "CANCELLED",
  ]).optional(),
  scheduledStart: z.string().optional(),
  scheduledEnd: z.string().optional(),
  accessInstructions: z.string().optional(),
  safetyNotes: z.string().optional(),
  propertyNotes: z.string().optional(),
  completionOverride: z.coerce.number().int().min(0).max(100).nullable().optional(),
  completionOverrideReason: z.string().optional(),
});

const ratingSchema = z.coerce.number().int().min(1).max(5);

export const reviewSchema = z.object({
  jobId: z.string().min(1),
  overallRating: ratingSchema,
  qualityRating: ratingSchema.optional(),
  communicationRating: ratingSchema.optional(),
  timelinessRating: ratingSchema.optional(),
  cleanlinessRating: ratingSchema.optional(),
  privateFeedback: z.string().max(5000).optional(),
  testimonial: z.string().max(2000).optional(),
  unresolvedIssue: z.boolean().optional(),
  issueDescription: z.string().max(5000).optional(),
});

export const reviewUpdateSchema = z.object({
  isPublished: z.boolean().optional(),
});

export const invoiceCreateSchema = z.object({
  jobId: z.string().min(1),
  subtotal: z.coerce.number().min(0),
  tax: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
  dueDate: z.string().optional(),
});

export type ServiceRequestInput = z.infer<typeof serviceRequestSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
