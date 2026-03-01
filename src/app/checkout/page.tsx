import type { Metadata } from "next";
import { CheckoutClient } from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Оформление заказа",
  description: "Оформите заказ в FORTE CUP",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
