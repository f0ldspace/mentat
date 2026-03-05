/**
 * Single-step Bayes update.
 * P(H|E) = P(E|H) * P(H) / [P(E|H) * P(H) + P(E|¬H) * P(¬H)]
 */
export function computePosterior(prior, pEgivenH, pEgivenNotH) {
  const numerator = pEgivenH * prior;
  const denominator = numerator + pEgivenNotH * (1 - prior);
  if (denominator === 0) return 0;
  return numerator / denominator;
}

/**
 * Chain of Bayes updates. Returns array of posteriors
 * starting with the prior as step 0.
 */
export function computePosteriorChain(prior, evidenceArray) {
  const chain = [prior];
  let current = prior;
  for (const ev of evidenceArray) {
    current = computePosterior(current, ev.pEgivenH, ev.pEgivenNotH);
    chain.push(current);
  }
  return chain;
}

/**
 * Likelihood ratio: P(E|H) / P(E|¬H)
 */
export function likelihoodRatio(pEgivenH, pEgivenNotH) {
  if (pEgivenNotH === 0) return Infinity;
  return pEgivenH / pEgivenNotH;
}
