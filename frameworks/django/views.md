
# Writing views



    from django.http import HttpResponse, HttpResponseNotFound

## Returning errors

> In order to show customized HTML when Django returns a 404, you can create an HTML template named `404.html` and place it in the top level of your template tree. This template will then be served when `DEBUG` is set to `False`.

```python
from django.http import Http404

def detail(request, poll_id):
    try:
        p = Poll.objects.get(pk=poll_id)
    except Poll.DoesNotExist:
        raise Http404("Poll does not exist")
    return render(request, 'polls/detail.html', {'poll': p})
```

## Customizing error views

The page_not_found() view is overridden by handler404:

```python
handler404 = 'mysite.views.my_custom_page_not_found_view'
```

The server_error() view is overridden by handler500:

```python
handler500 = 'mysite.views.my_custom_error_view'
```

The permission_denied() view is overridden by handler403:

```python
handler403 = 'mysite.views.my_custom_permission_denied_view'
```

The bad_request() view is overridden by handler400:

```python
handler400 = 'mysite.views.my_custom_bad_request_view'
```



# Django shortcut functions

- render()
- redirect()
- get_object_or_404()
- get_list_or_404()

`render(request, template_name, context=None, content_type=None, status=None, using=None)`

> Combines a given template with a given context dictionary and returns an HttpResponse object with that rendered text.

### Required arguments

- request
- template_name

### Optional arguments

  - context           # dictionary of values to add to the template context.
  - content_type      # The MIME type to use for the resulting document. Defaults to 'text/html'.
  - status            # The status code for the response. Defaults to 200.
  - using             # The NAME of a template engine to use for loading the template.

`redirect(to, *args, permanent=False, **kwargs)`

Returns an HttpResponseRedirect to the appropriate URL for the arguments passed.

### The arguments could be:

- A model: the model’s `get_absolute_url()` function will be called.
- A view name, possibly with arguments: `reverse()` will be used to reverse-resolve the name.
- An absolute or relative URL, which will be used as-is for the redirect location.

### You can use the redirect() function in a number of ways.

- redirect(MyModel.objects.get(...))
- redirect('some-view-name', foo='bar')
- redirect('/some/url/')
- redirect('https://example.com/')



`get_object_or_404(klass, *args, **kwargs)`

> Calls `get()` on a given model manager, but it raises `Http404` instead of the model’s DoesNotExist exception.

```python
obj = get_object_or_404(MyModel, pk=1)

# equivalent to:
try:
    obj = MyModel.objects.get(pk=1)
except MyModel.DoesNotExist:
    raise Http404("No MyModel matches the given query.")
```

> The most common use case is to pass a Model, as shown above. However, you can also pass a QuerySet instance:

```python
queryset = Book.objects.filter(title__startswith='M')
get_object_or_404(queryset, pk=1)

# equivalent to
get_object_or_404(Book, title__startswith='M', pk=1)
```

`get_list_or_404(klass, *args, **kwargs)`

> Returns the result of filter() on a given model manager cast to a list, raising Http404 if the resulting list is empty.

```python
my_objects = get_list_or_404(MyModel, published=True)

# equal to
my_objects = list(MyModel.objects.filter(published=True))
if not my_objects:
    raise Http404("No MyModel matches the given query.")
```