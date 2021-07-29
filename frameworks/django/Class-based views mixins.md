
# Simple mixins

- ## ContextMixin

    `class django.views.generic.base.ContextMixin`

    **Attributes**

    `extra_context`   : dictionary to include in the context. This is a convenient way of specifying some context in as_view()

    ```python
    from django.views.generic import TemplateView
    TemplateView.as_view(extra_context={'title': 'Custom Title'})
    ```

    **Methods**

    `get_context_data(**kwargs)`    : Returns a dictionary representing the template context

    ```python
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['number'] = random.randrange(1, 100)
        return context
    ```

- ## TemplateResponseMixin

    `class django.views.generic.base.TemplateResponseMixin`

    Provides a mechanism to construct a `TemplateResponse`, given suitable context. The template to use is configurable and can be further customized by subclasses.

  **Attributes**

  - `template_name`
    The full name of a template to use as defined by a string.
  - `template_engine`
    The NAME of a template engine to use for loading the template. like `jinja`
  - `response_class`
    The response class to be returned by `render_to_response` method.
  - `content_type`
    The content type to use for the response. `content_type` is passed as a keyword argument to `response_class`. Default is None – meaning that Django uses '`text/html`'.

  **Methods**
  
  - `render_to_response(context, **response_kwargs)`
    Returns a `self.response_class` instance.

  - `get_template_names()`
    Returns a list of template names to search for when rendering the template. The first template that is found will be used.

# Single object mixins

- ## SingleObjectMixin

    `class django.views.generic.detail.SingleObjectMixin`
    Provides a mechanism for looking up an object associated with the current HTTP request.

    **Methods and Attributes**

  - `model`
    The model that this view will display data for.
    the same as specifying `queryset = Foo.objects.all()`

  - `queryset`
    A QuerySet that represents the objects. If provided, the value of queryset supersedes the value provided for model.

  - `slug_field`
    The name of the field on the model that contains the slug. By default, `slug_field` is '**slug**'.

  - `slug_url_kwarg`
    The name of the URLConf keyword argument that contains the slug. By default, `slug_url_kwarg` is '**slug**'.

  - `pk_url_kwarg`
    The name of the URLConf keyword argument that contains the primary key. By default, `pk_url_kwarg` is '**pk**'.

  - `context_object_name`
    Designates the name of the variable to use in the context.

  - `query_pk_and_slug`
    if `True`, causes `get_object()` to perform its lookup using both the primary key and the slug. Defaults to `False`.

  - `get_object(queryset=None)`
    Returns the single object that this view will display. If `queryset` is provided, that queryset will be used as the source of objects otherwise, `get_queryset()`

  - `get_queryset()`
    Returns the queryset that will be used to retrieve the object that this view will display. By default, `get_queryset()` returns the value of the queryset attribute if it is set, otherwise it constructs a QuerySet by calling the `all()` method on the model

  - `get_context_object_name(obj)`
    Return the context variable name that will be used to contain the data that use in view . If `context_object_name` is not set, the context name will be constructed from the `model_name` of the model that the queryset is composed from. For example, the model **Article** would have context object named '**article**'.

  - `get_context_data(**kwargs)`
    Returns context data for displaying the object.

  - `get_slug_field()`
    Returns the name of a slug field to be used to look up by slug. By default this returns the value of `slug_field`.

- ## SingleObjectTemplateResponseMixin

    **Methods and Attributes**

  - template_name_field
    The field on the current object instance that can be used to determine the name of a candidate template.

  - template_name_suffix
    The suffix to append to the auto-generated candidate template name. Default suffix is `_detail`.

  - get_template_names()
    Returns a list of candidate template names.

    - the value of template_name on the view (if provided)
    - the contents of the `template_name_field` field on the object instance that the view is operating upon
    - `<app_label>/<model_name><template_name_suffix>.html`

# Multiple object mixins

- ## MultipleObjectMixin

    `class django.views.generic.list.MultipleObjectMixin`
    A mixin that can be used to display a list of objects
    If `paginate_by` is specified, Django will paginate the results returned by this. You can specify the page number in the URL in one of two ways:

  - Use the page parameter in the URLconf.
    `path('objects/page<int:page>/', PaginatedView.as_view()),`

  - Pass the page number via the page query-string parameter.
    `/objects/?page=3`

    **Methods and Attributes**

    - `allow_empty`
    A boolean specifying whether to display the page if no objects are available. If this is `False` and no objects are available, the view will raise a `404` instead of displaying an empty page. By default, this is `True`.
    - `model`       # model = Foo
    - `queryset`    # queryset = Foo.objects.all()
    - `ordering`    # A string | list of strings specifying ordering to queryset
    - `paginate_by` # integer specifying how many objects should be displayed per page
    - `page_kwarg`  # A string specifying the name to use for the page parameter
    - `paginate_orphans`    # An integer specifying the number of “overflow” objects the last page can contain.
    - `context_object_name` #  the name of the variable to use in the context
    - `get_queryset()`      # Get the list of items for this view
    - `get_ordering()`      # Returns a string (or iterable of strings)
    - `paginate_queryset(queryset, page_size)`
    Returns a 4-tuple containing (paginator, page, object_list, is_paginated).
    - `get_paginate_by(queryset)`   # Returns the number of items to paginate by, or None for no pagination.
    - `get_paginator(queryset, per_page, orphans=0, allow_empty_first_page=True)` Returns an instance of the paginator to use for this view.
    - `get_paginate_orphans()`  # An integer specifying the number of “overflow” objects the last page can contain.
    - `get_allow_empty()`       # Return a boolean specifying whether to display the page if no objects are available
    - `get_context_object_name(object_list)`    # Return the context variable name that will be used to contain the list of data 
    - `get_context_data(**kwargs)`  # Returns context data for displaying the list of objects.

    **Context**

    - `object_list`: The list of objects that this view is displaying.
    - `is_paginated`: A boolean representing whether the results are paginated.
    - `paginator`: If the page is not paginated, this context variable will be None.
    - `page_obj`: If the page is not paginated, this context variable will be None.

