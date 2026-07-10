# JSON Output Shape

The JSON formatter emits a deterministic object:

```json
{
  "generatedAt": "1970-01-01T00:00:00.000Z",
  "audits": [
    {
      "source": "SKILL.md",
      "summary": { "total": 0, "high": 0, "medium": 0, "low": 0 },
      "headings": [],
      "sections": { "present": [], "missing": [] },
      "tools": [],
      "findings": []
    }
  ]
}
```

`generatedAt` is fixed by design so fixture snapshots and downstream agent comparisons stay stable.
