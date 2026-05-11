import { useState, useRef, useCallback } from "react";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";

export function useEmailOTP() {
  const { user } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetVerified = useCallback(() => {
    setIsVerified(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const sendOTP = useCallback(async () => {
    if (!user?.email) throw new Error("No email");
    const { error } = await supabase.auth.signInWithOtp({
      email: user.email,
      options: { shouldCreateUser: false },
    });
    if (error) throw error;
  }, [user?.email]);

  const verifyOTP = useCallback(async (code: string): Promise<boolean> => {
    if (!user?.email) return false;
    const { error } = await supabase.auth.verifyOtp({
      email: user.email,
      token: code,
      type: "email",
    });
    if (error) return false;
    setIsVerified(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsVerified(false), 5 * 60 * 1000);
    return true;
  }, [user?.email]);

  return { isVerified, sendOTP, verifyOTP, resetVerified };
}
