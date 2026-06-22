# API Contracts

Interface contracts between the frontend and backend.

> These are design-time contracts. They define the data shape the UI expects.
> Final API design is the backend team's responsibility.

---

## Conventions

- All dates: ISO 8601 (`YYYY-MM-DDTHH:mm:ssZ`)
- All IDs: `string` (UUID)
- Pagination: cursor-based preferred; offset acceptable
- Errors: follow RFC 7807 Problem Details

## Error Shape

```json
{
  "type": "https://example.com/errors/not-found",
  "title": "Resource not found",
  "status": 404,
  "detail": "The requested item does not exist.",
  "instance": "/items/abc-123"
}
```

---

## Endpoints

_API contracts will be documented here as features are designed._

### Template

```
### GET /resource/:id

**Purpose:** One-line description

**Request**
- Params: `id` (string, required)
- Headers: `Authorization: Bearer <token>`

**Response 200**
\`\`\`json
{}
\`\`\`

**Error responses**
| Status | When |
|--------|------|
| 404 | Resource not found |
| 403 | Insufficient permissions |
```

---
_Last updated: 2026-06-22_
