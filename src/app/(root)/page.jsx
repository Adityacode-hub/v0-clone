"use client";
import Image from "next/image";
import ProjectForm from "@/modules/home/components/project-form"
import React from "react";
import { Button } from "@base-ui/react";
export default function Page() {

  return (
    <div className="flex items-center justify-center w-full px-4 py-16">

      <div className="max-w-5xl w-full">
        
        <section className="space-y-8 flex flex-col items-center">

          {/* Logo */}

          <Image
            src="/logo.svg"
            width={80}
            height={80}
            alt="logo"
            className="invert dark:invert-0"
          />

          {/* Title */}

          <h1 className="text-3xl md:text-5xl font-bold text-center">
            Build Something with 😎
          </h1>

          {/* Subtitle */}

          <p className="text-lg md:text-xl text-muted-foreground text-center">
            Create apps and websites by chatting with AI
          </p>

          {/* Form */}

          <div className="max-w-3xl w-full">
            <ProjectForm />
          </div>

        </section>

      </div>
    </div>
  );
}