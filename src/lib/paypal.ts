export function getPaypalClientId(): string {
  return process.env.PAYPAL_CLIENT_ID!;
}

export function getPaypalClientSecret(): string {
  return process.env.PAYPAL_CLIENT_SECRET!;
}

export function getPaypalApiBase(): string {
  const mode = process.env.PAYPAL_MODE || "sandbox";
  return mode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}
