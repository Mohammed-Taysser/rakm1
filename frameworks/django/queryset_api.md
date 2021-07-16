# QuerySet API

> class QuerySet(model=None, query=None, using=None, hints=None)


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

## Methods that return new QuerySets
### Retrieving specific objects with filters

- filter     # Returns a new QuerySet containing objects that match the given lookup parameters.
- exclude    # Returns a new QuerySet containing objects that do not match the given lookup parameters.
- annotate   # Each argument is an annotation that will be added to each object in the QuerySet that is returned
- order_by   # To order randomly, use "?" may be expensive and slow :   `Entry.objects.order_by('?')`
- reverse    # reverse the order 'require order the data before use'
- distinct   # eliminates duplicate rows from the query results.
- values     # Returns a QuerySet that returns dictionaries, rather than model instances
- values_list # similar to values() except that instead of returning dictionaries, it returns tuples
- dates      # dates(field, kind, order='ASC')
- datetimes  # datetimes(field_name, kind, order='ASC', tzinfo=None, is_dst=None)
- union      # qs1.union(qs2, qs3)
- intersection      # qs1.intersection(qs2, qs3)
- difference        # qs1.difference(qs2, qs3)
- select_related
- defer     # no need to specified field to get from DB
- only      # only field is needed



    Entry.objects.filter(pub_date__year=2006)

    Entry.objects.all().filter(pub_date__year=2006)

    Entry.objects.exclude(pub_date__gt=datetime.date(2005, 1, 3), headline='Hello')

    Entry.objects.filter(pub_date__year=2005).order_by('-pub_date', 'headline')

> annotate

```python
>>> from django.db.models import Count
>>> q = Blog.objects.annotate(Count('entry'))
# The name of the first blog
>>> q[0].name
'Blogasaurus'
# The number of entries on the first blog
>>> q[0].entry__count
42
>>> q = Blog.objects.annotate(number_of_entries=Count('entry'))
# The number of entries on the first blog, using the name provided
>>> q[0].number_of_entries
42
```
> values

```python
>>> Blog.objects.filter(name__startswith='Beatles').values()
<QuerySet [{'id': 1, 'name': 'Beatles Blog', 'tagline': 'All the latest Beatles news.'}]>

>>> Blog.objects.values()
<QuerySet [{'id': 1, 'name': 'Beatles Blog', 'tagline': 'All the latest Beatles news.'}]>
>>> Blog.objects.values('id', 'name')
<QuerySet [{'id': 1, 'name': 'Beatles Blog'}]>

# The `values()` method also takes optional keyword arguments, **expressions, which are passed through to annotate():

>>> from django.db.models.functions import Lower
>>> Blog.objects.values(lower_name=Lower('name'))
<QuerySet [{'lower_name': 'beatles blog'}]>

# An aggregate within a values() clause is applied before other arguments within the same values() clause. If you need to group by another value, add it to an earlier `values()` clause instead

>>> from django.db.models import Count
>>> Blog.objects.values('entry__authors', entries=Count('entry'))
<QuerySet [{'entry__authors': 1, 'entries': 20}, {'entry__authors': 1, 'entries': 13}]>
>>> Blog.objects.values('entry__authors').annotate(entries=Count('entry'))
<QuerySet [{'entry__authors': 1, 'entries': 33}]>

```
> values_list

```python
>>> Entry.objects.values_list('id').order_by('id')
<QuerySet[(1,), (2,), (3,), ...]>

# If you only pass in a single field, you can also pass in the flat parameter. 
# If True, this will mean the returned results are single values, rather than one-tuples
>>> Entry.objects.values_list('id', flat=True).order_by('id')
<QuerySet [1, 2, 3, ...]>

# get titles of blogs and order them by name
>>> Blog.objects.values_list('name', flat=True).order_by('name')
<QuerySet ['Beatles Blog', 'str']>
```

> dates

