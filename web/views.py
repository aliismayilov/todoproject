from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from django.views.decorators.http import require_http_methods
from django.utils import timezone

from api.models import Todo

@login_required
def index(request):
    completed = request.GET.get('completed', default='false')

    if completed.lower() == 'true':
        completed = True
    elif completed.lower() == 'false':
        completed = False

    if completed == 'all':
        todos = Todo.objects.filter(owner=request.user)
    else:
        todos = Todo.objects.filter(owner=request.user, completed=completed)
    
    return render(request, 'rest_framework/api.html', {
        'todos': todos
    })

@login_required
@require_http_methods(["POST"])
def create(request):
    title = request.POST.get('title')
    if not title:
        return redirect(reverse('web:index'))

    # get priority if supplied
    if title.strip().endswith('!'):
        priority = Todo.HIGH
        title = title.strip()[:-1].strip()
    else:
        priority = Todo.LOW

    # get date if defined
    if '^' in title:
        date = title.split('^')[1].split()[0]
        title = title.split('^')[0].strip()

        # parse date to datetime object
        date = timezone.datetime.strptime(date, '%m/%d/%Y')
    else:
        date = None

    todo = Todo(
        title=title,
        owner=request.user,
        completed=False,
        priority=priority,
        due_date=date
    )
    todo.save()

    return redirect(reverse('web:index'))
