

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

- ### ArchiveIndexView
    A top-level index page showing the “latest” objects, by date. Objects with a date in the future are not included unless you set `allow_future` to `True`.

    **Notes**
    - Uses a default `context_object_name` of **latest**.
    - Uses a default `template_name_suffix` of `_archive`.
    - Defaults to providing `date_list` by year, but this can be altered to month or day using the attribute `date_list_period`. This also applies to all subclass views.

    `urls.py`

    ```python
    from django.urls import path
    from django.views.generic.dates import ArchiveIndexView

    from myapp.models import Article

    urlpatterns = [
        path('archive/', ArchiveIndexView.as_view(model=Article,  date_field="pub_date"), name="article_archive"),
    ]
    ```

    `article_archive.html`

    ```html
    <ul>
        {% for article in latest %}
            <li>{{ article.pub_date }}: {{ article.title }}</li>
        {% endfor %}
    </ul>
    ```

- ### YearArchiveView
    A yearly archive page showing all available months in a given year. Objects with a date in the future are not displayed unless you set `allow_future` to `True`.

    **make_object_list**
    A boolean specifying whether to retrieve the full list of objects for this year and pass those to the template. If `True`, the list of objects will be made available to the context. If `False`, the None queryset will be used as the object list. By default `False`.

    **get_make_object_list()**
    Determine if an object list will be returned as part of the context. Returns `make_object_list` by default.

    **context**
    - `date_list`: A QuerySet object containing all months that have objects available according to queryset, represented as `datetime.datetime` objects, in **ascending** order.
    - `year`: A date object representing the given year.
    `next_year`: A date object representing the first day of the next year, according to `allow_empty` and `allow_future`.
    - `previous_year`: A date object representing the first day of the previous year, according to `allow_empty` and `allow_future`.

    **Notes**
    Uses a default `template_name_suffix` of `_archive_year`.

    `views.py`
    ```python
    class ArticleYearArchiveView(YearArchiveView):
        queryset = models.Book.objects.all()
        date_field = "publication_date"
        make_object_list = True
        allow_future = True
        template_name = 'CBV_doc/book_archive.html'
    ```


    `urls.py`

    ```python
    urlpatterns = [
        path('<int:year>/',
            ArticleYearArchiveView.as_view(),
            name="article_year_archive"),
    ]
    ```
    `html page`

    ```html
    <ul>
        {% for date in date_list %}
            <li>{{ date|date }}</li>
        {% endfor %}
    </ul>

    <div>
        <h3>All Articles for {{ year|date:"Y" }}</h3>
        {% for obj in object_list %}
            <p>
                {{ obj.title }} - {{ obj.publication_date|date:"F j, Y" }}
            </p>
        {% endfor %}
    </div>
    ```

- ### MonthArchiveView
    A monthly archive page showing all objects in a given month. Objects with a date in the future are not displayed unless you set `allow_future` to `True`.

    **Context**

    - `date_list`: A QuerySet object containing all days that have objects available in the given month, according to queryset, represented as `datetime.datetime` objects, in ascending order.
    - `month`: A date object representing the given month.
    - `next_month`: A date object representing the first day of the next month, according to `allow_empty` and `allow_future`.
    - `previous_month`: A date object representing the first day of the previous month, according to `allow_empty` and `allow_future`.
  
    **Notes**
    Uses a default `template_name_suffix` of `_archive_month`.

    `views.py`
    ```python
    class ArticleMonthArchiveView(MonthArchiveView):
        queryset = models.Book.objects.all()
        date_field = "publication_date"
        allow_future = True
        template_name = 'CBV_doc/book_archive.html'
    ```
    `urls.py`
    ```python
        # Example: /2012/08/
        path('book-archive/<int:year>/<int:month>/', views.ArticleMonthArchiveView.as_view(month_format='%m'), name="archive_month_numeric"),
        # Example: /2012/aug/
        path('book-archive/<int:year>/<str:month>/', views.ArticleMonthArchiveView.as_view(), name="archive_month"),
    ```

    `html`
    ```html
    <ul>
        {% for article in object_list %}
            <li>{{ article.publication_date|date:"F j, Y" }}: {{ article.title }}</li>
        {% endfor %}
    </ul>

    <p>
        {% if previous_month %}
            Previous Month: {{ previous_month|date:"F Y" }}
        {% endif %}
        {% if next_month %}
            Next Month: {{ next_month|date:"F Y" }}
        {% endif %}
    </p>
    ```

