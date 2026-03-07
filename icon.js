#!/usr/bin/env node
import JimpModule from 'jimp'
import { Resvg } from '@resvg/resvg-js'
import { readFile } from 'node:fs/promises'

const Jimp = JimpModule?.default ?? JimpModule
const read = Jimp.read.bind(Jimp)
const RESIZE_BICUBIC = Jimp.RESIZE_BICUBIC
const RESIZE_MITCHELL = Jimp.RESIZE_MITCHELL

const source = process.argv.slice(2).find(arg => !arg.startsWith('-'))
const dark = process.argv.includes('--dark') || process.argv.includes('-d')

if (!source) {
  console.error('Usage: icon <image-file-or-url> [--dark|-d]')
  process.exit(1)
}

const isHttpUrl = (value) => {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

const looksLikeSvg = (buffer, sourcePath, contentType) => {
  const ct = (contentType || '').toLowerCase()
  const lowerSource = (sourcePath || '').toLowerCase()
  if (ct.includes('image/svg+xml') || lowerSource.endsWith('.svg')) {
    return true
  }

  const header = buffer.toString('utf8', 0, 512).trimStart().toLowerCase()
  return header.startsWith('<svg') || header.startsWith('<?xml')
}

const loadSourceBuffer = async (value) => {
  if (isHttpUrl(value)) {
    const response = await fetch(value)
    if (!response.ok) {
      throw new Error(`failed to download source (${response.status} ${response.statusText})`)
    }

    const bytes = Buffer.from(await response.arrayBuffer())
    return {
      buffer: bytes,
      contentType: response.headers.get('content-type') || undefined,
      sourcePath: value
    }
  }

  const bytes = await readFile(value)
  return {
    buffer: bytes,
    contentType: undefined,
    sourcePath: value
  }
}

try {
  const { buffer, contentType, sourcePath } = await loadSourceBuffer(source)

  const rasterBuffer = looksLikeSvg(buffer, sourcePath, contentType)
    ? new Resvg(buffer).render().asPng()
    : buffer

  const image = await read(rasterBuffer)
  await image
    .clone()
    .resize(512, 512, RESIZE_BICUBIC)
    .writeAsync(`icon${dark ? '_dark' : ''}.png`)

  await image
    .clone()
    .resize(16, 16, RESIZE_MITCHELL)
    .writeAsync(`icon_16${dark ? '_dark' : ''}.png`)

  console.log(`generated icon${dark ? '_dark' : ''}.png and icon_16${dark ? '_dark' : ''}.png`)
} catch (err) {
  console.error(`processing failed: ${err.message}`)
  process.exit(1)
}