//
// src/app/utils/scoringUtils.js
// Shared scoring utilities for quiz games
//

/**
 * Recognition tier difficulty multipliers
 * Higher tiers = harder songs = more points
 */
export const TIER_MULTIPLIERS = {
  1: 1.0,   // Iconic - Everyone knows it
  2: 1.5,   // Essential - Milonga staples
  3: 2.0,   // Familiar - You've heard it
  4: 4.0,   // Challenging - Tests your ears
  5: 5.0,   // Deep Cuts - DJ-level knowledge
};

/**
 * Singer filter multiplier (fewer songs = harder)
 */
export const SINGER_MULTIPLIER = 1.25;

/**
 * Familiarity-based scoring multipliers
 * Lower familiarity = harder to recognize = more points
 */
export const FAMILIARITY_MULTIPLIERS = {
  // Familiarity 80-100: Well-known, easy (x1.0)
  high: { min: 80, max: 100, multiplier: 1.0 },
  // Familiarity 50-79: Moderately known (x1.5)
  medium: { min: 50, max: 79, multiplier: 1.5 },
  // Familiarity 20-49: Less known, harder (x2.0)
  low: { min: 20, max: 49, multiplier: 2.0 },
  // Familiarity 0-19: Obscure, very hard (x3.0)
  rare: { min: 0, max: 19, multiplier: 3.0 },
};

/**
 * Get familiarity multiplier for a song
 * @param {number} familiarity - Song familiarity score (0-100)
 * @returns {number} - Multiplier (1.0 to 3.0)
 */
export function getFamiliarityMultiplier(familiarity = 50) {
  const fam = Number(familiarity) || 50;
  if (fam >= 80) return FAMILIARITY_MULTIPLIERS.high.multiplier;
  if (fam >= 50) return FAMILIARITY_MULTIPLIERS.medium.multiplier;
  if (fam >= 20) return FAMILIARITY_MULTIPLIERS.low.multiplier;
  return FAMILIARITY_MULTIPLIERS.rare.multiplier;
}

/**
 * Lockout duration in milliseconds after wrong answer
 */
export const LOCKOUT_DURATION_MS = 1500;

/**
 * Calculate difficulty multiplier based on selected recognition tiers
 * Uses AVERAGE of selected tiers (since any song from selected tiers could appear)
 *
 * Examples:
 *   - Deep Cuts only [5] → x5.0 (all hard songs)
 *   - Deep Cuts + Challenging [4,5] → x4.5 (mix of hard)
 *   - Iconic + Deep Cuts [1,5] → x3.0 (could get easy OR hard)
 *   - All tiers [1,2,3,4,5] → x2.7 (full mix)
 *
 * @param {number[]} recognitionTiers - Array of selected tier numbers (1-5)
 * @returns {number} - Multiplier value
 */
export function getDifficultyMultiplier(recognitionTiers = [1]) {
  if (!recognitionTiers || recognitionTiers.length === 0) {
    return 1.0;
  }

  // Average the multipliers for all selected tiers
  const multipliers = recognitionTiers.map(tier => TIER_MULTIPLIERS[tier] || 1.0);
  const avgMultiplier = multipliers.reduce((sum, m) => sum + m, 0) / multipliers.length;

  // Round to 1 decimal place
  return Math.round(avgMultiplier * 10) / 10;
}

/**
 * Calculate singer filter multiplier
 *
 * @param {boolean} includeSinger - Whether singer filter is enabled
 * @returns {number} - Multiplier value (1.0 or 1.25)
 */
export function getSingerMultiplier(includeSinger = false) {
  return includeSinger ? SINGER_MULTIPLIER : 1.0;
}

/**
 * Calculate total score multiplier combining all factors
 *
 * @param {Object} config - Game configuration
 * @param {number[]} config.recognitionTiers - Selected recognition tiers
 * @param {boolean} config.includeSinger - Whether singer filter is enabled
 * @param {number} config.songFamiliarity - Current song's familiarity (0-100)
 * @returns {number} - Combined multiplier
 */
export function getTotalMultiplier(config = {}) {
  const difficultyMult = getDifficultyMultiplier(config.recognitionTiers);
  const singerMult = getSingerMultiplier(config.includeSinger);
  const familiarityMult = getFamiliarityMultiplier(config.songFamiliarity);
  return difficultyMult * singerMult * familiarityMult;
}

/**
 * Apply multiplier to a base score
 *
 * @param {number} baseScore - The raw score before multipliers
 * @param {Object} config - Game configuration (including songFamiliarity)
 * @returns {number} - Final score with multipliers applied
 */
export function applyScoreMultiplier(baseScore, config = {}) {
  const multiplier = getTotalMultiplier(config);
  return Math.round(baseScore * multiplier);
}

/**
 * Get a human-readable multiplier description
 *
 * @param {Object} config - Game configuration
 * @returns {string} - e.g., "x2.5 (avg difficulty + Singer)"
 */
export function getMultiplierDescription(config = {}) {
  const parts = [];
  const diffMult = getDifficultyMultiplier(config.recognitionTiers);
  const singerMult = getSingerMultiplier(config.includeSinger);
  const total = diffMult * singerMult;

  if (diffMult > 1) {
    const tiers = config.recognitionTiers || [1];
    if (tiers.length === 1) {
      // Single tier - show its name
      const tierNames = { 2: 'Essential', 3: 'Familiar', 4: 'Challenging', 5: 'Deep Cuts' };
      parts.push(tierNames[tiers[0]] || 'Difficulty');
    } else {
      // Multiple tiers - show "mixed"
      parts.push('Mixed');
    }
  }

  if (singerMult > 1) {
    parts.push('Singer');
  }

  if (parts.length === 0) {
    return 'x1';
  }

  return `x${total.toFixed(1)} (${parts.join(' + ')})`;
}
