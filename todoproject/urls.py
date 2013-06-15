from django.conf.urls import patterns, include, url

urlpatterns = patterns('',
    url(r'^api/', include('api.urls')),
    url(r'^auth/', include('rest_framework.urls', namespace='rest_framework')),
)
