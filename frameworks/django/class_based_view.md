

> allow you to structure your views and reuse code by harnessing inheritance and mixins. There are also some generic views for tasks

## Basic examples

### example 1
`urls.py`

```python
from django.urls import path
from django.views.generic import TemplateView

urlpatterns = [
    path('about/', TemplateView.as_view(template_name="about.html")),
]
# Any arguments passed to as_view() will override attributes set on the class.
```

### example 2

`views.py`
```python
from django.views.generic import TemplateView

class AboutView(TemplateView):
    template_name = "about.html"
```

`urls.py`

```python
from django.urls import path
from app_name.views import AboutView

urlpatterns = [
    path('about/', AboutView.as_view()),
]
```


# Built-in class-based generic views

`models.py`

```python
from django.db import models

class Publisher(models.Model):
    name = models.CharField(max_length=30)
    address = models.CharField(max_length=50)
    city = models.CharField(max_length=60)
    state_province = models.CharField(max_length=30)
    country = models.CharField(max_length=50)
    website = models.URLField()

    class Meta:
        ordering = ["-name"]

    def __str__(self):
        return self.name

class Author(models.Model):
    salutation = models.CharField(max_length=10)
    name = models.CharField(max_length=200)
    email = models.EmailField()
    headshot = models.ImageField(upload_to='author_headshots')

    def __str__(self):
        return self.name

class Book(models.Model):
    title = models.CharField(max_length=100)
    authors = models.ManyToManyField('Author')
    publisher = models.ForeignKey(Publisher, on_delete=models.CASCADE)
    publication_date = models.DateField()
```

`views.py`

```python
from django.views.generic import ListView
from books.models import Publisher

class PublisherListView(ListView):
    model = Publisher
```

`urls.py`

```python
from django.urls import path
from . import views

app_name = 'CBV'

urlpatterns = [
    path('publishers/', views.PublisherListView.as_view()),
]

```



> tell the view which template to use by adding a `template_name` attribute to the view, but if not provide Django will infer one from the object’s name. In this case, the inferred template will be `CBV_doc/publisher_list.html` the `CBV_doc` part comes from the name of the **app** that defines the model, while the `publisher` bit is the lowercase version of the model’s name.
> `/path/to/project/CBV_doc/templates/CBV_doc/publisher_list.html`

**Making “friendly” template contexts**

> This template will be rendered against a context containing a variable called `object_list` that contains all the publisher objects.
> to change `object_list` we use `context_object_name = 'my_favorite_publishers'`


```html
{% extends "base.html" %}

{% block content %}
    <h2>Publishers</h2>
    <ul>
        {% for publisher in object_list %}
            <li>{{ publisher.name }}</li>
        {% endfor %}
    </ul>
{% endblock %}
```

### Adding extra context

```python
from django.views.generic import DetailView
from books.models import Book, Publisher

class PublisherDetailView(DetailView):
    model = Publisher
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['book_list'] = Book.objects.all()
        return context
```


*two way to pass model to CBV*
- `queryset = Publisher.objects.all()`      # to apply some filters
- `model = models.Publisher`                # just the all model's objects

> Specifying `model = Publisher` is shorthand for saying `queryset = Publisher.objects.all()`.
> using `queryset` to define a filtered list of objects you can be more specific about the objects that will be visible in the view 



## Dynamic filtering

> various useful things are stored on `self` as well as the request (`self.request`) this includes the positional (`self.args`) and name-based (`self.kwargs`) arguments captured according to the `URLconf`.

> Another common need is to filter down the objects given in a list page by some key in the URL. Earlier we hard-coded the publisher’s name in the URLconf, but what if we wanted to write a view that displayed all the books by some arbitrary publisher?

> Handily, the ListView has a `get_queryset()` method we can override. By default, it returns the value of the queryset attribute, but we can use it to add more logic.

` urls.py`

```python
from django.urls import path
from books.views import PublisherBookListView

urlpatterns = [
    path('books/<publisher>/', PublisherBookListView.as_view()),
]
```

`views.py`

```python
from django.shortcuts import get_object_or_404
from django.views.generic import ListView
from . import models

class PublisherBookListView(ListView):
	template_name = 'CBV_doc/publisher_list.html'

	def get_queryset(self):
		self.publisher = get_object_or_404(models.Publisher, name=self.kwargs['publisher'])
		return models.Book.objects.filter(publisher=self.publisher)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['publisher'] = self.publisher
        return context
```

