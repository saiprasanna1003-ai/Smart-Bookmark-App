"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const router = useRouter();

  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  // Protect route + get user safely
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/");
        return;
      }

      setUserId(data.user.id);
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          router.push("/");
        } else {
          setUserId(session.user.id);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);

  // Fetch bookmarks when user ready
  useEffect(() => {
    if (!userId) return;
    fetchBookmarks(userId);
  }, [userId]);

  const fetchBookmarks = async (uid: string) => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    setBookmarks(data || []);
  };

  // REALTIME SUBSCRIPTION
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("realtime-bookmarks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {

          if (payload.eventType === "INSERT") {
            setBookmarks((prev) => [payload.new, ...prev]);
          }

          if (payload.eventType === "DELETE") {
            setBookmarks((prev) =>
              prev.filter((b) => b.id !== payload.old.id)
            );
          }

          if (payload.eventType === "UPDATE") {
            setBookmarks((prev) =>
              prev.map((b) =>
                b.id === payload.new.id ? payload.new : b
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Add bookmark
  const addBookmark = async () => {
    if (!title || !url || !userId) return;

    await supabase.from("bookmarks").insert([
      {
        title,
        url,
        user_id: userId,
      },
    ]);

    setTitle("");
    setUrl("");
  };

  // Delete bookmark
  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);
  };

  return (
    <div className="h-screen p-6 text-center bg-white text-black">
      <div className="max-w-2xl justify-self-center">
          <h1 className="text-2xl font-bold">My Bookmarks</h1>

        <div className="flex gap-2 mb-6">
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 rounded w-1/3"
          />
          <input
            placeholder="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="border p-2 rounded w-2/3"
          />
          <button
            onClick={addBookmark}
            className="bg-blue-600 text-white px-4 rounded"
          >
            Add
          </button>
        </div>

        <ul className="space-y-3">
          {bookmarks.map((b) => (
            <li
              key={b.id}
              className="flex justify-between items-center border p-3 rounded"
            >
              <a
                href={b.url}
                target="_blank"
                className="text-blue-600 underline"
              >
                {b.title}
              </a>
              <button
                onClick={() => deleteBookmark(b.id)}
                className="text-red-500"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}