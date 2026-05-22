import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/LoginForm";
import SVGComponent from "@/components/sections/logo";
import loginImg from "@/assets/imgs/auth/login.png";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen">
      {/* Left — form */}
      <div className="relative z-10 w-full lg:w-1/2 flex items-center justify-center bg-[#FAFAFA]/80 lg:bg-[#FAFAFA] px-4 py-8 sm:px-8 backdrop-blur-sm lg:backdrop-blur-none">
        <div className="w-full max-w-sm space-y-6">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <SVGComponent className="h-7 w-auto" />
            <span
              className="text-lg font-semibold text-[#1C1C1E]"
              style={{ fontFamily: "var(--font-cormorant-sc)" }}
            >
              Bizify
            </span>
          </Link>

          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-[#1C1C1E]">Welcome back</h1>
            <p className="text-sm text-[#8C8C8C]">Enter your credentials to access your account</p>
          </div>

          <div className="rounded-xl border border-gray-200/80 bg-[#FAFAFA] p-6 shadow-sm">
            <Suspense>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Right — image */}
      <div className="absolute inset-0 z-0 lg:relative lg:inset-auto lg:w-1/2 overflow-hidden bg-gray-900 pointer-events-none select-none">
        <Image
          src={loginImg}
          alt="Login illustration"
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
          draggable={false}
        />
      </div>
    </div>
  );
}
