#!/usr/bin/env node
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

console.log(await readFile(join(import.meta.dirname, 'agent-tpl.md'), 'utf8'))