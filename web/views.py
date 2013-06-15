from django.shortcuts import render
from django.contrib.auth.decorators import login_required

from api.models import Todo

@login_required
def index(request):
    todos = Todo.objects.filter(owner=request.user)
    return render(request, 'rest_framework/api.html', {
        'todos': todos
    })
