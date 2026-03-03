import TeamDetailClient from "./TeamDetailClient";

export const dynamicParams = false;

export async function generateStaticParams() {
    // For output "export", we either need real IDs or we create a dummy one
    // to satisfy the builder, but since dynamic router isn't fully static here
    // without a backend, we'll return an empty array and hope dynamicParams false works, 
    // or we'll provide a dummy ID so it generates at least one page.
    return [{ id: "placeholder" }];
}

export default function TeamDetailPage() {
    return <TeamDetailClient />;
}
