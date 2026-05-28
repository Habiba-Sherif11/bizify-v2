"use client";

import { Toaster as Sonner, ToasterProps } from "sonner";

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        classNames: {
          success: "!bg-green-600 !text-white !border-green-700",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
