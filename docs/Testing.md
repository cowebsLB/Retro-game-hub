# Testing

## Test Commands

- `npm run lint`
- `npm run test:run`
- `npm run build`
- `npm run test:e2e`

## Coverage Focus

### Unit and Integration

- Game manifest parsing and validation
- Runtime update feed parsing
- Featured game lookup
- Search and tag filtering, including release-note text
- Slug-based route lookup
- Route navigation from the catalog to a play page
- Local game and embed fallback rendering
- Canvas game HUD presence and upgraded local cabinet UI

### End-to-End

- Catalog load
- Search and filter flow
- Local game route playback surface
- Direct external embed route access
- Runtime catalog and update-rail render path

## Notes

The current suite validates critical catalog and routing behavior, but it does not yet include visual regression tooling or automated coverage metrics output.
