from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, File


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["username", "email", "full_name", "is_admin", "is_active"]
    list_filter = ["is_admin", "is_active", "is_staff"]
    fieldsets = BaseUserAdmin.fieldsets + (
        (
            "Дополнительная информация",
            {"fields": ("full_name", "is_admin", "storage_path")},
        ),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ("Дополнительная информация", {"fields": ("full_name", "is_admin")}),
    )


@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_display = [
        "original_name",
        "user",
        "size",
        "upload_date",
        "last_download_date",
    ]
    list_filter = ["upload_date", "user"]
    search_fields = ["original_name", "comment"]
    readonly_fields = ["special_link", "upload_date", "last_download_date"]
