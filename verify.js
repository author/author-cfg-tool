#!/usr/bin/env node
import Ajv2020 from "ajv/dist/2020.js"
import { imageSizeFromFile } from "image-size/fromFile"
import { pathToFileURL } from 'url'
import { existsSync } from 'node:fs'

console.log('verifying...')

// Config Validation
const cliArgs = process.argv.slice(2)
let configPath = './config.json'
let version = ''

for (let i = 0; i < cliArgs.length; i++) {
  const arg = cliArgs[i]

  if (arg === '--version' || arg === '-v') {
    const value = cliArgs[i + 1]
    if (value && !value.startsWith('-')) {
      version = `/${value.replace(/^\/+/, '')}`
      i++
    }
    continue
  }

  if (arg.startsWith('--version=')) {
    const value = arg.split('=')[1]
    if (value) {
      version = `/${value.replace(/^\/+/, '')}`
    }
    continue
  }

  if (arg.startsWith('-v=')) {
    const value = arg.split('=')[1]
    if (value) {
      version = `/${value.replace(/^\/+/, '')}`
    }
    continue
  }

  if (!arg.startsWith('-') && configPath === './config.json') {
    configPath = arg
  }
}

if (!existsSync(configPath)) {
  console.error(`Error: Config file not found: ${configPath}`)
  process.exit(1)
}

const errors = []
const configFile = pathToFileURL(configPath)
const config = await import(configFile.href, { with: { type: 'json' } })
let schema
const schemaUrl = `https://cdn.author.io/.well-known/schema/author-cfg${version}/config.json`

try {
  const res = await fetch(schemaUrl)
  if (!res.ok) {
    errors.push(`failed to fetch schema v${version.replace(/^\/+/, '')} (${res.status} ${res.statusText})`)
  } else {
    schema = await res.json()
  }
} catch (err) {
  errors.push('failed to fetch schema')
}

if (schema) {
  try {
    const ajv = new Ajv2020()
    ajv.addVocabulary(['version'])

    const validate = ajv.compile(schema)
    const valid = validate(config.default)

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
  } catch (err) {
    errors.push(`failed to compile schema: ${err.message}`)
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
