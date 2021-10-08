
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

- ## Core Settings

  - `ADMINS`

    Default: []

    list of all the people who get code error notifications. When DEBUG=False and AdminEmailHandler is configured in LOGGING (done by default), Django emails these people the details of exceptions raised in the request/response cycle.

    `[('John', 'john@example.com'), ('Mary', 'mary@example.com')]`

  - ALLOWED_HOSTS

    Default: []

    A list of strings representing the host/domain names that this Django site can serve

  - `DATABASES`

    ```python
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': 'mydatabase',
        }
    }
    ```

    ```python
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': 'mydatabase',
            'USER': 'mydatabaseuser',
            'PASSWORD': 'mypassword',
            'HOST': '127.0.0.1',
            'PORT': '5432',
        }
    }
    ```

    inner options

    - ENGINE
      - 'django.db.backends.postgresql'
      - 'django.db.backends.mysql'
      - 'django.db.backends.sqlite3'
      - 'django.db.backends.oracle'
    - HOST
    - NAME
    - PASSWORD
    - PORT
    - USER

  - `DATA_UPLOAD_MAX_MEMORY_SIZE`

    Default: 2621440 (i.e. 2.5 MB).

  - `DATE_FORMAT`

    Default: 'N j, Y' (e.g. Feb. 4, 2003)

  - `DATETIME_FORMAT`

    Default: 'N j, Y, P' (e.g. Feb. 4, 2003, 4 p.m.)

  - `DEFAULT_CHARSET`

    Default: 'utf-8'

  - `LANGUAGE_CODE`

    Default: 'en-us'

  - `LANGUAGES`

    ```python
    from django.utils.translation import gettext_lazy as _

    LANGUAGES = [
        ('de', _('German')),
        ('en', _('English')),
    ]
    ```

  - `MEDIA_ROOT`

    Default: ''

    `MEDIA_ROOT = BASE_DIR / 'media'`

    `MEDIA_URL = '/media/'`

  - `TIME_ZONE`

    TIME_ZONE = 'Africa/Cairo'

- ## Auth

  - LOGIN_REDIRECT_URL

    Default: '/accounts/profile/'

    The URL or named URL pattern where requests are redirected after login when the LoginView doesn’t get a next GET parameter.

  - LOGIN_URL

    Default: '/accounts/login/'

    The URL or named URL pattern where requests are redirected for login when using the login_required() decorator, LoginRequiredMixin, or AccessMixin.

  - LOGOUT_REDIRECT_URL

    Default: None

    The URL or named URL pattern where requests are redirected after logout if LogoutView doesn’t have a next_page attribute.

    If None, no redirect will be performed and the logout view will be rendered.

  - PASSWORD_RESET_TIMEOUT

    Default: 259200 (3 days, in seconds)

  - PASSWORD_RESET_TIMEOUT_DAYS

    Default: 3

  - MESSAGE_TAGS

    Default:

    {
        messages.DEBUG: 'debug',
        messages.INFO: 'info',
        messages.SUCCESS: 'success',
        messages.WARNING: 'warning',
        messages.ERROR: 'error',    # danger
    }

- ## Static Files

  - STATIC_ROOT

    The absolute path to the directory where collectstatic will collect static files for deployment.

    Example: "/var/www/example.com/static/"

  - STATIC_URL

    Default: None

    STATIC_URL = '/static/'
