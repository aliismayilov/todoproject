from rest_framework import permissions, viewsets, filters
from rest_framework.response import Response

from api.models import Todo
from api.permissions import IsOwnerOnly
from api.serializers import TodoSerializer


class TodoViewSet(viewsets.ModelViewSet):
    serializer_class = TodoSerializer
    permission_classes = (permissions.IsAuthenticated, IsOwnerOnly)
    
    filter_backend = filters.OrderingFilter

    def pre_save(self, obj):
        obj.owner = self.request.user
        obj.completed = False
        if not obj.priority:
            obj.priority = Todo.LOW

    def get_queryset(self):
        return Todo.objects.filter(owner=self.request.user)
