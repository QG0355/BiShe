from rest_framework import serializers
from .models import CustomUser, Ticket


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'name', 'role', 'identity_id', 'is_identity_bound']


class RegisterSerializer(serializers.ModelSerializer):
    name = serializers.CharField(required=True)
    role = serializers.CharField(required=True)
    identity_id = serializers.CharField(required=True)

    class Meta:
        model = CustomUser
        fields = ['username', 'password', 'name', 'role', 'identity_id']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # 自动识别超管
        is_staff = validated_data['role'] == 'admin'
        is_superuser = validated_data['role'] == 'admin'

        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            name=validated_data['name'],
            role=validated_data['role'],
            identity_id=validated_data['identity_id'],
            is_identity_bound=True,
            is_staff=is_staff,
            is_superuser=is_superuser
        )
        return user


class TicketSerializer(serializers.ModelSerializer):
    submitter_name = serializers.ReadOnlyField(source='submitter.name')

    class Meta:
        model = Ticket
        fields = '__all__'
        read_only_fields = ['submitter', 'status', 'submitTime', 'updateTime']