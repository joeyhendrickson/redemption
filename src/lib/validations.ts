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

export const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10),
});

export type ServiceRequestInput = z.infer<typeof serviceRequestSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
