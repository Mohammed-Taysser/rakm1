# Working with forms

`forms.py classes`

- `label='Your name'`
- `max_length=100`  validate the length of the data on browser and backend
- `help_text='helping text'`
- `is_valid()`  return true | false and place the form’s data in its cleaned_data attribute.
- `widget=forms.Textarea`
- `required=False`
- `attrs={'id': 'myFIELD'})`

`views.py`

```python
from django.http import HttpResponseRedirect
from django.shortcuts import render

from .forms import NameForm

def get_name(request):
    # if this is a POST request we need to process the form data
    if request.method == 'POST':
        # create a form instance and populate it with data from the request:
        form = NameForm(request.POST)
        # check whether it's valid:
        if form.is_valid():
            # process the data in form.cleaned_data as required
            subject = form.cleaned_data['subject']
            message = form.cleaned_data['message']
            sender = form.cleaned_data['sender']
            cc_myself = form.cleaned_data['cc_myself']

            recipients = ['info@example.com']
            if cc_myself:
                recipients.append(sender)

            send_mail(subject, message, sender, recipients)
            return HttpResponseRedirect('/thanks/')

    # if a GET (or any other method) we'll create a blank form
    else:
        form = NameForm()

    return render(request, 'name.html', {'form': form})
```

`html page`

```html
<form action="/your-name/" method="post">
    {% csrf_token %}
    {{ form }}
    <input type="submit" value="Submit">
</form>
```

## Form rendering options

**Note** that you’ll have to provide the surrounding `<table>` or `<ul>` elements yourself.

- `{{ form.as_table }}` will render them as table cells wrapped in `<tr>` tags
- `{{ form.as_p }}` will render them wrapped in `<p>` tags
- `{{ form.as_ul }}` will render them wrapped in `<li>` tags

## Reusable form templates

If your site uses the same rendering logic for forms in multiple places, you can reduce duplication by saving the form’s loop in a standalone template and using the include tag to reuse it in other templates:

```html
# In your form template:
{% include "form_snippet.html" %}
{% include "form_snippet.html" with form=comment_form %}

# In form_snippet.html:
{% for field in form %}
    <div class="fieldWrapper">
        {{ field.errors }}
        {{ field.label_tag }} {{ field }}
    </div>
{% endfor %}
```

# The Forms API

 Form.is_bound

- Form.clean()

- Form.is_valid()

- Form.errors

    `{'sender': ['Enter a valid email address.'], 'subject': ['This field is required.']}`

    keys are the field names and the values are lists of strings representing the error messages. The error messages are stored in lists because a field can have multiple error messages

- Form.errors.as_data()

    Returns a dict that maps fields to their original `ValidationError` instances

    `{'sender': [ValidationError(['Enter a valid email address.'])],
'subject': [ValidationError(['This field is required.'])]}`

- Form.errors.as_json(escape_html=True)

    `{"sender": [{"message": "Enter a valid email address.", "code": "invalid"}],
"subject": [{"message": "This field is required.", "code": "required"}]}`

- Form.errors.get_json_data(escape_html=False)

    Returns the errors as a dictionary suitable for serializing to `JSON`. `Form.errors.as_json()` returns serialized `JSON`, while this returns the error data before it’s serialized.

- Form.add_error(field, error)

    field argument is the name of the field, The error argument can be a string, or preferably an instance of `ValidationError`. **Note** that `Form.add_error()` automatically removes the relevant field from `cleaned_data`.

- Form.has_error(field, code=None)

    This method returns a boolean designating whether a field has an error with a specific error code. If code is None, it will return True if the field contains any errors at all.

- Form.non_field_errors()

    This method returns the list of errors from Form.errors that aren’t associated with a particular field. This includes `ValidationErrors` that are raised in `Form.clean()` and errors added using `Form.add_error(None, "...")`

- Form.initial

    `f = ContactForm(initial={'subject': 'Hi there!'})` should be a dictionary mapping field names to initial values.

- Form.get_initial_for_field(field, field_name)

