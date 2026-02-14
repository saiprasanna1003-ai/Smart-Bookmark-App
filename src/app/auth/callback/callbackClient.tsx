"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

export default function Callback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  useEffect(() => {
    const handleAuth = async () => {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.exchangeCodeForSession(window.location.href);

      if (sessionError) {
        console.error("OAuth Error:", sessionError.message);
        router.push("/");
        return;
      }

      const user = sessionData?.session?.user;

      if (!user) {
        router.push("/");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      // SIGNUP FLOW
      if (mode === "signup") {
        if (profile) {
          alert("Already registered. Please login.");
          router.push("/");
        } else {
          await supabase.from("profiles").insert({
            id: user.id,
            email: user.email,
          });

          alert("Registration successful! You can now access dashboard.");
          router.push("/dashboard");
        }
      }

      // LOGIN FLOW
      if (mode === "login") {
        if (!profile) {
          alert("User not found. Please sign up first.");
          router.push("/");
        } else {
          router.push("/dashboard");
        }
      }
    };

    handleAuth();
  }, [mode, router]);

  return <p className="text-center mt-10">Processing...</p>;
}