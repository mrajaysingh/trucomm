"use client";

import Link from "next/link";
import { useState } from "react";
import Aurora from "../components/Aurora";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-black overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Aurora colorStops={["#3A29FF", "#FF94B4", "#FF3232"]} blend={0.45} amplitude={0.9} speed={0.45} />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-white/5">
          <div className="text-center mb-6">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 group"
              onClick={() => {
                // Dispatch custom event to trigger preloader
                window.dispatchEvent(new CustomEvent('logo-click'));
              }}
            >
              <span className="text-2xl font-logo text-white"><span className="text-[#FF4655]">Tru</span>Comm</span>
            </Link>
            <h1 className="mt-2 text-xl sm:text-2xl font-heading text-white">Sign in to your account</h1>
            <p className="mt-1 text-sm text-gray-400">Welcome back! Please enter your details.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm text-gray-300 mb-1">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF4655]"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm text-gray-300 mb-1">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF4655]"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 text-gray-300">
                <input type="checkbox" className="rounded border-white/20 bg-black/40" />
                Remember me
              </label>
              <Link href="/forgot-password" className="text-gray-300 hover:text-white">Forgot password?</Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0f1923] hover:bg-[#ff4655] text-white px-4 py-2.5 rounded-lg border border-white/10 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-400">
            Don’t have an account? <Link href="/signup" className="text-white hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </main>
  );
}