- Form.has_changed()

    check if the form data has been changed from the initial data. `has_changed()` will be True if the data from request.`POST` differs from what was provided in initial or False otherwise. The result is computed by calling `Field.has_changed()` for each field in the form

- Form.changed_data

    returns a list of the names of the fields whose values are changed

- Form.fields   `f.fields['name']`

    ```python
    >>> f.fields['name']
    <django.forms.fields.CharField object at 0x7ffaac6324d0>
    >>> f.as_table().split('\n')[0]
    '<tr><th>Name:</th><td><input name="name" type="text" value="instance" required></td></tr>'
    >>> f.fields['name'].label = "Username"
    >>> f.as_table().split('\n')[0]
    '<tr><th>Username:</th><td><input name="name" type="text" value="instance" required></td></tr>'
    ```

- Form.cleaned_data

    ```python
    >>> data = {'subject': 'hello',
            'message': 'Hi there',
            'sender': 'foo@example.com',
            'cc_myself': True}
    >>> f = ContactForm(data)
    >>> f.is_valid()
    True
    >>> f.cleaned_data
    {'cc_myself': True, 'message': 'Hi there', 'sender': 'foo@example.com', 'subject': 'hello'}

    # If your data does not validate, the cleaned_data dictionary contains only the valid fields
    >>> data = {'subject': '',
            'message': 'Hi there',
            'sender': 'invalid email address',
            'cc_myself': True}
    >>> f = ContactForm(data)
    >>> f.is_valid()
    False
    >>> f.cleaned_data
    {'cc_myself': True, 'message': 'Hi there'}

    #  if you pass extra data when you define the Form. In this example, we pass a bunch of extra fields to the ContactForm constructor, but cleaned_data contains only the form’s fields
    >>> data = {'subject': 'hello',
            'message': 'Hi there',
            'sender': 'foo@example.com',
            'cc_myself': True,
            'extra_field_1': 'foo',
            'extra_field_2': 'bar',
            'extra_field_3': 'baz'}
    >>> f = ContactForm(data)
    >>> f.is_valid()
    True
    >>> f.cleaned_data # Doesn't contain extra_field_1, etc.
    {'cc_myself': True, 'message': 'Hi there', 'sender': 'foo@example.com', 'subject': 'hello'}

    # When the Form is valid, cleaned_data will include a key and value for all its fields, even if the data didn’t include a value for some optional fields. In this example, the data dictionary doesn’t include a value for the nick_name field, but cleaned_data includes it, with an empty value:

    >>> from django import forms
    >>> class OptionalPersonForm(forms.Form):
        first_name = forms.CharField()
        last_name = forms.CharField()
        nick_name = forms.CharField(required=False)
    >>> data = {'first_name': 'John', 'last_name': 'Lennon'}
    >>> f = OptionalPersonForm(data)
    >>> f.is_valid()
    True
    >>> f.cleaned_data
    {'nick_name': '', 'first_name': 'John', 'last_name': 'Lennon'}
    ```

- required_css_class = 'required'

    add class attributes to required rows

- error_css_class = 'error'

    add class attributes to required rows

- f = ContactForm(auto_id=False)

    by default `id_%s` mean add id and label for the input

- f = ContactForm(auto_id='id_for_%s')

    generate **id_for_subject**

- f = ContactForm(auto_id='id_for_%s', label_suffix='')

    `username:` will be `username`

- field_order=['email', 'message', 'name'])

- for boundfield in form: print(boundfield)

    To retrieve all BoundField objects, iterate the form

## Customizing the error list format

```python
>>> from django.forms.utils import ErrorList
>>> class DivErrorList(ErrorList):
         def __str__(self):
             return self.as_divs()
         def as_divs(self):
             if not self: return ''
             return '<div class="errorlist">%s</div>' % ''.join(['<div class="error">%s</div>' % e for e in self])
>>> f = ContactForm(data, auto_id=False, error_class=DivErrorList)
>>> f.as_p()
<div class="errorlist"><div class="error">This field is required.</div></div>
<p>Subject: <input type="text" name="subject" maxlength="100" required></p>
<p>Message: <input type="text" name="message" value="Hi there" required></p>
<div class="errorlist"><div class="error">Enter a valid email address.</div></div>
<p>Sender: <input type="email" name="sender" value="invalid email address" required></p>
<p>Cc myself: <input checked type="checkbox" name="cc_myself"></p>
```

