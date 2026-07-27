export const APP_NAME = "Redemption Home Services";

export const REQUEST_STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  AWAITING_REVIEW: "Awaiting Review",
  NEEDS_MORE_INFORMATION: "Needs More Information",
  ESTIMATE_NEEDED: "Estimate Needed",
  ESTIMATE_SENT: "Estimate Sent",
  CUSTOMER_APPROVAL_PENDING: "Customer Approval Pending",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  CONVERTED_TO_JOB: "Converted to Job",
  CANCELLED: "Cancelled",
  ARCHIVED: "Archived",
};

export const JOB_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  UNASSIGNED: "Unassigned",
  ASSIGNED: "Assigned",
  SCHEDULED: "Scheduled",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In Progress",
  PAUSED: "Paused",
  WAITING_ON_CUSTOMER: "Waiting on Customer",
  WAITING_ON_MATERIALS: "Waiting on Materials",
  CHANGE_APPROVAL_NEEDED: "Change Approval Needed",
  QUALITY_REVIEW: "Quality Review",
  COMPLETED: "Completed",
  CLOSED: "Closed",
  CANCELLED: "Cancelled",
};

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Low",
  NORMAL: "Normal",
  HIGH: "High",
  URGENT: "Urgent",
  EMERGENCY_REVIEW: "Emergency Review",
};

export const PROPERTY_TYPES = [
  { value: "SINGLE_FAMILY", label: "Single-family home" },
  { value: "MULTI_FAMILY", label: "Multi-family" },
  { value: "CONDO", label: "Condo" },
  { value: "TOWNHOME", label: "Townhome" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "OTHER", label: "Other" },
];

export const CUSTOMER_RELATIONSHIPS = [
  { value: "OWNER", label: "Owner" },
  { value: "RENTER", label: "Renter" },
  { value: "PROPERTY_MANAGER", label: "Property manager" },
  { value: "OTHER", label: "Other" },
];

export const CONTACT_METHODS = [
  { value: "EMAIL", label: "Email" },
  { value: "PHONE", label: "Phone" },
  { value: "TEXT", label: "Text message" },
];

export const BUDGET_RANGES = [
  "Under $200",
  "$200 – $500",
  "$500 – $1,000",
  "$1,000 – $2,500",
  "$2,500 – $5,000",
  "$5,000+",
  "Not sure yet",
];

export const REFERRAL_SOURCES = [
  "Google search",
  "Friend or family",
  "Social media",
  "Nextdoor",
  "Repeat customer",
  "Real estate agent",
  "Property manager",
  "Other",
];

export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/quicktime",
  "application/pdf",
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const EMERGENCY_KEYWORDS = [
  "fire",
  "gas leak",
  "sparks",
  "smoke",
  "burning smell",
  "structural collapse",
  "major flooding",
  "electrical fire",
];
