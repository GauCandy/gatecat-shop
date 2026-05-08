import { redirect } from "next/navigation";
import { shippingNavItems } from "./nav";

export default function ShippingIndexPage() {
  redirect(shippingNavItems[0].href);
}
