
# The basics

Be careful when you override settings, especially when the default value is a non-empty list or dictionary

```python
ALLOWED_HOSTS = ['www.example.com']
DEBUG = False
DEFAULT_FROM_EMAIL = 'webmaster@example.com'
```

## Using settings in Python code

```python
from django.conf import settings

if settings.DEBUG:
    # Do something
```
