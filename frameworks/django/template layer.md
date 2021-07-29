
# The Django template language

## Variables

    My first name is {{ first_name }}. My last name is {{ last_name }}

    {{ my_dict.key }}
    {{ my_object.attribute }}
    {{ my_list.0 }}

## filter

- {{ value|default:"nothing" }}
- {{ value|length }}    works for both strings and lists.
- {{ value|length_is:"4" }} true or false
- {{ value|add:"2" }}
- {{ first|add:second }}
- {{ value|filesizeformat }}
- {{ value|capfirst }}
- {{ value|title }}
- {{ value|lower }}
- {{ value|upper }}
- {{ value|center:"15" }}
- {{ title|escape }}
- {{ value|first }} Returns the first item in a list.
- {{ value|last }}
- {{ value|join:"-" }}
- {{ value|ljust:"10" }}
- {{ value|rjust:"10" }}
- {{ value|make_list }}     'abc' => ['a', 'b', 'c']
- {{ my_date|date:"Y-m-d" }}

    Format character| Description | Example output
    ----------- | ----------- | -----------
    **Day**|
    d | Day of the month, 2 digits with leading zeros. | '01' to '31'
    j | Day of the month without leading zeros. | '1' to '31'
    D | Day of the week, textual, 3 letters. | 'Fri'
    l | Day of the week, textual, long. | 'Friday'
    S | English ordinal suffix for day of the month, 2 characters. | 'st', 'nd', 'rd' or 'th'
    w | Day of the week, digits without leading zeros. | '0' (Sunday) to '6' (Saturday)
    z | Day of the year. | 1 to 366
    **Week**|
    W | ISO-8601 week number of year, with weeks starting on Monday. | 1, 53
    **Month**|
    m | Month, 2 digits with leading zeros. | '01' to '12'
    n | Month without leading zeros. | '1' to '12'
    M | Month, textual, 3 letters. | 'Jan'
    b | Month, textual, 3 letters, lowercase. | 'jan'
    F | Month, textual, long. | 'January'
    t | Number of days in the given month. | 28 to 31
    **Year**|
    y | Year, 2 digits with leading zeros. | '00' to '99'
    Y | Year, 4 digits. | '1999'
    L | Boolean for whether it’s a leap year. | True or False
    **Time**|
    g | Hour, 12-hour format without leading zeros. | '1' to '12'
    G | Hour, 24-hour format without leading zeros. | '0' to '23'
    h | Hour, 12-hour format. | '01' to '12'
    H | Hour, 24-hour format. | '00' to '23'
    i | Minutes. | '00' to '59'
    s | Seconds, 2 digits with leading zeros. | '00' to '59'
    u | Microseconds. | 000000 to 999999
    a | 'a.m.' or 'p.m.' | 'a.m.'
    A | 'AM' or 'PM'. | 'AM'
    f | Time, in 12-hour hours and minutes, with minutes left off . | '1', '1:30'
    P | Time, in 12-hour hours, minutes and ‘a.m.’/’p.m.’, with minutes left | '1 a.m.', '1:30 p.m.'
    **Timezone** |
    e | Timezone name. Could be in any format | 'GMT','US/Eastern'
    I | Daylight Savings Time, whether it’s in effect or not. | '1' or '0'
    O | Difference to Greenwich time in hours. | '+0200'
    T | Time zone of this machine. | 'EST', 'MDT'
- You have {{ num_messages }} message{{ num_messages|pluralize }}
- You have {{ num_walruses }} walrus{{ num_walruses|pluralize:"es" }}.
- {{ list|random }} Returns a random item from the given list
- {{ some_list|slice:":2" }}    Uses the same syntax as Python’s list slicing
- {{ value|slugify }}
- {{ value|time:"H:i" }}    datetime.datetime.now()
- {{ value|time:"TIME_FORMAT" }}
- {{ blog_date|timesince:comment_date }}
- {{ conference_date|timeuntil:from_date }}
- {{ value|truncatechars:7 }}
- {{ value|truncatechars_html:7 }}  Similar to truncatechars, except that it is aware of HTML tags
- {{ value|truncatewords:2 }}
- {{ value|truncatewords_html:2 }}
- {{ value|wordcount }}
- {{ value|yesno:"yeah,no,maybe" }}

    Value | Argument | Outputs
    ----- | ----- | -----
    True |   | yes
    True | "yeah,no,maybe" | yeah
    False | "yeah,no,maybe" | no
    None | "yeah,no,maybe" | maybe
    None | "yeah,no" | no (converts None to False if no mapping for None is given)

