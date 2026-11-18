import { mkdir, writeFile } from 'node:fs/promises'
import { crc32, deflateSync } from 'node:zlib'

const OUTPUT_DIR = 'public/icons'
const BACKGROUND = [11, 11, 12]
const ACCENT = [163, 230, 53]
const SUPERSAMPLE = 3
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
const BYTES_PER_PIXEL = 4

interface Box {
  x0: number
  x1: number
  y0: number
  y1: number
}

// Dumbbell in unit coordinates
const SHAPES: Box[] = [
  { x0: 0.2, x1: 0.8, y0: 0.465, y1: 0.535 },
  { x0: 0.28, x1: 0.37, y0: 0.27, y1: 0.73 },
  { x0: 0.63, x1: 0.72, y0: 0.27, y1: 0.73 },
  { x0: 0.2, x1: 0.26, y0: 0.37, y1: 0.63 },
  { x0: 0.74, x1: 0.8, y0: 0.37, y1: 0.63 }
]

function chunk (type: string, data: Buffer): Buffer {
  const body = Buffer.concat([Buffer.from(type), data])
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const checksum = Buffer.alloc(4)
  checksum.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, checksum])
}

function renderIcon (size: number, contentScale: number): Buffer {
  const raw = Buffer.alloc(size * (size * BYTES_PER_PIXEL + 1))
  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * BYTES_PER_PIXEL + 1)
    for (let x = 0; x < size; x++) {
      let hits = 0
      for (let sy = 0; sy < SUPERSAMPLE; sy++) {
        for (let sx = 0; sx < SUPERSAMPLE; sx++) {
          const u = 0.5 + ((x + (sx + 0.5) / SUPERSAMPLE) / size - 0.5) / contentScale
          const v = 0.5 + ((y + (sy + 0.5) / SUPERSAMPLE) / size - 0.5) / contentScale
          if (SHAPES.some(box => u >= box.x0 && u <= box.x1 && v >= box.y0 && v <= box.y1)) hits++
        }
      }
      const mix = hits / (SUPERSAMPLE * SUPERSAMPLE)
      const offset = rowStart + 1 + x * BYTES_PER_PIXEL
      BACKGROUND.forEach((base, channel) => {
        raw[offset + channel] = Math.round(base + (ACCENT[channel] - base) * mix)
      })
      raw[offset + 3] = 255
    }
  }

  const header = Buffer.alloc(13)
  header.writeUInt32BE(size, 0)
  header.writeUInt32BE(size, 4)
  header.writeUInt8(8, 8)
  header.writeUInt8(6, 9)
  return Buffer.concat([PNG_SIGNATURE, chunk('IHDR', header), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])
}

await mkdir(OUTPUT_DIR, { recursive: true })
await writeFile(`${OUTPUT_DIR}/icon-192.png`, renderIcon(192, 1))
await writeFile(`${OUTPUT_DIR}/icon-512.png`, renderIcon(512, 1))
await writeFile(`${OUTPUT_DIR}/maskable-512.png`, renderIcon(512, 0.75))
await writeFile(`${OUTPUT_DIR}/apple-touch-icon.png`, renderIcon(180, 1))
console.log('Icons written to', OUTPUT_DIR)
