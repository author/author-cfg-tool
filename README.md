# @authorsoftware/config

This utility is for application owners who wish to integrate their software into the Author application.

## Commands

### `npx --package @authorsoftware/config author-test`

Validates a `config.json` file against the Author schema and checks optional icon files for required dimensions.

Example:

`npx --package @authorsoftware/config test ./config.json`

### `npx --package @authorsoftware/config author-icon`

Generates `icon.png` and `icon_16.png` from a source image path or URL. Use `--dark` to generate dark variants.

Examples:

`npx --package @authorsoftware/config author-icon ./source.png`

`npx --package @authorsoftware/config author-icon ./source.svg --dark`

`npx --package @authorsoftware/config author-icon https://my.domain.com/path/to.png`

### `npx --package @authorsoftware/config author-example`

Creates an example config in the current working directory.

Example:

`npx --package @authorsoftware/config author-example`
