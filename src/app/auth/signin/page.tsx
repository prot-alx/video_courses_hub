"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import AuthLayout from "@/components/auth/AuthLayout";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import AuthFeatures from "@/components/auth/AuthFeatures";
import AuthFooter from "@/components/auth/AuthFooter";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      // NextAuth v5 signIn
      const result = await signIn("google", {
        callbackUrl: "/",
        redirect: false,
      });

      if (result?.error) {
        console.error("Sign in error:", result.error);
        alert("Ошибка входа. Попробуйте снова.");
      } else if (result?.url) {
        // Успешный вход - перенаправляем
        window.location.href = result.url;
      }
    } catch (error) {
      console.error("Sign in error:", error);
      alert("Ошибка входа. Попробуйте снова.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Добро пожаловать!"
      subtitle="Войдите в аккаунт для доступа к курсам и отслеживания прогресса"
    >
      {/* Google Sign In */}
      <GoogleSignInButton onClick={handleGoogleSignIn} isLoading={isLoading} />

      {/* Features List */}
      <AuthFeatures />

      {/* Footer Links */}
      <AuthFooter />
    </AuthLayout>
  );
}
