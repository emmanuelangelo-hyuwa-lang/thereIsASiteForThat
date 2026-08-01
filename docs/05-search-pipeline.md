# Search Pipeline

The product *is* search. This doc defines the v1 pipeline end-to-end.

---

## 1. Goals

- Feel instant (debounce + fast vector query).
- Feel intelligent (confidence percentages).
- Never dead-end (RAG fallback when catalog misses).
- Stay honest (label AI-inferred vs curated).

---

## 2. Pipeline

```
User query
   │
   ▼
Normalize (trim, lowercase, collapse whitespace)
   │
   ▼
Embed query (Ollama nomic-embed-text)
   │
   ▼
pgvector similarity against published sites
   │
   ├── top_score >= THRESHOLD ──▶ Curated results + confidence %
   │
   └── top_score < THRESHOLD ───▶ RAG fallback
                                   │
                                   ├─ retrieve top-k loose matches (k=8–12)
                                   ├─ LLM ranks / explains / may suggest known gaps
                                   └─ return results with source: "ai_inferred"
```

### Recommended default threshold

`SEARCH_CONFIDENCE_THRESHOLD = 0.78` (cosine similarity)

Tune after seeding with a labeled eval set of ~50 queries.

---

## 3. Confidence Score Display

Map cosine similarity `s` (0–1) to percentage:

```
confidence = round(s * 100)
```

UI grouping:

| Band | Label |
|---|---|
| Highest result | **Best match (N%)** |
| Next 2–4 above threshold | **Other good matches** |
| Below threshold but shown in RAG | **AI-suggested** |

Never invent fake precision (e.g. avoid always showing 99%). Clamp display to real similarity.

---

## 4. API Shape

`POST /api/search`

**Request**

```json
{
  "query": "compress a pdf",
  "limit": 8
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "query": "compress a pdf",
    "slug": "compress-a-pdf",
    "mode": "curated",
    "results": [
      {
        "siteId": "...",
        "name": "ILovePDF",
        "slug": "ilovepdf",
        "url": "https://www.ilovepdf.com/",
        "description": "...",
        "pricing": "freemium",
        "rating": 4.6,
        "confidence": 0.94,
        "confidencePercent": 94,
        "source": "curated"
      }
    ],
    "aiSummary": null
  },
  "error": null
}
```

When fallback triggers:

```json
{
  "mode": "ai_inferred",
  "aiSummary": "I couldn't find a strong curated match. Closest tools that usually help with this:",
  "results": [ { "source": "ai_inferred", "...": "..." } ]
}
```

---

## 5. Instant Search UX

- Min chars: 2
- Debounce: 300ms
- Abort in-flight requests on new keystrokes
- Show skeleton rows, then ranked results
- Enter / click → navigate to `/search/{slug}` (full page, SEO)

---

## 6. RAG Fallback Prompt (sketch)

System:

> You recommend websites for a user task. Only use provided candidates. Prefer free/freemium when quality is equal. Be concise. Never pretend a site is curated if it isn't in the candidate list. If nothing fits, say so and suggest how to rephrase.

User payload:

- query
- candidate sites (name, url, description, pricing, tags, similarity)

Output JSON:

```json
{
  "summary": "string",
  "rankedSiteIds": ["...", "..."],
  "notes": ["optional caveats"]
}
```

---

## 7. Hybrid Assist (optional v1.1)

If embeddings alone miss exact brand names:

1. Run trigram / `ilike` on `name` + `tags`.
2. Merge keyword hits with vector hits (RRF or simple score blend).
3. Re-rank.

Ship pure vector first; add hybrid if brand queries underperform.

---

## 8. Eval Set (must create before launch)

Hand-label ~50 queries:

| Query | Expected top site(s) | Notes |
|---|---|---|
| compress pdf | ILovePDF / Smallpdf | |
| remove background | remove.bg | |
| make a resume | ... | |
| notion alternative | ... | |

Track:

- Recall@3 for curated path
- % of queries hitting fallback
- Outbound CTR by confidence band

---

## 9. Abuse & Cost Guards

- IP rate limit on `/api/search`
- Cache embeddings for normalized queries
- Cap LLM fallback tokens
- Skip LLM if query is empty/gibberish (`/[a-z0-9 ]{2,}/i`)
