
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
