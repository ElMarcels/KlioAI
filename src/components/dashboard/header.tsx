"use client";

import { useSession } from "next-auth/react";
import { getInitials } from "@/lib/utils";
import { Bell, Search, Globe } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/components/shared/language-provider";
import { useState, useRef, useEffect } from "react";
import type { Language } from "@/lib/i18n";

export function DashboardHeader() {
  const { data: session } = useSession();
  const { t, language, setLanguage } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const flags: Record<Language, string> = { en: "EN", es: "ES" };

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center justify-between h-full px-4 lg:px-8">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("common.search")}
              className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Globe className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">{flags[language]}</span>
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-1 w-32 rounded-lg border border-border bg-card shadow-lg z-50">
                {(["en", "es"] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => { setLanguage(lang); setLangOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg ${language === lang ? "text-primary font-medium" : "text-muted-foreground"}`}
                  >
                    {lang === "en" ? "English" : "Espa\u00f1ol"}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
          </button>

          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-lg p-1.5 hover:bg-muted transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {getInitials(session?.user?.name)}
              </span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium">
                {session?.user?.name || "User"}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {session?.user?.plan?.toLowerCase() || "free"} plan
              </p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
