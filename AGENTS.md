# Clew workflow

Use Clew (`.clew/`) to track features, progress, and roadmap.

## Commands

| Action | Command |
|---|---|
| See active work | `clew list` |
| See everything | `clew list --all` |
| Read an increment | `clew show <id>` |
| Create one | `clew new "Title" --tag tagname` |
| Start working | `clew start <id>` |
| Mark done + archive | `clew done <id>` |
| Abandon | `clew abandon <id> "reason"` |
| Reopen | `clew reopen <id>` |
| Show next todo | `clew next` |
| Edit path order | `clew path` |

## Rules

- `clew start <id>` before implementing.
- `clew done <id>` after code is stable and checks pass.
- Commit `.clew/` changes **with** every code commit.
- When reading an increment, use `clew show <id>` to get the full body.

## Commands

| Action | Command |
|---|---|
| Run all tests | `npm test` |
| Watch tests | `npm run test:watch` |
| Run linter | `npm run lint` |
| Build | `npm run build` |
