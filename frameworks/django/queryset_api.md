
> **note** don't load database many times   : save query into variable and use it instead (cache)

## our model example

```python
from django.db import models

class Blog(models.Model):
    name = models.CharField(max_length=100)
    tagline = models.TextField()

    def __str__(self):
        return self.name

class Author(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField()

    def __str__(self):
        return self.name

class Entry(models.Model):
    blog = models.ForeignKey(Blog, on_delete=models.CASCADE)
    headline = models.CharField(max_length=255)
    body_text = models.TextField()
    pub_date = models.DateField()
    mod_date = models.DateField()
    authors = models.ManyToManyField(Author)
    number_of_comments = models.IntegerField()
    number_of_pingbacks = models.IntegerField()
    rating = models.IntegerField()

    def __str__(self):
        return self.headline
```


### Creating objects

> To create an object, instantiate it using keyword arguments to the model class, then call `save()` to save it to the database.


> Django doesn’t hit the database until you explicitly call `save()`.


```python
>>> from blog.models import Blog
>>> b = Blog(name='Beatles Blog', tagline='All the latest Beatles news.')
>>> b.save()
```


## Saving ForeignKey and ManyToManyField fields

```python
>>> from blog.models import Blog, Entry
>>> entry = Entry.objects.get(pk=1)
>>> cheese_blog = Blog.objects.get(name="Cheddar Talk")
>>> entry.blog = cheese_blog
>>> entry.save()
```

> Updating a `ManyToManyField` works a little differently – use the `add()` method on the field to add a record to the relation. This example adds the Author instance joe to the entry object:

```python
>>> from blog.models import Author
>>> joe = Author.objects.create(name="Joe")
>>> entry.authors.add(joe)
```

> To add multiple records to a `ManyToManyField` in one go, include multiple arguments in the call to` add()`, like this:

```python
>>> john = Author.objects.create(name="John")
>>> paul = Author.objects.create(name="Paul")
>>> george = Author.objects.create(name="George")
>>> ringo = Author.objects.create(name="Ringo")
>>> entry.authors.add(john, paul, george, ringo)    # here is the point
```



## Retrieving objects

> The `all()` method returns a QuerySet of all the objects in the database.

    all_entries = Entry.objects.all()

    one_entry = Entry.objects.get(pk=1)

## Retrieving specific objects with filters

- filter        # Returns a new QuerySet containing objects that match the given lookup parameters.
- exclude       # Returns a new QuerySet containing objects that do not match the given lookup parameters.


    Entry.objects.filter(pub_date__year=2006)

    Entry.objects.all().filter(pub_date__year=2006)



## Chaining filters


> The result of refining a `QuerySet` is itself a `QuerySet`, so it’s possible to chain refinements together. For example:


```python
>>> Entry.objects.filter(
...     headline__startswith='What'
... ).exclude(
...     pub_date__gte=datetime.date.today()
... ).filter(
...     pub_date__gte=datetime.date(2005, 1, 30)
... )
```


```python
>>> Entry.objects.filter(
...     headline__startswith='What'
... ).exclude(
...     pub_date__gte=datetime.date.today()
... ).filter(
...     pub_date__gte=datetime.date(2005, 1, 30)
... )
```

> Each refinement creates a separate and distinct `QuerySet` that can be stored, used and reused.

```python
>>> q1 = Entry.objects.filter(headline__startswith="What")
>>> q2 = q1.exclude(pub_date__gte=datetime.date.today())
>>> q3 = q1.filter(pub_date__gte=datetime.date.today())
```


# QuerySets are lazy
> the act of creating a `QuerySet` doesn’t involve any database activity. You can stack filters together all day long, and Django won’t actually run the query until the `QuerySet` is evaluated. Take a look at this example:

```python
>>> q = Entry.objects.filter(headline__startswith="What")
>>> q = q.filter(pub_date__lte=datetime.date.today())
>>> q = q.exclude(body_text__icontains="food")
>>> print(q)
```

> Though this looks like three database hits, in fact it hits the database only once, at the last line `(print(q))`. In general, the results of a QuerySet aren’t fetched from the database until you “ask” for them. When you do, the QuerySet is evaluated by accessing the database.



## Limiting QuerySets

> For example, this returns the first 5 objects (LIMIT 5):

        >>> Entry.objects.all()[:5]

> This returns the sixth through tenth objects (OFFSET 5 LIMIT 5):

    >>> Entry.objects.all()[5:10]

> this would actually execute the query in order to return a list of every second object of the first 10:

    >>> Entry.objects.all()[:10:2]



> To retrieve a single object rather than a list (e.g. SELECT foo FROM bar LIMIT 1), use an index instead of a slice. For example, this returns the first Entry in the database, after ordering entries alphabetically by headline:

    >>> Entry.objects.order_by('headline')[0]

