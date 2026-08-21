# ✨ Spectral Horn 🦄🔬
> *When theoretical optics, procedural rendering, crystal unicorns, and an unforgiving 13-kilobyte limit collide.*

[![JS13kGames](https://img.shields.io/badge/JS13kGames-2026-ff0055.svg?style=flat-square)](https://js13kgames.com)
[![Bundle Size](https://img.shields.io/badge/size-%3C%2013%20KB%20(ECT%20ZIP)-brightgreen.svg?style=flat-square)](#-how-on-earth-did-this-fit-in-13-kb)
[![Physics](https://img.shields.io/badge/optics-Snell%20%2B%20Cauchy%20%2B%20TIR-blueviolet.svg?style=flat-square)](#-physics-under-the-hood-why-light-is-fascinating)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

---

## 🧐 What's the Big Idea?

In 1666, Sir Isaac Newton stuck a glass prism into a sunbeam and proved that white light is secretly a chaotic party of all rainbow colors combined. 

Naturally, we asked the ultimate follow-up question of modern science: **What if that prism was actually the crystalline horn of a celestial unicorn, and you had to solve wicked optical puzzles with it?**

**Spectral Horn** is a 2D optical puzzle game handcrafted for the **[js13kGames](https://js13kgames.com/)** challenge. No bloated game engines, zero megabytes of textures, and strictly zero pre-rendered fakery. Every single ray of light—from Cauchy wavelength dispersion to Total Internal Reflection (TIR)—is computed in real time on your CPU and rendered with the pure HTML5 Canvas 2D API.

---

## 🌈 Physics Under the Hood (Why Light is Genuinely Awesome)

The optics in this game are not an arcade approximation like “red bounces right because reasons”. Every single ray obeys the actual laws of wave and geometric optics:

```
                      \  Surface Normal (n)
                       \
     Incident Ray in Air\       
      (n₁ = 1.00)        \  θ₁  
    --------------------->\ | . . . . . . . . .
    ═══════════════════════╲═══════════════════  Crystal Horn Interface
                            \ θ₂
                             \    Refracted Ray in Horn
                              \   (n₂ = n(λ) > 1.0)
```

### 1. Snell's Law of Refraction (Snell-Descartes)
At each boundary interface (air $\leftrightarrow$ unicorn horn), the angle of refraction follows:

$$n_1 \sin(\theta_1) = n_2 \sin(\theta_2)$$

In vector form, for an incident unit vector $\vec{v}$ and surface normal $\vec{n}$, the refracted direction $\vec{r}$ is calculated as:

$$\vec{r} = \eta \vec{v} + \left(\eta (\vec{n} \cdot (-\vec{v})) - \sqrt{1 - \eta^2 (1 - (\vec{n} \cdot (-\vec{v}))^2)}\right) \vec{n}$$

where $\eta = \frac{n_1}{n_2}$. If the expression under the square root drops below zero, nature triggers...

### 2. Total Internal Reflection (TIR)
When light travels from an optically denser medium (crystal horn, $n \approx 1.5$) into a rarer one (air, $n = 1.0$) at an angle steeper than the critical angle:

$$\theta_c = \arcsin\left(\frac{n_2}{n_1}\right)$$

light cannot escape the crystal and bounces back inside with **100% efficiency** and zero loss of energy. This exact principle powers modern fiber-optic internet, submarine periscopes—and in our game, trick levels where you must trap light inside a horn to steer it around dark obsidian walls.

### 3. Cauchy's Dispersion Equation (How Rainbows are Born)
Why does white light split into a spectrum inside the horn? Because the refractive index $n$ **is not constant for all colors**!

We simulate this with Cauchy's empirical dispersion formula:

$$n(\lambda) = n_{\text{base}} + \frac{B}{\lambda^2}$$

- **Violet light** ($\lambda \approx 400\text{ nm}$) has a shorter wavelength $\implies$ **higher refractive index** $\implies$ **bends more sharply**.
- **Red light** ($\lambda \approx 700\text{ nm}$) has a longer wavelength $\implies$ **lower refractive index** $\implies$ **bends more gently**.

Thanks to this physical phenomenon, a single compact white beam (composed of dozens of discrete wavelengths $\lambda \in [400, 700]\text{ nm}$) fans out into a continuous, vibrant spectral rainbow.

### 4. Wavelength to sRGB Mapping (CIE Standard)
Every ray in the game carries a real physical wavelength $\lambda$ in nanometers. To display on computer screens, the wavelength is mapped to human color perception (sRGB tristimulus approximation) with non-linear gamma correction ($\gamma = 0.8$) and smooth perceptual sensitivity falloff at spectral boundaries (380 nm and 750 nm).

---

## 🎨 Rendering Engine Architecture

When you have a 13-kilobyte budget for code, sound, levels, and visuals, loading Three.js or heavyweight shaders is out of the question.

```
       [ 48–64 Spectral Rays with varying λ ]
                   │
                   ▼
       ┌───────────────────────────────────┐
       │     Analytical 2D Raytracer       │  (Up to 12 bounces / refractions per ray)
       └───────────────────────────────────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
    Pass 1: Bloom       Pass 2: Core
    (Soft wide beam,    (Sharp narrow beam,
     subtle alpha)       high saturation)
         │                   │
         └─────────┬─────────┘
                   ▼
    [ ctx.globalCompositeOperation = 'lighter' ]  ==>  ✨ True Additive Photon Mixing
```

1. **Real-time Analytical 2D Raytracer:**
   - No stepped raymarching through blurry grids.
   - Exact mathematical intersection of ray $\vec{P}(t) = \vec{O} + t\vec{D}$ with line segments of polygon edges (crystal horns, obsidian walls, and chrome mirrors) using cross products and determinants.
   - Recursive ray tracing up to **12 bounces/refractions** per ray across dozens of wavelengths at a rock-solid **60 FPS**.

2. **Additive Light Blending (`globalCompositeOperation = 'lighter'`):**
   - Rays are rendered in two passes:
     - **Bloom Pass:** Wider, soft translucent beam simulating atmospheric glow and optical dispersion.
     - **Core Pass:** Sharp, intensely radiant beam core.
   - When dispersed spectral rays recombine at a single focal point, their colors additively sum back into pure white light—exactly like in physical reality!

3. **Pure Procedural Vector Visuals:**
   - Minimalist unicorn silhouettes, crystalline horn facets, diptychs, sensors, and starry particle systems are generated entirely with mathematical curves (Bézier curves, quadratic arcs, dynamic gradients).
   - Razor-sharp at any resolution (from mobile phones to 4K Retina displays).

4. **Procedural Web Audio Synthesis:**
   - Crystalline rotation chimes, energy pulses during sensor charging, and triumphant victory arpeggios are synthesized on the fly via the browser's `AudioContext`, custom oscillators (`sine`, `triangle`, `square`), and exponential gain ramps. 0 bytes of audio files!

---

## 🗜️ How on Earth Did This Fit in 13 KB?

The JS13k competition limit is **13,312 bytes** in a `.zip` archive. Our custom build pipeline wrings out every single bit:

| Step | Tool | What it does |
| :--- | :--- | :--- |
| **1. Bundle** | `esbuild` | Compiles TypeScript into a single self-contained IIFE bundle. |
| **2. JS Minify** | `terser` | 3 aggressive passes with `unsafe_math`, `pure_getters`, and top-level mangling. |
| **3. CSS Minify**| `csso` | Structural optimization and style minification. |
| **4. Inlining** | `html-minifier-terser` | Inlines all minified CSS and JS directly into `index.html` with zero external dependencies. |
| **5. Ultra ZIP** | `ect` (Enhanced Compression Tool) | Maximum DEFLATE compression with stripped metadata (`-9 -strip`). |

The resulting archive currently weighs in at **~11.05 KB (11,312 bytes)**—a comfortable **2,000 bytes below the limit**, leaving plenty of headroom for extra optical wizardry!

---

## 🎮 Controls & Gameplay Mechanics

| Action | Controls |
| :--- | :--- |
| **Move Unicorn** | Click and drag the unicorn's body |
| **Rotate Horn** | Drag the **golden knob** at the horn tip / **Mouse Scroll Wheel** |
| **Objective** | Disperse white light and illuminate each target sensor with its designated wavelength (e.g. 540 nm for green, 650 nm for red). |
| **Charge Sensor** | Sensors require a steady beam of matching color photons—reaching 100% locks the sensor. |

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js $\ge$ 18
- npm

### Installation & Development
```bash
# 1. Clone repository
git clone https://github.com/your-username/spectral-horn.git
cd spectral-horn

# 2. Install dependencies
npm install

# 3. Start local Vite development server
npm run dev
```
Open `http://localhost:5173` in your browser.

### Building the JS13k Production Package
```bash
npm run build
```
The optimized and compressed archive will be generated at `dist/spectral-horn.zip`. The build script automatically outputs your exact byte usage relative to the 13 KB limit.

---

## 📜 License

This project is licensed under the [MIT](LICENSE) License.

---
<p align="center">
  <i>“Nature does not conceal her secrets through malice, but through her own grandeur.”</i><br>
  — Albert Einstein (most likely while experimenting with light and unicorns) ✨🦄
</p>
