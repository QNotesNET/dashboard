import { Suspense } from "react";
import LoginForm from "./LoginForm";
import RegisterDecision from "./RegisterDecision";

export default async function LoginPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { searchParams } = await props; // ✅ Promise auflösen
  // @ts-expect-error ---
  const next = typeof searchParams.next === "string" ? searchParams.next : "/";
  // @ts-expect-error ---
  const step = typeof searchParams.step === "string" ? searchParams.step : null;

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
