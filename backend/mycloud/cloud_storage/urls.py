from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'files', views.FileViewSet, basename='file')

urlpatterns = [
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),
    path('current-user/', views.current_user, name='current-user'),
    path('download/<uuid:special_link>/', views.download_by_link, name='download-by-link'),
    path('', include(router.urls)),
]