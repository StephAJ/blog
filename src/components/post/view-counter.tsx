"use client";

import { useEffect } from "react";

/**
 * Records one view per post per browser session. Renders nothing.
 */
export function ViewCounter({ postId }: { postId: number }) {
  useEffect(() => {
    const key = `viewed:${postId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    const timer = setTimeout(() => {
      fetch(`/api/views/${postId}`, { method: "POST", keepalive: true }).catch(
        () => {},
      );
    }, 4000);

    return () => clearTimeout(timer);
  }, [postId]);

  return null;
}
