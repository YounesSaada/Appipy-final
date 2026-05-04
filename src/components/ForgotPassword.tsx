import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { ArrowLeft, Mail, CheckCircle2, Loader2, AlertCircle, Lock, Eye, EyeOff } from "lucide-react";
import hero1 from "../assets/hero1.png";
import { projectId } from "../utils/supabase/info";

interface ForgotPasswordProps {
  onBackToAuth: () => void;
}

export function ForgotPassword({ onBackToAuth }: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!newPassword) {
      setError("Please enter a new password");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-fe4c8b06/reset-password`;
      
      console.log("Sending password reset request to:", url);
      console.log("Request payload:", { email, newPassword: "***hidden***" });
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          newPassword: newPassword,
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);
      
      const data = await response.json();
      console.log("Response data:", data);

      // Check for error in response data, even if status is OK
      if (data.error && !data.success) {
        console.error("Password reset failed with error:", data.error);
        throw new Error(data.error);
      }

      if (!response.ok) {
        console.error("Password reset failed with non-OK status:", data);
        throw new Error(data.error || "Failed to reset password");
      }

      console.log("Password reset successful:", data);
      setIsSuccess(true);

      // Redirect to auth page after 2 seconds
      setTimeout(() => {
        onBackToAuth();
      }, 2000);
    } catch (err) {
      console.error("Password reset error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to reset password. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success View
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
        <Card className="p-8 md:p-12 bg-white shadow-2xl border-0 max-w-md w-full">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <img src={hero1} alt="Appipy" className="h-12 w-auto" />
            </div>

            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-blue-900 mb-4">
              Password Reset Successful!
            </h1>

            <p className="text-lg text-blue-700 mb-6">
              Your password has been updated successfully. Redirecting you to sign in...
            </p>

            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Form View
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
      <Card className="p-8 md:p-12 bg-white shadow-2xl border-0 max-w-md w-full">
        <div className="mb-8">
          <button
            onClick={onBackToAuth}
            className="flex items-center gap-2 text-blue-700 hover:text-blue-900 font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Sign In
          </button>

          <div className="flex justify-center mb-6">
            <img src={hero1} alt="Appipy" className="h-12 w-auto" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 text-center mb-3">
            Reset Password
          </h1>
          <p className="text-lg text-blue-700 text-center">
            Enter your email and choose a new password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email" className="text-blue-900 font-medium">
              Email Address
            </Label>
            <div className="relative mt-2">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                className="pl-11 bg-blue-50 border-blue-200 focus:border-yellow-400 focus:ring-yellow-400"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="newPassword" className="text-blue-900 font-medium">
              New Password
            </Label>
            <div className="relative mt-2">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400 z-10" />
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError("");
                }}
                className="pl-11 pr-11 bg-blue-50 border-blue-200 focus:border-yellow-400 focus:ring-yellow-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-600 z-10"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <Label
              htmlFor="confirmPassword"
              className="text-blue-900 font-medium"
            >
              Confirm New Password
            </Label>
            <div className="relative mt-2">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400 z-10" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
                className="pl-11 pr-11 bg-blue-50 border-blue-200 focus:border-yellow-400 focus:ring-yellow-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-600 z-10"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-700 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-900">
                  <p className="font-semibold mb-1">Error</p>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-700 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Password Requirements</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>At least 8 characters long</li>
                  <li>Should be unique and not easily guessable</li>
                  <li>Consider using a mix of letters, numbers, and symbols</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-6 text-lg bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold disabled:bg-blue-200 disabled:text-blue-400"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Resetting Password...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}