"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";

export interface ShaderCardProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: string;
  color?: string;
  highlightColor?: string;
  backgroundColor?: string;
  preset?: "ember" | "glacier" | "violet" | "rose" | "nebula" | "contour" | "mint";
  speed?: number;
  positionY?: number;
  scale?: number;
  effectRadius?: number;
  effectBoost?: number;
  edgeMin?: number;
  edgeMax?: number;
  falloffPower?: number;
  noiseScale?: number;
  widthFactor?: number;
  waveAmount?: number;
  branchIntensity?: number;
  verticalExtent?: number;
  horizontalExtent?: number;
  contours?: number;
  flash?: number;
  blur?: number;
  opacity?: number;
  intensity?: number;
  bloom?: number;
  grain?: number;
  fade?: number;
  interactive?: boolean;
  tiltStrength?: number;
  parallax?: number;
  hoverRise?: number;
  intro?: boolean;
  dpr?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export interface ShaderCardHandle {
  replay: () => void;
}

export const SHADER_CARD_PRESETS = {
  ember: {
    color: "#FF4A1C",
    highlightColor: "#FFC46B",
    speed: 0.6,
    intensity: 1.15,
    bloom: 1.1,
    blur: 4,
  },
  glacier: {
    color: "#2563EB",
    highlightColor: "#7DD3FC",
    speed: 0.45,
    intensity: 1.0,
    bloom: 0.9,
    blur: 3.5,
  },
  violet: {
    color: "#5227FF",
    highlightColor: "#C084FC",
    speed: 0.5,
    intensity: 1.0,
    bloom: 0.8,
    blur: 4,
  },
  rose: {
    color: "#E8368F",
    highlightColor: "#FFC2E6",
    speed: 0.5,
    intensity: 1.05,
    bloom: 0.9,
    blur: 4,
  },
  nebula: {
    color: "#8B5CF6",
    highlightColor: "#FF9FFC",
    speed: 0.5,
    intensity: 1.1,
    bloom: 1.4,
    blur: 6,
  },
  contour: {
    color: "#5227FF",
    highlightColor: "#B19EEF",
    blur: 1.5,
    bloom: 0.5,
    contours: 1.6,
  },
  mint: {
    color: "#0EA5A4",
    highlightColor: "#A7F3D0",
    positionY: 0.06,
    branchIntensity: 1.4,
  },
} as const;

// Vertex Shader (Fullscreen triangle)
const VERTEX_SHADER = `
in vec3 position;
out vec2 vUv;
void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// Flame Fragment Shader
const FLAME_FRAGMENT_SHADER = `
precision highp float;

uniform float uTime;
uniform vec2 uRes;
uniform vec2 uShift;
uniform vec3 uDeep;
uniform vec3 uMain;
uniform vec3 uHot;
uniform float uPositionY;
uniform float uScale;
uniform float uEffectRadius;
uniform float uEffectBoost;
uniform float uEdgeMin;
uniform float uEdgeMax;
uniform float uFalloffPower;
uniform float uNoiseScale;
uniform float uWidthFactor;
uniform float uWaveAmount;
uniform float uBranchIntensity;
uniform float uVerticalExtent;
uniform float uHorizontalExtent;
uniform float uContours;
uniform float uFlash;
uniform float uLift;
uniform float uFade;
uniform float uIntensity;

in vec2 vUv;
out vec4 fragColor;

vec3 random3(vec3 c) {
  float j = 4096.0 * sin(dot(c, vec3(17.0, 59.4, 15.0)));
  vec3 r;
  r.z = fract(512.0 * j);
  j *= 0.125;
  r.x = fract(512.0 * j);
  j *= 0.125;
  r.y = fract(512.0 * j);
  return r - 0.5;
}

const float F3 = 0.3333333;
const float G3 = 0.1666667;

float simplex3d(vec3 p) {
  vec3 s = floor(p + dot(p, vec3(F3)));
  vec3 x = p - s + dot(s, vec3(G3));
  vec3 e = step(vec3(0.0), x - x.yzx);
  vec3 i1 = e * (1.0 - e.zxy);
  vec3 i2 = 1.0 - e.zxy * (1.0 - e);
  vec3 x1 = x - i1 + G3;
  vec3 x2 = x - i2 + 2.0 * G3;
  vec3 x3 = x - 1.0 + 3.0 * G3;
  vec4 w;
  vec4 d;
  w.x = dot(x, x);
  w.y = dot(x1, x1);
  w.z = dot(x2, x2);
  w.w = dot(x3, x3);
  w = max(0.6 - w, 0.0);
  d.x = dot(random3(s), x);
  d.y = dot(random3(s + i1), x1);
  d.z = dot(random3(s + i2), x2);
  d.w = dot(random3(s + 1.0), x3);
  w *= w;
  w *= w;
  d *= w;
  return dot(d, vec4(52.0));
}

