import React, { useState } from "react";
import { Mail, Eye, EyeOff, ArrowRight, Shield, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const SignInPage = () => {
  const { requestLoginOtp, verifyLoginOtp, resendOtp } = useAuth();
  
  const [step, setStep] = useState("email"); // 'email' or 'otp'
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError("");

    try {
      await requestLoginOtp(email);
      setOtpSent(true);
      setStep("otp");
    } catch (error: any) {
      setError(error.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.querySelector(
          `input[data-index="${index + 1}"]`
        ) as HTMLInputElement;
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    
    if (otpString.length !== 6) {
      setError("Please enter the complete OTP");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await verifyLoginOtp(email, otpString);
      // Authentication successful - your App.jsx will automatically redirect
      console.log("Sign in successful!");
    } catch (error: any) {
      setError(error.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError("");

    try {
      await resendOtp(email, 'login');
      alert("OTP resent successfully!");
    } catch (error: any) {
      setError(error.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep("email");
    setOtp(["", "", "", "", "", ""]);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center px-4 py-8 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(99 102 241) 1px, transparent 0)`,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl mx-auto">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="px-6 sm:px-8 lg:px-10 pt-6 sm:pt-8 lg:pt-10 pb-4 sm:pb-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                {step === "email"
                  ? "Sign in to your marketplace account"
                  : "Enter the verification code sent to your email"}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 sm:mx-8 lg:mx-10 mb-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="px-6 sm:px-8 lg:px-10 pb-6 sm:pb-8 lg:pb-10">
            {step === "email" ? (
              <form onSubmit={handleEmailSubmit} className="space-y-4 sm:space-y-6">
                {/* Email Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base bg-white"
                      placeholder="Enter your email"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white py-3 sm:py-4 px-6 rounded-lg sm:rounded-xl font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Continue with Email</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Email Display */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4 sm:mb-6 px-2">
                    We sent a verification code to{" "}
                    <span className="font-medium text-gray-900 break-all">{email}</span>
                  </p>
                </div>

                <form onSubmit={handleOtpSubmit}>
                  {/* OTP Input */}
                  <div className="space-y-2 mb-6">
                    <label className="block text-sm font-medium text-gray-700 text-center sm:text-left">
                      Verification Code
                    </label>
                    <div className="flex justify-center gap-2 sm:gap-3">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          type="text"
                          inputMode="numeric"
                          data-index={index}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-center text-base sm:text-lg lg:text-xl font-semibold border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
                          maxLength={1}
                          disabled={isLoading}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Verify Button */}
                  <button
                    type="submit"
                    disabled={isLoading || otp.some((digit) => !digit)}
                    className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white py-3 sm:py-4 px-6 rounded-lg sm:rounded-xl font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2 text-sm sm:text-base mb-4"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Verify & Sign In</span>
                        <Shield className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Resend OTP */}
                <div className="text-center">
                  <button
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200 disabled:opacity-50"
                  >
                    Didn't receive code? Resend
                  </button>
                </div>

                {/* Back Button */}
                <button
                  onClick={handleBackToEmail}
                  disabled={isLoading}
                  className="w-full text-gray-600 hover:text-gray-800 py-2 font-medium transition-colors duration-200 text-sm sm:text-base disabled:opacity-50"
                >
                  ← Back to email
                </button>
              </div>
            )}

            {/* Sign Up Link */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <a
                  href="/signup" // Update with your route
                  className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
                >
                  Sign up for free
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-4 sm:mt-6 text-center">
          <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-4 lg:gap-6 text-xs sm:text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Secure</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full hidden sm:block"></div>
            <div className="flex items-center space-x-1">
              <span>256-bit SSL</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full hidden sm:block"></div>
            <div className="flex items-center space-x-1">
              <span>GDPR Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;