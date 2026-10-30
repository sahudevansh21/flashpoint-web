"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

const REFERENCE_BASE = "https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P";
const PORTAL_VIDEO = `${REFERENCE_BASE}/fc3ded42-e845-41f3-a830-5cab512d79cd.mp4`;
const INTRO_VIDEO = `${REFERENCE_BASE}/5fc5651c-3b5d-4171-b507-87f7e635d1b4.mp4`;
const SESSION_KEY = "flashpoint-portal-intro-seen";

function easeInOutCubic(value: number) {
  return value < 0.5 ? 4 * value ** 3 : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function animateValue(setter: (value: number) => void, duration: number) {
  return new Promise<void>((resolve) => {
    const start = performance.now();
    const frame = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setter(easeInOutCubic(progress));
      if (progress < 1) requestAnimationFrame(frame);
      else resolve();
    };
    requestAnimationFrame(frame);
  });
}

function MotionPreloader({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let disposed = false;
    let finished = false;
    let raf = 0;
    let hideTimer: number | undefined;
    let completeTimer: number | undefined;
    const video = videoRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const finish = () => {
      if (finished || disposed) return;
      finished = true;
      window.clearTimeout(hideTimer);
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch {}
      video?.pause();
      if (percentRef.current) percentRef.current.textContent = "100";
      setLeaving(true);
      document.body.classList.add("preload-complete");
      completeTimer = window.setTimeout(onComplete, 520);
      hideTimer = window.setTimeout(() => setVisible(false), 1750);
    };

    let hasPlayed = false;
    try { hasPlayed = Boolean(sessionStorage.getItem(SESSION_KEY)); } catch {}
    if (reducedMotion || hasPlayed) {
      document.body.classList.add("preload-complete");
      onComplete();
      return () => { disposed = true; };
    }

    setVisible(true);
    document.body.classList.remove("preload-complete");

    const startVideo = () => {
      if (!video || finished) return;
      if (video.duration) video.playbackRate = Math.max(0.25, video.duration / 2.8);
      void video.play().catch(finish);
    };
    const updateProgress = () => {
      if (disposed || finished) return;
      if (video?.duration) {
        const next = Math.min(99, Math.round((video.currentTime / video.duration) * 100));
        if (percentRef.current) percentRef.current.textContent = String(next);
      }
      raf = requestAnimationFrame(updateProgress);
    };

    video?.addEventListener("loadedmetadata", startVideo);
    video?.addEventListener("ended", finish, { once: true });
    video?.addEventListener("error", finish, { once: true });
    if (video && video.readyState >= 1) startVideo();
    raf = requestAnimationFrame(updateProgress);
    hideTimer = window.setTimeout(finish, 3600);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(hideTimer);
      window.clearTimeout(completeTimer);
      video?.removeEventListener("loadedmetadata", startVideo);
      video?.removeEventListener("ended", finish);
      video?.removeEventListener("error", finish);
      video?.pause();
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className={`fp-preloader${leaving ? " is-leaving" : ""}`} aria-label="Preparing Flashpoint">
      <video ref={videoRef} muted playsInline preload="auto" aria-hidden="true">
        <source src={INTRO_VIDEO} type="video/mp4" />
      </video>
      <div className="fp-preloader-shade" />
      <div className={`fp-preloader-logo${leaving ? " is-docked" : ""}`}>
        <Image src="/brand/flashpoint-wordmark.png" alt="Flashpoint" width={900} height={300} priority />
      </div>
      <div className={`fp-preloader-count${leaving ? " is-leaving" : ""}`} aria-live="polite">
        <span ref={percentRef}>0</span><span className="percent">%</span>
      </div>
    </div>
  );
}

