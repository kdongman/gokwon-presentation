import { redirect } from "next/navigation";

export default function ProductRedirectPage({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/checkout?productId=${encodeURIComponent(params.id)}`);
}
