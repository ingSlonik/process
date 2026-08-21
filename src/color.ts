// Cauchy's dispersion equation: n(lambda) = n_base + B / lambda^2
export function getRefractiveIndex(baseIndex: number, dispersionB: number, wavelengthNm: number): number {
  return baseIndex + dispersionB / (wavelengthNm * wavelengthNm);
}

// Convert wavelength (in nm, 380 - 750) to [r, g, b] in range [0, 255]
export function wavelengthToRGB(wavelength: number): [number, number, number] {
  const wl = Math.max(380, Math.min(750, wavelength));
  let r = 0;
  let g = 0;
  let b = 0;

  if (wl >= 380 && wl < 440) {
    r = -(wl - 440) / (440 - 380);
    g = 0;
    b = 1;
  } else if (wl >= 440 && wl < 490) {
    r = 0;
    g = (wl - 440) / (490 - 440);
    b = 1;
  } else if (wl >= 490 && wl < 510) {
    r = 0;
    g = 1;
    b = -(wl - 510) / (510 - 490);
  } else if (wl >= 510 && wl < 580) {
    r = (wl - 510) / (580 - 510);
    g = 1;
    b = 0;
  } else if (wl >= 580 && wl < 645) {
    r = 1;
    g = -(wl - 645) / (645 - 580);
    b = 0;
  } else if (wl >= 645 && wl <= 750) {
    r = 1;
    g = 0;
    b = 0;
  }

  // Smooth edge falloff
  let factor = 1.0;
  if (wl >= 380 && wl < 420) {
    factor = 0.3 + (0.7 * (wl - 380)) / (420 - 380);
  } else if (wl >= 680 && wl <= 750) {
    factor = 0.3 + (0.7 * (750 - wl)) / (750 - 680);
  }

  const gamma = 0.8;
  const adjust = (c: number) => (c <= 0 ? 0 : Math.round(255 * Math.pow(c * factor, gamma)));

  return [adjust(r), adjust(g), adjust(b)];
}

// Convert wavelength to RGBA string with custom alpha for additive blending
export function wavelengthToRGBA(wavelength: number, alpha: number = 0.08): string {
  const [r, g, b] = wavelengthToRGB(wavelength);
  return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
}

// Get bright CSS color hex/rgb for UI and target icons
export function wavelengthToHex(wavelength: number): string {
  const [r, g, b] = wavelengthToRGB(wavelength);
  const hex = (v: number) => v.toString(16).padStart(2, '0');
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

// Spectral classification helper
export function getSpectrumName(wl: number): string {
  if (wl < 430) return 'Violet';
  if (wl < 485) return 'Blue';
  if (wl < 515) return 'Cyan';
  if (wl < 565) return 'Green';
  if (wl < 595) return 'Yellow';
  if (wl < 630) return 'Orange';
  return 'Red';
}
