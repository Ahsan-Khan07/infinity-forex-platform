import { Suspense } from "react";
import VerifyDeviceClient from "./verify-device-client";

export default function VerifyDevicePage() {
  return (
    <Suspense fallback={<div className="text-white p-10">Loading...</div>}>
      <VerifyDeviceClient />
    </Suspense>
  );
}
