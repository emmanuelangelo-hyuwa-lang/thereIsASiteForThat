export type Pricing = "free" | "freemium" | "paid" | "free_trial";

export function pricingLabel(pricing: Pricing): string {
  switch (pricing) {
    case "free":
      return "Free";
    case "freemium":
      return "Freemium";
    case "paid":
      return "Paid";
    case "free_trial":
      return "Free trial";
  }
}
