import { useEffect, useMemo, useRef, useState } from "react"
import { Search } from "lucide-react"
import { useNavigate } from "react-router-dom"
import "./Discover.css"

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

const API_BASE = "http://localhost:8080"
const ONLINE_PLACEHOLDER =
  "https://via.placeholder.com/400x300.png?text=No+Image"

export default function DiscoverPage() {
  const navigate = useNavigate()

  const [query, setQuery] = useState<string>("")
  const [items, setItems] = useState<Container[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<Record<number, boolean>>({})

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [debouncedQuery, setDebouncedQuery] = useState<string>("")

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  const fetchContainers = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`${API_BASE}/containers`)
      if (!res.ok) throw new Error(`Fetch failed (${res.status})`)
      const data = (await res.json()) as Container[]

      setItems(Array.isArray(data) ? data : [])
    } catch (e: any) {
      setItems([])
      setError(e?.message ?? "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContainers()
  }, [])

  const filtered = useMemo(() => {
    if (!debouncedQuery) return items
    const q = debouncedQuery.toLowerCase()
    return items.filter((c) => {
      const name = (c.name ?? "").toLowerCase()
      const desc = (c.description ?? "").toLowerCase()
      return name.includes(q) || desc.includes(q)
    })
  }, [items, debouncedQuery])

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const goToDetails = (id: number) => {
    navigate(`/containers/${id}`)
  }

  return (
    <div className="discover-screen">
      <div className="search-row">
        <input
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="suchbegriff"
        />
        <Search/>   
      </div>

      {error && (
        <div className="error-box">
          <div className="error-text">{error}</div>
          <button className="retry-btn" onClick={fetchContainers}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="list">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="list">
          {filtered.length === 0 ? (
            <div className="empty-box">Keine Treffer</div>
          ) : (
            filtered.map((item) => (
              <ContainerCard
                key={item.id}
                item={item}
                isFav={!!favorites[item.id]}
                onToggleFav={() => toggleFavorite(item.id)}
                onOpen={() => goToDetails(item.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

function ContainerCard({
  item,
  isFav,
  onToggleFav,
  onOpen,
}: {
  item: Container
  isFav: boolean
  onToggleFav: () => void
  onOpen: () => void
}) {
  const [imgSrc, setImgSrc] = useState(item.imageURL || ONLINE_PLACEHOLDER)

  const [bidValue, setBidValue] = useState<number | null>(null)

  useEffect(() => {
    setImgSrc(item.imageURL || ONLINE_PLACEHOLDER)
  }, [item.imageURL])

  useEffect(() => {
    if (!item.currentBid) {
      setBidValue(null)
      return
    }

    fetch(`${API_BASE}/bids/${item.currentBid}`)
      .then((res) => {
        if (!res.ok) throw new Error("Bid fetch failed")
        return res.json() as Promise<Bid>
      })
      .then((bid) => setBidValue(bid.value))
      .catch(() => setBidValue(null))
  }, [item.currentBid])

  return (
    <div
      className="card card-clickable"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen()
      }}
    >
      <div className="left">
        <img
          className="main-image"
          src={imgSrc}
          alt={item.name}
          onError={() => setImgSrc(ONLINE_PLACEHOLDER)}
        />
        <div className="thumb-row">
          <div className="thumb" />
          <div className="thumb" />
          <div className="thumb" />
        </div>
      </div>

      <div className="right">
        <button
          className="heart-btn"
          onClick={(e) => {
            e.stopPropagation()
            onToggleFav()
          }}
          aria-label="favorite"
        >
          <span className="heart">{isFav ? "♥" : "♡"}</span>
        </button>

        <div className="title">{item.name}</div>
        <div className="subtitle">{item.description ?? ""}</div>

        
        <div className="bid-text">
          Gebot : {bidValue !== null ? `${bidValue} CHF` : "-.-"}
        </div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="card skeleton">
      <div className="left">
        <div className="main-image skel" />
        <div className="thumb-row">
          <div className="thumb skel" />
          <div className="thumb skel" />
          <div className="thumb skel" />
        </div>
      </div>
      <div className="right">
        <div className="skel-line w70" />
        <div className="skel-line w90" />
        <div className="skel-line w55" />
      </div>
    </div>
  )
}
