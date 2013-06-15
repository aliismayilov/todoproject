from django.contrib.auth.models import User

from rest_framework import serializers

from api.models import Todo


class TodoSerializer(serializers.HyperlinkedModelSerializer):
    owner = serializers.Field(source='owner.username')


    class Meta:
        model = Todo
        fields = ('id', 'url', 'owner', 'title', 'priority', 'completed', 'due_date')
