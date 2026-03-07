#!/usr/bin/env node
import Ajv2020 from "ajv/dist/2020.js"
import { imageSizeFromFile } from "image-size/fromFile"
import { pathToFileURL } from 'url'
import { existsSync } from 'node:fs'

console.log('verifying...')

// Config Validation
const configPath = process.argv[2] || './config.json'
if (!existsSync(configPath)) {
  console.error(`Error: Config file not found: ${configPath}`)
  process.exit(1)
}

const configFile = pathToFileURL(configPath)
const config = await import(configFile.href, { with: { type: 'json' } })
const res = await fetch('https://cdn.author.io/.well-known/schema/author-cfg/config.json')
const schema = await res.json()
const ajv = new Ajv2020()
const validate = ajv.compile(schema)
const valid = validate(config.default)
const errors = []

if (!valid) {
  const allErrors = validate.errors || []
  const specificErrors = allErrors.filter(error => !['anyOf', 'oneOf', 'allOf'].includes(error.keyword))
  const errorsToShow = specificErrors.length > 0 ? specificErrors : allErrors

  const errs = {}
  for (const error of errorsToShow) {
    const key = `${error.keyword}|${error.instancePath}|${error.message}`
    if (!errs[key]) {
      errs[key] = error
    }
  }

  for (const e of Object.values(errs)) {
    errors.push(`${e.message} at ${e.instancePath.length > 0 ? e.instancePath : '<root>'} (${e.schemaPath})`)
  }
}

// Icon validation
const icons = [
  { path: './icon.png', width: 512, height: 512, required: false },
  { path: './icon_dark.png', width: 512, height: 512, required: false, requires: './icon.png' },
  { path: './icon_16.png', width: 16, height: 16, required: false },
  { path: './icon_16_dark.png', width: 16, height: 16, required: false, requires: './icon_16.png' }
]

let iconErrors = []

for (const icon of icons) {
  if (existsSync(icon.path)) {
    // Check if the required variant exists
    if (icon.requires && !existsSync(icon.requires)) {
      iconErrors.push(`${icon.path} requires ${icon.requires} to exist`)
      continue
    }

    // Verify dimensions
    try {
      const dimensions = await imageSizeFromFile(icon.path)
      if (dimensions.width !== icon.width || dimensions.height !== icon.height) {
        iconErrors.push(`${icon.path} must be ${icon.width}x${icon.height} but is ${dimensions.width}x${dimensions.height}`)
      }
    } catch (err) {
      iconErrors.push(`${icon.path} could not be read: ${err.message}`)
    }
  }
}

if (iconErrors.length > 0) {
  errors.push(...iconErrors)
}

if (errors.length > 0) {
  console.error('\ninvalid')
  errors.forEach(err => console.error(`  - ${err}`))
  process.exitCode = 1
} else {
  console.log('ok')
}
