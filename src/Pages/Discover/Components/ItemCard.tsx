import { useEffect, useState } from "react";
import "./ItemCard.css";

/* ================= TYPES ================= */

type Container = {
  id: number;
  name: string;
  description?: string | null;
  imageURL?: string | null;
  owner: number;
  currentBid?: number | null; // Bid-ID
};

type Bid = {
  id: number;
  containerId: number;
  userId: number;
  value: number; // Geldbetrag
};

type Props = {
  containerId?: number;
};

/* ================= COMPONENT ================= */

export default function ItemCard({ containerId }: Props) {
  const [container, setContainer] = useState<Container | null>(null);
  const [bidValue, setBidValue] = useState<number | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerId) {
      setContainer(null);
      setBidValue(null);
      setLoading(false);
      setError(null);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        setBidValue(null);

        // 1) Container holen
        const res = await fetch(`http://localhost:8080/containers/${containerId}`);
        if (!res.ok) throw new Error("Container not found");
        const containerData = (await res.json()) as Container;
        setContainer(containerData);

        // 2) Aktuellen Bid holen (value)
        if (containerData.currentBid) {
          const bidRes = await fetch(
            `http://localhost:8080/bids/${containerData.currentBid}`
          );
          if (!bidRes.ok) throw new Error("Bid not found");
          const bidData = (await bidRes.json()) as Bid;
          setBidValue(bidData.value);
        }

        setLoading(false);
      } catch (err: unknown) {
        setContainer(null);
        setBidValue(null);
        setError(err instanceof Error ? err.message : "Unknown error");
        setLoading(false);
      }
    };

    load();
  }, [containerId]);

  /* ================= STATES ================= */

  if (loading) return <ItemCardSkeleton />;
  if (error) return <div className="item-card error">{error}</div>;

  if (!container) {
    return (
      <div className="item-card empty">
        <div className="empty-text">No item available</div>
      </div>
    );
  }

  /* ================= RENDER ================= */

  return (
    <div className="item-card">
      <img
        src={container.imageURL ?? "/placeholder.png"}
        alt={container.name}
        className="item-image"
      />

      <div className="item-content">
        <h2>{container.name}</h2>
        <p className="description">{container.description ?? ""}</p>

        <div className="meta">
          <span>Owner ID: {container.owner}</span>
          <span>
            Gebot: {bidValue !== null ? `${bidValue} CHF` : "No bids yet"}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ================= SKELETON ================= */

function ItemCardSkeleton() {
  return (
    <div className="item-card skeleton">
      <div className="skeleton-image" />
      <div className="item-content">
        <div className="skeleton-title" />
        <div className="skeleton-text" />
        <div className="skeleton-text short" />
        <div className="skeleton-meta" />
      </div>
    </div>
  );
}
