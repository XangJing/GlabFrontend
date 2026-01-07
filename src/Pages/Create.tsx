import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateContainerPage.css";

type User = {
  id: number;
  name: string;
  email: string;
};

const API_BASE = "http://localhost:8080";

export default function CreateContainerPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageURL, setImageURL] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    setUser(raw ? JSON.parse(raw) : null);
  }, []);

  const onCancel = () => navigate(-1);

  const onCreate = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!name.trim()) {
      setError("Name ist erforderlich");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE}/containers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          imageURL: imageURL.trim() || null,
          owner: user.id,
          currentBid: null,
        }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `Create failed (${res.status})`);
      }

      navigate(-1);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-page">
      <h1 className="create-title">Insert new Container</h1>

      <div className="create-card">
        <div className="field">
          <label>Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Value"
          />
        </div>

        <div className="field">
          <label>Beschreibung</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Value"
            rows={5}
          />
        </div>

        <div className="field">
          <label>Lade Bilder hoch</label>
          <input
            value={imageURL}
            onChange={(e) => setImageURL(e.target.value)}
            placeholder="Bild-URL (string)"
          />
        </div>

        {error && <div className="error">{error}</div>}

        <div className="actions">
          <button
            className="btn dark"
            onClick={onCreate}
            disabled={loading}
            type="button"
          >
            Create
          </button>

          <button
            className="btn light"
            onClick={onCancel}
            disabled={loading}
            type="button"
          >
            Cancel
          </button>
        </div>

        {!user && (
          <div className="hint">
            Du musst eingeloggt sein, um zu erstellen.
          </div>
        )}
      </div>
    </div>
  );
}
