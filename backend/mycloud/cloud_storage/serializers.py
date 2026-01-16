from rest_framework import serializers
from .models import User, File
import re


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'full_name']
    
    def validate_username(self, value):
        # Только латинские буквы и цифры, первый символ - буква, длина 4-20
        if not re.match(r'^[a-zA-Z][a-zA-Z0-9]{3,19}$', value):
            raise serializers.ValidationError(
                "Логин должен начинаться с буквы, содержать только латинские буквы и цифры, длина 4-20 символов"
            )
        return value
    
    def validate_password(self, value):
        # Минимум 6 символов, одна заглавная, одна цифра, один спецсимвол
        if len(value) < 6:
            raise serializers.ValidationError("Пароль должен содержать минимум 6 символов")
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Пароль должен содержать хотя бы одну заглавную букву")
        if not re.search(r'[0-9]', value):
            raise serializers.ValidationError("Пароль должен содержать хотя бы одну цифру")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise serializers.ValidationError("Пароль должен содержать хотя бы один специальный символ")
        return value
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            full_name=validated_data['full_name']
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    files_count = serializers.SerializerMethodField()
    total_size = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'is_admin', 'files_count', 'total_size']
    
    def get_files_count(self, obj):
        return obj.files.count()
    
    def get_total_size(self, obj):
        return sum(f.size for f in obj.files.all())


class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['id', 'original_name', 'size', 'comment', 'upload_date', 'last_download_date', 'special_link']
        read_only_fields = ['upload_date', 'last_download_date', 'special_link']