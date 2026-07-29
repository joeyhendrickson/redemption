const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

export function isSmsConfigured() {
  return Boolean(twilioAccountSid && twilioAuthToken && twilioPhoneNumber);
}

export async function sendSms({ to, body }: { to: string; body: string }) {
  if (!isSmsConfigured()) {
    console.log("[sms:stub]", { to, body });
    return { success: true, stub: true };
  }

  const twilio = await import("twilio");
  const client = twilio.default(twilioAccountSid!, twilioAuthToken!);

  await client.messages.create({
    from: twilioPhoneNumber!,
    to,
    body,
  });

  return { success: true };
}

export function normalizePhoneNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (phone.startsWith("+")) return phone;
  return `+${digits}`;
}
