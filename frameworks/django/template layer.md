
# The Django template language

## Variables

    My first name is {{ first_name }}. My last name is {{ last_name }}

    {{ my_dict.key }}
    {{ my_object.attribute }}
    {{ my_list.0 }}

## Tags

    {% csrf_token %}

    {% cycle 'odd' 'even' %}

    {% if user.is_authenticated %} Hello, {{ user.username }}.{% endif %}

## Filters

    {{ name|title }}

    {{ my_date|date:"Y-m-d" }}

## Comments

    {# this won't be rendered #}
