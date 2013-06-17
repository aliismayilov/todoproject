from django.conf.urls import patterns, include, url

urlpatterns = patterns('web.views',
    url(r'^$', 'index', name='index'),
    url(r'^create_update$', 'create_update', name='create_update'),
    url(r'^edit/(?P<todo_id>\d+)/$', 'index', name='index'),
)