```python
>>> Entry.objects.dates('pub_date', 'year')
[datetime.date(2005, 1, 1)]
>>> Entry.objects.dates('pub_date', 'month')
[datetime.date(2005, 2, 1), datetime.date(2005, 3, 1)]
>>> Entry.objects.dates('pub_date', 'week')
[datetime.date(2005, 2, 14), datetime.date(2005, 3, 14)]
>>> Entry.objects.dates('pub_date', 'day')
[datetime.date(2005, 2, 20), datetime.date(2005, 3, 20)]
>>> Entry.objects.dates('pub_date', 'day', order='DESC')
[datetime.date(2005, 3, 20), datetime.date(2005, 2, 20)]
>>> Entry.objects.filter(headline__contains='Lennon').dates('pub_date', 'day')
[datetime.date(2005, 3, 20)]
```

> union

```python
# The UNION operator selects only distinct values by default. To allow duplicate values, use the all=True argument.

>>> qs1 = Author.objects.values_list('name')
<QuerySet [('dr strange',), ('mohamed',), ('John',), ('Paul',), ('George',), ('Ringo',)]>
>>> qs2 = Entry.objects.values_list('headline')
<QuerySet [('ooo',)]>
>>> qs1.union(qs2).order_by('name')
<QuerySet [('George',), ('John',), ('Paul',), ('Ringo',), ('dr strange',), ('mohamed',), ('ooo',)]>
```

> select_related(*fields)
> 
```python
# Returns a QuerySet that will “follow” foreign-key relationships, selecting additional related-object data when it executes its query. This is a performance booster which results in a single more complex query but means later use of foreign-key relationships won’t require database queries.


e = Entry.objects.get(id=5)     # Hits the database.
b = e.blog      # # Hits the database again to get the related Blog object.



e = Entry.objects.select_related('blog').get(id=5)      # # Hits the database.
b = e.blog    # # Doesn't hit the database, because e.blog has been prepopulated in the previous query.
```

> differ

```python
# if you need those particular fields when you initially fetch the data, you can tell Django not to retrieve them from the database.

>>> Entry.objects.defer("body_text").filter(rating=5).defer("headline")
<QuerySet [<Entry: ooo>]>

# You can defer loading of fields in related models (if the related models are loading via select_related()) by using the standard double-underscore notation to separate related fields:

Blog.objects.select_related().defer("entry__headline", "entry__body")

# Load all fields immediately.
my_queryset.defer(None)
```

> only

```python
# The only() method is more or less the opposite of defer(). You call it with the fields that should not be deferred when retrieving a model. If you have a model where almost all the fields need to be deferred, using only() to specify the complementary set of fields can result in simpler code.

# Suppose you have a model with fields name, age and biography. The following two querysets are the same, in terms of deferred fields:

Person.objects.defer("age", "biography")
Person.objects.only("name")
```

## Methods that do not return QuerySets

- get(**kwargs)
- create(**kwargs)    
- get_or_create(defaults=None, **kwargs)    # only one object no repeat
- update_or_create(defaults=None, **kwargs)
- bulk_create(objs, batch_size=None, ignore_conflicts=False)
- count()   # Returns an integer representing the number of objects in the database
- latest(*fields)
- earliest(*fields)
- first()   # first object matched by the queryset
- last()    # returns the last object in the queryset.
- aggregate(*args, **kwargs)
- exists()  # Returns True if the QuerySet contains any results, and False if not
- update(**kwargs)
- delete()

> Like `get()`,` earliest()` and `latest()` raise DoesNotExist if there is no object with the given parameters.

