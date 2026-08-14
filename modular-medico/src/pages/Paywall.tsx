import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, Check, Smartphone, AlertTriangle } from "lucide-react";
import Card from "../components/Card";
import Pill from "../components/Pill";
import Btn from "../components/Btn";
import { THEME, FONT_DISPLAY, FONT_MONO } from "../theme";
import { useAppStore, useIsPremium } from "../store/useAppStore";
import { startCheckout, PLAN_PRICES } from "../services/payments";
import type { PaymentProvider } from "../types";

const PERKS = [
  "Every subject, every module, every block",
  "Custom quiz builder across all subjects",
  "Spaced repetition across your full history",
  "Streaks, daily goals & weak-topic breakdown",
];

export default function Paywall() {
  const navigate = useNavigate();
  const isDark = useAppStore((s) => s.isDark);
  const uid = useAppStore((s) => s.uid);
  const isPremium = useIsPremium();
  const t = isDark ? THEME.dark : THEME.light;

  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly");
  const [loadingProvider, setLoadingProvider] = useState<PaymentProvider | null>(null);
  const [error, setError] = useState("");

  if (!uid) {
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center gap-4 py-16 text-center">
        <Crown size={28} color={t.gold} />
        <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 21 }}>Create a free account first</h1>
        <p style={{ color: t.textMuted, fontSize: 14 }}>Premium is tied to your account so it works across every device.</p>
        <Btn t={t} onClick={() => navigate("/signup")}>Create free account</Btn>
      </div>
    );
  }

  if (isPremium) {
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center gap-4 py-16 text-center">
        <Crown size={28} color={t.gold} />
        <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 21 }}>You're already Premium</h1>
        <Btn t={t} variant="ghost" onClick={() => navigate("/subjects")}>Back to practice</Btn>
      </div>
    );
  }

  const pay = async (provider: PaymentProvider) => {
    setError("");
    setLoadingProvider(provider);
    try {
      await startCheckout(provider, plan, uid);
      // startCheckout redirects the browser away on success, so nothing else runs here.
    } catch {
      setError(
        "Couldn't start checkout. This usually means the payment Cloud Functions haven't been deployed yet, or merchant credentials aren't configured \u2014 see functions/README.md."
      );
      setLoadingProvider(null);
    }
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div className="text-center">
        <Crown size={28} color={t.gold} className="mx-auto mb-2" />
        <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 26 }}>Go Premium</h1>
        <p style={{ color: t.textMuted, fontSize: 14, marginTop: 4 }}>Pay with JazzCash or Easypaisa \u2014 both are local wallets, no card needed.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card t={t} onClick={() => setPlan("monthly")} style={{ borderColor: plan === "monthly" ? t.purple : t.border, textAlign: "center" }}>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 14 }}>Monthly</span>
          <div style={{ fontFamily: FONT_MONO, fontSize: 22, fontWeight: 700, marginTop: 4 }}>Rs {PLAN_PRICES.monthly}</div>
          <span style={{ fontSize: 11, color: t.textFaint }}>per month</span>
        </Card>
        <Card t={t} onClick={() => setPlan("yearly")} style={{ borderColor: plan === "yearly" ? t.purple : t.border, textAlign: "center" }}>
          <div className="mb-0.5">
            <Pill t={t} tone="gold" style={{ fontSize: 10, padding: "2px 8px" }}>Best value</Pill>
          </div>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 14 }}>Yearly</span>
          <div style={{ fontFamily: FONT_MONO, fontSize: 22, fontWeight: 700, marginTop: 4 }}>Rs {PLAN_PRICES.yearly}</div>
          <span style={{ fontSize: 11, color: t.textFaint }}>~Rs {Math.round(PLAN_PRICES.yearly / 12)}/mo</span>
        </Card>
      </div>

      <Card t={t}>
        <ul className="flex flex-col gap-2">
          {PERKS.map((p) => (
            <li key={p} className="flex items-center gap-2 text-sm" style={{ color: t.textMuted }}>
              <Check size={14} color={t.green} /> {p}
            </li>
          ))}
        </ul>
      </Card>

      {error && (
        <div className="flex items-start gap-2 rounded-2xl p-3 text-xs" style={{ backgroundColor: `${t.red}18`, color: t.red }}>
          <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Btn t={t} full icon={Smartphone} disabled={!!loadingProvider} onClick={() => pay("jazzcash")}>
          {loadingProvider === "jazzcash" ? "Redirecting\u2026" : "Pay with JazzCash"}
        </Btn>
        <Btn t={t} full variant="secondary" icon={Smartphone} disabled={!!loadingProvider} onClick={() => pay("easypaisa")}>
          {loadingProvider === "easypaisa" ? "Redirecting\u2026" : "Pay with Easypaisa"}
        </Btn>
      </div>
      <p className="text-center text-xs" style={{ color: t.textFaint }}>
        You'll be redirected to {plan === "monthly" ? "JazzCash/Easypaisa" : "the gateway"} to complete payment securely. Premium activates automatically once payment is confirmed.
      </p>
    </div>
  );
}
