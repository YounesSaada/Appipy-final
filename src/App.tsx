import { Navigation } from "./components/Navigation";
import { HeroSection } from "./components/HeroSection";
import { WhatIsAppipy } from "./components/WhatIsAppipy";
import { HowItWorks } from "./components/HowItWorks";
import { FutureAddOns } from "./components/FutureAddOns";
import { PilotProgram } from "./components/PilotProgram";
import { Footer } from "./components/Footer";
import { EarnerDashboard } from "./components/EarnerDashboard";
import { AdvertiserDashboard } from "./components/AdvertiserDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { AuthPage } from "./components/AuthPage";
import { AdvertiserVerification } from "./components/AdvertiserVerification";
import { EarnerVerification } from "./components/EarnerVerification";
import { ForgotPassword } from "./components/ForgotPassword";
import { useState, useEffect } from "react";

export default function App() {
  const [showAbout, setShowAbout] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [dashboardType, setDashboardType] = useState<
    "earner" | "advertiser" | "admin"
  >("earner");

  // Check for admin access via URL parameter or keyboard shortcut
  useEffect(() => {
    // Check URL parameter: ?admin=true
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
      setDashboardType('admin');
      setShowDashboard(true);
    }

    // Keyboard shortcut: Ctrl + Shift + A
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setDashboardType('admin');
        setShowDashboard(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  console.log("App render state:", { showAbout, showDashboard, showVerification, dashboardType, showForgotPassword });

  // Show about page when user clicks About from auth page
  if (showAbout && !showDashboard && !showVerification) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <HeroSection />
        <WhatIsAppipy />
        <HowItWorks />
        <FutureAddOns />
        <PilotProgram />
        <Footer />
      </div>
    );
  }

  // Show verification page for advertisers after signup
  if (showVerification && !showDashboard) {
    if (dashboardType === "advertiser") {
      return (
        <AdvertiserVerification
          onVerificationComplete={() => {
            setShowVerification(false);
            setShowDashboard(false);
            setShowAbout(false);
          }}
        />
      );
    } else {
      return (
        <EarnerVerification
          onVerificationComplete={() => {
            setShowVerification(false);
            setShowDashboard(false);
            setShowAbout(false);
          }}
        />
      );
    }
  }

  // Show dashboard after successful auth
  if (showDashboard && dashboardType === "earner") {
    return (
      <div className="min-h-screen">
        <EarnerDashboard />
      </div>
    );
  }

  if (showDashboard && dashboardType === "advertiser") {
    return (
      <div className="min-h-screen">
        <AdvertiserDashboard />
      </div>
    );
  }

  if (showDashboard && dashboardType === "admin") {
    return (
      <div className="min-h-screen">
        <AdminDashboard 
          onLogout={() => {
            setShowDashboard(false);
            setShowAbout(false);
            setShowVerification(false);
          }}
        />
      </div>
    );
  }

  // Show forgot password page
  if (showForgotPassword) {
    return (
      <ForgotPassword
        onBackToAuth={() => {
          setShowForgotPassword(false);
        }}
      />
    );
  }

  // Default: Show auth page as main landing page
  return (
    <AuthPage
      onAboutClick={() => setShowAbout(true)}
      onAuthSuccess={(userType, isNewSignup) => {
        setDashboardType(userType);
        // If new signup (earner OR advertiser), show verification; otherwise go to dashboard
        if (isNewSignup) {
          setShowVerification(true);
        } else {
          setShowDashboard(true);
        }
      }}
      onForgotPassword={() => setShowForgotPassword(true)}
    />
  );
}