```python

# get
Entry.objects.get(id=1)
Entry.objects.get(blog=blog, entry_number=1)

# create

p = Person.objects.create(first_name="Bruce", last_name="Springsteen")

p = Person(first_name="Bruce", last_name="Springsteen")
p.save(force_insert=True)

# get_or_create
# Returns a tuple of (object, created), where object is the retrieved or created object and created is a boolean specifying whether a new object was created.
# instead of
try:
    obj = Person.objects.get(first_name='John', last_name='Lennon')
except Person.DoesNotExist:
    obj = Person(first_name='John', last_name='Lennon', birthday=date(1940, 10, 9))
    obj.save()

# can write as
obj, created = Person.objects.get_or_create(
    first_name='John',
    last_name='Lennon',
    defaults={'birthday': date(1940, 10, 9)},
)

# update_or_create
# A convenience method for updating an object with the given kwargs, creating a new one if necessary. The defaults is a dictionary of (field, value) pairs used to update the object.
# Returns a tuple of (object, created), where object is the created or updated object and created is a boolean specifying whether a new object was created.
# The update_or_create method tries to fetch an object from database based on the given kwargs. If a match is found, it updates the fields passed in the defaults dictionary.

# instead of writing
defaults = {'first_name': 'Bob'}
try:
    obj = Person.objects.get(first_name='John', last_name='Lennon')
    for key, value in defaults.items():
        setattr(obj, key, value)
    obj.save()
except Person.DoesNotExist:
    new_values = {'first_name': 'John', 'last_name': 'Lennon'}
    new_values.update(defaults)
    obj = Person(**new_values)
    obj.save()

# can write as
obj, created = Person.objects.update_or_create(
    first_name='John', last_name='Lennon',
    defaults={'first_name': 'Bob'},
)


# bulk_create
# This method inserts the provided list of objects into the database in an efficient manner (generally only 1 query, no matter how many objects there are), and returns created objects as a list, in the same order as provided:

objs = Entry.objects.bulk_create([
    Entry(headline='This is a test'),
    Entry(headline='This is only a test'),
])

# count()
# A count() call performs a SELECT COUNT(*) behind the scenes, so you should always use count() rather than loading all of the record into Python objects and calling len() on the result (unless you need to load the objects into memory anyway, in which case len() will be faster).
# Returns the total number of entries in the database.
Entry.objects.count()

# Returns the number of entries whose headline contains 'Lennon'
Entry.objects.filter(headline__contains='Lennon').count()


#latest
# Returns the latest object in the table based on the given field(s).

Entry.objects.latest('pub_date')

#You can also choose the latest based on several fields. For example, to select the Entry with the earliest expire_date when two entries have the same pub_date:

Entry.objects.latest('pub_date', '-expire_date')


# aggregate
# Returns a dictionary of aggregate values (averages, sums, etc.) calculated over the QuerySet. Each argument to aggregate() specifies a value that will be included in the dictionary that is returned.

from django.db.models import Count
Blog.objects.aggregate(Count('entry'))  # {'entry__count': 16}
Blog.objects.aggregate(number_of_entries=Count('entry'))    # {'number_of_entries': 16}

# exist
if some_queryset.exists():
    print("There is at least one object in some_queryset")

# Which will be faster than:

if some_queryset:
    print("There is at least one object in some_queryset")


# update
# Performs an SQL update query for the specified fields, and returns the number of rows matched (which may not be equal to the number of rows updated if some rows already have the new value).

# to turn comments off for all blog entries published in 2010, you could do this:
Entry.objects.filter(pub_date__year=2010).update(comments_on=False)

# You can update multiple fields 
Entry.objects.filter(pub_date__year=2010).update(comments_on=False, headline='This is old')

Entry.objects.filter(id=64).update(comments_on=True)    # 1
Entry.objects.filter(slug='nonexistent-slug').update(comments_on=True)  # 0
Entry.objects.filter(pub_date__year=2010).update(comments_on=False)     # 132

# instead of doing this:
e = Entry.objects.get(id=10)
e.comments_on = False
e.save()

# do this
Entry.objects.filter(id=10).update(comments_on=False)


# delete
# Performs an SQL delete query on all rows in the QuerySet and returns the number of objects deleted and a dictionary with the number of deletions per object type.


b = Blog.objects.get(pk=1)

# Delete all the entries belonging to this Blog.
Entry.objects.filter(blog=b).delete()
    (4, {'weblog.Entry': 2, 'weblog.Entry_authors': 2})

blogs = Blog.objects.all()

# This will delete all Blogs and all of their Entry objects.
blogs.delete()
    (5, {'weblog.Blog': 1, 'weblog.Entry': 2, 'weblog.Entry_authors': 2})
```



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


