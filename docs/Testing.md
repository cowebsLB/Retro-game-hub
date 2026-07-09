# Testing

## Commands

- `npm run lint`
- `npm run test:run`
- `npm run build`
- `npm run test:e2e`

## Test Layers

### Unit and Integration Coverage

The Vitest suite currently verifies:

- manifest parsing and schema validation
- update-feed parsing and ordering
- slug lookup and missing-route handling
- featured cabinet selection
- search and tag filtering
- local cabinet registry lookup
- catalog rendering and card-to-route navigation
- direct route rendering for shipped cabinets including `Pixel Breach`
- live sync pill freshness updates over time
- featured hero status rendering from manifest data

### End-to-End Coverage

The Playwright suite currently verifies:

- home page load
- catalog visibility
- route navigation into a cabinet
- direct cabinet route access
- visible local play surface rendering

### Manual Verification

Recommended manual checks before shipping:

- desktop home hero layout
- desktop catalog readability
- mobile cabinet layout
- keyboard control smoke-check for all local cabinets
- runtime feed sync label behavior
- GitHub Pages hash-route correctness

## Current Verification Baseline

Last full local verification for the current bug-fix pass:

- `npm run lint`: pass
- `npm run test:run`: pass
- `npm run build`: pass
- `npm run test:e2e`: pass

## Coverage Notes

- The test suite focuses on functional correctness and route stability.
- There is no visual regression pipeline yet.
- Coverage percentages are not currently emitted as part of the repo scripts.

## Known Gaps

- no screenshot diffing
- no performance benchmark automation
- no accessibility audit automation
- no long-session gameplay soak tests
