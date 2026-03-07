#!/usr/bin/env node
import { cp } from 'node:fs/promises'
import { join, basename } from 'node:path'

const source = join(import.meta.dirname, 'test/demo.json')

await cp(source, join(import.meta.dirname, basename(source)), { force: true })

console.log(`generated ${basename(source)}`)