const float PI = 3.14159265359;

void main() {
  float time = 28.22 + 1.25 * uTime;
  float bignessScale = 1.0 / max(uNoiseScale, 0.01);

  vec2 uv = ((vUv * uRes + uShift) / uRes) * 2.0 - 1.0;
  float aspect = uRes.x / max(uRes.y, 0.001);
  uv.x *= aspect;

  float effectiveScale = max(uScale, 0.5);
  uv = uv / effectiveScale;

  float yOffset = mix(-0.3, 0.8, uPositionY) + uLift / effectiveScale;
  uv.y -= yOffset;
  uv.y *= uVerticalExtent;
  uv.x *= uHorizontalExtent;

  vec2 p = (uv / aspect + 1.0) * 0.5;
  p.x *= aspect;

  vec2 positionFromCenter = uv;
  positionFromCenter /= max(uEffectRadius, 0.01);
  positionFromCenter.x /= max(uWidthFactor, 0.01);
  float positionFromBottom = 0.5 * (positionFromCenter.y + 1.0);

  vec2 waveOffset = vec2(0.0);
  waveOffset.x += positionFromBottom * sin(4.0 * positionFromCenter.y - 4.0 * time);
  waveOffset.x += 0.1 * positionFromBottom * sin(4.0 * positionFromCenter.x - 1.561 * time);
  waveOffset.x += uBranchIntensity * 0.15 * sin(8.0 * positionFromCenter.y + time * 2.0);
  waveOffset.x += uBranchIntensity * 0.1 * sin(12.0 * positionFromCenter.y - time * 1.5);
  waveOffset.y += uBranchIntensity * 0.08 * sin(6.0 * positionFromCenter.x + time * 1.8);
  positionFromCenter += uWaveAmount * waveOffset;

  positionFromCenter.x += positionFromCenter.x / max(1.0 - positionFromCenter.y, 0.01);

  float effectMask = clamp(1.0 - length(positionFromCenter), 0.0, 1.0);
  effectMask = 1.0 - pow(1.0 - effectMask, max(uFalloffPower, 0.1));

  vec3 p3 = bignessScale * 0.25 * vec3(p.x, p.y, 0.0) + vec3(0.0, -time * 0.1, time * 0.025);
  float noise = simplex3d(p3 * 32.0);
  noise += 0.3 * simplex3d(p3 * 64.0 + vec3(time * 0.05, time * 0.03, 0.0));
  noise += 0.15 * simplex3d(p3 * 128.0 - vec3(time * 0.08, 0.0, time * 0.04));
  noise = 0.5 + 0.5 * noise;

  float value = effectMask * noise + uEffectBoost * effectMask;
  float edge = mix(uEdgeMin, uEdgeMax, pow(clamp(0.5 * (positionFromCenter.y + 1.0), 0.0, 1.0), 1.2));
  float steppedValue = smoothstep(edge, edge + 0.1, value);
  float highlight = 1.0 - clamp(value - edge, 0.0, 1.0);

  p3 = bignessScale * 0.1 * vec3(p.x, p.y, 0.0) + vec3(0.0, -time * 0.01, time * 0.025);
  noise = 0.5 + 0.5 * simplex3d(p3 * 32.0);
  float repeatedValue = mix(highlight, noise, 0.65);
  repeatedValue = 0.5 * sin(6.0 * PI * (1.0 - pow(1.0 - repeatedValue, 1.8)) - 0.5 * PI) + 0.5;
  float steppedLines = smoothstep(0.95, 1.0, pow(repeatedValue, 8.0));
  steppedLines = mix(steppedLines, 0.0, 0.8 - noise);
  highlight = max(steppedLines * uContours, highlight);
  highlight = highlight * highlight;

  float wave = sin(time * 3.0);
  float flash = wave * wave * wave * wave * uFlash;
  float heat = clamp(steppedValue * highlight, 0.0, 1.0);
  float height = clamp(vUv.y, 0.0, 1.0);
  vec3 body = mix(uMain, uDeep, smoothstep(0.0, 0.9, height));
  vec3 emission = body * steppedValue * 0.95;
  emission += uHot * heat * (0.9 + 0.4 * flash);
  emission += vec3(1.0, 0.94, 0.98) * heat * heat * heat * (0.15 + 0.35 * flash);
  float cover = steppedValue * mix(0.55, 1.0, heat);

  float fadeStart = mix(1.05, 0.3, uFade);
  float mask = 1.0 - smoothstep(fadeStart, fadeStart + 0.4, vUv.y);
  fragColor = vec4(emission * uIntensity * mask, cover * mask);
}
`;

// Helper: Convert sRGB to Linear
const sRgbToLinear = (c: number) =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

// Helper: Convert Oklch to Linear RGB
function oklchToLinearRgb([L, C, h]: [number, number, number]): [number, number, number] {
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l_ = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3);
  const m_ = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3);
  const s_ = Math.pow(L - 0.0894841775 * a - 1.291485548 * b, 3);
  const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);
  return [
    clamp01(4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_),
    clamp01(-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_),
    clamp01(-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_),
  ];
}

// Helper: Parse Hex or CSS color to RGB [0-1]
function parseColor(str: string): [number, number, number] {
  const hexMatch = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(str.trim());
  if (hexMatch) {
    return [
      parseInt(hexMatch[1], 16) / 255,
      parseInt(hexMatch[2], 16) / 255,
      parseInt(hexMatch[3], 16) / 255,
    ];
  }
  const shortHex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(str.trim());
  if (shortHex) {
    return [
      parseInt(shortHex[1] + shortHex[1], 16) / 255,
      parseInt(shortHex[2] + shortHex[2], 16) / 255,
      parseInt(shortHex[3] + shortHex[3], 16) / 255,
    ];
  }
  return [1.0, 0.42, 0.11]; // default Flashpoint molten hot orange
}

function resolveDpr(propDpr?: number) {
  if (typeof window === "undefined") return 1;
  const dpr = window.devicePixelRatio || 1;
  return Math.min(dpr, propDpr ?? 2);
}

export const ShaderCard = forwardRef<ShaderCardHandle, ShaderCardProps>(
  function ShaderCard(props, ref) {
    const {
      width = "100%",
      height = "auto",
      borderRadius = "20px",
      preset,
      className = "",
      style,
      children,
    } = props;

    // Apply preset overrides if provided
    const presetConfig: Partial<ShaderCardProps> = preset ? SHADER_CARD_PRESETS[preset] : {};
    const merged = {
      color: presetConfig.color ?? "#FF4A1C",
      highlightColor: presetConfig.highlightColor ?? "#FFC46B",
      speed: presetConfig.speed ?? 0.5,
      positionY: presetConfig.positionY ?? 0,
      scale: 4,
      effectRadius: 0.9,
      effectBoost: 0.5,
      edgeMin: 0,
      edgeMax: 1,
      falloffPower: 2,
      noiseScale: 1.5,
      widthFactor: 1.5,
      waveAmount: 0.15,
      branchIntensity: presetConfig.branchIntensity ?? 2,
      verticalExtent: 1.5,
      horizontalExtent: 1.5,
      contours: presetConfig.contours ?? 1,
      flash: 0.6,
      blur: presetConfig.blur ?? 4,
      opacity: 1,
      intensity: presetConfig.intensity ?? 1,
      bloom: presetConfig.bloom ?? 0.8,
      grain: 0.25,
      fade: 0.6,
      interactive: true,
      tiltStrength: 8,
      parallax: 1,
      hoverRise: 1,
      intro: true,
      dpr: 2,
      ...props,
    };

    const cardRef = useRef<HTMLDivElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number | null>(null);

    const reduceMotion = useSyncExternalStore(
      (cb) => {
        if (typeof window === "undefined") return () => {};
        const q = window.matchMedia("(prefers-reduced-motion: reduce)");
        q.addEventListener("change", cb);
        return () => q.removeEventListener("change", cb);
      },
      () =>
        typeof window !== "undefined"
          ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
          : false,
      () => false
    );

    useImperativeHandle(ref, () => ({
      replay: () => {
        // Trigger intro animation replay
      },
    }));

    useEffect(() => {
      const container = canvasContainerRef.current;
      const card = cardRef.current;
      if (!container || !card) return;

      let renderer: THREE.WebGLRenderer | null = null;
      try {
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: false,
          powerPreference: "high-performance",
        });
      } catch {
        return;
      }

      renderer.setClearColor(0, 0);
      renderer.domElement.style.position = "absolute";
      renderer.domElement.style.inset = "0";
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.pointerEvents = "none";
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(
          new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]),
          3
        )
      );

      // Compute colors in Linear & Oklch space
      const baseRgb = parseColor(merged.color);
      const linRgb: [number, number, number] = [
        sRgbToLinear(baseRgb[0]),
        sRgbToLinear(baseRgb[1]),
        sRgbToLinear(baseRgb[2]),
      ];

      // Oklch representation
      const l_cb = Math.cbrt(0.4122214708 * linRgb[0] + 0.5363325363 * linRgb[1] + 0.0514459929 * linRgb[2]);
      const m_cb = Math.cbrt(0.2119034982 * linRgb[0] + 0.6806995451 * linRgb[1] + 0.1073969566 * linRgb[2]);
      const s_cb = Math.cbrt(0.0883024619 * linRgb[0] + 0.2817188376 * linRgb[1] + 0.6299787005 * linRgb[2]);
      const a_val = 1.9779984951 * l_cb - 2.428592205 * m_cb + 0.4505937099 * s_cb;
      const b_val = 0.0259040371 * l_cb + 0.7827717662 * m_cb - 0.808675766 * s_cb;
      const oklchL = 0.2104542553 * l_cb + 0.793617785 * m_cb - 0.0040720468 * s_cb;
      const oklchC = Math.hypot(a_val, b_val);
      const oklchH = Math.atan2(b_val, a_val);

      const deepRgb = oklchToLinearRgb([0.55 * oklchL, 0.9 * oklchC, oklchH - 0.12]);

      let hotRgb: [number, number, number];
      if (merged.highlightColor) {
        const parsedHot = parseColor(merged.highlightColor);
        hotRgb = [sRgbToLinear(parsedHot[0]), sRgbToLinear(parsedHot[1]), sRgbToLinear(parsedHot[2])];
      } else {
        hotRgb = oklchToLinearRgb([Math.min(oklchL + 0.13, 0.86), oklchC, oklchH + 0.28]);
      }

      const uniforms = {
        uTime: { value: 0 },
        uRes: { value: new THREE.Vector2(1, 1) },
        uShift: { value: new THREE.Vector2(0, 0) },
        uDeep: { value: new THREE.Vector3(...deepRgb) },
        uMain: { value: new THREE.Vector3(...linRgb) },
        uHot: { value: new THREE.Vector3(...hotRgb) },
        uPositionY: { value: merged.positionY },
        uScale: { value: merged.scale },
        uEffectRadius: { value: merged.effectRadius },
        uEffectBoost: { value: merged.effectBoost },
        uEdgeMin: { value: merged.edgeMin },
        uEdgeMax: { value: merged.edgeMax },
        uFalloffPower: { value: merged.falloffPower },
        uNoiseScale: { value: merged.noiseScale },
        uWidthFactor: { value: merged.widthFactor },
        uWaveAmount: { value: merged.waveAmount },
        uBranchIntensity: { value: merged.branchIntensity },
        uVerticalExtent: { value: merged.verticalExtent },
        uHorizontalExtent: { value: merged.horizontalExtent },
        uContours: { value: merged.contours },
        uFlash: { value: merged.flash },
        uLift: { value: 0 },
        uFade: { value: merged.fade },
        uIntensity: { value: merged.intensity },
      };

      const material = new THREE.RawShaderMaterial({
        glslVersion: THREE.GLSL3,
        vertexShader: VERTEX_SHADER,
        fragmentShader: FLAME_FRAGMENT_SHADER,
        uniforms,
        transparent: true,
        blending: THREE.NormalBlending,
        depthTest: false,
        depthWrite: false,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.frustumCulled = false;
      scene.add(mesh);

      let targetX = 0;
      let targetY = 0;
      let currentX = 0;
      let currentY = 0;
      let hoverWeight = 0;
      let targetHoverWeight = 0;

      const handleResize = () => {
        if (!container || !renderer) return;
        const rect = container.getBoundingClientRect();
        const width = Math.max(1, Math.round(rect.width));
        const height = Math.max(1, Math.round(rect.height));
        const dpr = resolveDpr(merged.dpr);
        renderer.setPixelRatio(dpr);
        renderer.setSize(width, height, false);
        uniforms.uRes.value.set(width * dpr, height * dpr);
      };

      handleResize();
      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);

      // Interactive Pointer tracking & 3D tilt
      const handlePointerMove = (e: PointerEvent) => {
        if (!merged.interactive || reduceMotion) return;
        const rect = card.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;
        const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const normY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        targetX = Math.min(Math.max(normX, -1), 1);
        targetY = Math.min(Math.max(normY, -1), 1);
        targetHoverWeight = 1;
      };

      const handlePointerLeave = () => {
        targetX = 0;
        targetY = 0;
        targetHoverWeight = 0;
      };

      if (merged.interactive) {
        card.addEventListener("pointermove", handlePointerMove);
        card.addEventListener("pointerleave", handlePointerLeave);
      }

      let startTime = performance.now();
      let lastTime = startTime;
      let isVisible = true;

      const io = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
      }, { rootMargin: "100px" });
      io.observe(card);

      const renderLoop = (time: number) => {
        animationFrameRef.current = requestAnimationFrame(renderLoop);
        if (!isVisible || !renderer) return;

        const dt = Math.min((time - lastTime) / 1000, 0.1);
        lastTime = time;

        const lerpFactor = Math.min(dt * 8, 1);
        currentX += (targetX - currentX) * lerpFactor;
        currentY += (targetY - currentY) * lerpFactor;
        hoverWeight += (targetHoverWeight - hoverWeight) * lerpFactor;

        // Animate flame parameters
        const elapsed = (time - startTime) * 0.001;
        const effectiveSpeed = reduceMotion ? 0 : merged.speed * (1 + 0.6 * hoverWeight * merged.hoverRise);
        uniforms.uTime.value = elapsed * effectiveSpeed;
        uniforms.uLift.value = hoverWeight * merged.hoverRise * 0.35;
        uniforms.uIntensity.value = merged.intensity * (1 + 0.2 * hoverWeight * merged.hoverRise);

        // Apply interactive parallax
        uniforms.uShift.value.set(
          currentX * merged.parallax * 25,
          currentY * merged.parallax * 25
        );

        // Tilt Card
        if (merged.interactive && !reduceMotion) {
          const tiltX = -currentY * merged.tiltStrength;
          const tiltY = currentX * merged.tiltStrength;
          card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;
          card.style.transition = targetHoverWeight === 0 ? "transform 0.4s ease-out" : "none";
        }

        renderer.render(scene, camera);
      };

      animationFrameRef.current = requestAnimationFrame(renderLoop);

      return () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        resizeObserver.disconnect();
        io.disconnect();
        if (merged.interactive) {
          card.removeEventListener("pointermove", handlePointerMove);
          card.removeEventListener("pointerleave", handlePointerLeave);
        }
        card.style.transform = "";
        scene.remove(mesh);
        geometry.dispose();
        material.dispose();
        renderer?.dispose();
        if (renderer?.domElement && renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
      };
    }, [
      merged.color,
      merged.highlightColor,
      merged.speed,
      merged.positionY,
      merged.scale,
      merged.effectRadius,
      merged.effectBoost,
      merged.edgeMin,
      merged.edgeMax,
      merged.falloffPower,
      merged.noiseScale,
      merged.widthFactor,
      merged.waveAmount,
      merged.branchIntensity,
      merged.verticalExtent,
      merged.horizontalExtent,
      merged.contours,
      merged.flash,
      merged.blur,
      merged.intensity,
      merged.fade,
      merged.interactive,
      merged.tiltStrength,
      merged.parallax,
      merged.hoverRise,
      merged.dpr,
      reduceMotion,
    ]);

    return (
      <div
        ref={cardRef}
        className={cn(
          "relative overflow-hidden rounded-[24px] border border-white/10 bg-[#0d1017]/85 backdrop-blur-2xl shadow-2xl transition-shadow duration-500 hover:shadow-[0_0_50px_rgba(255,107,0,0.22)]",
          className
        )}
        style={{
          width,
          height,
          borderRadius,
          willChange: "transform",
          transformStyle: "preserve-3d",
          ...style,
        }}
      >
        {/* Luminous WebGL Flame Background */}
        <div
          ref={canvasContainerRef}
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{
            borderRadius,
            filter: merged.blur > 0 ? `blur(${merged.blur}px)` : undefined,
            opacity: merged.opacity,
          }}
        />

        {/* Ambient Top & Edge Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-black/60"
          style={{ borderRadius }}
        />

        {/* Card Content Overlay */}
        {children && (
          <div className="relative z-10 w-full h-full flex flex-col p-6 sm:p-8">
            {children}
          </div>
        )}
      </div>
    );
  }
);
