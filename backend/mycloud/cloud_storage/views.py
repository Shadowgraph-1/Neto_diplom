from rest_framework.authtoken.models import Token
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import login, logout
from django.http import FileResponse, Http404
from django.utils import timezone
from .models import User, File
from .serializers import UserRegistrationSerializer, UserSerializer, FileSerializer
import os
import logging
from django.conf import settings

# Логирование (настройки берутся из settings.py)
logger = logging.getLogger("cloud_storage")


@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):
    """Регистрация нового пользователя"""
    logger.info(
        f"Попытка регистрации пользователя: {request.data.get('username', 'unknown')}"
    )
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        logger.info(
            f"Пользователь успешно зарегистрирован: {user.username} (ID: {user.id})"
        )
        return Response(
            {
                "message": "Пользователь успешно зарегистрирован",
                "user": UserSerializer(user).data,
                "token": token.key,
            },
            status=status.HTTP_201_CREATED,
        )
    logger.warning(f"Ошибка регистрации: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def login_user(request):
    """Аутентификация пользователя (использует сессионную аутентификацию)"""
    username = request.data.get("username")
    password = request.data.get("password")
    logger.info(f"Попытка входа пользователя: {username}")

    try:
        user = User.objects.get(username=username)
        if user.check_password(password):
            login(request, user)
            token, created = Token.objects.get_or_create(user=user)
            logger.info(f"Успешный вход пользователя: {username} (ID: {user.id})")
            return Response(
                {
                    "message": "Успешный вход",
                    "user": UserSerializer(user).data,
                    "token": token.key,
                }
            )
        else:
            logger.warning(f"Неверный пароль для пользователя: {username}")
            return Response(
                {"error": "Неверный пароль"}, status=status.HTTP_401_UNAUTHORIZED
            )
    except User.DoesNotExist:
        logger.warning(f"Попытка входа несуществующего пользователя: {username}")
        return Response(
            {"error": "Пользователь не найден"}, status=status.HTTP_404_NOT_FOUND
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """Выход из системы"""
    username = request.user.username
    logger.info(f"Выход пользователя: {username}")
    logout(request)
    return Response({"message": "Успешный выход"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):
    """Получить информацию о текущем пользователе"""
    return Response(UserSerializer(request.user).data)


class UserViewSet(viewsets.ModelViewSet):
    """API для управления пользователями (только для администраторов)"""

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_admin:
            logger.debug(
                f"Администратор {self.request.user.username} запрашивает список пользователей"
            )
            return User.objects.all()
        logger.debug(
            f"Пользователь {self.request.user.username} запрашивает свою информацию"
        )
        return User.objects.filter(id=self.request.user.id)

    def update(self, request, *args, **kwargs):
        """Обновление пользователя (изменение прав администратора)"""
        if not request.user.is_admin:
            logger.warning(
                f"Попытка обновления пользователя без прав администратора: {request.user.username}"
            )
            return Response(
                {"error": "Недостаточно прав"}, status=status.HTTP_403_FORBIDDEN
            )

        user_to_update = self.get_object()
        old_is_admin = user_to_update.is_admin
        result = super().update(request, *args, **kwargs)
        user_to_update.refresh_from_db()

        if old_is_admin != user_to_update.is_admin:
            logger.info(
                f"Изменение прав администратора для {user_to_update.username}: "
                f"{old_is_admin} -> {user_to_update.is_admin} администратором: "
                f"{request.user.username}"
            )

        return result

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_admin:
            logger.warning(
                f"Попытка удаления пользователя без прав администратора: {request.user.username}"
            )
            return Response(
                {"error": "Недостаточно прав"}, status=status.HTTP_403_FORBIDDEN
            )
        user_to_delete = self.get_object()
        logger.info(
            f"Удаление пользователя: {user_to_delete.username} (ID: {user_to_delete.id}) администратором: {request.user.username}"
        )
        return super().destroy(request, *args, **kwargs)


class FileViewSet(viewsets.ModelViewSet):
    """API для управления файлами"""

    serializer_class = FileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_id = self.request.query_params.get("user_id")
        if user_id and self.request.user.is_admin:
            return File.objects.filter(user_id=user_id)
        return File.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        """Загрузка файла"""
        uploaded_file = request.FILES.get("file")
        comment = request.data.get("comment", "")

        if not uploaded_file:
            logger.warning(
                f"Попытка загрузки без файла пользователем: {request.user.username}"
            )
            return Response(
                {"error": "Файл не предоставлен"}, status=status.HTTP_400_BAD_REQUEST
            )

        logger.info(
            f"Начало загрузки файла: {uploaded_file.name} (размер: {uploaded_file.size} байт) пользователем: {request.user.username}"
        )

        user_dir = os.path.join(settings.MEDIA_ROOT, request.user.storage_path)
        os.makedirs(user_dir, exist_ok=True)

        import uuid

        file_extension = os.path.splitext(uploaded_file.name)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(user_dir, unique_filename)

        try:
            with open(file_path, "wb+") as destination:
                for chunk in uploaded_file.chunks():
                    destination.write(chunk)

            file_obj = File.objects.create(
                user=request.user,
                original_name=uploaded_file.name,
                file_path=os.path.join(request.user.storage_path, unique_filename),
                size=uploaded_file.size,
                comment=comment,
            )

            logger.info(
                f"Файл успешно загружен: {uploaded_file.name} (ID: {file_obj.id}) пользователем: {request.user.username}"
            )
            return Response(
                FileSerializer(file_obj).data, status=status.HTTP_201_CREATED
            )
        except Exception as e:
            logger.error(f"Ошибка при загрузке файла {uploaded_file.name}: {str(e)}")
            return Response(
                {"error": "Ошибка при сохранении файла"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        """Скачивание файла"""
        file_obj = self.get_object()
        file_full_path = os.path.join(settings.MEDIA_ROOT, file_obj.file_path)

        logger.info(
            f"Попытка скачивания файла: {file_obj.original_name} (ID: {file_obj.id}) пользователем: {request.user.username}"
        )

        if not os.path.exists(file_full_path):
            logger.error(f"Файл не найден на диске: {file_full_path}")
            raise Http404("Файл не найден")

        file_obj.last_download_date = timezone.now()
        file_obj.save()

        logger.info(
            f"Файл успешно скачан: {file_obj.original_name} пользователем: {request.user.username}"
        )
        response = FileResponse(open(file_full_path, "rb"))
        response["Content-Disposition"] = (
            f'attachment; filename="{file_obj.original_name}"'
        )
        return response

    @action(detail=True, methods=["get"])
    def view(self, request, pk=None):
        """Просмотр файла в браузере (для изображений и текстовых файлов)"""
        file_obj = self.get_object()
        file_full_path = os.path.join(settings.MEDIA_ROOT, file_obj.file_path)

        logger.info(
            f"Попытка просмотра файла: {file_obj.original_name} (ID: {file_obj.id}) пользователем: {request.user.username}"
        )

        if not os.path.exists(file_full_path):
            logger.error(f"Файл не найден на диске: {file_full_path}")
            raise Http404("Файл не найден")

        # Определяем тип контента
        file_extension = os.path.splitext(file_obj.original_name)[1].lower()
        content_type_map = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".gif": "image/gif",
            ".svg": "image/svg+xml",
            ".txt": "text/plain",
            ".html": "text/html",
            ".css": "text/css",
            ".js": "text/javascript",
            ".json": "application/json",
            ".pdf": "application/pdf",
        }

        content_type = content_type_map.get(file_extension, "application/octet-stream")

        response = FileResponse(open(file_full_path, "rb"), content_type=content_type)
        response["Content-Disposition"] = f'inline; filename="{file_obj.original_name}"'

        logger.info(
            f"Файл открыт для просмотра: {file_obj.original_name} пользователем: {request.user.username}"
        )
        return response

    def update(self, request, *args, **kwargs):
        """Обновление файла (переименование, изменение комментария)"""
        file_obj = self.get_object()
        logger.info(
            f"Обновление файла: {file_obj.original_name} (ID: {file_obj.id}) пользователем: {request.user.username}"
        )

        # Разрешаем обновление original_name и comment
        if "original_name" in request.data:
            old_name = file_obj.original_name
            file_obj.original_name = request.data["original_name"]
            logger.info(f"Переименование файла: {old_name} -> {file_obj.original_name}")

        if "comment" in request.data:
            old_comment = file_obj.comment
            file_obj.comment = request.data["comment"]
            logger.info(
                f"Изменение комментария к файлу {file_obj.original_name}: '{old_comment}' -> '{file_obj.comment}'"
            )

        file_obj.save()
        return Response(FileSerializer(file_obj).data)

    def destroy(self, request, *args, **kwargs):
        """Удаление файла"""
        file_obj = self.get_object()
        logger.info(
            f"Удаление файла: {file_obj.original_name} (ID: {file_obj.id}) пользователем: {request.user.username}"
        )

        file_full_path = os.path.join(settings.MEDIA_ROOT, file_obj.file_path)
        if os.path.exists(file_full_path):
            try:
                os.remove(file_full_path)
                logger.info(f"Файл удален с диска: {file_full_path}")
            except Exception as e:
                logger.error(f"Ошибка при удалении файла с диска: {str(e)}")

        return super().destroy(request, *args, **kwargs)


@api_view(["GET"])
@permission_classes([AllowAny])
def download_by_link(request, special_link):
    """Скачивание файла по специальной ссылке"""
    logger.info(f"Попытка скачивания файла по специальной ссылке: {special_link}")
    try:
        file_obj = File.objects.get(special_link=special_link)
        file_full_path = os.path.join(settings.MEDIA_ROOT, file_obj.file_path)

        if not os.path.exists(file_full_path):
            logger.error(
                f"Файл не найден на диске по ссылке {special_link}: {file_full_path}"
            )
            raise Http404("Файл не найден")

        file_obj.last_download_date = timezone.now()
        file_obj.save()

        logger.info(
            f"Файл успешно скачан по специальной ссылке: {file_obj.original_name}"
        )
        response = FileResponse(open(file_full_path, "rb"))
        response["Content-Disposition"] = (
            f'attachment; filename="{file_obj.original_name}"'
        )
        return response
    except File.DoesNotExist:
        logger.warning(
            f"Попытка скачивания несуществующего файла по ссылке: {special_link}"
        )
        raise Http404("Файл не найден")
