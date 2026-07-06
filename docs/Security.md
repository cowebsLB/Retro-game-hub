# Security

## Current Security Posture

Retro Game Hub is a static frontend with no authentication layer and no backend API. That keeps the exposed attack surface relatively small compared to a full-stack service.

## Current Risk Areas

- client-side dependency supply chain
- malformed runtime JSON content
- browser-local persistence integrity
- GitHub Actions deployment configuration

## Content Integrity

The runtime JSON feed is validated before use. Invalid payloads fall back to the bundled data model rather than replacing the live app state blindly.

## Browser Storage

The app stores only low-sensitivity gameplay values in `localStorage`, such as best score or best move count. There is no credential, billing, or personal data storage.

## Deployment Considerations

- the site runtime requires no secrets
- GitHub Actions needs Pages deployment permissions
- repository Pages settings must point at `GitHub Actions`

## Embed Note

The type system still supports `embed` entries, but the current shipped lineup is original-only and does not actively load third-party game origins.

## Maintenance Guidance

- keep dependencies current
- validate manifest changes through the test suite
- avoid adding remote content paths that bypass the existing parsing layer
