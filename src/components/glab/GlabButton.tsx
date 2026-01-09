import "./GlabButton.css"

type Props = {
  text: string
  variant?: "primary" | "secondary" | "text"
  disabled?: boolean
  onClick?: () => void
  type?: "button" | "submit" | "reset"
}

export default function GlabButton({
  text,
  variant = "primary",
  disabled = false,
  onClick,
  type = "button",
}: Props) {
  return (
    <button
      type={type}
      className={`btn ${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  )
}
