# Security

## Current Security Posture

This release is fully static and has no authentication, user accounts, or backend API surface.

## External Embed Considerations

- Embedded games load in iframes from third-party origins
- External origins may block iframe playback, so the UI includes a new-tab fallback path
- Only intentionally approved sources should be added to the manifest

## Static Hosting Considerations

- Deployments are produced through GitHub Actions
- No secrets are required for application runtime
- Keep dependencies current because the app relies entirely on client-side packages
