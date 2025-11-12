import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Pharmacy, InventoryItem


def _require_pharmacist(request):
    """Returns None if authorized, or a JsonResponse error if not."""
    if not hasattr(request, 'auth_user') or request.auth_user is None:
        return JsonResponse({'message': 'Unauthorized'}, status=401)
    if request.auth_user.role != 'pharmacist':
        return JsonResponse({'message': 'Forbidden — pharmacist role required'}, status=403)
    return None


# ── Create / Update Pharmacy ──────────────────────────────────────────────────

@csrf_exempt
def pharmacy_upsert(request):
    """POST /api/pharmacy/ — create or update the pharmacist's pharmacy profile."""
    if request.method != 'POST':
        return JsonResponse({'message': 'Method not allowed'}, status=405)

    err = _require_pharmacist(request)
    if err:
        return err

    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({'message': 'Invalid JSON'}, status=400)

    name = (body.get('name') or '').strip()
    if len(name) < 2:
        return JsonResponse({'message': 'Pharmacy name must be at least 2 characters'}, status=400)

    address = (body.get('address') or '').strip()
    phone = (body.get('phone') or '').strip()

    # Accept lat/lng directly
    lat = body.get('lat')
    lng = body.get('lng')

    if lat is not None:
        try:
            lat = float(lat)
        except (TypeError, ValueError):
            lat = None
    if lng is not None:
        try:
            lng = float(lng)
        except (TypeError, ValueError):
            lng = None

    # Upsert pharmacy record
    pharmacy, created = Pharmacy.objects.get_or_create(owner=request.auth_user)
    pharmacy.name = name
    pharmacy.address = address
    pharmacy.phone = phone
    if lat is not None and lng is not None:
        pharmacy.latitude = lat
        pharmacy.longitude = lng
    pharmacy.save()

    return JsonResponse(pharmacy.to_dict(), status=200)


# ── Update Inventory ──────────────────────────────────────────────────────────

@csrf_exempt
def pharmacy_inventory(request):
    """POST /api/pharmacy/inventory/ — upsert inventory items for the pharmacist's pharmacy."""
    if request.method != 'POST':
        return JsonResponse({'message': 'Method not allowed'}, status=405)

    err = _require_pharmacist(request)
    if err:
        return err

    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({'message': 'Invalid JSON'}, status=400)

    items = body.get('items', [])
    if not isinstance(items, list) or len(items) == 0:
        return JsonResponse({'message': 'items must be a non-empty array'}, status=400)

    try:
        pharmacy = Pharmacy.objects.get(owner=request.auth_user)
    except Pharmacy.DoesNotExist:
        return JsonResponse({'message': 'Pharmacy not found. Create it first.'}, status=404)

    for item in items:
        medicine_name = (item.get('medicine') or '').lower().strip()
        quantity = item.get('quantity', 0)
        price = item.get('price')

        if not medicine_name:
            continue

        try:
            quantity = int(quantity)
            if quantity < 0:
                quantity = 0
        except (TypeError, ValueError):
            quantity = 0

        price_val = None
        if price is not None:
            try:
                price_val = float(price)
                if price_val < 0:
                    price_val = None
            except (TypeError, ValueError):
                price_val = None

        inv_item, _ = InventoryItem.objects.get_or_create(
            pharmacy=pharmacy,
            medicine=medicine_name,
        )
        inv_item.quantity = quantity
        if price_val is not None:
            inv_item.price = price_val
        inv_item.save()

    # Reload with fresh inventory
    pharmacy.refresh_from_db()
    return JsonResponse(pharmacy.to_dict(), status=200)


# ── Get My Pharmacy ───────────────────────────────────────────────────────────

def pharmacy_me(request):
    """GET /api/pharmacy/me/ — get the current pharmacist's pharmacy."""
    if request.method != 'GET':
        return JsonResponse({'message': 'Method not allowed'}, status=405)

    err = _require_pharmacist(request)
    if err:
        return err

    try:
        pharmacy = Pharmacy.objects.get(owner=request.auth_user)
        return JsonResponse(pharmacy.to_dict(), status=200)
    except Pharmacy.DoesNotExist:
        return JsonResponse(None, safe=False, status=200)
