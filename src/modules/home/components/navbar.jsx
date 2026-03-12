"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

const Navbar = () => {

  const { isSignedIn } = useUser();

  return (
    <nav className="p-4 bg-transparent fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b border-transparent">

      <div className="max-w-5xl mx-auto w-full flex justify-between items-center">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          {/* <Image
            src="/logo.svg"
            alt="v0_clone"
            width={32}
            height={32}
          /> */}
          <span className="font-semibold">v0_clone</span>
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-2">

          {!isSignedIn && (
            <>
              <SignInButton mode="modal">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </SignInButton>

              <SignUpButton mode="modal">
                <Button size="sm">
                  Sign Up
                </Button>
              </SignUpButton>
            </>
          )}

          {isSignedIn && (
            <UserButton afterSignOutUrl="/" />
          )}

        </div>

      </div>

    </nav>
  );
};

export default Navbar;