## Operators that return new QuerySets


- AND   &
    ```python
    Model.objects.filter(x=1) & Model.objects.filter(y=2)
    Model.objects.filter(x=1, y=2)

    from django.db.models import Q
    Model.objects.filter(Q(x=1) & Q(y=2))
    ```
- OR    |
    ```python
    Model.objects.filter(x=1) | Model.objects.filter(y=2)

    from django.db.models import Q
    Model.objects.filter(Q(x=1) | Q(y=2))
    ```



# Field lookups

- `exact`   : Entry.objects.get(headline__exact="Cat bites dog")
- `iexact`  : Blog.objects.get(name__iexact="beatles blog")         # case-insensitive
- contains  : Entry.objects.get(headline__contains='Lennon')
- icontains : Entry.objects.get(headline__icontains='Lennon')
- `in`      : Entry.objects.filter(id__in=[1, 3, 4])
- gtl
- gt
- lt
- lte
- startswith
- istartswith
- endswith
- iendswith
- range
- date  : Allows chaining additional field lookups  # pub_date__date__gt
- year  : pub_date__year__gte, pub_date__year
- month
- day
- week
- week_day
- quarter
- time  : pub_date__time=datetime.time(14, 30), pub_date__time__range=(datetime.time(8), datetime.time(17))
- hour  : timestamp__hour=23
- minute    : timestamp__minute__gte=29
- second    
- regex     : title__regex=r'^(An?|The) +'
- iregex

```python
Entry.objects.filter(headline__in='abc')
# SQL equivalents: SELECT ... WHERE headline IN ('a', 'b', 'c');

inner_qs = Blog.objects.filter(name__contains='Cheddar')
entries = Entry.objects.filter(blog__in=inner_qs)

inner_qs = Blog.objects.filter(name__contains='Ch').values('name')
entries = Entry.objects.filter(blog__name__in=inner_qs)
```
## Filter Query
```python
name.objects.all()
name.objects.bulk_create([obj1, ...])   # add objects of name to db
name.objects.get(id = 1)                # return error if not found
name.objects.filter(id = 1)             # return empty list if not found
name.objects.count()
name.objects.all().exclude(id = 1)      # all except id = 1
name.objects.all().order_by('name')     # order objects
name.objects.all().order_by('-name')     # order objects
name.objects.all().order_by('?')        # order objects random
name.objects.all().reverse()            # reverse objects
name.objects.all().values('name')       # column values as dic
name.objects.all().values('name', 'age')        # columns values as dic
name.objects.all().values_list('name')          # column values as list
name.objects.first()            # first row for table name
name.objects.last()             # last row for table name
name.objects.latest('age')      # latest row added to table in column age
name.objects.earliest('age')    # earliest row added to table in column age
name.objects.filter(age = 70).exists()              # return true | false
name.objects.filter(id = 1).delete()
name.objects.filter(title__exact  = 'ali')          # case sensitive
name.objects.filter(title__iexact = 'ali')          # case insensitive
name.objects.filter(title__contains  = 'ali')       # case sensitive
name.objects.filter(title__icontains = 'ali')       # case insensitive
name.objects.filter(title__isnull = True)           # contain null
name.objects.filter(title__regex = r'[a-z]')        # search by re ex
name.objects.filter(id__in = [1,2,3])               # id found in list
name.objects.filter(id__range = [1,5])              # id found in range 1, 5
name.objects.filter(id__gt = 10)                    # id greater than 10
name.objects.filter(id__gte = 10)                   # id greater than or equal to 10
name.objects.filter(id__lt = 10)                    # id less than 10
name.objects.filter(id__lte = 10)                   # id less than or equal to 10
name.objects.filter(title__startwith = 'o')         # start with o
name.objects.filter(title__endwith = 'o')           # end with o
```