function buildProjectedPath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  width: number,
  height: number,
  radius: number,
  rotateX: number,
  rotateY: number
) {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const r = Math.min(radius, halfWidth, halfHeight);
  const arcs: [number, number, number, number][] = [
    [halfWidth - r, -halfHeight + r, -Math.PI / 2, 0],
    [halfWidth - r, halfHeight - r, 0, Math.PI / 2],
    [-halfWidth + r, halfHeight - r, Math.PI / 2, Math.PI],
    [-halfWidth + r, -halfHeight + r, Math.PI, Math.PI * 1.5],
  ];
  const points: [number, number][] = [];
  for (const [arcX, arcY, startAngle, endAngle] of arcs) {
    for (let step = 0; step <= 10; step++) {
      const angle = startAngle + (endAngle - startAngle) * step / 10;
      points.push([arcX + r * Math.cos(angle), arcY + r * Math.sin(angle)]);
    }
  }

  const ax = rotateX * Math.PI / 180;
  const ay = rotateY * Math.PI / 180;
  ctx.beginPath();
  points.forEach(([x, y], index) => {
    const xx = x * Math.cos(ay);
    const yy = y * Math.cos(ax);
    const z = x * Math.sin(ay) - y * Math.sin(ax);
    const perspective = 850 / (850 + z);
    const sx = cx + xx * perspective;
    const sy = cy + yy * perspective;
    if (index === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  });
  ctx.closePath();
}

function drawCover(ctx: CanvasRenderingContext2D, video: HTMLVideoElement) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const sourceWidth = video.videoWidth;
  const sourceHeight = video.videoHeight;
  if (!sourceWidth || !sourceHeight) return false;
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  try {
    ctx.drawImage(video, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
    return true;
  } catch {
    return false;
  }
}

export function ImmersivePortal({
  href = "/feed",
  actionLabel = "See tonight’s baskets",
}: {
  href?: string;
  actionLabel?: string;
}) {
  const router = useRouter();
  const [introReady, setIntroReady] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const portalRef = useRef<HTMLAnchorElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorOrbitRef = useRef<HTMLSpanElement>(null);
  const busyRef = useRef(false);
  const animateIntro = useCallback(() => setIntroReady(true), []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const ready = () => setVideoReady(true);
    video.addEventListener("loadeddata", ready);
    video.addEventListener("canplay", ready);
    void video.play().catch(() => {});
    if (video.readyState >= 2) ready();
    return () => {
      video.removeEventListener("loadeddata", ready);
      video.removeEventListener("canplay", ready);
      video.pause();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const portal = portalRef.current;
    const video = videoRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !portal || !video || !ctx) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frameId = 0;
    let lastTime = performance.now();
    let rotationX = 0;
    let rotationY = 0;
    let targetX = 0;
    let targetY = 0;
    let maskScale = motionPreference.matches ? 1 : 0;
    let expansion = 0;
    let sourceActive = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const pointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || busyRef.current || motionPreference.matches) return;
      targetY = (event.clientX / window.innerWidth - 0.5) * 37.4;
      targetX = (event.clientY / window.innerHeight - 0.5) * -33;
    };
    const pointerLeave = () => { targetX = 0; targetY = 0; };
    const enterCursor = () => cursorRef.current?.classList.add("is-enter");
    const leaveCursor = () => cursorRef.current?.classList.remove("is-enter");

    const draw = (now: number) => {
      frameId = requestAnimationFrame(draw);
      const dt = Math.min(40, now - lastTime);
      lastTime = now;
      if (!busyRef.current && !motionPreference.matches) {
        rotationX += (targetX - rotationX) * Math.min(1, dt * 0.009);
        rotationY += (targetY - rotationY) * Math.min(1, dt * 0.009);
      }

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      if (!sourceActive || video.readyState < 2 || maskScale <= 0) return;

      const rect = portal.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const cx0 = rect.left + rect.width / 2;
      const cy0 = rect.top + rect.height / 2;
      const cx = cx0 + (window.innerWidth / 2 - cx0) * expansion;
      const cy = cy0 + (window.innerHeight / 2 - cy0) * expansion;
      const width = (rect.width + (window.innerWidth - rect.width) * expansion) * (expansion ? 1 : maskScale);
      const height = (rect.height + (window.innerHeight - rect.height) * expansion) * (expansion ? 1 : maskScale);
      if (width < 1 || height < 1) return;

      buildProjectedPath(ctx, cx, cy, width, height, 90 * (1 - expansion) * (expansion ? 1 : maskScale), rotationX * (1 - expansion), rotationY * (1 - expansion));
      ctx.save();
      ctx.clip();
      if (drawCover(ctx, video)) {
        const shade = ctx.createLinearGradient(0, window.innerHeight * 0.52, 0, window.innerHeight);
        shade.addColorStop(0, "rgba(0,0,0,0)");
        shade.addColorStop(1, "rgba(0,0,0,.42)");
        ctx.fillStyle = shade;
        ctx.fillRect(0, window.innerHeight * 0.52, window.innerWidth, window.innerHeight * 0.48);
      }
      ctx.restore();
    };

    const motionChange = () => {
      if (motionPreference.matches) {
        targetX = 0;
        targetY = 0;
        rotationX = 0;
        rotationY = 0;
      }
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", pointerMove, { passive: true });
    window.addEventListener("pointerleave", pointerLeave);
    motionPreference.addEventListener("change", motionChange);
    portal.addEventListener("pointerenter", enterCursor);
    portal.addEventListener("pointerleave", leaveCursor);
    frameId = requestAnimationFrame(draw);

    const cursor = cursorRef.current;
    const orbit = cursorOrbitRef.current;
    let mouseX = -100;
    let mouseY = -100;
    let orbitX = -100;
    let orbitY = -100;
    let cursorFrame = 0;
    const cursorMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || motionPreference.matches) return;
      mouseX = event.clientX;
      mouseY = event.clientY;
      cursor?.classList.add("is-visible");
    };
    const cursorTick = () => {
      if (!motionPreference.matches && cursor && orbit) {
        orbitX += (mouseX - orbitX) * 0.2;
        orbitY += (mouseY - orbitY) * 0.2;
        cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        orbit.style.transform = `translate3d(${orbitX - mouseX}px, ${orbitY - mouseY}px, 0)`;
      }
      cursorFrame = requestAnimationFrame(cursorTick);
    };
    const cursorLeave = () => cursor?.classList.remove("is-visible");
    window.addEventListener("pointermove", cursorMove, { passive: true });
    document.addEventListener("mouseleave", cursorLeave);
    cursorFrame = requestAnimationFrame(cursorTick);

    const reveal = async () => {
      if (!videoReady || sourceActive) return;
      sourceActive = true;
      portal.classList.add("is-video-active");
      if (motionPreference.matches) maskScale = 1;
      else await animateValue((value) => { maskScale = value; }, 1050);
    };
    if (introReady) void reveal();
    if (videoReady && introReady) void reveal();

    const onTransition = (event: Event) => {
      const click = event as MouseEvent;
      if (click.button !== 0 || click.metaKey || click.ctrlKey || click.shiftKey || click.altKey) return;
      click.preventDefault();
      if (busyRef.current) return;
      if (!videoReady || motionPreference.matches) {
        router.push(href);
        return;
      }
      busyRef.current = true;
      portal.classList.add("is-loading");
      targetX = 0;
      targetY = 0;
      void animateValue((value) => { expansion = value; }, 1050).then(() => router.push(href));
    };
    portal.addEventListener("click", onTransition);

    return () => {
      cancelAnimationFrame(frameId);
      cancelAnimationFrame(cursorFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointerleave", pointerLeave);
      window.removeEventListener("pointermove", cursorMove);
      document.removeEventListener("mouseleave", cursorLeave);
      motionPreference.removeEventListener("change", motionChange);
      portal.removeEventListener("pointerenter", enterCursor);
      portal.removeEventListener("pointerleave", leaveCursor);
      portal.removeEventListener("click", onTransition);
    };
  }, [href, introReady, router, videoReady]);

  return (
    <>
      <MotionPreloader onComplete={animateIntro} />
      <canvas ref={canvasRef} className="portal-canvas" aria-hidden="true" />
      <a ref={portalRef} href={href} className="signal-portal" aria-label={actionLabel}>
        <span className="portal-cosmos" aria-hidden="true" />
        <span className="portal-earth" aria-hidden="true" />
        <span className="signal-portal-shade" />
        <span className="signal-portal-label">{actionLabel} <span aria-hidden="true">↗</span></span>
      </a>
      <video ref={videoRef} className="fp-portal-source" src={PORTAL_VIDEO} muted playsInline preload="auto" aria-hidden="true" />
      <div ref={cursorRef} className="custom-cursor" aria-hidden="true">
        <span ref={cursorOrbitRef} className="cursor-orbit" />
        <span className="cursor-dot" />
        <span className="cursor-label">{actionLabel}</span>
      </div>
    </>
  );
}
