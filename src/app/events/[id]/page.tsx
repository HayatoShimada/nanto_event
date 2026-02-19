import ClientPage from "./ClientPage";

export const dynamicParams = false;
export const revalidate = 0;

export function generateStaticParams() {
  return [];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClientPage id={id} />;
}
