import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

type LoginResponse = {
  id: number;
  name: string;
  email: string;
};

const API_BASE = "http://localhost:8080";
const LS_USER_KEY = "user";

export default function LoginPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "register">("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveUser = (user: LoginResponse) => {
    localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Login failed");

      const user = (await res.json()) as LoginResponse;
      saveUser(user);

      navigate(-1);
    } catch (e: any) {
      setError(e.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!name.trim()) {
        setError("Name is required");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) throw new Error("Register failed");

      const user = (await res.json()) as LoginResponse;
      saveUser(user);

      navigate(-1);
    } catch (e: any) {
      setError(e.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const continueWithoutLogin = () => {
    localStorage.removeItem(LS_USER_KEY);
    navigate(-1);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (mode === "login") handleLogin();
    else handleRegister();
  };

  return (
    <div className="login-page">
      <h1 className="login-title">Log in</h1>

      <form className="login-card" onSubmit={onSubmit}>
        {mode === "register" && (
          <div className="field">
            <label>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
            />
          </div>
        )}

        <div className="field">
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
        </div>

        <div className="field">
          <label>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
          />
        </div>

        {error && <div className="error">{error}</div>}

        <button
          type="button"
          className="ghost"
          onClick={continueWithoutLogin}
          disabled={loading}
        >
          Ohne login fortfahren
        </button>

        <div className="actions">
          <button
            type="submit"
            className={mode === "login" ? "btn light" : "btn dark"}
            onClick={() => setMode("login")}
            disabled={loading}
          >
            Sign in
          </button>

          <button
            type="submit"
            className={mode === "register" ? "btn dark" : "btn light"}
            onClick={() => setMode("register")}
            disabled={loading}
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
}
