#!/usr/bin/env node
/**
 * Extracts Next.js bundle statistics from build output
 * Parses route sizes and generates structured JSON
 */

const fs = require('fs');

const buildOutput = fs.readFileSync('build-output.txt', 'utf8');

// Extract all routes with their sizes
const routes = [];
const lines = buildOutput.split('\n');

lines.forEach(line => {
  // Match route table lines: ┌ ○ /path    size    firstLoadJS
  // Handle variable whitespace between columns
  const match = line.match(/^[├┌└]\s+([○ƒλ])\s+(\/[^\s]*|\/_not-found)\s+(.+)$/);
  if (match) {
    const type = match[1]; // ○ = static, ƒ = dynamic, λ = lambda
    const path = match[2].trim();
    const sizes = match[3].trim();

    // Extract the two size columns (handle multiple spaces)
    // Note: Next.js uses "kB" not "KB"
    const sizeMatch = sizes.match(/(\d+\.?\d*\s*(?:bytes|B|kB|KB|MB|GB))\s+(\d+\.?\d*\s*(?:bytes|B|kB|KB|MB|GB))/);

    if (sizeMatch) {
      routes.push({
        path: path,
        type: type === '○' ? 'static' : type === 'ƒ' ? 'dynamic' : 'lambda',
        size: sizeMatch[1].trim(),
        firstLoadJS: sizeMatch[2].trim()
      });
    }
  }
});

// Extract shared chunk size
const sharedMatch = buildOutput.match(/First Load JS shared by all\s+(\d+\.?\d*\s*(?:bytes|B|kB|KB|MB|GB))/);
const sharedSize = sharedMatch ? sharedMatch[1].trim() : 'unknown';

// Calculate summary statistics
const largestRoute = routes.reduce((max, r) => {
  if (r.firstLoadJS === '0 B') return max;
  const size = parseFloat(r.firstLoadJS);
  const maxSize = parseFloat(max.firstLoadJS) || 0;
  return size > maxSize ? r : max;
}, routes[0] || {path: 'none', firstLoadJS: '0 B'});

const smallestRoute = routes
  .filter(r => r.firstLoadJS !== '0 B')
  .reduce((min, r) => {
    const size = parseFloat(r.firstLoadJS);
    const minSize = parseFloat(min.firstLoadJS) || Infinity;
    return size < minSize ? r : min;
  }, routes[0] || {path: 'none', firstLoadJS: '0 B'});

// Build final JSON structure
const bundleData = {
  commitSha: process.env.GITHUB_SHA || 'local-test',
  branch: process.env.GITHUB_REF_NAME || 'main',
  buildId: process.env.GITHUB_RUN_ID || 'local-' + Date.now(),
  timestamp: new Date().toISOString(),
  routes: routes,
  shared: {
    size: sharedSize,
    description: 'JavaScript shared by all routes'
  },
  summary: {
    totalRoutes: routes.length,
    staticRoutes: routes.filter(r => r.type === 'static').length,
    dynamicRoutes: routes.filter(r => r.type === 'dynamic').length,
    largestRoute: largestRoute,
    smallestRoute: smallestRoute
  }
};

// Write to file
fs.writeFileSync('bundle-stats.json', JSON.stringify(bundleData, null, 2));

console.log('✅ Bundle stats extracted successfully');
console.log(`📊 Found ${routes.length} routes`);
console.log(`📦 Shared bundle size: ${sharedSize}`);
console.log(`🔝 Largest route: ${largestRoute.path} (${largestRoute.firstLoadJS})`);
console.log(`🔽 Smallest route: ${smallestRoute.path} (${smallestRoute.firstLoadJS})`);