## Attributes of BoundField

- BoundField.auto_id
- BoundField.data

    ```python
    >>> unbound_form = ContactForm()
    >>> print(unbound_form['subject'].data)
    None
    >>> bound_form = ContactForm(data={'subject': 'My Subject'})
    >>> print(bound_form['subject'].data)
    My Subject
        ```

- BoundField.errors

    ```python
    >>> data = {'subject': 'hi', 'message': '', 'sender': '', 'cc_myself': ''}
    >>> f = ContactForm(data, auto_id=False)
    >>> print(f['message'])
    <input type="text" name="message" required>
    >>> f['message'].errors
    ['This field is required.']
    >>> print(f['message'].errors)
    <ul class="errorlist"><li>This field is required.</li></ul>
    >>> f['subject'].errors
    []
    >>> print(f['subject'].errors)

    >>> str(f['subject'].errors)
    ''
    ```

- BoundField.field
- BoundField.form
- BoundField.html_name
- BoundField.id_for_label

    `<label for="{{ form.my_field.id_for_label }}">...</label>{{ my_field }}`

- BoundField.help_text
- BoundField.label
- BoundField.is_hidden
- BoundField.name
- BoundField.widget_type

    {% for field in form %}
        {% if field.widget_type == 'checkbox' %}
            # render one way
        {% else %}
            # render another way
        {% endif %}
    {% endfor %}

## Methods of BoundField

- BoundField.as_hidden(attrs=None, **kwargs)
- BoundField.as_widget(widget=None, attrs=None, only_initial=False)
- BoundField.css_classes(extra_classes=None)
- BoundField.label_tag(contents=None, attrs=None, label_suffix=None)
- BoundField.value()
- Form.is_multipart()

    ```html
    {% if form.is_multipart %}
        <form enctype="multipart/form-data" method="post" action="/foo/">
    {% else %}
        <form method="post" action="/foo/">
    {% endif %}
    {{ form }}
    </form>
    ```

- Form.prefix

    ```html
    >>> mother = PersonForm(prefix="mother")
    >>> father = PersonForm(prefix="father")
    >>> print(mother.as_ul())
    <li><label for="id_mother-first_name">First name:</label> <input type="text" name="mother-first_name" id="id_mother-first_name" required></li>
    <li><label for="id_mother-last_name">Last name:</label> <input type="text" name="mother-last_name" id="id_mother-last_name" required></li>
    >>> print(father.as_ul())
    <li><label for="id_father-first_name">First name:</label> <input type="text" name="father-first_name" id="id_father-first_name" required></li>
    <li><label for="id_father-last_name">Last name:</label> <input type="text" name="father-last_name" id="id_father-last_name" required></li>
    ```

    The prefix can also be specified on the form class:

    ```python
    class PersonForm(forms.Form):
        prefix = 'person'
    ```

# Form fields

## Rendering fields manually

```html
{{ form.non_field_errors }}
<div class="fieldWrapper">
    {{ form.subject.errors }}
    <label for="{{ form.subject.id_for_label }}">Email subject:</label>
    {{ form.subject }}
</div>
<div class="fieldWrapper">
    {{ form.message.errors }}
    <label for="{{ form.message.id_for_label }}">Your message:</label>
    {{ form.message }}
</div>
<div class="fieldWrapper">
    {{ form.sender.errors }}
    <label for="{{ form.sender.id_for_label }}">Your email address:</label>
    {{ form.sender }}
</div>
<div class="fieldWrapper">
    {{ form.cc_myself.errors }}
    <label for="{{ form.cc_myself.id_for_label }}">CC yourself?</label>
    {{ form.cc_myself }}
</div>
```

## Rendering form error messages

```html
{% if form.subject.errors %}
    <ol>
    {% for error in form.subject.errors %}
        <li><strong>{{ error|escape }}</strong></li>
    {% endfor %}
    </ol>
{% endif %}
```