- ### WeekArchiveView

    A weekly archive page showing all objects in a given week. Objects with a date in the future are not displayed unless you set `allow_future` to `True`.

    **Context**

    - `week`: A date object representing the first day of the given week.
    - `next_week`: A date object representing the first day of the next week, according to `allow_empty` and `allow_future`.
    - `previous_week`: A date object representing the first day of the previous week, according to `allow_empty` and `allow_future`.

    **Notes**
    - Uses a default template_name_suffix of _archive_week.
    - The week_format attribute is a strptime() format string used to parse the week number. The following values are supported:
      - '%U': Based on the United States week system where the week begins on Sunday. This is the default value.
      - '%W': Similar to '%U', except it assumes that the week begins on Monday. This is not the same as the ISO 8601 week number.
      - '%V': ISO 8601 week number where the week begins on Monday.

    `views.py`
    ```python
    class ArticleWeekArchiveView(WeekArchiveView):
        queryset = models.Book.objects.all()
        date_field = "publication_date"
        week_format = "%W"
        allow_future = True
        template_name = 'CBV_doc/book_archive.html'
    ```

    `urls.py`
    ```python
    # Example: /2012/week/23/
    path('book-archive/<int:year>/week/<int:week>/',  views.ArticleWeekArchiveView.as_view(),  name="archive_week"),
    ```

    `html`
    ```html
    <h1>Week {{ week|date:'W' }}</h1>

    <ul>
        {% for article in object_list %}
            <li>{{ article.publication_date|date:"F j, Y" }}: {{ article.title }}</li>
        {% endfor %}
    </ul>

    <p>
        {% if previous_week %}
            Previous Week: {{ previous_week|date:"W" }} of year {{ previous_week|date:"Y" }}
        {% endif %}
        {% if previous_week and next_week %}--{% endif %}
        {% if next_week %}
            Next week: {{ next_week|date:"W" }} of year {{ next_week|date:"Y" }}
        {% endif %}
    </p>
    ```


- ### DayArchiveView
    A day archive page showing all objects in a given day. Days in the future *throw a 404 error*, regardless of whether any objects exist for future days, unless you set `allow_future` to `True`.

    **Context**
    - `day`: A date object representing the given day.
    - `next_day`: A date object representing the next day, according to `allow_empty` and `allow_future`.
    - `previous_day`: A date object representing the previous day, according to `allow_empty` and `allow_future`.
    - `next_month`: A date object representing the first day of the next month, according to `allow_empty` and `allow_future`.
    - `previous_month`: A date object representing the first day of the previous month, according to `allow_empty` and `allow_future`.
    - 
    **Notes**
    Uses a default `template_name_suffix` of `_archive_day`.

    `views.py`
    ```python
    class ArticleDayArchiveView(DayArchiveView):
        queryset = models.Book.objects.all()
        date_field = "publication_date"
        allow_future = True
        template_name = 'CBV_doc/book_archive.html'
    ```

    `urls.py`
    ```python
    # Example: /2012/nov/10/
    path('book-archive/<int:year>/<str:month>/<int:day>/', views.ArticleDayArchiveView.as_view(), name="archive_day"),
    ```

    `html`
    ```html
    <h1>{{ day }}</h1>

    <ul>
        {% for article in object_list %}
            <li>{{ article.publication_date|date:"F j, Y" }}: {{ article.title }}</li>
        {% endfor %}
    </ul>

    <p>
        {% if previous_day %}
            Previous Day: {{ previous_day }}
        {% endif %}
        {% if previous_day and next_day %}--{% endif %}
        {% if next_day %}
            Next Day: {{ next_day }}
        {% endif %}
    </p>
    ```


- ### TodayArchiveView

    A day archive page showing all objects for today. This is exactly the same as django.views.generic.dates.DayArchiveView, except today’s date is used instead of the year/month/day arguments.

    **Notes**
    Uses a default `template_name_suffix` of `_archive_today`.

    `views.py`
    ```python
    class ArticleTodayArchiveView(TodayArchiveView):
        queryset = models.Book.objects.all()
        date_field = "pub_date"
        allow_future = True
        template_name = 'CBV_doc/book_archive.html'
    ```

    `urls.py`
    ```python
    path('book-archive/today',
         views.ArticleTodayArchiveView.as_view(),
         name="archive_today"),
    ```

    `html`
    This view uses by default the same template as the `DayArchiveView`, which is in the previous example. If you need a different template, set the `template_name` attribute to be the name of the new template.


- ### DateDetailView

    A page representing an individual object. If the object has a date value in the future, the view will throw a 404 error by default, unless you set allow_future to True.

    **Context**
    Includes the single object associated with the model specified in the DateDetailView.

    **Notes**
    Uses a default template_name_suffix of _detail.

    `urls.py`
    ```python
    urlpatterns = [
        path('<int:year>/<str:month>/<int:day>/<int:pk>/',
            DateDetailView.as_view(model=Article, date_field="pub_date"),
            name="archive_date_detail"),
    ]
    ```
    `html`
    ```html
    <h1>{{ object.title }}</h1>
    ```