## deal with date
```python
name.objects.filter(date__range(datetime.date(2010,1,1), datetime.date(2015,1,1)))      # range between 2010,1, and 2015,1,1
name.objects.filter(date__date(datetime.date(2010,1,1)))      # exact date 
name.objects.filter(date__year = 2010)      # year
name.objects.filter(date__month = 10)       # month
name.objects.filter(date__week = 10)        # week
name.objects.filter(date__day = 10)         # day
name.objects.filter(date__quarter= 1)       # quarter 1-4
```
## deal with time
```python
name.objects.filter(date__time = datetime.time(10,3,20))      # exact time 10:03:20
name.objects.filter(date__hour = 10)      # hour 10
name.objects.filter(date__minute = 3)     # minute 03
name.objects.filter(date__second = 20)    # second 20

```
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



# Querying `JSONField`

>  mainly due to the existence of key transformations. To demonstrate, we will use the following example model:

```python
from django.db import models

class Dog(models.Model):
    name = models.CharField(max_length=200)
    data = models.JSONField(null=True)

    def __str__(self):
        return self.name
```


## Storing and querying for None


> As with other fields, storing None as the field’s value will store it as SQL `NULL`. While not recommended, it is possible to store JSON scalar null instead of SQL NULL by using `Value('null')`.


```python
>>> Dog.objects.create(name='Max', data=None)  # SQL NULL.
<Dog: Max>
>>> Dog.objects.create(name='Archie', data=Value('null'))  # JSON null.
<Dog: Archie>
>>> Dog.objects.filter(data=None)
<QuerySet [<Dog: Archie>]>
>>> Dog.objects.filter(data=Value('null'))
<QuerySet [<Dog: Archie>]>
>>> Dog.objects.filter(data__isnull=True)
<QuerySet [<Dog: Max>]>
>>> Dog.objects.filter(data__isnull=False)
<QuerySet [<Dog: Archie>]>
```
> Unless you are sure you wish to work with SQL NULL values, consider setting `null=False` and providing a suitable default for empty values, such as `default=dict`.

> **note**  : Storing JSON scalar null does not violate `null=False`.



### Key, index, and path transforms



```python
>>> Dog.objects.create(name='Rufus', data={
         'breed': 'labrador',
         'owner': {
             'name': 'Bob',
             'other_pets': [{
                 'name': 'Fishy',
             }],
         },
     })
<Dog: Rufus>
>>> Dog.objects.create(name='Meg', data={'breed': 'collie', 'owner': None})
<Dog: Meg>
>>> Dog.objects.filter(data__breed='collie')
<QuerySet [<Dog: Meg>]>
```

```python

# Multiple keys can be chained together to form a path lookup:
>>> Dog.objects.filter(data__owner__name='Bob')
<QuerySet [<Dog: Rufus>]>


# If the key is an integer, it will be interpreted as an index transform in an array:
>>> Dog.objects.filter(data__owner__other_pets__0__name='Fishy')
<QuerySet [<Dog: Rufus>]>


>>> Dog.objects.create(name='Shep', data={'breed': 'collie'})
<Dog: Shep>
>>> Dog.objects.filter(data__owner__isnull=True)
<QuerySet [<Dog: Shep>]>

```


## Containment and key lookups

- contains      # supported on Oracle and SQLite
  > The contains lookup is overridden on `JSONField`. The returned objects are those where the given dict of key-value pairs are all contained in the top-level of the field.
  ```python
     >>> Dog.objects.create(name='Rufus', data={'breed': 'labrador', 'owner': 'Bob'})
    <Dog: Rufus>
    >>> Dog.objects.create(name='Meg', data={'breed': 'collie', 'owner': 'Bob'})
    <Dog: Meg>
    >>> Dog.objects.create(name='Fred', data={})
    <Dog: Fred>
    >>> Dog.objects.filter(data__contains={'owner': 'Bob'})
    <QuerySet [<Dog: Rufus>, <Dog: Meg>]>
    >>> Dog.objects.filter(data__contains={'breed': 'collie'})
    <QuerySet [<Dog: Meg>]>
  ```
