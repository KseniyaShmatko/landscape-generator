import { hexToRgb, rgbToHex } from "../drawScene/color.js";
import { dotProductVectors } from "../drawScene/math.js";

export let light =  {
    position: [],
    direction: [0, 0, 1],
    intensity: 1.0,
    diffuseCoefficient: 0.7
};

export function calculateLambertianIntensity(normal, lightDirection, lightIntensity, diffuseCoefficient) {
    const dotProduct = Math.max(0, dotProductVectors(normal, lightDirection));
    const diffuseIntensity = lightIntensity * diffuseCoefficient * dotProduct;

    return diffuseIntensity;
}

export function applyLighting(intensity, surfaceColor, isShadowed, lightIntensity) {
    const shadowCoefficient = isShadowed ? 0.5 : 1.0;

    // Общая интенсивность с учетом теней
    const totalIntensity = (lightIntensity + (1 - lightIntensity) * intensity) * shadowCoefficient;

    let color = hexToRgb(surfaceColor);
    // Применяем интенсивность к каждому каналу цвета
    const coloredIntensity = color.map(channel => channel * totalIntensity);

    const clampedColor = coloredIntensity.map(channel => Math.min(255, Math.max(0, Math.round(channel))));

    let newColor = rgbToHex(clampedColor);    
    return newColor;
}
