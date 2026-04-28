// src/three/shaders/rimLightMaterial.ts
// Shader matériau "rim light" : éclaire les bords de l'objet avec une couleur configurable.
// Le centre reste sombre (silhouette), les bords brillent.

import * as THREE from 'three'

export function createRimLightMaterial(color = '#00A3E0', intensity = 1.5) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uIntensity: { value: intensity },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vec4 viewPosition = viewMatrix * worldPosition;
        vNormal = normalize(normalMatrix * normal);
        vViewDir = normalize(-viewPosition.xyz);
        gl_Position = projectionMatrix * viewPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uIntensity;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        // Rim factor : 1 quand le normal est perpendiculaire à la vue (bords),
        // 0 quand le normal pointe vers la caméra (centre).
        float rim = 1.0 - max(dot(vNormal, vViewDir), 0.0);
        rim = pow(rim, 2.5) * uIntensity;
        gl_FragColor = vec4(uColor * rim, rim);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
  })
}
