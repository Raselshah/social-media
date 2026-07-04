
"use client";

import { RegisterForm } from "@/components";
import Image from "next/image";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen bg-[#f0f2f5] lg:grid lg:grid-cols-[55.6%_44.4%] overflow-hidden">
      
      <div className="absolute top-0 left-0 w-[176px] h-[540px] pointer-events-none -translate-x-[1%] -translate-y-[1%] select-none z-0">
        <Image
          src="/assets/images/shape1.svg"
          alt=""
          fill
          sizes="540px"
          className="object-contain"
          priority
        />
      </div>

   
      <div className="absolute top-0 right-0 w-[400px] h-[568px] pointer-events-none translate-x-[5%] -translate-y-[30%] select-none z-0">
        <Image
          src="/assets/images/shape2.svg"
          alt=""
          fill
          sizes="568px"
          className="object-contain"
          priority
        />
      </div>

  



      <section className="relative hidden  overflow-hidden lg:flex items-center justify-center p-8 z-10">
  
        <div className="relative w-full h-[618px] max-w-[856px] aspect-[1.22/1]">
          <Image
            src="/assets/images/registration.png"
            alt="BuddyScript Showcase Illustration"
            fill
            sizes="618px"
            className="object-contain object-center"
            priority
          />
        </div>
      </section>

   
      <section className="relative flex  items-start justify-start px-6 py-10 sm:px-10 lg:px-[74px] z-10">
        <div className="w-full max-w-[416px] bg-white rounded-[10px] p-[30px] sm:p-[40px] shadow-[0_0_20px_rgba(0,0,0,0.05)]">
          <div className="mb-[38px] flex flex-col items-center justify-start">
     
            <Image
              src="/assets/images/logo.svg"
              alt="BuddyScript"
              width={137}
              height={28}
              className="mb-[42px] h-auto w-[137px]"
              priority
            />
            <p className="text-[16px] font-medium text-[#686f7b] mb-[10px]">Get Started Now</p>
            <h1 className="text-[28px] font-semibold leading-[1.16] tracking-normal text-[#050505]">
             Registration
            </h1>
          </div>

       
          <button className="mb-[24px] flex h-[52px] w-full items-center justify-center gap-3 rounded-[6px] border border-[#d8dce3] bg-white text-[16px] font-medium text-[#171717] transition-colors hover:bg-[#f7f8fa]">
            <Image
              src="/assets/images/google.svg"
              alt="Google Icon"
              width={20}
              height={20}
            />
            <span>Or sign-in with google</span>
          </button>

          {/* Semantic Grid Separation Horizontal Rule Line */}
          <div className="mb-[24px] flex items-center gap-4">
            <span className="h-px flex-1 bg-[#e4e7ec]" />
            <span className="text-[14px] font-medium text-[#8a91a0]">Or</span>
            <span className="h-px flex-1 bg-[#e4e7ec]" />
          </div>

          {/* Shared Interactive Control Field Form Fields Tree Wrapper */}
          <RegisterForm />

          {/* Footer Interactive Redirection Anchor Text Target Block */}
          <p className="mt-[28px] text-center text-[15px] font-medium text-[#676e7a]">
            {`Or already have an account? `}
            <Link
              href="/login"
              className="font-semibold text-[#168bff] underline underline-offset-2"
            >
               Login
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}