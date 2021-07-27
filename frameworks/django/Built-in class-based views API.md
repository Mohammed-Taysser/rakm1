

# Built-in class-based views API

Most generic views require the queryset key, which is a QuerySet instance

## Base views

- ### View
    `class django.views.generic.base.View`
    The master class-based base view. All other class-based views inherit from this base class.

        from django.views import View
        # or
        from django.views.generic.base import View
    ```python
    from django.http import HttpResponse
    from django.views import View

    class MyView(View):

        def get(self, request, *args, **kwargs):
            return HttpResponse('Hello, World!')
    ```

- ### TemplateView
    `class django.views.generic.base.TemplateView`
    Renders a given template, with the context containing parameters captured in the URL.
    ```python
    from django.views.generic.base import TemplateView
    from articles.models import Article

    class HomePageView(TemplateView):
        template_name = "home.html"

        def get_context_data(self, **kwargs):
            context = super().get_context_data(**kwargs)
            context['latest_articles'] = Article.objects.all()[:5]
            return context
    ```

- ### RedirectView
    `class django.views.generic.base.RedirectView`
    Redirects to a given URL
    **Attributes**
    - `url`               # The URL to redirect to, as a string
    - `pattern_name`      # The name of the URL pattern to redirect to.
    - `permanent` 
        Whether the redirect should be permanent. The only difference here is the HTTP status code returned. If True, then the redirect will use status code 301. If False, then the redirect will use status code 302. By default, `permanent` is False.
    - `query_string`
        Whether to pass along the GET query string to the new location. If True, then the query string is appended to the URL. If False, then the query string is discarded. By default, `query_string` is False.

    **Methods**
    `get_redirect_url(*args, **kwargs)`
    Constructs the target URL for redirection.

    ```python
    from django.shortcuts import get_object_or_404
    from django.views.generic.base import RedirectView
    from articles.models import Article

    class ArticleCounterRedirectView(RedirectView):

        permanent = False
        query_string = True
        pattern_name = 'article-detail'

        def get_redirect_url(self, *args, **kwargs):
            article = get_object_or_404(Article, pk=kwargs['pk'])
            article.update_counter()
            return super().get_redirect_url(*args, **kwargs)
    ```



## Generic display views

- ### DetailView
    `class django.views.generic.detail.DetailView`
    While this view is executing, `self.object` will contain the object that the view is operating upon.

    `view.py`
    ```python
    class PublisherDetailView(DetailView):
        # model = models.Publisher
        context_object_name = 'publisher'
        queryset = models.Publisher.objects.all()
        template_name = 'CBV_doc/publisher_list.html'
    ```

    `urls.py`
    ```python
    urlpatterns = [
        path('<slug:slug>/', ArticleDetailView.as_view(), name='article-detail'),
    ]
    ```

- ### ListView
    `class django.views.generic.list.ListView`
    A page representing a list of objects.
    While this view is executing, `self.object_list` will contain the list of objects (usually, but not necessarily a queryset)

    ```python
    class PublisherListView(ListView):
        # model = models.Publisher
        queryset = models.Publisher.objects.all()
        paginate_by = 100  # if pagination is desired
        
        def get_context_data(self, **kwargs):
            context = super().get_context_data(**kwargs)
            context['db_objects_book'] = models.Book.objects.all()
            return context
    ```

    `html page`
    ```html
    <ul>
    {% for article in object_list %}
        <li>{{ article.pub_date|date }} - {{ article.headline }}</li>
    {% empty %}
        <li>No articles yet.</li>
    {% endfor %}
    </ul>
    ```

## Generic editing views
```python
from django.db import models
from django.urls import reverse

class Author(models.Model):
    name = models.CharField(max_length=200)

    def get_absolute_url(self):
        return reverse('author-detail', kwargs={'pk': self.pk})
```
- ### FormView
    `class django.views.generic.edit.FormView`
    A view that displays a form. On error, redisplays the form with validation errors; on success, redirects to a new URL.

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

    `html page`

    ```html
    <form method="post">
        {% csrf_token %}
        {{ form.as_p }}
        <input type="submit" value="Send message">
    </form>
    ```

- ### CreateView
    `class django.views.generic.edit.CreateView`
    A view that displays a form for creating an object, re-displaying the form with validation errors (if there are any) and saving the object.

    `views.py`

    ```python
    from django.views.generic.edit import CreateView
    from myapp.models import Author

    class AuthorCreateView(CreateView):
        fields = ['name', 'email', 'salutation', 'headshot']
        model = models.Author
        template_name = 'CBV_doc/publisher_list.html'
        context_object_name = 'form'
    ```
    **Methods**

    - get(request, *args, **kwargs)
        Sets the current object instance (self.object) to None.

    - post(request, *args, **kwargs)
        Sets the current object instance (self.object) to None.

- ### UpdateView
    `class django.views.generic.edit.UpdateView`
    A view that displays a form for editing an **existing** object, re-displaying the form with validation errors (if there are any) and saving changes to the object. This uses a form automatically generated from the object’s model class

    **template_name_suffix**
    The `UpdateView` page displayed to a GET request uses a `template_name_suffix` of '`_form`'. For example, changing this attribute to '`_update_form`' for a view updating objects for the example Author model would cause the default `template_name` to be '`myapp/author_update_form.html`'.

    `views.py`
    ```python
    from django.views.generic.edit import UpdateView
    from myapp.models import Author

    class AuthorUpdateView(UpdateView):
        model = Author
        fields = ['name']
        template_name_suffix = '_update_form'
    ```
    **Methods**

    - get(request, *args, **kwargs)
        Sets the current object instance (self.object).

    - post(request, *args, **kwargs)
        Sets the current object instance (self.object).

- ### DeleteView
    `class django.views.generic.edit.DeleteView`

    A view that displays a confirmation page and deletes an **existing** object. The given object will only be deleted if the request method is **POST**. If this view is fetched via GET, it will display a confirmation page that should contain a form that POSTs to the same URL.

    ```python
    from django.urls import reverse_lazy
    from django.views.generic.edit import DeleteView
    from myapp.models import Author

    class AuthorDeleteView(DeleteView):
        model = Author
        success_url = reverse_lazy('author-list')
    ```

    author_confirm_delete.html:

    ```html
    <form method="post">
        {% csrf_token %}
        <p>Are you sure you want to delete "{{ object }}"?</p>
        <input type="submit" value="Confirm">
    </form>
    ```

## Generic date views

```python
from django.db import models
from django.urls import reverse

class Article(models.Model):
    title = models.CharField(max_length=200)
    pub_date = models.DateField()

    def get_absolute_url(self):
        return reverse('article-detail', kwargs={'pk': self.pk})
```


