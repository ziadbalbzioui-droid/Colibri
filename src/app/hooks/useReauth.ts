import { useState, useRef, useCallback } from "react";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";

export function useReauth() {
  const { user } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetVerified = useCallback(() => {
    setIsVerified(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const verifyPassword = useCallback(async (password: string): Promise<boolean> => {
    if (!user?.email) return false;
    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    });
    if (error) return false;
    setIsVerified(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsVerified(false), 5 * 60 * 1000);
    return true;
  }, [user?.email]);

  return { isVerified, verifyPassword, resetVerified };
}
