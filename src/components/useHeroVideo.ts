import { useEffect, type RefObject } from 'react'

// Janela em que um evento de scroll conta como "do utilizador": logo a seguir a roda,
// toque ou tecla. Assim o restauro automático da posição ao recarregar não dispara o vídeo.
const USER_INPUT_WINDOW_MS = 800

export type VideoSource = { src: string; type: string }

type Refs = {
  area: RefObject<HTMLElement | null>
  box: RefObject<HTMLElement | null>
  video: RefObject<HTMLVideoElement | null>
}

/**
 * Reproduz o vídeo do retrato uma única vez por carregamento, no primeiro hover sobre a hero
 * ou no primeiro scroll real com a hero visível. Até o primeiro fotograma estar pronto,
 * fica visível a fotografia que está por baixo; se `play()` falhar, a fotografia mantém-se.
 */
export function useHeroVideo({ area: areaRef, box: boxRef, video: videoRef }: Refs, sources: VideoSource[], enabled: boolean) {
  useEffect(() => {
    const area = areaRef.current
    const box = boxRef.current
    const video = videoRef.current
    if (!enabled || !area || !box || !video) return

    let state: 'idle' | 'waiting' | 'playing' | 'done' = 'idle'
    let visible = false
    let scrolledAway = false
    let lastInput = -Infinity
    let idleHandle = 0
    let pendingCanPlay: (() => void) | null = null

    video.muted = true
    video.defaultMuted = true

    // Primeiro formato que o browser declara tocar com segurança (WebM VP9 é ~3× mais leve; MP4 H.264 para o resto).
    const src = (sources.find((s) => video.canPlayType(s.type) === 'probably') ?? sources.find((s) => video.canPlayType(s.type)))?.src

    const loadSource = () => {
      if (!src || video.getAttribute('src')) return
      video.preload = 'auto'
      video.src = src
      video.load()
    }

    const reveal = () => {
      if (state !== 'playing') return
      box.dataset.video = 'on'
    }

    const showFirstFrame = () => {
      // Só mostra o vídeo quando um fotograma já foi desenhado: nada de flash nem ecrã preto.
      if ('requestVideoFrameCallback' in video) video.requestVideoFrameCallback(() => reveal())
      else requestAnimationFrame(() => requestAnimationFrame(reveal))
    }

    const play = () => {
      pendingCanPlay = null
      video.currentTime = 0
      video.play().then(
        () => {
          state = 'playing'
          showFirstFrame()
        },
        () => {
          // Bloqueado (ex.: poupança de energia) ou erro: a fotografia fica; um gesto seguinte pode tentar de novo.
          state = 'idle'
          delete box.dataset.video
        },
      )
    }

    // Ponto de entrada único para hover e scroll.
    const start = () => {
      if (state !== 'idle' || !src) return
      state = 'waiting'
      loadSource()
      if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
        play()
      } else {
        pendingCanPlay = play
        video.addEventListener('canplay', play, { once: true })
      }
    }

    const onEnded = () => {
      state = 'done' // fica no último fotograma (sorriso); sem loop, sem reinício
    }
    const onError = () => {
      if (pendingCanPlay) video.removeEventListener('canplay', pendingCanPlay)
      pendingCanPlay = null
      if (state !== 'done') state = 'idle'
      delete box.dataset.video
    }

    // pointerenter não dispara se o rato já estava sobre a hero quando a página abriu
    // (comum: a hero ocupa o ecrã); o primeiro movimento dentro dela também conta.
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      area.removeEventListener('pointermove', onPointer)
      start()
    }
    const markInput = () => {
      lastInput = performance.now()
    }
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(e.key)) markInput()
    }
    const onScroll = () => {
      if (performance.now() - lastInput > USER_INPUT_WINDOW_MS) return
      if (visible) start()
      else scrolledAway = true
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        // A deteção inicial não dispara; só depois de o utilizador já ter feito scroll.
        if (visible && scrolledAway) start()
      },
      { threshold: 0.15 },
    )
    io.observe(area)

    area.addEventListener('pointerenter', onPointer)
    area.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('wheel', markInput, { passive: true })
    window.addEventListener('touchstart', markInput, { passive: true })
    window.addEventListener('touchmove', markInput, { passive: true })
    window.addEventListener('pointerdown', markInput, { passive: true })
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, { passive: true })
    video.addEventListener('ended', onEnded)
    video.addEventListener('error', onError)

    // Pré-carrega o vídeo depois de a página estar pronta, para não competir com a fotografia.
    const scheduleLoad = () => {
      const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200))
      idleHandle = idle(loadSource, { timeout: 2500 })
    }
    if (document.readyState === 'complete') scheduleLoad()
    else window.addEventListener('load', scheduleLoad, { once: true })

    return () => {
      io.disconnect()
      area.removeEventListener('pointerenter', onPointer)
      area.removeEventListener('pointermove', onPointer)
      window.removeEventListener('wheel', markInput)
      window.removeEventListener('touchstart', markInput)
      window.removeEventListener('touchmove', markInput)
      window.removeEventListener('pointerdown', markInput)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('load', scheduleLoad)
      video.removeEventListener('ended', onEnded)
      video.removeEventListener('error', onError)
      if (pendingCanPlay) video.removeEventListener('canplay', pendingCanPlay)
      if (idleHandle) (window.cancelIdleCallback ?? window.clearTimeout)(idleHandle)
    }
  }, [areaRef, boxRef, videoRef, sources, enabled])
}
