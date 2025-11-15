from django.http import JsonResponse
from .ai_service import suggest_medicine_ai


def suggest(request):
    """GET /api/ai/suggest/?query=<name> — return AI medicine suggestions."""
    if request.method != 'GET':
        return JsonResponse({'message': 'Method not allowed'}, status=405)

    query = (request.GET.get('query') or '').strip()
    if not query:
        return JsonResponse({'message': 'query parameter is required'}, status=400)

    suggestions = suggest_medicine_ai(query)
    return JsonResponse({'suggestions': suggestions})
