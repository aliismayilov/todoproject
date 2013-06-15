from django.core.urlresolvers import reverse
from django.shortcuts import redirect

from rest_framework import permissions, viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response

from api.models import Todo
from api.permissions import IsOwnerOnly
from api.serializers import TodoSerializer


class TodoViewSet(viewsets.ModelViewSet):
    serializer_class = TodoSerializer
    permission_classes = (permissions.IsAuthenticated, IsOwnerOnly)
    
    filter_backends = (filters.OrderingFilter, filters.DjangoFilterBackend)
    filter_fields = ('completed',)

    @action()
    def completed(self, request, *args, **kwargs):
        todo = self.get_object()
        todo.completed = not todo.completed # toggle
        todo.save()
        serializer = TodoSerializer(todo)
        if request.POST.get('next'):
            return redirect(reverse('web:index'))
        else:
            return Response(serializer.data)

    def pre_save(self, obj):
        obj.owner = self.request.user
        obj.completed = False
        if not obj.priority:
            obj.priority = Todo.LOW

    def get_queryset(self):
        return Todo.objects.filter(owner=self.request.user)
