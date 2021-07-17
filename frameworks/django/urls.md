

# URL dispatcher

> Here’s a sample URLconf:

```python
from django.urls import path
from . import views

urlpatterns = [
    path('articles/2003/', views.special_case_2003),
    path('articles/<int:year>/', views.year_archive),
    path('articles/<int:year>/<int:month>/', views.month_archive),
    path('articles/<int:year>/<int:month>/<slug:slug>/', views.article_detail),
]
```


## Path converters

- `str`       # Matches any non-empty string, excluding the path separator, '/'.
- `int`       # Matches zero or any positive integer. Returns an int.
- `slug`      # string consisting of ASCII letters | numbers, hyphen and underscore characters.
- `path`      # Matches any non-empty string, including the path separator, '/'
- `uuid`      #  075194d3-6885-417e-a8a8-6c931e272f00



# Registering custom path converters

- regex
- to_python
- to_url

`converters.py`

```python
class FourDigitYearConverter:
    regex = '[0-9]{4}'

    def to_python(self, value):
        return int(value)

    def to_url(self, value):
        return '%04d' % value
```

`urls.py`

```python
from django.urls import path, register_converter
from . import converters, views

register_converter(converters.FourDigitYearConverter, 'yyyy')

urlpatterns = [
    path('articles/2003/', views.special_case_2003),
    path('articles/<yyyy:year>/', views.year_archive),
    ...
]
```
on `views.py`
```python
def article_detail(request, year, month, slug):
    return render(request, 'doc_models/pages/dashboard.html')

def year_archive(request, year):
    return render(request, 'doc_models/pages/dashboard.html')
```

## Using regular expressions

> you can also use regular expressions. To do so, use re_path() instead of path().

> Each captured argument is sent to the view as a string


```python
from django.urls import path, re_path
from . import views

urlpatterns = [
    path('articles/2003/', views.special_case_2003),
    re_path(r'^articles/(?P<year>[0-9]{4})/$', views.year_archive),
    re_path(r'^articles/(?P<year>[0-9]{4})/(?P<month>[0-9]{2})/$', views.month_archive),
    re_path(r'^articles/(?P<year>[0-9]{4})/(?P<month>[0-9]{2})/(?P<slug>[\w-]+)/$', views.article_detail),
]
```

# Including other URLconfs

```python
from django.urls import include, path

urlpatterns = [
    # ... snip ...
    path('community/', include('aggregator.urls')),
    path('contact/', include('contact.urls')),
    # ... snip ...
]
```

> This can be used to remove redundancy from URLconfs

```python
from django.urls import include, path

from apps.main import views as main_views
from credit import views as credit_views

extra_patterns = [
    path('reports/', credit_views.report),
    path('reports/<int:id>/', credit_views.report),
    path('charge/', credit_views.charge),
]

urlpatterns = [
    path('', main_views.homepage),
    path('help/', include('apps.help.urls')),
    path('credit/', include(extra_patterns)),
]
```

> instead of 
```python
from django.urls import path
from . import views

urlpatterns = [
    path('<page_slug>-<page_id>/history/', views.history),
    path('<page_slug>-<page_id>/edit/', views.edit),
    path('<page_slug>-<page_id>/discuss/', views.discuss),
    path('<page_slug>-<page_id>/permissions/', views.permissions),
]
```
> can be

```python
from django.urls import include, path
from . import views

urlpatterns = [
    path('<page_slug>-<page_id>/', include([
        path('history/', views.history),
        path('edit/', views.edit),
        path('discuss/', views.discuss),
        path('permissions/', views.permissions),
    ])),
]
```

# Passing extra options to view functions

```python
from django.urls import path
from . import views

urlpatterns = [
    path('blog/<int:year>/', views.year_archive, {'foo': 'bar'}),
]
```

# Passing extra options to `include()`

> instead of 

```python
# main.py
from django.urls import include, path
from mysite import views

urlpatterns = [
    path('blog/', include('inner')),
]

# inner.py
from django.urls import path

urlpatterns = [
    path('archive/', views.archive, {'blog_id': 3}),    # here is the point    
    path('about/', views.about, {'blog_id': 3}),        # here is the point
]
```
> can be

```python
# main.py
from django.urls import include, path

urlpatterns = [
    path('blog/', include('inner'), {'blog_id': 3}),    # here is the point 
]

# inner.py
from django.urls import path
from mysite import views

urlpatterns = [
    path('archive/', views.archive),
    path('about/', views.about),
]
```


# Reverse resolution of URLs

> Django provides tools for performing URL reversing that match the different layers where URLs are needed:

- In templates: Using the url template tag.
- In Python code: Using the `reverse()` function.
- In higher level code related to handling of URLs of Django model instances: The `get_absolute_url()` method.


## Examples

> our `url` in `urls.py`

```python
urlpatterns = [
    path('articles/<int:year>/', views.year_archive, name='news-year-archive'),
]
```

in `template.html` page

```html 
<a href="{% url 'news-year-archive' 2012 %}">2012 Archive</a>
```

on `Python code`

```python
from django.http import HttpResponseRedirect
from django.urls import reverse

def redirect_to_year(request):
    year = 2006
    return HttpResponseRedirect(reverse('news-year-archive', args=(year,)))
```
