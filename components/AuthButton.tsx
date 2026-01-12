import React, { useState } from "react";
import { User } from "firebase/auth";
import {
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
} from "../services/firebase";

interface AuthButtonProps {
  user: User | null;
  onAuthChange: () => void;
}

const AuthButton: React.FC<AuthButtonProps> = ({ user, onAuthChange }) => {
  const [showForm, setShowForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showUserId, setShowUserId] = useState(false);
  const [copied, setCopied] = useState(false);

  const getErrorMessage = (error: any): string => {
    const code = error?.code || "";
    
    switch (code) {
      case "auth/invalid-credential":
        return isSignUp
          ? "This email is already registered. Try signing in instead."
          : "Invalid email or password. Please check your credentials.";
      case "auth/user-not-found":
        return "No account found with this email. Try signing up instead.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/email-already-in-use":
        return "This email is already registered. Try signing in instead.";
      case "auth/weak-password":
        return "Password is too weak. Please use at least 6 characters.";
      case "auth/invalid-email":
        return "Invalid email address. Please check your email format.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      default:
        return error?.message || "Authentication failed. Please try again.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      setShowForm(false);
      setEmail("");
      setPassword("");
      onAuthChange();
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      onAuthChange();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleCopyUserId = async () => {
    if (!user?.uid) return;
    
    try {
      await navigator.clipboard.writeText(user.uid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = user.uid;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        console.error("Failed to copy:", e);
      }
      document.body.removeChild(textArea);
    }
  };

  // Google Sign-In handler (commented out)
  // const handleSignIn = async () => {
  //   try {
  //     await signInWithGoogle();
  //     onAuthChange();
  //   } catch (error) {
  //     console.error("Sign in error:", error);
  //   }
  // };

  if (user) {
    return (
      <div className="flex items-center space-x-2 md:space-x-3">
        <div className="relative">
          <button
            onClick={() => setShowUserId(!showUserId)}
            className="text-xs font-sans text-pi-secondary hover:text-pi-accent transition-colors px-2 py-1 border border-pi-hover rounded-full hover:border-pi-accent flex items-center space-x-1"
            title="Click to show User ID"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span className="hidden md:inline">ID</span>
          </button>
          
          {showUserId && (
            <div className="absolute right-0 top-full mt-2 bg-white border border-pi-hover rounded-lg shadow-lg p-3 z-50 min-w-[200px] md:min-w-[300px]">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-sans font-medium text-pi-text">
                  User ID:
                </span>
                <button
                  onClick={() => setShowUserId(false)}
                  className="text-pi-secondary hover:text-pi-text text-xs"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <code className="text-xs font-mono text-pi-text bg-pi-bg px-2 py-1 rounded break-all">
                  {user.uid}
                </code>
                <button
                  onClick={handleCopyUserId}
                  className="flex-shrink-0 text-xs font-sans text-pi-accent hover:text-[#08422D] transition-colors px-2 py-1 border border-pi-accent rounded hover:bg-pi-accent/10"
                >
                  {copied ? "✓ Copied!" : "Copy"}
                </button>
              </div>
              <p className="text-[10px] text-pi-secondary font-sans">
                Use this ID in your Apple Shortcut
              </p>
            </div>
          )}
        </div>
        
        <span className="text-sm font-sans text-pi-text hidden md:inline">
          {user.email}
        </span>
        <button
          onClick={handleSignOut}
          className="text-xs font-sans text-pi-secondary hover:text-pi-accent transition-colors px-3 py-1 border border-pi-hover rounded-full hover:border-pi-accent"
        >
          Sign Out
        </button>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="relative">
        <form
          onSubmit={handleSubmit}
          className="absolute right-0 top-0 mt-2 bg-white border border-pi-hover rounded-lg shadow-lg p-4 w-64 z-50"
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-serif text-sm font-bold text-pi-text">
              {isSignUp ? "Sign Up" : "Sign In"}
            </h3>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setError("");
                setEmail("");
                setPassword("");
              }}
              className="text-pi-secondary hover:text-pi-text"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="mb-3 text-xs text-red-600 font-sans">{error}</div>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-2 px-3 py-2 border border-pi-hover rounded text-sm font-sans text-pi-text focus:outline-none focus:border-pi-accent"
            required
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-3 px-3 py-2 border border-pi-hover rounded text-sm font-sans text-pi-text focus:outline-none focus:border-pi-accent"
            required
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full mb-2 px-4 py-2 bg-pi-accent text-white rounded text-sm font-sans hover:bg-[#08422D] transition-colors disabled:opacity-50"
          >
            {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            className="w-full text-xs text-pi-secondary hover:text-pi-accent font-sans"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="px-4 py-2 bg-white border border-pi-hover rounded-full text-sm font-sans text-pi-text hover:border-pi-accent hover:text-pi-accent transition-all shadow-sm"
    >
      Sign In
    </button>
  );
};

export default AuthButton;