- contained_by      # not supported on Oracle and SQLite.
    > This is the inverse of the contains lookup - the objects returned will be those where the key-value pairs on the object are a subset of those in the value passed. 
    .
    ```python
    >>> Dog.objects.filter(data__contained_by={'breed': 'collie', 'owner': 'Bob'})
    <QuerySet [<Dog: Meg>, <Dog: Fred>]>
    >>> Dog.objects.filter(data__contained_by={'breed': 'collie'})
    <QuerySet [<Dog: Fred>]>
    ```
- has_key   # Returns objects where the given key is in the top-level of the data
    Dog.objects.filter(data__has_key='owner')
    <QuerySet [<Dog: Meg>]>

- has_keys  # Returns objects where all of the given keys are in the top-level of the data.
     Dog.objects.filter(data__has_keys=['breed', 'owner'])
    <QuerySet [<Dog: Meg>]>

- has_any_keys  # Returns objects where any of the given keys are in the top-level of the data
    Dog.objects.filter(data__has_any_keys=['owner', 'breed'])
    <QuerySet [<Dog: Rufus>, <Dog: Meg>]>






# Complex lookups with Q objects

    from django.db.models import Q

```python
Q(question__startswith='What')  
   <Q: (AND: ('question__startswith', 'What'))>
```


> This is equivalent to the following SQL WHERE clause:
```SQL 
WHERE question LIKE 'Who%' OR question LIKE 'What%'
```
```python
Q(question__startswith='Who') | Q(question__startswith='What')
    <Q: (OR: ('question__startswith', 'Who'), ('question__startswith', 'What'))>
```


> You can compose statements of arbitrary complexity by combining `Q` objects with the` &` and `| `operators and use parenthetical grouping. Also, `Q` objects can be negated using the ~ operator, allowing for combined lookups that combine both a normal query and a negated (NOT) query:

    Q(question__startswith='Who') | ~Q(pub_date__year=2005)


> Each lookup function that takes keyword-arguments (e.g. `filter()`, `exclude()`, `get()`) can also be passed one or more `Q` objects as positional (not-named) arguments. If you provide multiple Q object arguments to a lookup function, the arguments will be “AND”ed together. For example:

```python
Poll.objects.get(
    Q(question__startswith='Who'),
    Q(pub_date=date(2005, 5, 2)) | Q(pub_date=date(2005, 5, 6))
)
```

>  roughly translates into the `SQL`:

```SQL:
SELECT * from polls WHERE question LIKE 'Who%'
    AND (pub_date = '2005-05-02' OR pub_date = '2005-05-06')
```

Lookup functions can mix the use of Q objects and keyword arguments. All arguments provided to a lookup function (be they keyword arguments or Q objects) are “AND”ed together. However, if a Q object is provided, it must **precede** the definition of any keyword arguments. For example:


```python
Poll.objects.get(
    Q(pub_date=date(2005, 5, 2)) | Q(pub_date=date(2005, 5, 6)),
    question__startswith='Who',
)
```
> would be a valid query, equivalent to the previous example; but:

```python
Poll.objects.get(
    question__startswith='Who',
    Q(pub_date=date(2005, 5, 2)) | Q(pub_date=date(2005, 5, 6))
)
```
> would not be valid.


# Comparing objects

> Using the Entry example above, the following two statements are equivalent:

    some_entry == other_entry

    some_entry.id == other_entry.id

    some_obj.name == other_obj.name




# Deleting objects

> The delete method, conveniently, is named `delete()`. This method immediately deletes the object and returns the number of objects deleted and a dictionary with the number of deletions per object type. Example:

    >>> e.delete()
    (1, {'weblog.Entry': 1})



> You can also delete objects in bulk. Every QuerySet has a `delete()` method, which deletes all members of that QuerySet.

