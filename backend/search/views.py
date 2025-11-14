import math
from django.http import JsonResponse
from pharmacy.models import Pharmacy, InventoryItem
from ai_module.ai_service import suggest_medicine_ai


def haversine(lat1, lng1, lat2, lng2):
    """
    Calculate the great-circle distance in metres between two points
    on the earth using the Haversine formula.
    """
    R = 6_371_000  # Earth radius in metres
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = (
        math.sin(dphi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def search(request):
    """
    GET /api/search/?query=<name>&lat=<lat>&lng=<lng>

    1. Find pharmacies that have the medicine in stock within 50 km.
    2. If none found, fall back to AI medicine suggestions.
    """
    if request.method != 'GET':
        return JsonResponse({'message': 'Method not allowed'}, status=405)

    query = (request.GET.get('query') or '').strip()
    lat_str = request.GET.get('lat', '')
    lng_str = request.GET.get('lng', '')

    if not query:
        return JsonResponse({'message': 'query parameter is required'}, status=400)

    try:
        lat = float(lat_str)
        lng = float(lng_str)
    except (TypeError, ValueError):
        return JsonResponse({'message': 'lat and lng must be valid numbers'}, status=400)

    MAX_DISTANCE_M = 50_000  # 50 km radius

    # ── Step 1: DB search ─────────────────────────────────────────────────────
    # Find all pharmacies that have the medicine (case-insensitive, > 0 qty)
    matching_items = InventoryItem.objects.filter(
        medicine__icontains=query,
        quantity__gt=0,
    ).select_related('pharmacy')

    results = []
    seen_pharmacy_ids = set()

    for item in matching_items:
        pharmacy = item.pharmacy
        if pharmacy.id in seen_pharmacy_ids:
            continue
        if pharmacy.latitude is None or pharmacy.longitude is None:
            continue

        distance = haversine(lat, lng, pharmacy.latitude, pharmacy.longitude)
        if distance > MAX_DISTANCE_M:
            continue

        seen_pharmacy_ids.add(pharmacy.id)

        # Collect only matching inventory items for this pharmacy
        matching_inventory = [
            inv.to_dict()
            for inv in pharmacy.inventory.filter(medicine__icontains=query, quantity__gt=0)
        ]

        results.append({
            'id': pharmacy.id,
            '_id': pharmacy.id,  # alias for frontend compatibility
            'name': pharmacy.name,
            'address': pharmacy.address,
            'phone': pharmacy.phone,
            'distance': round(distance, 2),
            # GeoJSON-style location for frontend map compatibility
            'location': {
                'type': 'Point',
                'coordinates': [pharmacy.longitude, pharmacy.latitude],
            },
            'items': matching_inventory,
        })

    # Sort by distance ascending
    results.sort(key=lambda r: r['distance'])
    results = results[:20]

    if results:
        return JsonResponse({'found': True, 'results': results})

    # ── Step 2: AI fallback ───────────────────────────────────────────────────
    print(f'[AI] No DB results for "{query}". Getting AI suggestions...')
    suggestions = suggest_medicine_ai(query)

    if suggestions:
        return JsonResponse({
            'found': False,
            'message': 'Medicine not found nearby. Here are some AI-based alternatives:',
            'suggestions': suggestions,
        })

    return JsonResponse({
        'found': False,
        'message': (
            'No nearby pharmacies have this medicine, and AI couldn\'t find alternatives. '
            'Try another name or spelling.'
        ),
        'suggestions': [],
    }, status=404)
