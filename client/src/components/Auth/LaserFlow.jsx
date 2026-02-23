import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const VERTEX_SHADER = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;
uniform float iTime;
uniform vec2 iResolution;
uniform vec3 iColor1;
uniform vec3 iColor2;
varying vec2 vUv;

float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 5; i++) {
        v += a * sin(p.x * 10.0 + iTime);
        p = m * p;
        a *= 0.5;
    }
    return v;
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - iResolution.xy) / min(iResolution.y, iResolution.x);
    float t = iTime * 0.3;
    
    vec3 finalColor = vec3(0.0);
    
    // Create dual-layered laser streaks for more depth
    for(float i=0.0; i<6.0; i++) {
        float offset = i * 1.2;
        vec2 p = uv;
        p.x += sin(p.y * 1.5 + t + offset) * 0.5;
        p.y += fbm(p * 0.4 + offset) * 0.25;
        
        float dist = abs(p.x);
        float laser = 0.008 / (dist + 0.015);
        
        // Alternate between primary color (Gold) and accent (Deep Indigo/Slate)
        vec3 col = mix(iColor1, iColor2, sin(t + i * 0.5) * 0.5 + 0.5);
        finalColor += col * laser * laser * (0.8 + 0.2 * sin(t * 2.0 + i));
    }
    
    // Ambient volumetric glow
    finalColor += iColor1 * 0.03 * (1.0 - length(uv) * 0.4);
    finalColor += iColor2 * 0.02 * (1.1 - length(uv + vec2(0.5)) * 0.5);
    
    gl_FragColor = vec4(finalColor, 1.0);
}
`;

export default function LaserFlow({ color1 = '#D4AF37', color2 = '#1E293B' }) {
    const mountRef = useRef(null);
    const rendererRef = useRef(null);
    const materialRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        if (!mountRef.current) return;

        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const geometry = new THREE.PlaneGeometry(2, 2);

        const c1 = new THREE.Color(color1);
        const c2 = new THREE.Color(color2);

        const uniforms = {
            iTime: { value: 0 },
            iResolution: { value: new THREE.Vector2(width, height) },
            iColor1: { value: new THREE.Vector3(c1.r, c1.g, c1.b) },
            iColor2: { value: new THREE.Vector3(c2.r, c2.g, c2.b) }
        };

        const material = new THREE.ShaderMaterial({
            vertexShader: VERTEX_SHADER,
            fragmentShader: FRAGMENT_SHADER,
            uniforms: uniforms,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        materialRef.current = material;

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        const handleResize = () => {
            if (!mountRef.current) return;
            const w = mountRef.current.clientWidth;
            const h = mountRef.current.clientHeight;
            renderer.setSize(w, h);
            uniforms.iResolution.value.set(w, h);
        };
        window.addEventListener('resize', handleResize);

        const animate = (time) => {
            uniforms.iTime.value = time / 1000;
            renderer.render(scene, camera);
            animationRef.current = requestAnimationFrame(animate);
        };
        animationRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            geometry.dispose();
            material.dispose();
            renderer.dispose();
        };
    }, [color1, color2]);

    return (
        <div
            ref={mountRef}
            className="absolute inset-0 z-0 pointer-events-none opacity-60 mix-blend-screen"
            style={{ width: '100%', height: '100%' }}
        />
    );
}
