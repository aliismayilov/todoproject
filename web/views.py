from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from django.views.decorators.http import require_http_methods

from api.models import Todo

@login_required
def index(request):
    todos = Todo.objects.filter(owner=request.user)
    return render(request, 'rest_framework/api.html', {
        'todos': todos
    })

@login_required
@require_http_methods(["POST"])
def create(request):
    title = request.POST.get('title')
    if not title:
        return redirect(reverse('web:index'))

    todo = Todo(
        title=title,
        owner=request.user,
        completed=False,
        priority=Todo.LOW
    )
    todo.save()

    return redirect(reverse('web:index'))
