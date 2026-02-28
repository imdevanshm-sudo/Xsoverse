import { redirect } from "next/navigation";

export default async function XsoShortLinkPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ k?: string | string[] }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const id = resolvedParams?.id;
  const tokenParam = resolvedSearchParams?.k;
  const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;

  if (!id) {
    redirect("/");
  }
  if (!token) {
    redirect(`/exso/${encodeURIComponent(id)}`);
  }
  redirect(`/exso/${encodeURIComponent(id)}?k=${encodeURIComponent(token)}`);
}
