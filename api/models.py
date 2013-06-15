from django.db import models


class Todo(models.Model):
    LOW = 1
    HIGH = 10
    PRIORITIES = (
        (LOW, 'low'),
        (HIGH, 'high')
    )

    title = models.CharField(max_length=100)
    priority = models.IntegerField(choices=PRIORITIES)
    completed = models.BooleanField(editable=False)
    owner = models.ForeignKey('auth.User', related_name='todos')

    due_date = models.DateTimeField(null=True, blank=True)

    def __unicode__(self):
        return self.title
