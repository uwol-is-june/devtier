import fs from 'fs'
import path from 'path'

const tiers = ['challenger', 'diamond', 'platinum', 'gold', 'silver', 'bronze']
const lines = [
  '// AUTO-GENERATED — do not edit manually. Run: node scripts/gen-tier-icon-base64.mjs',
  'export const TIER_ICON_BASE64: Record<string, string> = {',
]

for (const tier of tiers) {
  const buf = fs.readFileSync(path.join('public', 'tier-icons', `${tier}.png`))
  lines.push(`  ${tier}: 'data:image/png;base64,${buf.toString('base64')}',`)
}
lines.push('}')
fs.writeFileSync('lib/tier-icon-base64.ts', lines.join('\n') + '\n')
console.log('✓ lib/tier-icon-base64.ts generated')
