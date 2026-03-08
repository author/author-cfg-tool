# Agent Development Guide

A file for [guiding coding agents](https://agents.md/).

## Commands

These commands require Node.js.

- Verify: `npx --package @authorsoftware/config --call "author-test"`
- Icon: `npx --package @authorsoftware/config --call "author-icon [filepath_or_url] [--dark]"`

If npx is blocked, run `npm i @authorsoftware/config` and replace `npx --package @authorsoftware/config` with `npm exec --package @authorsoftware/config` for each command.

## Instructions

Use the appropriate pre-made prompt when the user requests related actions.

Always follow the rules.

## Rules

1. Prompts may contain custom values identified by `<variable>` notation. Ask user for unknown values.
2. Never delete commands, flags, arguments, or environment variables.
  - Hint: removed values suggest an EOL/EOD attribute requires update.
  - Hint: reintroduced values suggest removal of EOD/EOL and update/creation of the exclude attribute.

## Prompts

### Create config.json

Run `<app_name> --help` to acquire initial data. Extract results into config.json using the Author Config JSON Schema spec. Verify the config. Repeat for each subcommand, recursively.

### Update config.json

Run `<app_name> --help` to acquire current data. Update config.json using the Author Config JSON Schema spec. Verify the config. Repeat for each subcommand, recursively.

## Directory Structure

- config.json
- icon.png (optional)
- icon_dark.png (optional for dark background)
- icon_16.png (optional)
- icon_16_dark.png (optional)

The icon should be 512px x 512px. An optional 16px x 16px icon may be supplied for use in system menus. Icons are optional.

### References

- [Latest Author Config JSON Schema](https://cdn.author.io/.well-known/schema/author-cfg/config.json)
- [Available Versions](https://cdn.author.io/.well-known/schema/author-cfg/versions.txt) available at `https://cdn.author.io/.well-known/schema/author-cfg/<version>/config.json`. Prefer the latest.
