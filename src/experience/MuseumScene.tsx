import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, OrbitControls, RoundedBox, Sparkles } from "@react-three/drei";
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

import type { HistoryChapter } from "../content/history";
import type { MuseumMode } from "./museumState";

export interface MuseumQuality {
  dpr: number;
  shadows: boolean;
  shadowMapSize: number;
  dustCount: number;
}

export interface MuseumSceneProps {
  chapter: HistoryChapter;
  pageIndex: number;
  mode: MuseumMode;
  quality: MuseumQuality;
  reducedMotion: boolean;
  onOpenArtifact: (artifactIndex: number) => void;
  onSwipe: (direction: "next" | "previous") => void;
}

const palette = {
  wall: "#220b0d",
  wallLight: "#3b1416",
  walnut: "#321714",
  walnutLight: "#6b3420",
  brass: "#c58a4e",
  paper: "#e8d6b6",
  ink: "#382a23",
};

function createCanvasTexture(
  title: string,
  period: string,
  accent: string,
  variant: "cover" | "paper",
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = variant === "cover" ? 512 : 720;
  canvas.height = variant === "cover" ? 720 : 520;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas 2D context is unavailable");
  }

  if (variant === "cover") {
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#6f171f");
    gradient.addColorStop(0.5, "#9d2b32");
    gradient.addColorStop(1, "#4a0f15");
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "rgba(227, 178, 94, .72)";
    context.lineWidth = 5;
    context.strokeRect(28, 28, canvas.width - 56, canvas.height - 56);
    context.lineWidth = 1;
    context.strokeRect(43, 43, canvas.width - 86, canvas.height - 86);
    context.fillStyle = "rgba(229, 181, 96, .88)";
    context.textAlign = "center";
    context.font = "600 20px Inter, Arial, sans-serif";
    context.fillText("LƯU TRỮ / 03", canvas.width / 2, 108);
    context.font = "400 44px Georgia, serif";
    const words = title.split(" ");
    const rows: string[] = [];
    let row = "";
    for (const word of words) {
      if (`${row} ${word}`.trim().length > 17) {
        rows.push(row);
        row = word;
      } else {
        row = `${row} ${word}`.trim();
      }
    }
    if (row) rows.push(row);
    rows.slice(0, 4).forEach((line, index) => {
      context.fillText(line, canvas.width / 2, 270 + index * 52);
    });
    context.font = "500 18px Inter, Arial, sans-serif";
    context.fillText(period, canvas.width / 2, canvas.height - 108);
    context.fillStyle = accent;
    context.beginPath();
    context.arc(canvas.width / 2, canvas.height / 2 + 44, 32, 0, Math.PI * 2);
    context.strokeStyle = "rgba(235, 194, 111, .82)";
    context.lineWidth = 2;
    context.stroke();
    context.fillStyle = "rgba(248, 220, 150, .92)";
    context.fillRect(canvas.width / 2 - 1, canvas.height / 2 + 13, 2, 62);
  } else {
    context.fillStyle = "#e9d6b7";
    context.fillRect(0, 0, canvas.width, canvas.height);
    const paperGradient = context.createLinearGradient(0, 0, 0, canvas.height);
    paperGradient.addColorStop(0, "rgba(255,255,255,.2)");
    paperGradient.addColorStop(1, "rgba(128,74,41,.1)");
    context.fillStyle = paperGradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "rgba(111, 56, 38, .32)";
    context.lineWidth = 2;
    context.strokeRect(22, 22, canvas.width - 44, canvas.height - 44);
    context.fillStyle = palette.ink;
    context.textAlign = "left";
    context.font = "600 18px Inter, Arial, sans-serif";
    context.fillText(period, 54, 78);
    context.font = "400 34px Georgia, serif";
    context.fillText(title, 54, 132);
    context.strokeStyle = accent;
    context.lineWidth = 5;
    context.beginPath();
    context.moveTo(54, 162);
    context.lineTo(176, 162);
    context.stroke();
    context.strokeStyle = "rgba(56, 42, 35, .24)";
    context.lineWidth = 2;
    for (let y = 218; y < canvas.height - 56; y += 28) {
      context.beginPath();
      context.moveTo(54, y);
      context.lineTo(canvas.width - 54 - ((y / 28) % 3) * 38, y);
      context.stroke();
    }
    context.fillStyle = "rgba(139, 59, 43, .36)";
    context.beginPath();
    context.arc(canvas.width - 130, canvas.height - 92, 38, 0, Math.PI * 2);
    context.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function createDustPositions(count: number): Float32Array {
  const values = new Float32Array(count * 3);
  let seed = 29;
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let index = 0; index < count; index += 1) {
    values[index * 3] = (random() - 0.5) * 11;
    values[index * 3 + 1] = random() * 4.7 + 0.15;
    values[index * 3 + 2] = (random() - 0.5) * 6.4 - 0.2;
  }

  return values;
}

