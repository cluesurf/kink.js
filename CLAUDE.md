# Project Guidelines

## Security rules

- Do not read or include any `.env` or secrets files.
- Avoid scanning hidden files or non-template configuration files.

## Conventions

- Use pnpm, NOT npm or yarn.
- Use prettier and eslint.
- Use dotenv.

## Other important notes

- Never make it necessary to have to avoid using `export default ...`,
  that should always be accetable and working, even when importing.
  PLEASE MAKE SURE THAT IS POSSIBLE.
- All readmes should have a LOWERCASE file name, exactly as `readme.md`,
  not `README.md`.