> This is roughly equivalent to:

    >>> Entry.objects.order_by('headline')[0:1].get()




# Field lookups

- `exact`   : Entry.objects.get(headline__exact="Cat bites dog")
- `iexact`  : Blog.objects.get(name__iexact="beatles blog")         # case-insensitive
- contains  : Entry.objects.get(headline__contains='Lennon')
- startswith, endswith


## Lookups that span relationships

> This example retrieves all Entry objects with a Blog whose name is 'Beatles Blog'

    Entry.objects.filter(blog__name='Beatles Blog')

> This example retrieves all Blog objects which have at least one Entry whose headline contains 'Lennon'

    Blog.objects.filter(entry__headline__contains='Lennon')


> **note** If you are filtering across multiple relationships and one of the intermediate models doesn’t have a value that meets the filter condition, Django will treat it as if there is an empty (all values are NULL), but valid, object there. All this means is that no error will be raised

    Blog.objects.filter(entry__authors__name='Lennon')

>  if there was no author associated with an entry, it would be treated as if there was also no name attached, rather than raising an error because of the missing author. Usually this is exactly what you want to have happen. The only case where it might be confusing is if you are using `isnull`.

    Blog.objects.filter(entry__authors__name__isnull=True)

> will return Blog objects that have an empty name on the author and also those which have an empty author on the entry. If you don’t want those latter objects, you could write

    Blog.objects.filter(entry__authors__isnull=False, entry__authors__name__isnull=True)


## Spanning multi-valued relationships


>  To select all blogs that contain entries with both “Lennon” in the headline and that were published in 2008 (the same entry satisfying both conditions)

    Blog.objects.filter(entry__headline__contains='Lennon', entry__pub_date__year=2008)

    Blog.objects.filter(entry__headline__contains='Lennon').filter(entry__pub_date__year=2008)



# Filters can reference fields on the model

> if you want to compare the value of a model field with another field on the same model
>
> Django provides `F` expressions to allow such comparisons. Instances of `F()` act as a reference to a model field within a query. These references can then be used in query filters to compare the values of two different fields on the same model instance.

For example, to find a list of all blog entries that have had more comments than pingbacks, we construct an `F()` object to reference the pingback count

```python
>>> from django.db.models import F
>>> Entry.objects.filter(number_of_comments__gt=F('number_of_pingbacks'))
```
> Django supports the use of addition, subtraction, multiplication, division, modulo, and power arithmetic with F() objects, both with constants and with other F() objects. To find all the blog entries with more than twice as many comments as pingbacks, we modify the query:

    Entry.objects.filter(number_of_comments__gt=F('number_of_pingbacks') * 2)


> to retrieve all the entries where the author’s name is the same as the blog name, we could issue the query:

    Entry.objects.filter(authors__name=F('blog__name'))

> For date and date/time fields, you can add or subtract a timedelta object. The following would return all entries that were modified more than 3 days after they were published:

    >>> from datetime import timedelta
    >>> Entry.objects.filter(mod_date__gt=F('pub_date') + timedelta(days=3))



# Expressions can reference transforms

> to find all Entry objects published in the same year as they were last modified:

    >>> Entry.objects.filter(pub_date__year=F('mod_date__year'))

> To find the earliest year an entry was published, we can issue the query:

    >>> Entry.objects.aggregate(first_published_year=Min('pub_date__year'))

This example finds the value of the highest rated entry and the total number of comments on all entries for each year:

```python
>>> Entry.objects.values('pub_date__year').annotate(
...     top_rating=Subquery(
...         Entry.objects.filter(
...             pub_date__year=OuterRef('pub_date__year'),
...         ).order_by('-rating').values('rating')[:1]
...     ),
...     total_comments=Sum('number_of_comments'),
... )
```


# The `pk` lookup shortcut


```python
>>> Blog.objects.get(id__exact=14)  # Explicit form
>>> Blog.objects.get(id=14)         # __exact is implied
>>> Blog.objects.get(pk=14)         # pk implies id__exact

# Get blogs entries with id 1, 4 and 7
>>> Blog.objects.filter(pk__in=[1,4,7])

# Get all blog entries with id > 14
>>> Blog.objects.filter(pk__gt=14)

>>> Entry.objects.filter(blog__id__exact=3) # Explicit form
>>> Entry.objects.filter(blog__id=3)        # __exact is implied
>>> Entry.objects.filter(blog__pk=3)        # __pk implies __id__exact

```



## Escaping percent signs and underscores in LIKE statements

> to retrieve all the entries that contain a percent sign, use the percent sign as any other character:

    >>> Entry.objects.filter(headline__contains='%')

> Django takes care of the quoting for you; the resulting SQL will look something like this:

    SELECT ... WHERE headline LIKE '%\%%';