function CameraMovement({ mode, reducedMotion }: Pick<MuseumSceneProps, "mode" | "reducedMotion">) {
  const { current: target } = useRef(new THREE.Vector3());

  useFrame(({ camera, clock }) => {
    const intro = mode === "intro";
    const destination = intro ? [0, 2.8, 8.9] : mode === "credits" ? [0, 3.2, 9] : [0, 2.35, 6.6];
    const breathing = reducedMotion ? 0 : Math.sin(clock.getElapsedTime() * 0.22) * 0.045;
    target.set(destination[0], destination[1] + breathing, destination[2]);
    camera.position.lerp(target, reducedMotion ? 0.14 : 0.045);
    camera.lookAt(0, 0.95, -0.2);
  });

  return null;
}

function ArchiveWall({ chapter, reducedMotion }: Pick<MuseumSceneProps, "chapter" | "reducedMotion">) {
  const glowRef = useRef<THREE.Mesh>(null);
  const wallTexture = useMemo(() => {
    const texture = new THREE.TextureLoader().load("/assets/museum/archive-wall-texture.png");
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2.1, 1.15);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  useFrame(({ clock }) => {
    if (!glowRef.current || reducedMotion) return;
    const material = glowRef.current.material as THREE.MeshBasicMaterial;
    material.opacity = 0.19 + Math.sin(clock.getElapsedTime() * 0.55) * 0.035;
  });

  return (
    <group>
      <mesh position={[0, 3.4, -3.15]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial map={wallTexture} color={palette.wall} roughness={0.96} metalness={0.04} />
      </mesh>
      <mesh ref={glowRef} position={[0, 2.6, -3.08]}>
        <planeGeometry args={[8.5, 4.8]} />
        <meshBasicMaterial color={chapter.accent} transparent opacity={0.2} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color="#160d0c" roughness={0.72} metalness={0.08} />
      </mesh>
      <mesh position={[0, 7.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color="#120809" roughness={1} />
      </mesh>
      <ArchiveFrame position={[-3.25, 3.45, -3.04]} size={[2.25, 2.7]} accent={chapter.accent} />
      <ArchiveFrame position={[3.35, 3.45, -3.04]} size={[2.2, 2.7]} accent={chapter.accent} />
      <mesh position={[0, 5.55, -3.02]}>
        <boxGeometry args={[5.4, 0.018, 0.018]} />
        <meshBasicMaterial color={chapter.accent} transparent opacity={0.58} />
      </mesh>
    </group>
  );
}

function ArchiveFrame({
  position,
  size,
  accent,
}: {
  position: [number, number, number];
  size: [number, number];
  accent: string;
}) {
  return (
    <group position={position}>
      <RoundedBox args={[size[0] + 0.28, size[1] + 0.28, 0.14]} radius={0.04} smoothness={4}>
        <meshStandardMaterial color={palette.walnutLight} roughness={0.72} metalness={0.18} />
      </RoundedBox>
      <mesh position={[0, 0, 0.081]}>
        <planeGeometry args={size} />
        <meshBasicMaterial color="#2f1112" />
      </mesh>
      <mesh position={[0, 0, 0.09]}>
        <ringGeometry args={[Math.min(size[0], size[1]) * 0.18, Math.min(size[0], size[1]) * 0.2, 32]} />
        <meshBasicMaterial color={accent} transparent opacity={0.58} />
      </mesh>
    </group>
  );
}

function MuseumTable({ chapter, quality }: Pick<MuseumSceneProps, "chapter" | "quality">) {
  return (
    <group position={[0, 0, 0.35]}>
      <RoundedBox args={[7.2, 0.46, 3.3]} radius={0.12} smoothness={5} castShadow receiveShadow>
        <meshStandardMaterial color={palette.walnut} roughness={0.6} metalness={0.12} />
      </RoundedBox>
      <mesh position={[0, 0.26, 0]} receiveShadow>
        <boxGeometry args={[6.65, 0.035, 2.8]} />
        <meshStandardMaterial color="#74422a" roughness={0.72} metalness={0.05} />
      </mesh>
      {[-2.85, 2.85].map((x) => (
        <RoundedBox key={x} args={[0.35, 2.35, 0.35]} radius={0.06} smoothness={3} position={[x, -1.15, 0]} castShadow>
          <meshStandardMaterial color={palette.walnut} roughness={0.76} />
        </RoundedBox>
      ))}
      <mesh position={[0, 0.5, -0.95]}>
        <boxGeometry args={[2.7, 0.025, 0.025]} />
        <meshBasicMaterial color={chapter.accent} transparent opacity={0.62} />
      </mesh>
      <spotLight
        position={[0, 4.6, 0.35]}
        angle={0.56}
        penumbra={0.82}
        intensity={quality.shadows ? 85 : 58}
        distance={8}
        color="#ffd8a1"
        castShadow={quality.shadows}
        shadow-mapSize-width={quality.shadowMapSize}
        shadow-mapSize-height={quality.shadowMapSize}
      />
    </group>
  );
}

function ArchiveShelves({ accent }: { accent: string }) {
  const bookColors = ["#5d2a25", "#7b4430", "#263d3a", "#9b623b", "#46191e", "#4d4933"];

  return (
    <group>
      {[-5.15, 5.15].map((x) => (
        <group key={x} position={[x, 1.78, -1.3]}>
          <RoundedBox args={[1.35, 4.15, 0.42]} radius={0.05} smoothness={3}>
            <meshStandardMaterial color={palette.walnut} roughness={0.8} />
          </RoundedBox>
          {[0.05, 1.2, 2.35, 3.5].map((y, shelfIndex) => (
            <group key={y} position={[0, y - 1.7, 0.02]}>
              <mesh receiveShadow>
                <boxGeometry args={[1.7, 0.08, 0.75]} />
                <meshStandardMaterial color={palette.walnutLight} roughness={0.76} />
              </mesh>
              {Array.from({ length: 5 }).map((_, bookIndex) => (
                <RoundedBox
                  key={bookIndex}
                  args={[0.22 + (bookIndex % 2) * 0.05, 0.68 + ((bookIndex + shelfIndex) % 3) * 0.1, 0.52]}
                  radius={0.025}
                  smoothness={2}
                  position={[-0.62 + bookIndex * 0.3, 0.4, 0]}
                  rotation={[0, 0, (bookIndex % 2 ? 1 : -1) * 0.025]}
                >
                  <meshStandardMaterial color={bookColors[(bookIndex + shelfIndex) % bookColors.length]} roughness={0.7} />
                </RoundedBox>
              ))}
            </group>
          ))}
          <mesh position={[0, 4.02, 0.23]}>
            <boxGeometry args={[1.52, 0.016, 0.018]} />
            <meshBasicMaterial color={accent} transparent opacity={0.48} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Projector({ accent, reducedMotion }: { accent: string; reducedMotion: boolean }) {
  const beamRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!beamRef.current || reducedMotion) return;
    beamRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.18) * 0.015;
  });

  return (
    <group position={[3.35, 1.55, -0.35]} rotation={[0, -0.18, 0]}>
      <RoundedBox args={[1.2, 0.52, 0.84]} radius={0.08} smoothness={4} castShadow>
        <meshStandardMaterial color="#222021" roughness={0.42} metalness={0.68} />
      </RoundedBox>
      <mesh position={[0, 0, 0.46]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.25, 0.055, 12, 32]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.2} metalness={0.42} roughness={0.3} />
      </mesh>
      <mesh ref={beamRef} position={[0, 1.05, -1.65]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.95, 3.1, 32, 1, true]} />
        <meshBasicMaterial color={accent} transparent opacity={0.035} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.55, 0]}>
        <boxGeometry args={[0.08, 1.25, 0.08]} />
        <meshStandardMaterial color="#423b37" metalness={0.72} roughness={0.26} />
      </mesh>
    </group>
  );
}

function AnimatedMotif({ chapter, reducedMotion }: Pick<MuseumSceneProps, "chapter" | "reducedMotion">) {
  const groupRef = useRef<THREE.Group>(null);
  const points = useMemo(() => {
    if (chapter.motif === "journey") {
      return [
        [-2.1, 2.9, -2.97],
        [-1.2, 3.1, -2.97],
        [-0.45, 2.8, -2.97],
        [0.35, 3.04, -2.97],
        [1.4, 2.72, -2.97],
        [2.35, 2.96, -2.97],
      ] as [number, number, number][];
    }
    if (chapter.motif === "press") {
      return [
        [-2.2, 2.5, -2.96],
        [-1.25, 3.3, -2.96],
        [-0.22, 2.55, -2.96],
        [0.82, 3.32, -2.96],
        [2.2, 2.62, -2.96],
      ] as [number, number, number][];
    }
    if (chapter.motif === "terrain") {
      return [
        [-2.5, 2.5, -2.96],
        [-1.65, 3.15, -2.96],
        [-0.75, 2.65, -2.96],
        [0.05, 3.38, -2.96],
        [0.9, 2.75, -2.96],
        [1.95, 3.25, -2.96],
      ] as [number, number, number][];
    }
    return [
      [-2.25, 2.82, -2.96],
      [-1.35, 3.28, -2.96],
      [-0.35, 2.62, -2.96],
      [0.65, 3.28, -2.96],
      [1.7, 2.72, -2.96],
      [2.35, 3.18, -2.96],
    ] as [number, number, number][];
  }, [chapter.motif]);

  useFrame(({ clock }) => {
    if (!groupRef.current || reducedMotion) return;
    groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.18) * 0.012;
    groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.45) * 0.025;
  });

  return (
    <group ref={groupRef}>
      <Line points={points} color={chapter.accent} lineWidth={1.2} transparent opacity={0.62} />
      {points.map(([x, y, z], index) => (
        <mesh key={`${x}-${y}-${index}`} position={[x, y, z + 0.012]}>
          <circleGeometry args={[0.055 + (index % 2) * 0.02, 16]} />
          <meshBasicMaterial color={chapter.accent} transparent opacity={0.72} />
        </mesh>
      ))}
      {chapter.motif === "bridge" && (
        <group position={[0, 2.92, -2.945]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.48, 0.025, 8, 32, Math.PI]} />
            <meshBasicMaterial color={chapter.accent} transparent opacity={0.68} />
          </mesh>
          <mesh rotation={[0, 0, -Math.PI / 2]}>
            <torusGeometry args={[0.48, 0.025, 8, 32, Math.PI]} />
            <meshBasicMaterial color={chapter.accent} transparent opacity={0.68} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function SkinnedPage({
  chapter,
  turn,
  side,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  chapter: HistoryChapter;
  turn: number;
  side: "left" | "right";
  onPointerDown: (event: { clientX: number; stopPropagation: () => void }) => void;
  onPointerMove: (event: { clientX: number; buttons: number; stopPropagation: () => void }) => void;
  onPointerUp: (event: { stopPropagation: () => void }) => void;
}) {
  const mesh = useMemo(() => {
    const width = 1.65;
    const height = 2.25;
    const boneCount = 12;
    const geometry = new THREE.PlaneGeometry(width, height, boneCount * 2, 2);
    geometry.translate(width / 2, 0, 0);
    const vertexCount = geometry.attributes.position.count;
    const skinIndices = new Uint16Array(vertexCount * 4);
    const skinWeights = new Float32Array(vertexCount * 4);
    const position = geometry.attributes.position;

    for (let index = 0; index < vertexCount; index += 1) {
      const normalizedX = THREE.MathUtils.clamp(position.getX(index) / width, 0, 1);
      const scaled = normalizedX * boneCount;
      const primaryBone = Math.min(Math.floor(scaled), boneCount - 1);
      const blend = scaled - primaryBone;
      skinIndices[index * 4] = primaryBone;
      skinIndices[index * 4 + 1] = Math.min(primaryBone + 1, boneCount);
      skinWeights[index * 4] = 1 - blend;
      skinWeights[index * 4 + 1] = blend;
    }
    geometry.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(skinIndices, 4));
    geometry.setAttribute("skinWeight", new THREE.Float32BufferAttribute(skinWeights, 4));

    const bones: THREE.Bone[] = [];
    const root = new THREE.Bone();
    bones.push(root);
    let previous = root;
    for (let index = 1; index <= boneCount; index += 1) {
      const bone = new THREE.Bone();
      bone.position.x = width / boneCount;
      previous.add(bone);
      bones.push(bone);
      previous = bone;
    }
    const skeleton = new THREE.Skeleton(bones);
    const material = new THREE.MeshStandardMaterial({
      color: palette.paper,
      roughness: 0.94,
      metalness: 0,
      side: THREE.DoubleSide,
      emissive: "#3a2118",
      emissiveIntensity: 0.04,
    });
    const skinned = new THREE.SkinnedMesh(geometry, material);
    skinned.add(root);
    skinned.bind(skeleton);
    skinned.castShadow = true;
    skinned.receiveShadow = true;
    return skinned;
  }, []);

  useFrame(() => {
    const bones = mesh.skeleton.bones;
    const amount = THREE.MathUtils.clamp(turn, 0, 1);
    bones.forEach((bone, index) => {
      const normalized = index / Math.max(1, bones.length - 1);
      const curl = Math.sin(normalized * Math.PI) * amount;
      bone.rotation.z = (side === "right" ? -1 : 1) * curl * 0.72;
      bone.rotation.y = (side === "right" ? 1 : -1) * amount * normalized * 0.14;
    });
  });

  return (
    <primitive
      object={mesh}
      position={[0, 0.14, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      scale-x={side === "left" ? -1 : 1}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    />
  );
}

function BookModel({
  chapter,
  pageIndex,
  mode,
  reducedMotion,
  onOpenArtifact,
  onSwipe,
}: Pick<MuseumSceneProps, "chapter" | "pageIndex" | "mode" | "reducedMotion" | "onOpenArtifact" | "onSwipe">) {
  const groupRef = useRef<THREE.Group>(null);
  const coverTexture = useMemo(
    () => createCanvasTexture(chapter.title, chapter.period, chapter.accent, "cover"),
    [chapter.title, chapter.period, chapter.accent],
  );
  const paperTexture = useMemo(
    () => createCanvasTexture(chapter.title, chapter.period, chapter.accent, "paper"),
    [chapter.title, chapter.period, chapter.accent],
  );
  const heroTexture = useMemo(() => {
    const texture = new THREE.TextureLoader().load(chapter.heroImage.localPath);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }, [chapter.heroImage.localPath]);
  const dragStart = useRef<number | null>(null);
  const [dragAmount, setDragAmount] = useState(0);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const float = reducedMotion ? 0 : Math.sin(clock.getElapsedTime() * 0.72) * 0.035;
    const introLift = mode === "intro" ? 0.1 : 0;
    groupRef.current.position.y = 0.72 + float + introLift;
    groupRef.current.rotation.y = reducedMotion ? 0 : Math.sin(clock.getElapsedTime() * 0.22) * 0.035;
  });

  const baseTurn = THREE.MathUtils.clamp(pageIndex / 5, 0, 1);
  const effectiveTurn = THREE.MathUtils.clamp(baseTurn + dragAmount * 0.5, 0, 1);
  const handlePointerDown = (event: { clientX: number; stopPropagation: () => void }) => {
    event.stopPropagation();
    dragStart.current = event.clientX;
  };
  const handlePointerMove = (event: { clientX: number; buttons: number; stopPropagation: () => void }) => {
    if (dragStart.current === null || event.buttons === 0) return;
    event.stopPropagation();
    setDragAmount(THREE.MathUtils.clamp((event.clientX - dragStart.current) / 210, -1, 1));
  };
  const handlePointerUp = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    if (Math.abs(dragAmount) > 0.16) {
      onSwipe(dragAmount > 0 ? "previous" : "next");
    }
    dragStart.current = null;
    setDragAmount(0);
  };

  return (
    <group ref={groupRef} position={[0, 0.72, 0]} rotation={[-0.025, 0, 0]}>
      <RoundedBox args={[3.58, 0.18, 2.46]} radius={0.11} smoothness={5} castShadow receiveShadow>
        <meshStandardMaterial color="#55171b" roughness={0.72} metalness={0.08} />
      </RoundedBox>
      <mesh position={[0, 0.106, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <planeGeometry args={[3.42, 2.35]} />
        <meshStandardMaterial map={coverTexture} roughness={0.88} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.23, 0]}>
        <boxGeometry args={[0.16, 0.11, 2.27]} />
        <meshStandardMaterial color="#d0a35a" roughness={0.68} metalness={0.42} />
      </mesh>
      <SkinnedPage
        chapter={chapter}
        turn={effectiveTurn}
        side="left"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      <SkinnedPage
        chapter={chapter}
        turn={1 - effectiveTurn}
        side="right"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      <mesh position={[-0.82, 0.19, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.52, 2.12]} />
        <meshStandardMaterial map={paperTexture} roughness={0.96} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.82, 0.19, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.52, 2.12]} />
        <meshStandardMaterial map={heroTexture} roughness={0.88} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.82, 0.205, 1.03]} rotation={[-Math.PI / 2, 0, 0]} onClick={(event) => { event.stopPropagation(); onOpenArtifact(0); }}>
        <planeGeometry args={[0.98, 0.56]} />
        <meshBasicMaterial map={heroTexture} transparent opacity={0.94} />
      </mesh>
      <mesh position={[-0.82, 0.205, -0.84]} rotation={[-Math.PI / 2, 0, 0]} onClick={(event) => { event.stopPropagation(); onOpenArtifact(1); }}>
        <planeGeometry args={[0.86, 0.44]} />
        <meshBasicMaterial map={heroTexture} transparent opacity={0.68} />
      </mesh>
      <mesh position={[0, 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.12, 2.16]} />
        <meshBasicMaterial color="#6d3e27" transparent opacity={0.45} />
      </mesh>
    </group>
  );
}

