from django.conf.urls import patterns, include, url

urlpatterns = patterns('web.views',
    url(r'^$', 'index', name='index'),
    url(r'^create$', 'create', name='create')
)
