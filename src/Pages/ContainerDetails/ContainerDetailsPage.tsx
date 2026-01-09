import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import "./ContainerDetails.css"
import GlabButton from "../../components/glab/GlabButton"

type Container = {
  id: number
  name: string
  description?: string | null
  imageURL?: string | null
  owner: number
  currentBid?: number | null
}

type Bid = {
  id: number
  containerId: number
  userId: number
  value: number
}

type User = {
  id: number
  name: string
  email: string
}

const API_BASE = "http://localhost:8080"
const ONLINE_PLACEHOLDER =
  "https://via.placeholder.com/900x500.png?text=No+Image"

export default function ContainerDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [container, setContainer] = useState<Container | null>(null)
  const [currentBidValue, setCurrentBidValue] = useState<number>(0)
  const [user, setUser] = useState<User | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imgSrc, setImgSrc] = useState(ONLINE_PLACEHOLDER)

  const [showBidInput, setShowBidInput] = useState(false)
  const [bidInput, setBidInput] = useState<string>("")
  const [bidError, setBidError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem("user")
    setUser(raw ? JSON.parse(raw) : null)
  }, [])

  useEffect(() => {
    if (!id) return

    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`${API_BASE}/containers/${id}`)
        if (!res.ok) throw new Error("Container not found")
        const c = (await res.json()) as Container

        setContainer(c)
        setImgSrc(c.imageURL || ONLINE_PLACEHOLDER)

        if (c.currentBid) {
          const bidRes = await fetch(`${API_BASE}/bids/${c.currentBid}`)
          if (bidRes.ok) {
            const bid = (await bidRes.json()) as Bid
            setCurrentBidValue(bid.value)
          }
        }

        setLoading(false)
      } catch (e: any) {
        setError(e.message ?? "Unknown error")
        setLoading(false)
      }
    }

    load()
  }, [id])

  const handleBidClick = async () => {
    if (!user) {
      navigate("/login")
      return
    }

    if (!showBidInput) {
      setShowBidInput(true)
      setBidInput("")
      setBidError(null)
      return
    }

    const value = Number(bidInput)

    if (isNaN(value) || value <= 0) {
      setBidError("Bitte gültigen Betrag eingeben")
      return
    }

    if (value <= currentBidValue) {
      setBidError(`Gebot muss größer als ${currentBidValue} CHF sein`)
      return
    }

    try {
      setSubmitting(true)
      setBidError(null)

      const res = await fetch(
        `${API_BASE}/users/${user.id}/bid`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            containerId: container!.id,
            money: value,
          }),
        }
      )

      if (!res.ok) throw new Error("Bieten fehlgeschlagen")

      setShowBidInput(false)
      setBidInput("")
      window.location.reload()
    } catch (e: any) {
      setBidError(e.message ?? "Fehler beim Bieten")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="details-page" />

  if (error || !container)
    return (
      <GlabButton
        text="← Zurück"
        variant="text"
        onClick={() => navigate(-1)}
      />
    )

  return (
    <div className="details-page">
      <div className="details-inner">
        <div className="left-col">
          <GlabButton
            text="← Zurück"
            variant="text"
            onClick={() => navigate(-1)}
          />

          <div className="image-block">
            <img
              className="hero-image"
              src={imgSrc}
              alt={container.name}
              onError={() => setImgSrc(ONLINE_PLACEHOLDER)}
            />

            <div className="thumb-strip">
              <GlabButton
                text="←"
                variant="text"
              />
              <div className="thumb" />
              <div className="thumb" />
              <div className="thumb" />
              <div className="thumb" />
              <GlabButton
                text="→"
                variant="text"
              />
            </div>
          </div>

          <div className="description-box">
            {container.description ?? ""}
          </div>
        </div>

        <div className="right-col">
          <div className="side-card">
            <div className="side-title">{container.name}</div>
            <div className="side-sep" />

            <div className="side-row">
              <span>Gebot</span>
              <strong>{currentBidValue} CHF</strong>
            </div>

            {showBidInput && (
              <input
                className="bid-input"
                type="number"
                placeholder="Dein Gebot (CHF)"
                value={bidInput}
                onChange={(e) => setBidInput(e.target.value)}
              />
            )}

            {bidError && <div className="bid-error">{bidError}</div>}

            <GlabButton
              text={user ? "Bieten" : "Einloggen zum Bieten"}
              variant="primary"
              disabled={submitting}
              onClick={handleBidClick}
            />

            <GlabButton
              text="zu Favos hinzufügen"
              variant="secondary"
            />
          </div>
        </div>
      </div>
    </div>

  )
}
