"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-zinc-950">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex w-1/2 bg-[#1c1a17] flex-col justify-center items-center text-white p-12 relative">
        <div className="max-w-md w-full flex flex-col items-center">
          <div className="mb-12">
            <img 
              src="/images/zirithLogo.jpeg" 
              alt="Zirith Logo" 
              className="h-20 w-auto rounded-md shadow-2xl brightness-110" 
            />
          </div>
          <h2 className="text-[2.75rem] leading-tight font-serif text-center mb-6 text-zinc-100">
            Manage your<br />
            relationships<br />
            <span className="text-blue-500 italic">seamlessly.</span>
          </h2>
          <p className="text-zinc-400 text-center text-md leading-relaxed max-w-[320px]">
            Access your leads, track daily tasks, and close more deals from your internal command center.
          </p>
        </div>
      </div>

      {/* Right Side - Login */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-[#f8f9fa] dark:bg-zinc-950 p-6">
        <div className="w-full max-w-md space-y-8 bg-white dark:bg-zinc-900 p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 dark:border-zinc-800">
          <div className="flex flex-col space-y-3 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Welcome Back
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Sign in to the ZIRITH Internal CRM
            </p>
          </div>

          <div className="pt-4">
            <Button 
              variant="default" 
              type="button" 
              className="w-full h-12 text-md font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all"
              onClick={() => signIn("google", { callbackUrl: "/kanban" })}
            >
              <svg role="img" viewBox="0 0 24 24" className="mr-3 h-5 w-5 bg-white text-blue-600 rounded-full p-0.5">
                <path
                  fill="currentColor"
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                />
              </svg>
              Sign in with Google
            </Button>
          </div>

          <p className="px-2 text-center text-xs text-zinc-400 leading-relaxed mt-8">
            By clicking continue, you agree to our Terms of Service and Privacy Policy. Only whitelisted team members have access.
          </p>
        </div>
      </div>
    </div>
  );
}
