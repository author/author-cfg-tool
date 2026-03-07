# @authorsoftware/config

This utility is for application owners who wish to incorporate their software into the Author runtime.

## Commands

### `npx --package @authorsoftware/config test`

Validates a `config.json` file against the Author schema and checks optional icon files for required dimensions.

Example:

`npx --package @authorsoftware/config test ./config.json`

### `npx --package @authorsoftware/config icon`

Generates `icon.png` and `icon_16.png` from a source image path or URL. Use `--dark` to generate dark variants.

Examples:

`npx --package @authorsoftware/config icon ./source.png`

`npx --package @authorsoftware/config icon ./source.svg --dark`

`npx --package @authorsoftware/config icon https://my.domain.com/path/to.png`

### `npx --package @authorsoftware/config instructions`

Prints instructions for code agents.

Example:

`npx --package @authorsoftware/config instructions`

### `npx --package @authorsoftware/config create-example`

Creates an example config in the current working directory.

Example:

`npx --package @authorsoftware/config create-example`
