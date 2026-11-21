/** PITCHLIVE: the yellow ball mark and the name, readable on the dark header at any size. */
export default function Wordmark({ className = "h-8" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 40 40" className="h-full w-auto shrink-0" aria-hidden>
        <path d="M3 27 15 21M6 33l12-7M12 37l9-6" stroke="#e6ef3b" strokeWidth="3" strokeLinecap="round" />
        <circle cx="25" cy="17" r="13" fill="#e6ef3b" />
        {[
          [25, 9],
          [19, 13],
          [31, 13],
          [25, 17],
          [19, 21],
          [31, 21],
          [25, 25],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.7" fill="#2b2f0a" opacity="0.75" />
        ))}
      </svg>
      <span className="font-display text-[1.45em] font-black uppercase leading-none tracking-wide">
        <span className="text-fg">Pitch</span>
        <span className="text-volt">Live</span>
      </span>
    </span>
  )
}
