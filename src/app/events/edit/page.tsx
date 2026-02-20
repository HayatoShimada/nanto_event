import { Suspense } from "react";
import ClientPage from "./ClientPage";

export default function Page() {
  return (
    <Suspense fallback={
      <div className="h-dvh w-full flex items-center justify-center bg-bg-main">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-main" />
      </div>
    }>
      <ClientPage />
    </Suspense>
  );
}
