from django.conf.urls import patterns, include, url

from rest_framework.routers import SimpleRouter

from api import views

router = SimpleRouter()
router.register(r'todos', views.TodoViewSet, base_name='todo')

urlpatterns = patterns('',
    url(r'^', include(router.urls)),
)
