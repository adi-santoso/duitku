import sharp from 'sharp'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const svgPath = join(__dirname, '../public/icon.svg')
const svgBuffer = readFileSync(svgPath)

const sizes = [192, 512]

console.log('🎨 Generating PNG icons from SVG...\n')

for (const size of sizes) {
  const outputPath = join(__dirname, `../public/icon-${size}.png`)

  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(outputPath)

  console.log(`✅ Generated: icon-${size}.png (${size}x${size})`)
}

// Generate maskable icon (with safe zone padding)
const maskableOutputPath = join(__dirname, '../public/icon-maskable-512.png')
await sharp(svgBuffer)
  .resize(512, 512)
  .png()
  .toFile(maskableOutputPath)

console.log(`✅ Generated: icon-maskable-512.png (512x512)`)

console.log('\n✨ All PNG icons generated successfully!')
