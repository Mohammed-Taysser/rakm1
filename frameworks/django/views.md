
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



# View decorators

## Allowed HTTP methods

These decorators will return a django.http.HttpResponseNotAllowed if the conditions are not met.

- require_http_methods(request_method_list)
- require_GET
- require_POST
- require_safe      # require that a view only accepts the GET and HEAD methods.
    commonly considered “safe” because they should not have the significance of taking an action other than retrieving the requested resource.

```python
from django.views.decorators.http import require_http_methods

@require_http_methods(["GET", "POST"])
def my_view(request):
    # I can assume now that only GET or POST requests make it this far
    pass
```


# HttpRequest objects

## Attributes

- `request.path`        # string representing the full path to the requested page
- `request.scheme`      # string representing the scheme of the request http | https 
- `request.body`
- `request.path_info`
- `request.method`      # GET | POST
- `request.encoding`
- `request.content_type`        # text/plain
- `request.content_params`      # dictionary of parameters included in the CONTENT_TYPE header.
- `request.GET`         # dictionary containing all given HTTP GET parameters
- `request.POST`        # dictionary containing all given HTTP POST parameters
- `request.COOKIES`     # dictionary containing all cookies.
- `request.FILES`       # dictionary containing all uploaded files
- `request.resolver_match`
- `request.headers`     # case insensitive, dict provides access to all HTTP-prefixed headers
    ```html
        <ul>
            {% for key, value in request.headers.items %}
                <li>{{key}} ===> {{value}} </li>
            {% endfor %}
        </ul>
    ```
- `request.META`
    >  dictionary containing all available HTTP headers. Available headers depend on the client and server

    - CONTENT_LENGTH – The length of the request body (as a string).
    - CONTENT_TYPE – The MIME type of the request body.
    - HTTP_ACCEPT – Acceptable content types for the response.
    - HTTP_ACCEPT_ENCODING – Acceptable encodings for the response.
    - HTTP_ACCEPT_LANGUAGE – Acceptable languages for the response.
    - HTTP_HOST – The HTTP Host header sent by the client.
    - HTTP_REFERER – The referring page, if any.
    - HTTP_USER_AGENT – The client’s user-agent string.
    - QUERY_STRING – The query string, as a single (unparsed) string.
    - REMOTE_ADDR – The IP address of the client.
    - REMOTE_HOST – The hostname of the client.
    - REMOTE_USER – The user authenticated by the Web server, if any.
    - REQUEST_METHOD – A string such as "GET" or "POST".
    - SERVER_NAME – The hostname of the server.
    - SERVER_PORT – The port of the server (as a string).


    ```html
        <ul>
        {% for key, value in request.META.items %}
            <li>{{key}} ===> {{value}} </li>
        {% endfor %}
        </ul>
    ```



## Attributes set by application code

- `request.urlconf`
- `request.current_app`
- `request.exception_reporter_filter`
- `request.exception_reporter_class`


## Attributes set by middleware

- `request.session`
- `request.site`
- `request.user`


## Methods

- `request.get_host`            # 127.0.0.1:8000
- `request.get_port`
- `request.get_full_path`
- `request.get_full_path_info`
- `request.is_secure`       # True if the request is secure,if it was made with HTTPS.
- `request.get_full_path_info`
- get_signed_cookie(key, default=RAISE_ERROR, salt='', max_age=None)
    request.get_signed_cookie('name')
    'Tony'

    request.get_signed_cookie('name', salt='name-salt')
    'Tony' # assuming cookie was set using the same salt

    request.get_signed_cookie('nonexistent-cookie')
    ...
    KeyError: 'nonexistent-cookie'

    request.get_signed_cookie('nonexistent-cookie', False)
    False

    request.get_signed_cookie('cookie-that-was-tampered-with')
    ...
    BadSignature: ...

    request.get_signed_cookie('name', max_age=60)
    ...
    SignatureExpired: Signature age 1677.3839159 > 60 seconds

    request.get_signed_cookie('name', False, max_age=60)
    False



## JsonResponse objects

`class JsonResponse(data, encoder=DjangoJSONEncoder, safe=True, json_dumps_params=None, **kwargs)`



```python
>>> from django.http import JsonResponse
>>> response = JsonResponse({'foo': 'bar'})
>>> response.content
b'{"foo": "bar"}'

# Without passing safe=False, a TypeError will be raised.
response = JsonResponse([1, 2, 3], safe=False)
```

# File Uploads

> `request.FILES` will only contain data if the request method was `POST`, and the `<form>` that posted the request has the attribute `enctype="multipart/form-data`". Otherwise, request.FILES will be empty.

on `forms.py`

```python
from django import forms

class UploadFileForm(forms.Form):
    title = forms.CharField(max_length=50)
    file = forms.FileField()
```


on `views.py`

```python
from django.http import HttpResponseRedirect
from django.shortcuts import render
from .forms import UploadFileForm

# Imaginary function to handle an uploaded file.
from somewhere import handle_uploaded_file

def upload_file(request):
    if request.method == 'POST':
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            handle_uploaded_file(request.FILES['file'])
            return HttpResponseRedirect('/success/url/')
    else:
        form = UploadFileForm()
    return render(request, 'upload.html', {'form': form})
```

> Here’s a common way you might handle an uploaded file:
```python
def handle_uploaded_file(f):
    with open('some/file/name.txt', 'wb+') as destination:
        for chunk in f.chunks():
            destination.write(chunk)
```
Looping over UploadedFile.chunks() instead of using read() ensures that large files don’t overwhelm your system’s memory.


## Handling uploaded files with a model

```python
from django.http import HttpResponseRedirect
from django.shortcuts import render
from .forms import ModelFormWithFileField

def upload_file(request):
    if request.method == 'POST':
        form = ModelFormWithFileField(request.POST, request.FILES)
        if form.is_valid():
            # file is saved
            form.save()
            return HttpResponseRedirect('/success/url/')
    else:
        form = ModelFormWithFileField()
    return render(request, 'upload.html', {'form': form})
```



# Uploading multiple files

on `forms.py`
```python
from django import forms

class FileFieldForm(forms.Form):
    file_field = forms.FileField(widget=forms.ClearableFileInput(
        attrs={'multiple': True})
    )
```

> Then override the post method of your FormView subclass to handle multiple file uploads:

on `views.py`

```python
from django.views.generic.edit import FormView
from .forms import FileFieldForm

class FileFieldFormView(FormView):
    form_class = FileFieldForm
    template_name = 'upload.html'  # Replace with your template.
    success_url = '...'  # Replace with your URL or reverse().

    def post(self, request, *args, **kwargs):
        form_class = self.get_form_class()
        form = self.get_form(form_class)
        files = request.FILES.getlist('file_field')
        if form.is_valid():
            for f in files:
                ...  # Do something with each file.
            return self.form_valid(form)
        else:
            return self.form_invalid(form)
```

## Modifying upload handlers on the fly

suppose you’ve written a ProgressBarUploadHandler that provides feedback on upload progress to some sort of AJAX widget. You’d add this handler to your upload handlers like this:

    request.upload_handlers.insert(0, ProgressBarUploadHandler(request))

You’d probably want to use list.insert() in this case (instead of append()) because a progress bar handler would need to run before any other handlers. Remember, the upload handlers are processed in order.

    request.upload_handlers = [ProgressBarUploadHandler(request)]
