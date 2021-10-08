
# Internationalization: in Python code

```python
from django.http import HttpResponse
from django.utils.translation import gettext as _

def my_view(request):
    output = _("Welcome to my site.")
    return HttpResponse(output)
```

## Comments for translators

If you would like to give translators hints about a translatable string, you can add a comment prefixed with the Translators keyword on the line preceding the string, e.g.:

```python
def my_view(request):
    # Translators: This message appears on the home page only
    output = gettext("Welcome to my site.")
```

## Pluralization

`ngettext()` takes three arguments: the singular translation string, the plural translation string and the number of objects.

```python
from django.http import HttpResponse
from django.utils.translation import ngettext

def hello_world(request, count):
    page = ngettext(
        'there is %(count)d object',
        'there are %(count)d objects',
        count,
    ) % {
        'count': count,
    }
    return HttpResponse(page)
```

## steps to translate from template

in `settings.py`

```python
MIDDLEWARE = [
   'django.contrib.sessions.middleware.SessionMiddleware',
   'django.middleware.locale.LocaleMiddleware', # add this
   'django.middleware.common.CommonMiddleware',
]

LANGUAGES = [
  ('en-us', 'English'),
  ('fr', 'French'),
]


LOCALE_PATHS = [
    BASE_DIR / 'locale',
]
```

in `urls.py` for the project

```python
urlpatterns = [
    path('admin/', admin.site.urls),
    path('i18n/', include('django.conf.urls.i18n')),    # add this
]
```

on `template.html`

```html
{% load i18n %}

<form action="{% url 'set_language' %}" method="post">{% csrf_token %}
     <select name="language">
        {% get_current_language as LANGUAGE_CODE %}
        {% get_available_languages as LANGUAGES %}
        {% get_language_info_list for LANGUAGES as languages %}
        {% for language in languages %}
          <option value="{{ language.code }}"{% if language.code == LANGUAGE_CODE %} selected{% endif %}>
              {{ language.name_local }} ({{ language.code }})
          </option>
        {% endfor %}
     </select>
     <input type="submit" value="Go">
 </form>


{% trans "Have a good day" %}
```

- create `locale` dir with `manage.py`
- on it create `dir` for each language
- run `django-admin makemessages -l ar --ignore venv` for each language

    in `locale/ar/django.po`

    ```po
    #: templates/home.html:27
    msgid "Have a good day"
    msgstr "نتمني لك يوما لطيفا"
    ```

- then run `django-admin compilemessages`
- run `python manage.py migrate`
