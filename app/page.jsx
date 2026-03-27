import Link from "next/link";
import { Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-6">
          <Shield size={24} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Coram Digital Sales Room</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Dynamic sales rooms powered by Supabase. Each prospect gets a unique, data-driven experience.
        </p>
        <div className="space-y-3">
          <p className="text-sm text-slate-500">To view a Digital Sales Room, navigate to:</p>
          <code className="block bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-emerald-400">
            /[slug]
          </code>
          <p className="text-xs text-slate-600 mt-4">
            Example: <code className="text-emerald-500">/novi-dsr</code>
          </p>
        </div>
      </div>
    </div>
  );
}
