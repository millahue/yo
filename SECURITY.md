# Security Policy

## Supported Versions

We currently support the latest version of `yo` with security updates.

| Version | Supported          |
|---------|--------------------|
| 1.x     | ✅ Active          |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it privately.

**Do not open a public issue.** Instead, send a description to the repository owner via GitHub or email.

Please include:

- Type of vulnerability
- Steps to reproduce (if applicable)
- Potential impact
- Suggested fix (if any)

We will respond within 48 hours and work on a fix as soon as possible.

## Scope

This project is a client-side 3D portfolio rendered in the browser. Security concerns are primarily related to:

- **Dependency vulnerabilities** — Three.js, React, Rapier, and their transitive dependencies
- **Cross-site scripting (XSS)** — via dynamically loaded user content (models, textures, animations)
- **Data privacy** — this project does not collect, store, or transmit user data

### Assets from external sources

Models, textures, and animations from Mixamo or other third-party sites are loaded locally from `public/`. If you serve this project publicly, ensure that any user-uploaded assets are sanitized.

## Dependency Scanning

We use `bun audit` to check for known vulnerabilities in dependencies. Run it periodically:

```bash
bun audit
```

To update dependencies:

```bash
bun update
```
