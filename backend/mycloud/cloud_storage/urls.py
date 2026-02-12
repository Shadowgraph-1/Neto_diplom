from django.urls import path, include
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"users", views.UserViewSet, basename="user")
router.register(r"files", views.FileViewSet, basename="file")


def csrf_token_view(request):
    """Возвращает CSRF cookie для SPA (ensure_csrf_cookie устанавливает cookie)."""
    ensure_csrf_cookie(request)
    return JsonResponse({"detail": "CSRF cookie set"})


urlpatterns = [
    path("csrf/", csrf_token_view, name="csrf-token"),
    path("register/", views.register_user, name="register"),
    path("login/", views.login_user, name="login"),
    path("logout/", views.logout_user, name="logout"),
    path("current-user/", views.current_user, name="current-user"),
    path(
        "download/<uuid:special_link>/", views.download_by_link, name="download-by-link"
    ),
    path("", include(router.urls)),
]
