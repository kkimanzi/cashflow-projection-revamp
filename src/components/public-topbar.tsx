"use client";

import { Button } from "@/components/ui/button";
import { BarChart3, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function PublicTopBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">CashFlow Pro</span>
        </Link>

        {/* Desktop Navigation - now only "Sign In" button */}
        <div className="hidden md:flex items-center gap-6">
          <Button asChild variant="outline">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>

        {/* Mobile Menu Trigger */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container px-4 py-4">
            <div className="flex flex-col gap-4">
              <Button
                asChild
                className="w-full"
                onClick={() => setIsMenuOpen(false)}
              >
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
