"""
AI Medicine Suggestion Service — Python port of the Node.js aiService.js

Uses Python's built-in difflib for fuzzy search (replaces Fuse.js).
Optionally falls back to OpenAI embeddings + cosine similarity when
OPENAI_API_KEY is set and difflib finds no good match.
"""

import csv
import difflib
import json
import math
import os
from pathlib import Path

# ── Dataset loading ───────────────────────────────────────────────────────────

DATASET_PATH = Path(__file__).parent / 'medicine_dataset.csv'
CACHE_PATH = Path(__file__).parent / 'embeddings_cache.json'

_medicines: list[dict] = []
_embeddings_cache: dict[str, list[float]] = {}
_loaded = False


def _load_dataset():
    global _medicines, _embeddings_cache, _loaded
    if _loaded:
        return

    if DATASET_PATH.exists():
        with open(DATASET_PATH, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row.get('name'):
                    _medicines.append(row)
        print(f'[AI] Loaded {len(_medicines)} medicines from dataset')
    else:
        print(f'[AI] WARNING: medicine_dataset.csv not found at {DATASET_PATH}')

    if CACHE_PATH.exists():
        try:
            with open(CACHE_PATH, encoding='utf-8') as f:
                _embeddings_cache = json.load(f)
            print(f'[AI] Loaded cached embeddings for {len(_embeddings_cache)} medicines')
        except (json.JSONDecodeError, OSError):
            _embeddings_cache = {}

    _loaded = True


# ── Fuzzy search (difflib — replaces Fuse.js) ─────────────────────────────────

def _fuzzy_search(query: str, top_n: int = 5) -> list[dict]:
    """Return top N medicines whose name best matches the query."""
    query_lower = query.lower()
    names = [m['name'].lower() for m in _medicines]

    # difflib.get_close_matches returns best matches by sequence ratio
    close_names = difflib.get_close_matches(query_lower, names, n=top_n, cutoff=0.4)

    results = []
    name_to_medicine = {m['name'].lower(): m for m in _medicines}
    for name in close_names:
        medicine = name_to_medicine.get(name)
        if medicine:
            results.append(medicine)

    # If difflib found nothing, try a simple substring match as a fallback
    if not results:
        for medicine in _medicines:
            if query_lower in medicine['name'].lower():
                results.append(medicine)
                if len(results) >= top_n:
                    break

    return results[:top_n]


def _format_result(medicine: dict) -> dict:
    substitutes = [
        medicine.get(f'substitute{i}', '')
        for i in range(5)
        if medicine.get(f'substitute{i}', '').strip()
    ]
    uses = [
        medicine.get(f'use{i}', '')
        for i in range(5)
        if medicine.get(f'use{i}', '').strip()
    ]
    return {
        'name': medicine.get('name', ''),
        'substitutes': substitutes,
        'uses': uses,
    }


# ── Optional OpenAI embedding fallback ───────────────────────────────────────

def _cosine_similarity(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    mag_a = math.sqrt(sum(x * x for x in a))
    mag_b = math.sqrt(sum(x * x for x in b))
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return dot / (mag_a * mag_b)


def _get_embedding(name: str) -> list[float] | None:
    """Fetch or cache an OpenAI embedding for a medicine name."""
    if name in _embeddings_cache:
        return _embeddings_cache[name]

    api_key = os.getenv('OPENAI_API_KEY', '')
    if not api_key:
        return None

    try:
        from openai import OpenAI  # type: ignore
        client = OpenAI(api_key=api_key)
        response = client.embeddings.create(
            model='text-embedding-3-small',
            input=name,
        )
        embedding = response.data[0].embedding
        _embeddings_cache[name] = embedding
        try:
            with open(CACHE_PATH, 'w', encoding='utf-8') as f:
                json.dump(_embeddings_cache, f, indent=2)
        except OSError:
            pass
        return embedding
    except Exception as exc:
        print(f'[AI] Skipping embedding for "{name}": {exc}')
        return None


def _embedding_search(query: str, top_n: int = 5) -> list[dict]:
    """Semantic search via OpenAI embeddings + cosine similarity."""
    query_embedding = _get_embedding(query)
    if not query_embedding:
        return []

    scored = []
    for medicine in _medicines:
        med_embedding = _embeddings_cache.get(medicine['name'])
        if not med_embedding:
            continue
        similarity = _cosine_similarity(query_embedding, med_embedding)
        scored.append((similarity, medicine))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [m for _, m in scored[:top_n]]


# ── Public API ────────────────────────────────────────────────────────────────

def suggest_medicine_ai(query: str) -> list[dict]:
    """
    Main entry point — returns up to 5 medicine suggestions for a query.

    Strategy:
    1. Fuzzy search with difflib (fast, no API needed)
    2. If no results, try OpenAI embedding similarity (if OPENAI_API_KEY set)
    """
    _load_dataset()

    if not query or not _medicines:
        return []

    # Step 1: fuzzy search
    fuzzy_results = _fuzzy_search(query, top_n=5)
    if fuzzy_results:
        return [_format_result(m) for m in fuzzy_results]

    # Step 2: embedding fallback
    embedding_results = _embedding_search(query, top_n=5)
    if embedding_results:
        return [_format_result(m) for m in embedding_results]

    return []
