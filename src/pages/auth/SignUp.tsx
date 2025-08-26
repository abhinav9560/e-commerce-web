import React, { useState } from "react";
import {
  Mail,
  User,
  ArrowRight,
  Shield,
  Check,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const SignUpPage = () => {
  const { requestSignupOtp, verifySignupOtp, resendOtp } = useAuth();

  const [step, setStep] = useState("details"); // 'details' or 'otp'
  const [formData, setFormData] = useState({
    email: "",
  });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !agreedToTerms) return;

    setIsLoading(true);
    setError("");

    try {
      await requestSignupOtp(formData.email);
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

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setError("Please enter the complete OTP");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await verifySignupOtp(
        formData.email,
        otpString,
      );
      // Account created successfully - your App.jsx will automatically redirect
      console.log("Account created successfully!");
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
      await resendOtp(formData.email, "signup");
      alert("OTP resent successfully!");
    } catch (error: any) {
      setError(error.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToDetails = () => {
    setStep("details");
    setOtp(["", "", "", "", "", ""]);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(168 85 247) 1px, transparent 0)`,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-xl">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="px-6 sm:px-8 lg:px-10 pt-8 sm:pt-10 pb-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-6">
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                Create Account
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                {step === "details"
                  ? "Sign up to get started"
                  : "Verify your email to complete registration"}
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
          <div className="px-6 sm:px-8 lg:px-10 pb-8 sm:pb-10">
            {step === "details" ? (
              <form onSubmit={handleSignUpSubmit} className="space-y-6">
                {/* Email Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                      <Mail className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="w-full pl-12 pr-4 py-3 sm:py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                      placeholder="Enter your email"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-3">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="text-sm">
                    <label className="text-gray-700">
                      I agree to the{" "}
                      <a
                        href="#"
                        className="text-purple-600 hover:text-purple-800 font-medium"
                      >
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a
                        href="#"
                        className="text-purple-600 hover:text-purple-800 font-medium"
                      >
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                </div>

                {/* Sign Up Button */}
                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    !formData.email ||
                    !agreedToTerms
                  }
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 sm:py-4 px-6 rounded-xl font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Sign Up</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Email Display */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-6">
                    We sent a verification code to{" "}
                    <span className="font-medium text-gray-900">
                      {formData.email}
                    </span>
                  </p>
                </div>

                <form onSubmit={handleVerifySubmit}>
                  {/* OTP Input */}
                  <div className="space-y-2 mb-6">
                    <label className="text-sm font-medium text-gray-700">
                      Verification Code
                    </label>
                    <div className="flex justify-center space-x-2 sm:space-x-3">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          type="text"
                          inputMode="numeric"
                          data-index={index}
                          value={digit}
                          onChange={(e) =>
                            handleOtpChange(index, e.target.value)
                          }
                          className="w-12 h-12 sm:w-14 sm:h-14 text-center text-lg sm:text-xl font-semibold border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
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
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 sm:py-4 px-6 rounded-xl font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2 mb-4"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Verify & Create Account</span>
                        <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Resend OTP */}
                <div className="text-center">
                  <button
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors duration-200 disabled:opacity-50"
                  >
                    Didn't receive code? Resend
                  </button>
                </div>

                {/* Back Button */}
                <button
                  onClick={handleBackToDetails}
                  disabled={isLoading}
                  className="w-full text-gray-600 hover:text-gray-800 py-2 font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  ← Back to details
                </button>
              </div>
            )}

            {/* Sign In Link */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <a
                  href="/signin"
                  className="text-purple-600 hover:text-purple-800 font-medium transition-colors duration-200"
                >
                  Sign In
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <Shield className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-xs text-gray-600 font-medium">Secure</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <Check className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-xs text-gray-600 font-medium">Verified</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <User className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-xs text-gray-600 font-medium">Trusted</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