> Using `get_queryset` to add logic to the queryset selection is as convenient as it is powerful. For instance, if we wanted, we could use `self.request.user` to filter using the current user, or other more complex logic.

### Performing extra work

`models.py`

```python
from django.db import models

class Author(models.Model):
    ...
    last_accessed = models.DateTimeField()
```

```python
from django.urls import path
from books.views import AuthorDetailView

urlpatterns = [
    path('authors/<int:pk>/', AuthorDetailView.as_view(), name='author-detail'),
]
```

> `get_object` is the method that retrieves the object 


```python
from django.utils import timezone
from django.views.generic import DetailView
from books.models import Author

class AuthorDetailView(DetailView):
    queryset = Author.objects.all()

    def get_object(self):
        obj = super().get_object()
        # Record the last accessed date
        obj.last_accessed = timezone.now()
        obj.save()
        return obj
```


# Form handling with class-based views

**Form processing generally has 3 paths:**

- Initial GET (blank or prepopulated form)
- POST with invalid data (typically redisplay form with errors)
- POST with valid data (process the data and typically redirect)


## Basic forms

`forms.py`

```python
from django import forms

class ContactForm(forms.Form):
    name = forms.CharField()
    message = forms.CharField(widget=forms.Textarea)

    def send_email(self):
        # send email using the self.cleaned_data dictionary
        pass
```

`views.py`

```python
from myapp.forms import ContactForm
from django.views.generic.edit import FormView

class ContactFormView(FormView):
    template_name = 'contact.html'
    form_class = ContactForm
    success_url = '/thanks/'

    def form_valid(self, form):
        # This method is called when valid form data has been POSTed.
        # It should return an HttpResponse.
        form.send_email()
        return super().form_valid(form)

```

## Model forms

- If the `model` attribute is given, that model class will be used.
- If `get_object()` returns an object, the class of that object will be used.
- If a `queryset` is given, the model for that queryset will be used.


- Model form views provide a `form_valid()` implementation that saves the model automatically
-no need to provide a `success_url` for `CreateView` or `UpdateView` - they will use `get_absolute_url` on the model object if available.

`models.py`

```python
from django.db import models
from django.urls import reverse

class Author(models.Model):
    name = models.CharField(max_length=200)

    def get_absolute_url(self):
        return reverse('author-detail', kwargs={'pk': self.pk})
```

`views.py`

> We have to use` reverse_lazy()` instead of `reverse()`, as the urls are not loaded when the file is imported
> 
```python
from django.urls import reverse_lazy
from django.views.generic.edit import CreateView, DeleteView, UpdateView
from myapp.models import Author

class AuthorCreateView(CreateView):
    model = Author
    fields = ['name']

class AuthorUpdateView(UpdateView):
    model = Author
    fields = ['name']

class AuthorDeleteView(DeleteView):
    model = Author
    success_url = reverse_lazy('author-list')
```

`urls.py`

```python
from django.urls import path
from myapp.views import AuthorCreateView, AuthorDeleteView, AuthorUpdateView

urlpatterns = [
    # ...
    path('author/add/', AuthorCreateView.as_view(), name='author-add'),
    path('author/<int:pk>/', AuthorUpdateView.as_view(), name='author-update'),
    path('author/<int:pk>/delete/', AuthorDeleteView.as_view(), name='author-delete'),
]
```


**Note**

These views inherit `SingleObjectTemplateResponseMixin` which uses `template_name_suffix` to construct the `template_name` based on the model.


- `CreateView` and `UpdateView` use` myapp/author_form.html`
- `DeleteView` uses `myapp/author_confirm_delete.html`

> If you wish to have separate templates for `CreateView` and `UpdateView`, you can set either `template_name` or `template_name_suffix` on your view class.


# Models and request.user

`models.py`

```python
from django.contrib.auth.models import User
from django.db import models

class Author(models.Model):
    name = models.CharField(max_length=200)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
```

> In the view, ensure that you don’t include `created_by` in the list of fields to edit, and override `form_valid()` to add the user
> `LoginRequiredMixin` prevents users who aren’t logged in from accessing the form.


