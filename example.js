#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises'
import { join, basename } from 'node:path'

const source = join(import.meta.dirname, 'test/demo.json')
const file = basename(source)
const out = join(import.meta.dirname, file)
const content = JSON.parse(await readFile(source, 'utf8'))
const res = await fetch('https://cdn.author.io/.well-known/schema/author-cfg/config.json')
const schema = await res.json()

content.schema = schema.version

await writeFile(out, JSON.stringify(content, null, 2), 'utf8')

console.log(`generated ${file} with schema version ${schema.version}`)