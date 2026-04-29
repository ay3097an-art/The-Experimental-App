import { RosterViewPage } from "./pages/RosterViewPage";
import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LandingPage } from "./pages/LandingPage";
import { AuthPage } from "./pages/AuthPage";
import { Dashboard } from "./pages/Dashboard";
import { RosterWorkspace } from "./pages/RosterWorkspace";


function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState("landing"); // landing, signup, signin, dashboard, workspace
  const [isGuest, setIsGuest] = useState(false);
  const [selectedRoster, setSelectedRoster] = useState<any>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  // If user is authenticated, redirect to dashboard
  if (
    user &&
    currentPage !== "dashboard" &&
    currentPage !== "workspace" &&
    currentPage !== "view-roster"
  ) {
    setCurrentPage("dashboard");
  }

  if (currentPage === "landing") {
    return (
      <LandingPage
        onGuestClick={() => {
          setIsGuest(true);
          setCurrentPage("workspace");
        }}
        onSignUpClick={() => setCurrentPage("signup")}
        onSignInClick={() => setCurrentPage("signin")}
      />
    );
  }

  if (currentPage === "signup") {
    return (
      <AuthPage
        isSignUp={true}
        onBackClick={() => setCurrentPage("landing")}
        onAuthSuccess={() => setCurrentPage("dashboard")}
      />
    );
  }
  
  if (currentPage === "signin") {
    return (
      <AuthPage
        isSignUp={false}
        onBackClick={() => setCurrentPage("landing")}
        onAuthSuccess={() => setCurrentPage("dashboard")}
      />
    );
  }
  if (currentPage === "dashboard") {
    return (
      <Dashboard
  onCreateRoster={() => setCurrentPage("workspace")}
  onLogout={() => {
    setCurrentPage("landing");
    setIsGuest(false);
  }}
  onOpenRoster={(roster) => {
    setSelectedRoster(roster);
    setCurrentPage("view-roster");
  }}
/>
    );
  }
  if (currentPage === "view-roster") {
    return (
      <RosterViewPage
        roster={selectedRoster}
        onReturnDashboard={() => {
          setCurrentPage("dashboard");
          setSelectedRoster(null);
        }}
      />
    );
  }
  if (currentPage === "workspace") {
    return (
      <RosterWorkspace
        isGuest={isGuest}
        onReturnHome={() => {
          setCurrentPage("landing");
          setIsGuest(false);
        }}
      />
    );
  }

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