`views.py`

```python
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic.edit import CreateView
from myapp.models import Author

class AuthorCreateView(LoginRequiredMixin, CreateView):
    model = Author
    fields = ['name']

    def form_valid(self, form):
        form.instance.created_by = self.request.user
        return super().form_valid(form)

```

# Using mixins with class-based views

## Context and template responses

- `TemplateResponseMixin`
- `ContextMixin`


# Building up Django’s generic class-based views

- DetailView        : working with a single Django object
- ListView          : working with many Django objects




## Using `SingleObjectMixin` with View

a class-based view that responds only to POST


`views.py`

```python
from django.http import HttpResponseForbidden, HttpResponseRedirect
from django.urls import reverse
from django.views import View
from django.views.generic.detail import SingleObjectMixin
from books.models import Author

class RecordInterestView(SingleObjectMixin, View):
    """Records the current user's interest in an author."""
    model = Author

    def post(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return HttpResponseForbidden()

        # Look up the author we're interested in.
        self.object = self.get_object()
        # Actually record interest somehow here!

        return HttpResponseRedirect(reverse('author-detail', kwargs={'pk': self.object.pk}))
```


`urls.py`

```python
from django.urls import path
from books.views import RecordInterestView

urlpatterns = [
    #...
    path('author/<int:pk>/interest/', RecordInterestView.as_view(), name='author-interest'),
]
```

## Using `SingleObjectMixin` with ListView

`ListView` provides built-in pagination, but you might want to paginate a list of objects that are all linked (by a foreign key) to another object. In our publishing *example*, you might want to paginate through all the books by a particular publisher.

One way to do this is to combine `ListView` with `SingleObjectMixin`, so that the queryset for the paginated list of books can hang off the publisher found as the single object. In order to do this, we need to have two different querysets:

- Book queryset for use by `ListView`
    Since we have access to the Publisher whose books we want to list, we override `get_queryset()` and use the Publisher’s reverse foreign key manager.
- Publisher queryset for use in `get_object()`
    We’ll rely on the default implementation of `get_object()` to fetch the correct Publisher object. However, we need to explicitly pass a queryset argument because otherwise the default implementation of `get_object()` would call `get_queryset()` which we have overridden to return Book objects instead of Publisher ones.


**Note**

We have to think carefully about `get_context_data()`. Since both `SingleObjectMixin` and `ListView` will put things in the context data under the value of `context_object_name` if it’s set, we’ll instead explicitly ensure the Publisher is in the context data. `ListView` will add in the suitable `page_obj` and paginator for us providing we remember to call `super()`.



```python
from django.views.generic import ListView
from django.views.generic.detail import SingleObjectMixin
from books.models import Publisher

class PublisherDetailView(SingleObjectMixin, ListView):
    paginate_by = 2
    template_name = "books/publisher_detail.html"

    def get(self, request, *args, **kwargs):
        self.object = self.get_object(queryset=Publisher.objects.all())
        return super().get(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['publisher'] = self.object
        return context

    def get_queryset(self):
        return self.object.book_set.all()
```
> Notice how we set `self.object` within `get()` so we can use it again later in `get_context_data()` and `get_queryset()`. If you don’t set `template_name`, the template will default to the normal `ListView` choice, which in this case would be "`books/book_list.html`" because it’s a list of books; `ListView` knows nothing about `SingleObjectMixin`, so it doesn’t have any clue this view is anything to do with a Publisher.

> The `paginate_by` is deliberately small in the example so you don’t have to create lots of books to see the pagination working!

```html
{% extends "base.html" %}

{% block content %}
    <h2>Publisher {{ publisher.name }}</h2>

    <ol>
      {% for book in page_obj %}
        <li>{{ book.title }}</li>
      {% endfor %}
    </ol>

    <div class="pagination">
        <span class="step-links">
            {% if page_obj.has_previous %}
                <a href="?page={{ page_obj.previous_page_number }}">previous</a>
            {% endif %}

            <span class="current">
                Page {{ page_obj.number }} of {{ paginator.num_pages }}.
            </span>

            {% if page_obj.has_next %}
                <a href="?page={{ page_obj.next_page_number }}">next</a>
            {% endif %}
        </span>
    </div>
{% endblock %}
```