## Looping over the form’s fields

```html
{% for field in form %}
    <div class="fieldWrapper">
        {{ field.errors }}
        {{ field.label_tag }} {{ field }}
        {% if field.help_text %}
        <p class="help">{{ field.help_text|safe }}</p>
        {% endif %}
    </div>
{% endfor %}
```

## Core field arguments

- required=False
- label='Your name'
- auto_id=False
- label_suffix='?'
- initial='http://'
- disabled=True
- error_messages={'required': 'Please enter your name'}
- help_text='100 characters max.'
- Field.widget
- Field.validators
- Field.localize

## Built-in Field classes

- BooleanField

  - Default widget: CheckboxInput
  - Empty value: False
  - Normalizes to: A Python True or False value.
  - Validates that the value is True (e.g. the check box is checked) if the  field has `required=True`
  - Error message keys: `required`

- SlugField
- CharField
  - Default widget: TextInput
  - Empty value: Whatever you’ve given as empty_value.
  - Normalizes to: A string.
  - Uses MaxLengthValidator and MinLengthValidator if max_length and min_length are provided. Otherwise, all inputs are valid.
  - Error message keys: required, max_length, min_length

    Has **four** optional arguments for validation:

  - `max_length`
  - `min_length`
  - `strip` If True (default), trailing whitespace.
  - `empty_value` The value to use to represent “empty”. Defaults to an empty string

- ChoiceField
  - Default widget: Select
  - Empty value: '' (an empty string)
  - Normalizes to: A string.
  - Validates that the given value exists in the list of choices.
  - Error message keys: required, invalid_choice

    Takes one extra argument:
    `choices` [('db', 'user')]

- MultipleChoiceField
- DateField
  - Default widget: DateInput
  - Empty value: None
  - Normalizes to: A Python datetime.date object.
  - Validates that the given value is either a datetime.date, datetime.datetime or string formatted in a particular date format.
  - Error message keys: required, invalid

    Takes one optional argument:
    `input_formats` A list of formats used to attempt to convert a string to a valid datetime.date object.

    ```html
    [
    '%Y-%m-%d %H:%M:%S',     # '2006-10-25 14:30:59'
    '%Y-%m-%d %H:%M:%S.%f',  # '2006-10-25 14:30:59.000200'
    '%Y-%m-%d %H:%M',        # '2006-10-25 14:30'
    '%m/%d/%Y %H:%M:%S',     # '10/25/2006 14:30:59'
    '%m/%d/%Y %H:%M:%S.%f',  # '10/25/2006 14:30:59.000200'
    '%m/%d/%Y %H:%M',        # '10/25/2006 14:30'
    '%m/%d/%y %H:%M:%S',     # '10/25/06 14:30:59'
    '%m/%d/%y %H:%M:%S.%f',  # '10/25/06 14:30:59.000200'
    '%m/%d/%y %H:%M',        # '10/25/06 14:30'
    ]
    ```

- DateTimeField
    Default widget: DateTimeInput
    and the other as `DateField`

- TimeField
- IntegerField
- DecimalField
  - Default widget: NumberInput when Field.localize is False, else TextInput.
  - Empty value: None
  - Normalizes to: A Python decimal.
  - Validates that the given value is a decimal. Uses MaxValueValidator and   MinValueValidator if max_value and min_value are provided. Leading and trailing whitespace is ignored.
  - Error message keys: required, invalid, max_value, min_value, max_digits,  max_decimal_places, max_whole_digits

    Takes **four** optional arguments:

  - max_value
  - min_value
  - max_digits
  - decimal_places

- FloatField
- DurationField
- TypedChoiceField
- FileField
- ImageField
- JSONField
- GenericIPAddressField
- FilePathField
- TypedMultipleChoiceField
- NullBooleanField
- URLField
- UUIDField
- RegexField

## Slightly complex built-in Field classes

- ComboField
- MultiValueField
- SplitDateTimeField

## Fields which handle relationships

