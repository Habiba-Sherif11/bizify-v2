import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/LoginForm";
import loginImg from "@/assets/imgs/auth/login.png";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen">
      {/* Left — form */}
      <div className="relative z-10 w-full lg:w-1/2 flex items-center justify-center bg-white/80 lg:bg-white px-4 py-8 sm:px-8 backdrop-blur-sm lg:backdrop-blur-none">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-gray-900">Welcome back</h1>
            <p className="text-sm text-gray-500">Enter your credentials to access your account</p>
          </div>

          <div className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
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
