import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { media } from '../media'
import { useHeroVideo, type VideoSource } from './useHeroVideo'

const SRC = media('hero-ulisses-1813.webp')
const SRC_SET = `${media('hero-ulisses-960.webp')} 960w, ${SRC} 1813w`
const SIZES = '(min-width: 768px) 95vw, 100vw'
// Mesmo enquadramento do PNG (1813 × 1110): 1.º fotograma alinhado com a fotografia.
const VIDEO_SOURCES: VideoSource[] = [
  { src: media('hero-ulisses-sorriso.webm'), type: 'video/webm; codecs="vp9"' },
  { src: media('hero-ulisses-sorriso.mp4'), type: 'video/mp4; codecs="avc1.640028"' },
]
const OFFSCREEN = -999
// current += (target - current) * 0.1 por frame a 60 fps; normalizado pelo tempo real do frame
// para a luz ter a mesma velocidade em ecrãs de 30, 60 ou 120 Hz.
const EASE = 0.1
const FRAME_MS = 1000 / 60

function useReducedMotion() {
  const [reduced, setReduced] = useState(true)
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(motion.matches)
    update()
    motion.addEventListener('change', update)
    return () => motion.removeEventListener('change', update)
  }, [])
  return reduced
}

// Só com rato e sem "reduzir movimento"; em ecrãs táteis a fotografia fica estática.
function useSpotlightEnabled() {
  const [enabled, setEnabled] = useState(false)
  useEffect(() => {
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setEnabled(pointer.matches && !motion.matches)
    update()
    pointer.addEventListener('change', update)
    motion.addEventListener('change', update)
    return () => {
      pointer.removeEventListener('change', update)
      motion.removeEventListener('change', update)
    }
  }, [])
  return enabled
}

/**
 * Luz roxa que segue o rato sobre o retrato. A posição vive em refs e é escrita em
 * variáveis CSS (--spot-x/--spot-y) num único ciclo requestAnimationFrame, que pára
 * quando a luz assenta ou o rato sai: o React não volta a renderizar durante o movimento.
 */
export function HeroPortrait({ areaRef }: { areaRef: RefObject<HTMLElement | null> }) {
  const enabled = useSpotlightEnabled()
  const reducedMotion = useReducedMotion()
  const boxRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  useHeroVideo({ area: areaRef, box: boxRef, video: videoRef }, VIDEO_SOURCES, !reducedMotion)
  const pointer = useRef({ x: OFFSCREEN, y: OFFSCREEN, present: false })
  const current = useRef({ x: OFFSCREEN, y: OFFSCREEN })
  const wasInside = useRef(false)
  const frame = useRef(0)
  const lastTime = useRef(0)

  useEffect(() => {
    const area = areaRef.current
    const box = boxRef.current
    if (!enabled || !area || !box) return

    const write = () => {
      box.style.setProperty('--spot-x', `${current.current.x}px`)
      box.style.setProperty('--spot-y', `${current.current.y}px`)
    }

    const tick = (now: number) => {
      frame.current = 0
      const dt = lastTime.current ? Math.min(now - lastTime.current, 100) : FRAME_MS
      lastTime.current = now
      // Coordenadas relativas ao contentor, recalculadas a cada frame: seguem scroll e redimensionamento.
      const rect = box.getBoundingClientRect()
      const tx = pointer.current.x - rect.left
      const ty = pointer.current.y - rect.top
      const inside = pointer.current.present && tx >= 0 && ty >= 0 && tx <= rect.width && ty <= rect.height

      if (!inside) {
        // A luz apaga-se no sítio onde está (transição CSS de ~200 ms) e o ciclo pára.
        box.dataset.spot = 'off'
        wasInside.current = false
        lastTime.current = 0
        return
      }
      if (!wasInside.current) {
        // Ao entrar, a luz nasce onde está o cursor em vez de atravessar a imagem.
        current.current = { x: tx, y: ty }
        wasInside.current = true
        box.dataset.spot = 'on'
      } else {
        const k = 1 - Math.pow(1 - EASE, dt / FRAME_MS)
        current.current.x += (tx - current.current.x) * k
        current.current.y += (ty - current.current.y) * k
      }
      write()
      const settled = Math.abs(tx - current.current.x) < 0.2 && Math.abs(ty - current.current.y) < 0.2
      if (settled) lastTime.current = 0
      else frame.current = requestAnimationFrame(tick)
    }

    const schedule = () => {
      if (!frame.current) frame.current = requestAnimationFrame(tick)
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      pointer.current = { x: e.clientX, y: e.clientY, present: true }
      schedule()
    }
    const onLeave = () => {
      pointer.current.present = false
      schedule()
    }

    area.addEventListener('pointermove', onMove)
    area.addEventListener('pointerleave', onLeave)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      area.removeEventListener('pointermove', onMove)
      area.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(frame.current)
      frame.current = 0
      current.current = { x: OFFSCREEN, y: OFFSCREEN }
      wasInside.current = false
      box.dataset.spot = 'off'
      write()
    }
  }, [enabled, areaRef])

  const style = {
    '--spot-x': `${OFFSCREEN}px`,
    '--spot-y': `${OFFSCREEN}px`,
    '--portrait-mask': `url("${SRC}")`,
  } as CSSProperties

  return (
    <div className="hero__portrait" ref={boxRef} style={style} data-spot="off">
      <img
        className="hero__portrait-img"
        src={SRC}
        srcSet={SRC_SET}
        sizes={SIZES}
        width={1813}
        height={1110}
        alt="Retrato de Ulisses Antônio, de t-shirt preta, com iluminação roxa"
        fetchPriority="high"
        decoding="async"
      />
      {!reducedMotion && (
        // Começa invisível e sem src; a fotografia acima faz de poster até haver um fotograma.
        <video
          ref={videoRef}
          className="hero__portrait-img hero__portrait-video"
          width={1176}
          height={720}
          muted
          playsInline
          preload="none"
          disablePictureInPicture
          disableRemotePlayback
          aria-hidden="true"
          tabIndex={-1}
        />
      )}
      {enabled && (
        <>
          <img className="hero__portrait-img hero__portrait-lit" src={SRC} srcSet={SRC_SET} sizes={SIZES} width={1813} height={1110} alt="" aria-hidden="true" decoding="async" />
          <div className="hero__portrait-tint" aria-hidden="true" />
        </>
      )}
    </div>
  )
}
