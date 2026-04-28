// src/three/components/CoverageTree.tsx
// Arborescence 3D qui se déploie depuis le centre.
// Niveaux : centre (un nœud) → 3 enfants → 5 sous-enfants par enfant.
// Les nœuds apparaissent progressivement via le scale (animé par parent en GSAP).

import { useMemo } from 'react'
import * as THREE from 'three'

interface Node {
  position: [number, number, number]
  children: Node[]
}

function buildTree(): Node {
  // Centre
  const root: Node = { position: [0, 0, 0], children: [] }
  // 3 branches niveau 1
  const radius1 = 1.4
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2
    const child: Node = {
      position: [Math.cos(angle) * radius1, Math.sin(angle) * radius1, 0],
      children: [],
    }
    // 5 feuilles niveau 2
    const radius2 = 0.7
    for (let j = 0; j < 5; j++) {
      const subAngle = angle + (j - 2) * 0.3
      child.children.push({
        position: [
          child.position[0] + Math.cos(subAngle) * radius2,
          child.position[1] + Math.sin(subAngle) * radius2,
          0,
        ],
        children: [],
      })
    }
    root.children.push(child)
  }
  return root
}

interface Props {
  color?: string
}

export function CoverageTree({ color = '#00A3E0' }: Props) {
  const root = useMemo(() => buildTree(), [])

  // Liste plate des nœuds + segments pour le rendu
  const { nodes, segmentsGeometry } = useMemo(() => {
    const nodes: { pos: [number, number, number]; level: number }[] = []
    const segmentPoints: number[] = []

    function walk(node: Node, level: number) {
      nodes.push({ pos: node.position, level })
      for (const child of node.children) {
        // Chaque segment = 2 points consécutifs dans le tableau
        segmentPoints.push(...node.position, ...child.position)
        walk(child, level + 1)
      }
    }
    walk(root, 0)

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(segmentPoints, 3)
    )

    return { nodes, segmentsGeometry: geometry }
  }, [root])

  return (
    <group>
      {/* Segments (lignes entre nœuds) — utilise lineSegments pour éviter
          la collision JSX avec l'élément SVG <line>. */}
      <lineSegments geometry={segmentsGeometry}>
        <lineBasicMaterial color={color} transparent opacity={0.5} />
      </lineSegments>
      {/* Nœuds (sphères) */}
      {nodes.map((node, i) => (
        <mesh key={`node-${i}`} position={node.pos}>
          <sphereGeometry args={[node.level === 0 ? 0.15 : 0.08, 16, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.5}
          />
        </mesh>
      ))}
    </group>
  )
}