- ModelChoiceField  with queryset
- ModelMultipleChoiceField
- ModelChoiceIterator
- ModelChoiceIteratorValue


## Setting arguments for widgets

```python
from django import forms

BIRTH_YEAR_CHOICES = ['1980', '1981', '1982']
FAVORITE_COLORS_CHOICES = [
    ('blue', 'Blue'),
    ('green', 'Green'),
    ('black', 'Black'),
]

class SimpleForm(forms.Form):
    birth_year = forms.DateField(widget=forms.SelectDateWidget(years=BIRTH_YEAR_CHOICES))
    favorite_colors = forms.MultipleChoiceField(
        required=False,
        widget=forms.CheckboxSelectMultiple,
        choices=FAVORITE_COLORS_CHOICES,
    )

```

## Styling widget instances

```python
class CommentForm(forms.Form):
    name = forms.CharField(widget=forms.TextInput(attrs={'class': 'special'}))
    url = forms.URLField()
    comment = forms.CharField(widget=forms.TextInput(attrs={'size': '40'}))
```

## Built-in widgets

- TextInput,    input_type: 'text'
- NumberInput,  input_type: 'number'
- EmailInput,   input_type: 'email'
- URLInput,     input_type: 'url'
- PasswordInput,    input_type: 'password'
- HiddenInput,      input_type: 'hidden'
- DateInput,        input_type: 'text'
- DateTimeInput,    input_type: 'text'
- TimeInput,        input_type: 'text'
- Textarea
- CheckboxInput     input_type: 'checkbox'
- Select    need choices, `<select>...</select>`
- NullBooleanSelect  options ‘Unknown’, ‘Yes’ and ‘No’
- SelectMultiple    `<select multiple>...</select>`
- RadioSelect

    ```html
    <fieldset>
        <legend>{{ myform.beatles.label }}</legend>
        {% for radio in myform.beatles %}
        <div class="myradio">
            {{ radio }}
        </div>
        {% endfor %}
    </fieldset>

    # or even
    <fieldset>
        <legend>{{ myform.beatles.label }}</legend>
        {% for radio in myform.beatles %}
        <label for="{{ radio.id_for_label }}">
            {{ radio.choice_label }}
            <span class="radio">{{ radio.tag }}</span>
        </label>
        {% endfor %}
    </fieldset>
    ```

- CheckboxSelectMultiple    Similar to SelectMultiple, but list of checkboxes
- FileInput type="file"
- ClearableFileInput    type="file" with an additional checkbox input to clear the field’s value, if the field is not required and has initial data.
- MultipleHiddenInput   type="hidden"
- SplitDateTimeWidget
- SplitHiddenDateTimeWidget
- SelectDateWidget

# Creating forms from models

```python
>>> from django.forms import ModelForm
>>> from myapp.models import Article

# Create the form class.
>>> class ArticleForm(ModelForm):
...     class Meta:
...         model = Article
...         fields = ['pub_date', 'headline', 'content', 'reporter']

# Creating a form to add an article.
>>> form = ArticleForm()

# Creating a form to change an existing article.
>>> article = Article.objects.get(pk=1)
>>> form = ArticleForm(instance=article)
```

## meta class

- `model = Author`
- `fields = '__all__'`
- `exclude = ['title']`
- `widgets = {'name': Textarea(attrs={'cols': 80, 'rows': 20}),}`
- `labels = {'name': _('Writer'),}`
- `help_texts = {'name': _('Some useful help text.'),}`
- `error_messages = {'name': {'max_length': _("This writer's name is too long."),},}`
- `field_classes = {'slug': MySlugFormField,}`
- `localized_fields = ('birth_date',)`

## Form inheritance

```python
class RestrictedArticleForm(EnhancedArticleForm):
    class Meta(ArticleForm.Meta):
        exclude = ('body',)
```

## Providing initial values

```python
>>> article = Article.objects.get(pk=1)
>>> article.headline
'My headline'
>>> form = ArticleForm(initial={'headline': 'Initial headline'}, instance=article)
>>> form['headline'].value()
'Initial headline'
```
