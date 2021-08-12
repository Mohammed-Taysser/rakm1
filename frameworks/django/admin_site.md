
# The Django admin site

## ModelAdmin objects

The `ModelAdmin` is very flexible. It has several options for dealing with customizing the interface. All options are defined on the `ModelAdmin` subclass

```python
from django.contrib import admin
from myproject.myapp.models import Author

class AuthorAdmin(admin.ModelAdmin):
    pass
admin.site.register(Author, AuthorAdmin)
```

- `ModelAdmin.actions`  list of actions to make available on the change list page
- `ModelAdmin.actions_on_bottom`
- `ModelAdmin.actions_on_top`
    Controls whether a selection counter is displayed next to the action dropdown. By default, the admin changelist will display it (`actions_selection_counter = True`).
- `ModelAdmin.actions_selection_counter`
    Controls whether a selection counter is displayed next to the action dropdown. By default, the admin changelist will display it (`actions_selection_counter = True`).
- `ModelAdmin.date_hierarchy` date_hierarchy = 'pub_date'
- `ModelAdmin.empty_value_display` empty_value_display = '-empty-'
- `ModelAdmin.fields`

    ```python
    class FlatPageAdmin(admin.ModelAdmin):
    fields = ('url', 'title', 'content')
    ```

- `ModelAdmin.exclude`

    ```python
    from django.db import models

    class Author(models.Model):
        name = models.CharField(max_length=100)
        title = models.CharField(max_length=3)
        birth_date = models.DateField(blank=True, null=True)
    ```

    If you want a form for the Author model that includes only the name and title fields, you would specify fields or exclude like this:

    ```python
    from django.contrib import admin

    class AuthorAdmin(admin.ModelAdmin):
        fields = ('name', 'title')

    class AuthorAdmin(admin.ModelAdmin):
        exclude = ('birth_date',)
    ```

    To display multiple fields on the same line, wrap those fields in their own tuple. In this example, the url and title fields will display on the same line and the content field will be displayed below them on its own line:

    ```python
    class FlatPageAdmin(admin.ModelAdmin):
        fields = (('url', 'title'), 'content')
    ```

- `ModelAdmin.fieldsets`

    ```python
    from django.contrib import admin

    class FlatPageAdmin(admin.ModelAdmin):
        fieldsets = (
            ('main data', {
                'fields': ('title','publisher', 'authors'),
                'description': 'hello this is description',
            }),
            ('Advanced options', {
                'classes': ('collapse',),
                'fields' : ('publication_date', ),
            }),
        )
    ```

    field_options

  - fields

    ```python
    {
    'fields': ('first_name', 'last_name', 'address', 'city', 'state'),
    }

    # If you add the name of a callable to fields, the same rule applies as with the fields option: the callable must be listed in readonly_fields.

    {
    'fields': (('first_name', 'last_name'), 'address', 'city', 'state'),
    }
    ```

  - classes
    Two useful classes defined by the default admin site stylesheet are `collapse` and `wide`. `Fieldsets` with the collapse style will be initially collapsed in the admin and replaced with a small “click to expand” link. `Fieldsets` with the wide style will be given extra horizontal space.

    ```python
    {
    'classes': ('wide', 'extrapretty'),
    }
    ```

  - description
  A string of optional extra text to be displayed at the top of each fieldset, under the heading of the fieldset

- `ModelAdmin.filter_horizontal`
- `ModelAdmin.filter_vertical`
- `ModelAdmin.form`
- `ModelAdmin.list_display`
- `ModelAdmin.list_filter`

`register(*models, site=django.contrib.admin.sites.site)`

```python
from django.contrib import admin
from .models import Author

@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    pass
```