- ## MultipleObjectTemplateResponseMixin

    `class django.views.generic.list.MultipleObjectTemplateResponseMixin`

    **Methods and Attributes**

  - `template_name_suffix`
    The suffix to append to the auto-generated candidate template name. Default `_list`.

  - `get_template_names()`
    Returns a list of candidate template names. Returns the following list:

  - the value of `template_name` on the view (if provided)
  - `<app_label>/<model_name><template_name_suffix>.html`

# Editing mixins

- ## FormMixin

    `class django.views.generic.edit.FormMixin` A mixin class that provides facilities for creating and displaying forms.

    **Methods and Attributes**

  - `initial`       # dictionary containing initial data for the form.
  - `form_class`    # The form class to instantiate.
  - `success_url`   # URL to redirect to when the form is success
  - `prefix`
  - `get_initial()`
  - `get_form_class()`
  - `get_form(form_class=None)`
  - `get_form_kwargs()`
  - `get_prefix()`
  - `get_success_url()`
  - `form_valid(form)`      # Redirects to get_success_url().
  - `form_invalid(form)`    # Renders a response, provide invalid form as context.
  - `get_context_data(**kwargs)`    # Calls get_form() and adds the result to the context data with the name ‘form’.

- ## ModelFormMixin

    `class django.views.generic.edit.ModelFormMixin` A form mixin that works on `ModelForms`, rather than a standalone form.

    **Methods and Attributes**

  - `model`
  - `fields`    # A list of names of fields
  - `success_url`
  - `get_form_class()`
  - `get_form_kwargs()`
  - `get_success_url()`
  - `form_valid(form)`
  - `form_invalid(form)`

- ## ProcessFormView

    `class django.views.generic.edit.ProcessFormView` A mixin that provides basic HTTP GET and POST workflow

    **Methods and Attributes**

  - `get(request, *args, **kwargs)`
    Renders a response using a context created with `get_context_data()`.

  - `post(request, *args, **kwargs)`
    Constructs a form, checks the form for validity, and handles it accordingly.

  - `put(*args, **kwargs)`
    The PUT action is also handled and passes all parameters through to `post()`.

- ## DeletionMixin

    `class django.views.generic.edit.DeletionMixin` Enables handling of the DELETE http action.

    **Methods and Attributes**

  - `success_url`
  - `delete(request, *args, **kwargs)`
    Retrieves the target object and calls its `delete()` method, then redirects to the success URL.
  - `get_success_url()`

# Date-based mixins

- ## YearMixin

    A mixin that can be used to retrieve and provide parsing information for a year component of a date.

    **Methods and Attributes**

  - `year_format`
    The `strftime()` format to use when parsing the year. By default '%Y'.
  - `year`
  - `get_year_format()`
  - `get_year()`
  - `get_next_year(date)`
  - `get_previous_year(date)`

- ## MonthMixin

  - `month_format`
  - `month`
  - `get_month_format()`
  - `get_month()`
  - `get_next_month(date)`
  - `get_previous_month(date)`

- ## DayMixin

  - `day_format`
  - `day`
  - `get_day_format()`
  - `get_day()`
  - `get_next_day(date)`
  - `get_previous_day(date)`

- ## WeekMixin

  - `week_format`
  - `week`
  - `get_week_format()`
  - `get_week()`
  - `get_next_week(date)`
  - `get_previous_week(date)`

- ## DateMixin

  - `date_field`        # The name of the DateField or DateTimeField in the QuerySet’s model
  - `allow_future`
  - `get_date_field()`
  - `get_allow_future()`

- ## BaseDateListView

    base class that provides common behavior for all date-based views

    **Methods and Attributes**

  - `allow_empty`
  - `date_list_period`  string defining the aggregation period for `date_list`. It must be one of 'year' (default), 'month', or 'day'.
  - `get_dated_items()` Returns a 3-tuple containing (date_list, object_list, extra_context).
  - `get_dated_queryset(**lookup)`  # Returns a queryset, filtered using the query arguments defined by lookup.
  - `get_date_list_period()`    # Returns the aggregation period for date_list. Returns date_list_period by default.
  - `get_date_list(queryset, date_type=None, ordering='ASC')` Returns the list of dates of type date_type for which queryset contains entries. 
    > For example, `get_date_list(qs, 'year')` will return the list of years for which qs has entries. If `date_type` isn’t provided, the result of `get_date_list_period()` is used. date_type and ordering are passed to `QuerySet.dates()`.
