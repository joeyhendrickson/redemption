export function generateReferenceNumber(prefix: string) {
  const date = new Date();
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${stamp}-${random}`;
}

export function formatPhoneNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

export function formatCurrency(amount: number | string) {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function calculateJobProgress(
  tasks: { progressPercentage: number; weight: number }[],
  method: "EQUAL_WEIGHT" | "ASSIGNED_WEIGHT",
) {
  if (tasks.length === 0) return 0;

  if (method === "ASSIGNED_WEIGHT") {
    const totalWeight = tasks.reduce((sum, task) => sum + task.weight, 0);
    if (totalWeight === 0) return 0;
    const weighted = tasks.reduce(
      (sum, task) => sum + task.progressPercentage * task.weight,
      0,
    );
    return Math.round(weighted / totalWeight);
  }

  const total = tasks.reduce((sum, task) => sum + task.progressPercentage, 0);
  return Math.round(total / tasks.length);
}

export function detectEmergency(description: string, safetyConcern: boolean) {
  if (safetyConcern) return true;
  const lower = description.toLowerCase();
  return ["fire", "gas leak", "sparks", "smoke", "collapse", "911"].some((term) =>
    lower.includes(term),
  );
}
