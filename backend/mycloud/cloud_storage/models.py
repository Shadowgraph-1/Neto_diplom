from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid
import os

class User(AbstractUser):
    email = models.EmailField(unique=True, max_length=254, verbose_name="email address")
    full_name = models.CharField(max_length=255, verbose_name="Полное имя")
    is_admin = models.BooleanField(default=False, verbose_name="Администритор")
    storage_path = models.CharField(max_length=255, blank=True, verbose_name="Путь к хранилищу")

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def __str__(self):
        return self.username
    
    def save(self, *args, **kwargs):
        if not self.storage_path:
            self.storage_path = f"user_{self.username}"
            super().save(*args, **kwargs)


class File(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='files', verbose_name="Пользователь")
    original_name = models.CharField(max_length=255, verbose_name="Оригинальное имя файла")
    file_path = models.CharField(max_length=500, verbose_name="Путь к файлу")
    size = models.BigIntegerField(verbose_name="Размер файла (байты)")
    comment = models.TextField(blank=True, verbose_name="Комментарий")
    upload_date = models.DateTimeField(auto_now_add=True, verbose_name="Дата загрузки")
    last_download_date = models.DateTimeField(null=True, blank=True, verbose_name="Последнее скачивание")
    special_link = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, verbose_name="Специальная ссылка")
    
    class Meta:
        verbose_name = "Файл"
        verbose_name_plural = "Файлы"
        ordering = ['-upload_date']
    
    def __str__(self):
        return f"{self.original_name} ({self.user.username})"