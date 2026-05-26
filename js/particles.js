// Three.js Particle System with interactive effects
class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('webgl-canvas');
        
        // Detect mobile/low-end device
        this.isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
        this.hasWebGL = this.checkWebGL();
        
        if (!this.hasWebGL || this.isMobile) {
            this.showFallback();
            return;
        }
        
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas, 
            alpha: true, 
            antialias: !this.isMobile,
            powerPreference: 'low-power'
        });
        
        this.particles = null;
        this.particlePositions = null;
        this.particleVelocities = [];
        this.mouse = new THREE.Vector2(0, 0);
        this.targetMouse = new THREE.Vector2(0, 0);
        this.time = 0;
        
        this.init();
    }
    
    checkWebGL() {
        try {
            const testCanvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && 
                (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }
    
    showFallback() {
        // Create CSS particle fallback for mobile/no-WebGL
        const fallback = document.createElement('div');
        fallback.id = 'particle-fallback';
        fallback.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            overflow: hidden;
            background: radial-gradient(ellipse at center, #0a0a1a 0%, #050508 100%);
        `;
        
        // Create CSS particles
        const particleCount = this.isMobile ? 30 : 50;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            const size = Math.random() * 4 + 2;
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const duration = Math.random() * 20 + 10;
            const delay = Math.random() * -20;
            const colors = ['#00ff88', '#0088ff', '#ff0080', '#00d4aa'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                left: ${x}%;
                top: ${y}%;
                opacity: ${Math.random() * 0.5 + 0.2};
                box-shadow: 0 0 ${size * 2}px ${color};
                animation: float ${duration}s ${delay}s infinite ease-in-out;
            `;
            fallback.appendChild(particle);
        }
        
        // Add floating animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes float {
                0%, 100% { transform: translate(0, 0) scale(1); }
                25% { transform: translate(${Math.random()*100-50}px, ${Math.random()*-50}px) scale(1.2); }
                50% { transform: translate(${Math.random()*100-50}px, ${Math.random()*50}px) scale(0.8); }
                75% { transform: translate(${Math.random()*-50}px, ${Math.random()*50}px) scale(1.1); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.insertBefore(fallback, document.body.firstChild);
        this.canvas.style.display = 'none';
    }
    
    init() {
        // Setup renderer - lower pixel ratio on mobile
        const pixelRatio = this.isMobile ? 1 : Math.min(window.devicePixelRatio, 2);
        this.renderer.setPixelRatio(pixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x050508, 1);
        
        // Camera position
        this.camera.position.z = 50;
        
        // Create particles - fewer on mobile
        this.createParticles();
        
        // Create connection lines - skip on mobile
        if (!this.isMobile) {
            this.createConnections();
        }
        
        // Event listeners
        window.addEventListener('resize', () => this.onResize());
        
        if (this.isMobile) {
            window.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: true });
        } else {
            window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        }
        
        // Start animation
        this.animate();
    }
    
    createParticles() {
        // Reduce particle count on mobile
        const particleCount = this.isMobile ? 500 : 2000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        const color1 = new THREE.Color(0x00ff88); // Accent green
        const color2 = new THREE.Color(0x0088ff); // Blue
        const color3 = new THREE.Color(0xff0080); // Pink
        
        for (let i = 0; i < particleCount; i++) {
            // Position in a sphere-like distribution
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = 30 + Math.random() * 40;
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);
            
            // Velocity for animation
            this.particleVelocities.push({
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            });
            
            // Color mixing
            const colorChoice = Math.random();
            let mixedColor;
            if (colorChoice < 0.5) {
                mixedColor = color1.clone().lerp(color2, Math.random());
            } else {
                mixedColor = color1.clone().lerp(color3, Math.random());
            }
            
            colors[i * 3] = mixedColor.r;
            colors[i * 3 + 1] = mixedColor.g;
            colors[i * 3 + 2] = mixedColor.b;
            
            // Size variation
            sizes[i] = Math.random() * 2 + 0.5;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Shader material for particles
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uMouse: { value: new THREE.Vector2(0, 0) }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                uniform float uTime;
                uniform vec2 uMouse;
                
                void main() {
                    vColor = color;
                    vec3 pos = position;
                    
                    // Wave effect
                    pos.y += sin(pos.x * 0.1 + uTime) * 2.0;
                    pos.x += cos(pos.y * 0.1 + uTime * 0.5) * 2.0;
                    
                    // Mouse repulsion
                    float dist = distance(pos.xy, uMouse * 50.0);
                    if (dist < 20.0) {
                        float force = (20.0 - dist) / 20.0;
                        pos.xy += normalize(pos.xy - uMouse * 50.0) * force * 10.0;
                    }
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    float dist = length(gl_PointCoord - vec2(0.5));
                    if (dist > 0.5) discard;
                    
                    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
                    gl_FragColor = vec4(vColor, alpha * 0.8);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
        this.particlePositions = positions;
    }
    
    createConnections() {
        // Create lines between nearby particles
        const lineGeometry = new THREE.BufferGeometry();
        const linePositions = new Float32Array(2000 * 3); // Max lines
        lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
        
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.1,
            blending: THREE.AdditiveBlending
        });
        
        this.lines = new THREE.LineSegments(lineGeometry, lineMaterial);
        this.scene.add(this.lines);
    }
    
    updateConnections() {
        if (this.isMobile || !this.lines) return;
        
        const positions = this.particlePositions;
        const linePositions = this.lines.geometry.attributes.position.array;
        let lineIndex = 0;
        const maxDistance = 15;
        const maxConnections = 3;
        
        for (let i = 0; i < 200; i++) { // Check subset for performance
            let connections = 0;
            for (let j = i + 1; j < 200 && connections < maxConnections; j++) {
                const dx = positions[i * 3] - positions[j * 3];
                const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
                const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                
                if (dist < maxDistance) {
                    linePositions[lineIndex++] = positions[i * 3];
                    linePositions[lineIndex++] = positions[i * 3 + 1];
                    linePositions[lineIndex++] = positions[i * 3 + 2];
                    linePositions[lineIndex++] = positions[j * 3];
                    linePositions[lineIndex++] = positions[j * 3 + 1];
                    linePositions[lineIndex++] = positions[j * 3 + 2];
                    connections++;
                }
            }
        }
        
        // Clear remaining line positions
        for (let i = lineIndex; i < linePositions.length; i++) {
            linePositions[i] = 0;
        }
        
        this.lines.geometry.attributes.position.needsUpdate = true;
    }
    
    onMouseMove(event) {
        this.targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    
    onTouchMove(event) {
        if (event.touches.length > 0) {
            this.targetMouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
            this.targetMouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
        }
    }
    
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.time += 0.01;
        
        // Smooth mouse following
        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;
        
        // Update uniforms
        if (this.particles && this.particles.material.uniforms) {
            this.particles.material.uniforms.uTime.value = this.time;
            this.particles.material.uniforms.uMouse.value = this.mouse;
        }
        
        // Rotate particle system slowly
        if (this.particles) {
            this.particles.rotation.y += 0.001;
            this.particles.rotation.x += 0.0005;
        }
        
        // Update connections
        this.updateConnections();
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ParticleSystem());
} else {
    new ParticleSystem();
}