function Dust({ quality, reducedMotion }: Pick<MuseumSceneProps, "quality" | "reducedMotion">) {
  const pointsRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => createDustPositions(quality.dustCount), [quality.dustCount]);

  useFrame(({ clock }) => {
    if (!pointsRef.current || reducedMotion) return;
    pointsRef.current.rotation.y = clock.getElapsedTime() * 0.006;
    pointsRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.17) * 0.035;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#f1d3a3" size={0.028} transparent opacity={0.36} depthWrite={false} sizeAttenuation />
    </points>
  );
}

export function MuseumScene({
  chapter,
  pageIndex,
  mode,
  quality,
  reducedMotion,
  onOpenArtifact,
  onSwipe,
}: MuseumSceneProps) {
  return (
    <>
      <color attach="background" args={[palette.wall]} />
      <fog attach="fog" args={[palette.wall, 5.8, 14]} />
      <ambientLight intensity={0.52} color="#7d4d45" />
      <hemisphereLight intensity={0.5} color="#e6ba88" groundColor="#17090a" />
      <spotLight position={[0, 6.4, 1.8]} angle={0.46} penumbra={1} intensity={42} distance={12} color="#ffca88" castShadow={quality.shadows} />
      <pointLight position={[-3.6, 2.5, 0.5]} intensity={3.2} distance={7} color={chapter.accent} />
      <pointLight position={[3.5, 2.5, -1.8]} intensity={2.4} distance={6} color="#b7795f" />
      <ArchiveWall chapter={chapter} reducedMotion={reducedMotion} />
      <ArchiveShelves accent={chapter.accent} />
      <MuseumTable chapter={chapter} quality={quality} />
      <Projector accent={chapter.accent} reducedMotion={reducedMotion} />
      <AnimatedMotif chapter={chapter} reducedMotion={reducedMotion} />
      <BookModel
        chapter={chapter}
        pageIndex={pageIndex}
        mode={mode}
        reducedMotion={reducedMotion}
        onOpenArtifact={onOpenArtifact}
        onSwipe={onSwipe}
      />
      <Dust quality={quality} reducedMotion={reducedMotion} />
      <Sparkles count={Math.max(5, Math.floor(quality.dustCount / 10))} scale={[10, 4.5, 6]} size={1.25} speed={0.12} noise={0.34} color="#e3b77e" />
      <CameraMovement mode={mode} reducedMotion={reducedMotion} />
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={5.4}
        maxDistance={9.8}
        minPolarAngle={1.02}
        maxPolarAngle={1.47}
        minAzimuthAngle={-0.52}
        maxAzimuthAngle={0.52}
        target={[0, 0.98, -0.2]}
        enableDamping
        dampingFactor={0.08}
      />
      <EffectComposer multisampling={0}>
        <Bloom intensity={0.62} luminanceThreshold={0.78} luminanceSmoothing={0.35} mipmapBlur />
        <Noise premultiply opacity={0.045} />
        <Vignette eskil darkness={0.72} offset={0.22} />
      </EffectComposer>
    </>
  );
}
