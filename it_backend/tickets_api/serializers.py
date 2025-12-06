from rest_framework import serializers
from .models import CustomUser, Ticket


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'name', 'role', 'identity_id', 'is_identity_bound']


class RegisterSerializer(serializers.ModelSerializer):
    # 1. 删掉了之前那三行 required=True 的强制要求
    # 现在这些字段都是“可选”的了

    class Meta:
        model = CustomUser
        # 依然接收这些字段，但不再强制校验它们必须存在
        fields = ['username', 'password', 'name', 'role', 'identity_id']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # 2. 获取数据时给“默认值”
        # 如果前端没传 role，默认就是 'student'
        role = validated_data.get('role', 'student')

        # 如果前端没传 identity_id，或者是空字符串，就设为 None (避免空字符串占位导致唯一性冲突)
        identity_id = validated_data.get('identity_id')
        if identity_id == '':
            identity_id = None

        # 自动识别超管权限 (如果选了admin)
        is_staff = (role == 'admin')
        is_superuser = (role == 'admin')

        # 3. 创建用户
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            name=validated_data.get('name', ''),  # 没填名字就是空
            role=role,
            identity_id=identity_id,
            is_identity_bound=True,  # 既然简化了，就默认视为“已绑定”，避免登录后跳死循环
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