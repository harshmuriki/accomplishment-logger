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
      <div className="flex items-center space-x-3">
        <span className="text-sm font-sans text-pi-text">{user.email}</span>
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
