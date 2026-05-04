import { useState } from "react";
import { User, Building2, Mail, Lock, ArrowLeft, Eye, EyeOff, Loader2, Globe, HelpCircle, ArrowRight, Menu, X, Shield } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { Footer } from "./Footer";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import hero1 from "../assets/hero1.png";

interface AuthPageProps {
  onAboutClick: () => void;
  onAuthSuccess: (userType: "earner" | "advertiser" | "admin", isNewSignup: boolean) => void;
  onForgotPassword: () => void;
}

export function AuthPage({ onAboutClick, onAuthSuccess, onForgotPassword }: AuthPageProps) {
  const [view, setView] = useState<"landing" | "auth-form">("landing");
  const [isSignIn, setIsSignIn] = useState(true);
  const [selectedUserType, setSelectedUserType] = useState<"earner" | "advertiser" | "admin" | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    businessName: "",
  });

  const handleSelection = (type: "earner" | "advertiser" | "admin", mode: "signin" | "signup" = "signin") => {
    setSelectedUserType(type);
    setIsSignIn(mode === "signin");
    setView("auth-form");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!selectedUserType) {
      setError("Please select a user type");
      return;
    }

    // Validation
    if (!isSignIn) {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      if (selectedUserType === "earner" && !formData.fullName) {
        setError("Full name is required");
        return;
      }
      if (selectedUserType === "advertiser" && !formData.businessName) {
        setError("Business name is required");
        return;
      }
    }

    setIsLoading(true);

    try {
      const endpoint = isSignIn ? "signin" : "signup";
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-fe4c8b06/${endpoint}`;
      
      const payload = isSignIn 
        ? {
            email: formData.email,
            password: formData.password,
          }
        : {
            email: formData.email,
            password: formData.password,
            userType: selectedUserType,
            fullName: selectedUserType === "earner" ? formData.fullName : undefined,
            businessName: selectedUserType === "advertiser" ? formData.businessName : undefined,
          };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // Store access token for both sign in and sign up
      if (data.accessToken) {
        localStorage.setItem("appipy_access_token", data.accessToken);
        localStorage.setItem("appipy_user_type", data.userType || selectedUserType);
      }

      console.log("Auth success:", { userType: data.userType || selectedUserType, isNewSignup: !isSignIn });

      // Success!
      onAuthSuccess(data.userType || selectedUserType, !isSignIn);
    } catch (err) {
      console.error("Authentication error:", err);
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError(null);
  };

  // Uber-style Landing View
  if (view === "landing") {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans">
        {/* Navigation */}
        <header className="bg-slate-900 text-white py-4 px-6 md:px-10 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button onClick={onAboutClick} className="flex-shrink-0 cursor-pointer">
               <img src={hero1} alt="Appipy" className="h-8 md:h-10 w-auto" />
            </button>
            <nav className="hidden md:flex gap-6 text-sm font-medium">
              <button onClick={() => handleSelection("earner")} className="hover:text-gray-300">Earn</button>
              <button onClick={() => handleSelection("advertiser")} className="hover:text-gray-300">Advertise</button>
              <button onClick={onAboutClick} className="hover:text-gray-300">About</button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-4 text-sm font-medium">
                <button className="flex items-center gap-2 hover:bg-slate-800 px-3 py-2 rounded-full">
                   <Globe className="h-4 w-4" /> EN
                </button>
                <button className="flex items-center gap-2 hover:bg-slate-800 px-3 py-2 rounded-full">
                   <HelpCircle className="h-4 w-4" /> Help
                </button>
                <button 
                  onClick={() => setView("auth-form")} // Generic login, will prompt selection or use state
                  className="hover:bg-slate-800 px-3 py-2 rounded-full"
                >
                  Log in
                </button>
             </div>
             <Button 
               onClick={() => setView("auth-form")} // Sign up
               className="bg-white text-slate-900 hover:bg-gray-100 rounded-full px-4 py-1.5 font-medium text-sm border-none"
             >
               Sign up
             </Button>
             
             {/* Mobile Menu Toggle */}
             <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
             </button>
          </div>
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 text-white p-4 absolute top-16 left-0 right-0 z-50 shadow-xl border-t border-slate-800">
            <div className="flex flex-col gap-4 text-lg">
              <button onClick={() => { handleSelection("earner"); setMobileMenuOpen(false); }}>Earn</button>
              <button onClick={() => { handleSelection("advertiser"); setMobileMenuOpen(false); }}>Advertise</button>
              <button onClick={() => { onAboutClick(); setMobileMenuOpen(false); }}>About</button>
              <hr className="border-slate-800 my-2" />
              <button onClick={() => { setView("auth-form"); setMobileMenuOpen(false); }}>Log in</button>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 min-h-[500px]">
            <div className="flex flex-col justify-center px-6 md:px-20 lg:px-32 py-12 md:py-0">
               <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-8 leading-tight">
                 Log in to access your account
               </h1>
               <div className="flex flex-col gap-4">
                  <Button 
                    onClick={() => {
                        setSelectedUserType(null);
                        setView("auth-form");
                    }}
                    className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-8 py-6 text-lg rounded-lg w-fit"
                  >
                    Log in
                  </Button>
                  <Button 
                    onClick={() => {
                        onAuthSuccess("admin", false);
                    }}
                    className="bg-slate-950 hover:bg-slate-900 text-white px-8 py-6 text-lg rounded-lg w-fit flex items-center gap-2 border border-slate-800"
                  >
                    <Shield className="h-5 w-5" />
                    View Admin Dashboard
                  </Button>
               </div>
            </div>
            <div className="bg-blue-50 relative flex items-center justify-center overflow-hidden">
                {/* Image */}
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1719681113343-c65f0ce89273?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMHZlY3RvciUyMGlsbHVzdHJhdGlvbiUyMGRyaXZlciUyMHBhc3NlbmdlcnxlbnwxfHx8fDE3NzAyNjcwODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Driver and Passenger Illustration" 
                  className="w-full h-full object-cover"
                />
            </div>
          </div>

          {/* Dual Selection Section - The Black/Dark strip */}
          <div className="grid grid-cols-1 md:grid-cols-2">
            <button 
              onClick={() => handleSelection("earner")}
              className="group flex items-center justify-between p-10 md:p-16 bg-slate-900 text-white border-b md:border-b-0 md:border-r border-slate-800 hover:bg-slate-800 transition-colors text-left"
            >
              <span className="text-3xl md:text-4xl font-semibold group-hover:text-yellow-400 transition-colors">Earner</span>
              <ArrowRight className="h-8 w-8 md:h-10 md:w-10 group-hover:translate-x-2 transition-transform" />
            </button>
            
            <button 
              onClick={() => handleSelection("advertiser")}
              className="group flex items-center justify-between p-10 md:p-16 bg-slate-900 text-white hover:bg-slate-800 transition-colors text-left"
            >
              <span className="text-3xl md:text-4xl font-semibold group-hover:text-blue-400 transition-colors">Advertiser</span>
              <ArrowRight className="h-8 w-8 md:h-10 md:w-10 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // Auth Form View (Existing Logic but styled to match)
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
       {/* Simple Header for Auth Form */}
       <header className="bg-slate-900 text-white py-4 px-6 md:px-10">
         <div className="max-w-7xl mx-auto flex items-center justify-between">
           <button onClick={() => { setView("landing"); setSelectedUserType(null); }} className="flex items-center gap-2 hover:text-gray-300">
             <img src={hero1} alt="Appipy" className="h-8 w-auto" />
           </button>
           <button onClick={() => { setView("landing"); setSelectedUserType(null); }} className="text-sm font-medium hover:text-gray-300">
             <X className="h-6 w-6" />
           </button>
         </div>
       </header>

       <div className="flex-1 flex items-center justify-center p-4">
         <div className="w-full max-w-md">
            {/* If no user type selected, show selection (fallback) */}
            {!selectedUserType ? (
               <Card className="p-8">
                  <h2 className="text-2xl font-bold text-center mb-6">Select Account Type</h2>
                  <div className="space-y-4">
                     <Button 
                       onClick={() => setSelectedUserType("earner")}
                       className="w-full py-6 text-lg bg-yellow-400 hover:bg-yellow-500 text-slate-900 justify-start px-6"
                     >
                       <User className="mr-3 h-6 w-6" /> I'm an Earner
                     </Button>
                     <Button 
                       onClick={() => setSelectedUserType("advertiser")}
                       className="w-full py-6 text-lg bg-blue-700 hover:bg-blue-800 text-white justify-start px-6"
                     >
                       <Building2 className="mr-3 h-6 w-6" /> I'm an Advertiser
                     </Button>
                  </div>
               </Card>
            ) : (
               <Card className="p-8 bg-white shadow-xl border-0">
                  <div className="text-center mb-6">
                     <h1 className="text-2xl font-bold text-slate-900 mb-2">
                        {isSignIn ? "Welcome Back" : "Create Account"}
                     </h1>
                     <p className="text-slate-500">
                        {selectedUserType === "earner" ? "Earner Dashboard" : selectedUserType === "advertiser" ? "Advertiser Dashboard" : "Admin Dashboard"}
                     </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {!isSignIn && selectedUserType !== "admin" && (
                      <div>
                        <Label htmlFor="fullName" className="text-slate-700">
                          {selectedUserType === "earner" ? "Full Name" : "Business Name"}
                        </Label>
                        <Input
                          id="fullName"
                          name={selectedUserType === "earner" ? "fullName" : "businessName"}
                          type="text"
                          placeholder={selectedUserType === "earner" ? "John Doe" : "Your Business LLC"}
                          value={selectedUserType === "earner" ? formData.fullName : formData.businessName}
                          onChange={handleInputChange}
                          required
                          className="mt-2"
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="email" className="text-slate-700">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="password" className="text-slate-700">Password</Label>
                      <div className="relative mt-2">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    {!isSignIn && (
                      <div>
                        <Label htmlFor="confirmPassword" className="text-slate-700">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                          className="mt-2"
                        />
                      </div>
                    )}

                    <Button
                      type="submit"
                      className={`w-full py-6 text-lg ${
                        selectedUserType === "earner"
                          ? "bg-yellow-400 hover:bg-yellow-500 text-slate-900"
                          : "bg-blue-700 hover:bg-blue-800 text-white"
                      }`}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        isSignIn ? "Log In" : "Sign Up"
                      )}
                    </Button>

                    <div className="flex items-center justify-between text-sm pt-2">
                       <button type="button" onClick={() => setIsSignIn(!isSignIn)} className="text-blue-700 hover:underline">
                          {isSignIn ? "New to Appipy? Sign up" : "Already have an account? Log in"}
                       </button>
                       {isSignIn && (
                          <button 
                            type="button" 
                            onClick={onForgotPassword}
                            className="text-slate-500 hover:text-slate-700"
                          >
                             Forgot password?
                          </button>
                       )}
                    </div>
                  </form>
                  
                  {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded mt-4 text-sm text-center">
                       {error}
                    </div>
                  )}
               </Card>
            )}
         </div>
       </div>
    </div>
  );
}