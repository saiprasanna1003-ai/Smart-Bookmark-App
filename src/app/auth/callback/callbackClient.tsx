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
      // Let Supabase detect session automatically
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

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