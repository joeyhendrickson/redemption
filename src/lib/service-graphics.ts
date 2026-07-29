export type ServiceGraphicVariant =
  | "handyman"
  | "carpentry"
  | "painting"
  | "flooring"
  | "kitchen"
  | "plumbing"
  | "electrical"
  | "hvac"
  | "exterior"
  | "property"
  | "default";

export function getServiceGraphicVariant(slug?: string | null, name?: string | null): ServiceGraphicVariant {
  const key = `${slug ?? ""} ${name ?? ""}`.toLowerCase();

  if (key.includes("plumb")) return "plumbing";
  if (key.includes("elect")) return "electrical";
  if (key.includes("hvac") || key.includes("heat") || key.includes("cool")) return "hvac";
  if (key.includes("paint") || key.includes("drywall")) return "painting";
  if (key.includes("floor")) return "flooring";
  if (key.includes("kitchen") || key.includes("bath")) return "kitchen";
  if (key.includes("carpent") || key.includes("deck") || key.includes("fence")) return "carpentry";
  if (key.includes("exterior") || key.includes("roof") || key.includes("gutter")) return "exterior";
  if (key.includes("property") || key.includes("rental") || key.includes("landlord")) return "property";
  if (key.includes("handyman") || key.includes("general")) return "handyman";

  return "default";
}
