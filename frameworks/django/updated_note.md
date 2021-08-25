
# pro note

## settings

```python

TEMPLATES = [
    {
        'DIRS': [BASE_DIR / 'templates'],
        # ...
    }
]


LANGUAGE_CODE = 'en'

TIME_ZONE = 'Africa/Cairo'

USE_I18N = True


STATIC_URL = '/static/'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'


```

## urls

## new `urls` of main project

```python
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include(('todo.urls', 'todo_app'), namespace='todo_app')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

## templates

### submit on `select` change

```html
onchange='submit()'
```