> For example, this deletes all Entry objects with a pub_date year of 2005:

    >>> Entry.objects.filter(pub_date__year=2005).delete()
    (5, {'webapp.Entry': 5})



> When Django deletes an object, by default it emulates the behavior of the SQL constraint ON DELETE CASCADE – in other words, any objects which had foreign keys pointing at the object to be deleted will be deleted along with it. For example:

    b = Blog.objects.get(pk=1)

    # This will delete the Blog and all of its Entry objects.
    b.delete()

> This cascade behavior is customizable via the on_delete argument to the ForeignKey.

> if you do want to delete all the objects, then you have to explicitly request a complete query set:

    Entry.objects.all().delete()



# Updating multiple objects at once

> The `update()` method is applied instantly and returns the number of rows matched by the query 

    # Update all the headlines with pub_date in 2007.
    Entry.objects.filter(pub_date__year=2007).update(headline='Everything is the same'

Be aware that the update() method is converted directly to an SQL statement. It is a bulk operation for direct updates. It doesn’t run any save() methods on your models, or emit the pre_save or post_save signals (which are a consequence of calling save()), or honor the auto_now field option. If you want to save every item in a QuerySet and make sure that the save() method is called on each instance, you don’t need any special function to handle that. Loop over them and call save():

    for item in my_queryset:
        item.save()


# Related objects

## One-to-many relationships

    e = Entry.objects.get(id=2)
    e.blog()    # Returns the related Blog object.


> If a ForeignKey field has `null=True` set remove the relation:

    >>> e = Entry.objects.get(id=2)
    >>> e.blog = None
    >>> e.save() # "UPDATE blog_entry SET blog_id = NULL ...;"


> Forward access to one-to-many relationships is cached the first time the related object is accessed. Subsequent accesses to the foreign key on the same object instance are cached. Example:

    >>> e = Entry.objects.get(id=2)
    >>> print(e.blog)  # Hits the database to retrieve the associated Blog.
    >>> print(e.blog)  # Doesn't hit the database; uses cached version.

> **Note** that the select_related() QuerySet method recursively prepopulates the cache of all one-to-many relationships ahead of time. Example:

    >>> e = Entry.objects.select_related().get(id=2)
    >>> print(e.blog)  # Doesn't hit the database; uses cached version.
    >>> print(e.blog)  # Doesn't hit the database; uses cached version.

### Following relationships “backward”

```python
>>> b = Blog.objects.get(id=1)
>>> b.entry_set.all() # Returns all Entry objects related to Blog.

# b.entry_set is a Manager that returns QuerySets.
>>> b.entry_set.filter(headline__contains='Lennon')
>>> b.entry_set.count()
```
> You can override the FOO_set name by setting the related_name parameter in the ForeignKey definition. For example, if the Entry model was altered to blog = ForeignKey(Blog, on_delete=models.CASCADE, related_name='entries'), the above example code would look like this:

```python
>>> b = Blog.objects.get(id=1)
>>> b.entries.all() # Returns all Entry objects related to Blog.

# b.entries is a Manager that returns QuerySets.
>>> b.entries.filter(headline__contains='Lennon')
>>> b.entries.count()
```

### Additional methods to handle related objects

- add(obj1, obj2, ...)
    Adds the specified model objects to the related object set.
- create(**kwargs)
    Creates a new object, saves it and puts it in the related object set. Returns the created object.
- remove(obj1, obj2, ...)
    Removes the specified model objects from the related object set.
- clear()
    Removes all objects from the related object set.
- set(objs)
    Replace the set of related objects.


## Many-to-many relationships

```python
e = Entry.objects.get(id=3)
e.authors.all() # Returns all Author objects for this Entry.
e.authors.count()
e.authors.filter(name__contains='John')

a = Author.objects.get(id=5)
a.entry_set.all() # Returns all Entry objects for this Author.

a = Author.objects.get(id=5)
a.entry_set.set([e1, e2])
a.entry_set.set([e1.pk, e2.pk])
```



