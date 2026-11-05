import { useSyncExternalStore } from "react"

const query = "(prefers-reduced-motion: reduce)"
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(query)
  mq.addEventListener("change", cb)
  return () => mq.removeEventListener("change", cb)
}

/** True when the visitor has asked their system to reduce motion; auto-rotating content should hold still. */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false)
}
