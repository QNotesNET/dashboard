import { Suspense } from "react";
import LoginForm from "./LoginForm";
import RegisterDecision from "./RegisterDecision";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const next = typeof searchParams.next === "string" ? searchParams.next : "/";
  const step = typeof searchParams.step === "string" ? searchParams.step : null;

  // Nur zeigen, wenn auf register-notebook UND noch keine Entscheidung getroffen
  const showDecision =
    next.includes("/register-notebook") &&
    step !== "login" &&
    step !== "register";

  return (
    <Suspense
      fallback={
        <div className="min-h-dvh grid place-items-center p-6">Lädt…</div>
      }
    >
      {showDecision ? <RegisterDecision next={next} /> : <LoginForm />}
    </Suspense>
  );
}
