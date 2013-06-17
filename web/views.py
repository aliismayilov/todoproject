from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from django.views.decorators.http import require_http_methods
from django.utils import timezone

from api.models import Todo

@login_required
def index(request, todo_id=None):
    completed = request.GET.get('completed', default='false')

    if completed.lower() == 'true':
        completed = True
    elif completed.lower() == 'false':
        completed = False

    if completed == 'all':
        todos = Todo.objects.filter(owner=request.user)
    else:
        todos = Todo.objects.filter(owner=request.user, completed=completed)

    if todo_id:
        todo = get_object_or_404(Todo, id=todo_id)
        todo_string = todo.title
        if todo.due_date:
            todo_string += ' ^' + todo.due_date.strftime('%m/%d/%Y')
        if todo.priority == Todo.HIGH:
            todo_string += ' !'
    else:
        todo_string = None
    
    return render(request, 'rest_framework/api.html', {
        'todos': todos,
        'todo_string': todo_string,
        'todo_id': todo_id
    })

@login_required
@require_http_methods(["POST"])
def create_update(request):
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

    todo_id = request.POST.get('todo_id')
    if todo_id:
        todo = get_object_or_404(Todo, id=todo_id)
    else:
        todo = Todo()
        todo.owner = request.user
        todo.completed = False

    todo.title = title
    todo.priority = priority
    todo.due_date = date
    todo.save()

    return redirect(reverse('web:index'))