## tags

- {% autoescape on %}{{ variable }}{% endautoescape %}
- {% block content %}{% endblock content %}
- {% comment %}{% endcomment %}
- {# this won't be rendered #}
- {% csrf_token %}
- {% cycle 'odd' 'even' variable_name %}
    ```html
    <td class="{% cycle 'row1' 'row2' as rowcolors %}">...</td>
    <td class="">{{rowcolors}}</td>
    ```
- {% resetcycle %}
- {% cycle 'odd' 'even' as stripe %} {% resetcycle stripe %}
- {% extends "base.html" %}
- {% load static %}
- {% include "foo/bar.html" %}
- {% include "name_snippet.html" with person="Jane" greeting="Hello" %}
- {% for athlete in athlete_list %}normal loop{% endfor %}
- {% for athlete in athlete_list reversed %}reversed loop{% endfor %}
- {% for x, y in points %} {{ x }},{{ y }} {% endfor %}
- {% for key, value in data.items %}{{ key }}: {{ value }}{% endfor %}
- {% for athlete in athlete_list %} {{athlete}} {% empty %}not here{% endfor %}

    Variable|   Description
    ----------- | --------------
    forloop.counter |The current iteration of the loop (1-indexed)
    forloop.counter0   |The current iteration of the loop (0-indexed)
    forloop.revcounter |The number of iterations from the end of the loop (1-indexed)
    forloop.revcounter0|The number of iterations from the end of the loop (0-indexed)
    forloop.first   |True if this is the first time through the loop
    forloop.last    |True if this is the last time through the loop
- {% if athlete_list %}{% elif 12 %}{% else %}{% endif %}
  - {% if athlete_list and coach_list %}
  - {% if not athlete_list %}
  - {% if athlete_list or coach_list %}
  - {% if somevar is not None %}
- {% lorem [count] [method] [random] %}
    Argument|   Description
    ----------- | --------------
    count| A number or variable the number of paragraphs or words to generate. default 1
    method| Either w for words, p for HTML paragraphs or b for plain-text paragraph blocks. default b
    random| The word random, which if given, does not use the common paragraph (“Lorem ipsum dolor sit amet…”)
- {% now "jS F Y H:i" %}
- {% now "Y" as current_year %} to store the output
- {% url 'some-url-name' id %}
- {% url 'some-url-name' arg1=v1 arg2=v2 %}
- {% url 'some-url-name' arg as the_url %} retrieve a URL without displaying it
- {% widthratio value max_value max_width %} = (value/max_value) * max_width
- {% widthratio value max_value max_width as width %}
- {% with alpha=1 beta=2 %} {% endwith %}

## Other tags and filters libraries

- {% load static %}
- {% static "images/hi.jpg" as myphoto %}
- get_static_prefix `<img src="{% get_static_prefix %}images/hi.jpg" alt="Hi!">`
- {% get_static_prefix as STATIC_PREFIX %} `<img src="{{ STATIC_PREFIX }}images/hi.jpg" alt="Hi!">`
- get_media_prefix `<body data-media-url="{% get_media_prefix %}">`

## django.contrib.humanize

A set of Django template filters useful for adding a “human touch” to data

To activate these filters, add '`django.contrib.humanize`' to your `INSTALLED_APPS` setting. Once you’ve done that, use `{% load humanize %}` in a template

- ### apnumber

    For numbers 1-9, returns the number spelled out. Otherwise, returns the number.

  - 1 becomes one.
  - 2 becomes two.
  - 10 becomes 10.

- ### intcomma

    Converts an integer or float (or a string representation of either) to a string containing commas every three digits

  - 4500 becomes 4,500.
  - 4500.2 becomes 4,500.2.
  - 45000 becomes 45,000.
  - 450000 becomes 450,000.
  - 4500000 becomes 4,500,000.

- ### intword

    Converts a large integer (or a string representation of an integer) to a friendly text representation. Translates 1.0 as a singular phrase and all other numeric values as plural, this may be incorrect for some languages. Works best for numbers over 1 million.

  - 1000000 becomes 1.0 million.
  - 1200000 becomes 1.2 million.
  - 1200000000 becomes 1.2 billion.
  - -1200000000 becomes -1.2 billion.

- ### naturalday

    For dates that are the current day or within one day, return “today”, “tomorrow” or “yesterday”, as appropriate. Otherwise, format the date using the passed in format string.

  - `16 Feb 2007` becomes yesterday.
  - `17 Feb 2007` becomes today.
  - `18 Feb 2007` becomes tomorrow.

- ### naturaltime

    For datetime values, returns a string representing how many seconds, minutes or hours ago it was – falling back to the timesince format if the value is more than a day old. In case the datetime value is in the future the return value will automatically use an appropriate phrase.

  - `17 Feb 2007 16:30:00` becomes now.
  - `17 Feb 2007 16:29:31` becomes 29 seconds ago.
  - `17 Feb 2007 16:29:00` becomes a minute ago.
  - `17 Feb 2007 16:25:35` becomes 4 minutes ago.
  - `17 Feb 2007 15:30:29` becomes 59 minutes ago.
  - `17 Feb 2007 15:30:01` becomes 59 minutes ago.
  - `17 Feb 2007 15:30:00` becomes an hour ago.
  - `17 Feb 2007 13:31:29` becomes 2 hours ago.
  - `16 Feb 2007 13:31:29` becomes 1 day, 2 hours ago.
  - `16 Feb 2007 13:30:01` becomes 1 day, 2 hours ago.
  - `16 Feb 2007 13:30:00` becomes 1 day, 3 hours ago.
  - `17 Feb 2007 16:30:30` becomes 30 seconds from now.
  - `17 Feb 2007 16:30:29` becomes 29 seconds from now.
  - `17 Feb 2007 16:31:00` becomes a minute from now.
  - `17 Feb 2007 16:34:35` becomes 4 minutes from now.
  - `17 Feb 2007 17:30:29` becomes an hour from now.
  - `17 Feb 2007 18:31:29` becomes 2 hours from now.
  - `18 Feb 2007 16:31:29` becomes 1 day from now.
  - `26 Feb 2007 18:31:29` becomes 1 week, 2 days from now.

- ### ordinal

    Converts an integer to its ordinal as a string.

  - 1 becomes 1st.
  - 2 becomes 2nd.
  - 3 becomes 3rd.

# Custom template tags and filters

The app should contain a `templatetags` directory, at the same level as models.py, `views.py`, etc. If this doesn’t already exist, create it don’t forget the `__init__.py` file to ensure the directory is treated as a Python package.

- After adding the templatetags module, you will need to restart your server before you can use the tags or filters in templates.
- Your custom tags and filters will live in a module inside the `templatetags` directory. The name of the module file is the name you’ll use to load the tags later, so be **careful** to pick a name that won’t clash with custom tags and filters in another app.
- There’s no limit on how many modules you put in the `templatetags` package. Just keep in mind that a `{% load %}` statement will load tags/filters for the given Python module name, not the name of the app.

```text
polls/
    __init__.py
    models.py
    templatetags/
        __init__.py
        custom_tags.py
    views.py
```

    {% load poll_extras %}

> start write tag

`custom_tags.py`

```python
from django import template

register = template.Library()


@register.filter(name='cut')
def cut(value, arg):
    """Removes all values of arg from the given string"""
    return value.replace(arg, '')
```

`load`

    {% load custom_tags %}

`use`

    <p>{{ "mohammed"|cut:'m'}}</p>

- `@register.filter`  use the tag name as function name
- `@register.filter(name='tag_name')`  use the tag name as provide
- `from django.template.defaultfilters import stringfilter`
    `@stringfilter` only expects a string as the first argument
- `@register.filter(is_safe=True)` take care of all the auto-escaping handling
- `@register.filter(expects_localtime=True)`     filter that operates on datetime 
