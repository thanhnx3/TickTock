import { Suspense } from "react";
import SearchPage from "./SearchPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Đang tải...</div>}>
      <SearchPage />
    </Suspense>
  );
}
