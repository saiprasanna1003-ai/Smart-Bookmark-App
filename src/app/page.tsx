"use client";

import { supabase } from "@/lib/supabase";

export default function Home() {

  // const signup = async () => {
  //   await supabase.auth.signOut();
  //   await supabase.auth.signInWithOAuth({
  //     provider: "google",
  //     options: {
  //       redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?mode=signup`,
  //     },
  //   });
  // };
  
  const signup = async () => {
  const redirectUrl = `${window.location.origin}/auth/callback?mode=signup`;
  console.log("Redirect URL:", redirectUrl);

  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl,
    },
  });
};

 const login = async () => {
    const redirectUrl = `${window.location.origin}/auth/callback?mode=login`;
  console.log("Redirect URL:", redirectUrl);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });
  };
  // const login = async () => {
  //   await supabase.auth.signOut();
  //   await supabase.auth.signInWithOAuth({
  //     provider: "google",
  //     options: {
  //       redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?mode=login`,
  //     },
  //   });
  // };

  return (
    <div className="h-screen bg-white text-center">
      <h1 className="text-blue-500 text-5xl pt-16 pb-8">
        Smart Bookmark App
      </h1>

      <div className="flex flex-col gap-3 items-center">
        <button
          onClick={signup}
          className="w-[250px] px-4 py-2 bg-green-500 text-white rounded-[20px]"
        >
          Sign up with Google
        </button>

        <button
          onClick={login}
          className="w-[250px] px-4 py-2 bg-blue-500 text-white rounded-[20px]"
        >
          Login with Google
        </button>
      </div>
    </div>
  );
}