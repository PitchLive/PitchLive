import { useEffect, useState } from "react"

// Cross-fading background image slider. Sits behind content (absolute inset-0).
export default function BackgroundSlider({
  images,
  interval = 5000,
  position = "center",
  showIndicators = true,
}: {
  images: string[]
  interval?: number
  position?: string
  showIndicators?: boolean
}) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    const id = setInterval(() => setActive((i) => (i + 1) % images.length), interval)
    return () => clearInterval(id)
  }, [images.length, interval])

  return (
    <div className="absolute inset-0">
      {images.map((src, i) => (
        <div
          key={i}
          aria-hidden
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: "cover",
            backgroundPosition: position,
            opacity: i === active ? 1 : 0,
          }}
        />
      ))}

      {/* Slide indicators */}
      {showIndicators && images.length > 1 && (
        <div className="absolute bottom-4 right-5 z-10 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Show slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-6 bg-volt" : "w-1.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
