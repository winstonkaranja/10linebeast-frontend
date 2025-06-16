# Backend Response Format Debug Guide

When you see the error "Invalid response format: missing success or processed_document", here's how to debug it:

## Steps to Debug:

1. **Open Browser DevTools** (F12)
2. **Go to Console tab**
3. **Upload a document and process it**
4. **Look for these log messages:**

### Expected Log Messages:
```
Request body structure: { documentsCount: 1, features: {...}, firstDocumentInfo: {...} }
Response status: 200
Success response: { ... }
```

### What to Look For:

The "Success response" log will show exactly what your Railway backend is returning. Common formats include:

**Format A - Wrapped Response:**
```json
{
  "success": true,
  "processed_document": {
    "filename": "merged_document.pdf",
    "content": "base64_string_here",
    "pages": 5,
    "features_applied": ["merge_pdfs", "repaginate"],
    "processing_time_seconds": 2.5,
    "from_cache": false
  }
}
```

**Format B - Direct Document:**
```json
{
  "filename": "merged_document.pdf",
  "content": "base64_string_here", 
  "pages": 5,
  "features_applied": ["merge_pdfs", "repaginate"],
  "processing_time_seconds": 2.5,
  "from_cache": false
}
```

**Format C - Nested Data:**
```json
{
  "data": {
    "filename": "merged_document.pdf",
    "content": "base64_string_here",
    "pages": 5
  },
  "features": ["merge_pdfs", "repaginate"]
}
```

## If You See a Different Format:

Copy the exact response from the console and let me know what it looks like. The frontend has been updated to handle many different formats, but if your backend uses a unique structure, I can add support for it specifically.

## Current Supported Field Names:

The frontend now looks for these variations:
- `filename` / `file_name` / `name`
- `content` / `file_content` / `pdf_content` 
- `pages` / `page_count` / `total_pages`
- `features_applied` / `applied_features` / `features`
- `processing_time_seconds` / `processing_time` / `duration`
- `from_cache` / `cached` / `is_cached`

## Quick Fix:

If you can share the exact response structure your backend returns, I can add a specific handler for it in about 30 seconds!