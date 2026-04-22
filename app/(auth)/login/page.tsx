import { LoginCard } from "@/components/auth/login-card";

export default function LoginPage({
  searchParams
}: {
  searchParams?: { error?: string };
}) {
  return <LoginCard error={searchParams?.error} />;
}
