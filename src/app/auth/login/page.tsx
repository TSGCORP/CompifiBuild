"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      router.push("/overview");
      router.refresh();
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : "Unable to sign in. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(215,29,26,0.08),_transparent_35%),_#f3f5f2] p-6">
      <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <div className="flex items-center justify-between">
          <p className="text-sm uppercase tracking-[0.22em] text-red-600">Compifi</p>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
            Secure tenant access
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">Sign in</h1>
        <p className="mt-2 text-sm text-slate-500">Authenticate with your company workspace credentials.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-red-400 focus:bg-white"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              required
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="text-xs font-medium text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              id="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-red-400 focus:bg-white"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              Remember me
            </label>
            <a href="/auth/login" className="text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline">
              Need help?
            </a>
          </div>

          {error ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">Protected by tenant-aware Supabase authentication</p>
      </div>
    </div>
  );
}