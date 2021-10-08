# models

any change to `model.py` should run the two command to save change

   python manage.py makemigration

   python manage.py migrate


django model fields
   - html widget
   - validation (like password validation)
   - db size (choose the best one to save on a db)



# model fields

```python
test = models.AutoField(primary_key=True)
test = models.SmallIntegerField()
test = models.IntegerField()
test = models.BigIntegerField()
test = models.TextField()
test = models.BooleanField()
test = models.DateField()
test = models.TimeField()
test = models.UrlField()
test = models.DateTimeField(default=datetime.now())
test = models.FileField(upload_to='folder/%Y/%m/%d/')
test = models.ImageField(upload_to='photos/%Y/%m/%d/')
test = models.EmailField(max_length=100)
test = models.CharField(max_length=50)
test = models.DecimalField(decimal_places=3, max_digits=5)
```

------

- `AutoField`         : IntegerField that automatically increments according to available IDs
- `BigAutoField`      : 64-bit integer, much like an AutoField
- `SmallAutoField`    : Like an AutoField, but only allows values  Values from 1 to 32767
- `SmallIntegerField` : Like an IntegerField Values from -32768 to 32767
- `BigIntegerField`   : 64-bit integer, much like an IntegerField default form widget is a NumberInput.
- `BooleanField`      : default form widget for this field is CheckboxInput
- `CharField`         : A string field, for small- to large-sized strings.
- `TextField`         : A large text field. The default form widget for this field is a Textarea.
- `DateField`         : The default form widget for this field is a DateInput
- `TimeField`
- `DateTimeField`     : The default form widget for this field is a single DateTimeInput
- `DecimalField`      : two required arguments `max_digits` `decimal_places`
- `EmailField`        :
- `FileField`         : need `upload_to`, `MEDIA_ROOT`, `MEDIA_URL`    # uploads/%Y/%m/%d/
- `ImageField`        : need `upload_to`, `MEDIA_ROOT`, `MEDIA_URL` # height_field width_field
- `FloatField`        : default form widget for this field is a NumberInput
- `IntegerField`      : Values from -2147483648 to 2147483647 
- `JSONField`         
- `PositiveBigIntegerField`     : Values from 0 to 9223372036854775807
- `PositiveIntegerField`        : Values from 0 to 2147483647
- `PositiveSmallIntegerField`   : Values from 0 to 32767
- `SlugField`          :  If max_length is not specified, Django will use a default length of 50 # allow_unicode 
- `URLField`           : A CharField for a URL The default form widget for this field is a URLInput.


# Relationship fields

## `ForeignKey

> To create a recursive relationship

    models.ForeignKey('self', on_delete=models.CASCADE)

> **pro tip** if the Manufacturer model above is defined in another application called production, you’d need to use:

```python
class Car(models.Model):
    manufacturer = models.ForeignKey(
        'production.Manufacturer',
        on_delete=models.CASCADE,
    )
```

### Arguments

- `on_delete`
    - `CASCADE`
    - `PROTECT`
    - `SET_NULL`
    - `RESTRICT`
    - `SET_DEFAULT`
    - `DO_NOTHING`
  
- limit_choices_to
    > Sets a limit to the available choices for this field when this field is rendered using a ModelForm or the admin

    ```python
    staff_member = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'is_staff': True},
    )
    ```

    > The callable form can be helpful, for instance, when used in conjunction with the Python datetime module to limit selections by date range.


    ```python
    def limit_pub_date_choices():
        return {'pub_date__lte': datetime.date.today()}

    limit_choices_to = limit_pub_date_choices
    ```
- to_field
    > The field on the related object that the relation is to. By default, Django uses the primary key of the related object. If you reference a different field, that field must have `unique=True`.



## ManyToManyField

- `limit_choices_to`
- `through`
- `db_table`        # name of the table
- `through_fields`
    > Only used when a custom intermediary model is specified. Django will normally determine which fields of the intermediary model to use in order to establish a many-to-many relationship automatically.
    ```python
    from django.db import models

    class Person(models.Model):
        name = models.CharField(max_length=50)

    class Group(models.Model):
        name = models.CharField(max_length=128)
        members = models.ManyToManyField(
            Person,
            through='Membership',
            through_fields=('group', 'person'), # the point
        )

    class Membership(models.Model):
        group = models.ForeignKey(Group, on_delete=models.CASCADE)
        person = models.ForeignKey(Person, on_delete=models.CASCADE)
        inviter = models.ForeignKey(
            Person,
            on_delete=models.CASCADE,
            related_name="membership_invites",
        )
        invite_reason = models.CharField(max_length=64)
    ```


## OneToOneField

>  this is similar to a ForeignKey with `unique=True`


## different between auto_now_add and auto_now

`auto_now_add` save the last update of the object

but `auto_now` save the creation date of the object


### To create a recursive relationship – an object that has a many-to-one relationship with itself – use models.ForeignKey('self', on_delete=models.CASCADE)

# Relationships

- one to one [foreign key] (user have one profile)
- many to many (one user have many groups and one group has many users)
- one to many (user has many posts)

```python
# 1 to 1
test = models.OneToOneField(TopRatedFilms, on_delete=models.CASCADE)
# don't remove the reference
test = models.OneToOneField(TopRatedFilms, on_delete=models.PROTECT)

# 1 to n
test = models.ForeignKey(TopRatedFilms, on_delete=models.CASCADE)
# n to m
test = models.ManyToManyField(TopRatedFilms)
```


```python
poll = models.ForeignKey(
    Poll,
    on_delete=models.CASCADE,
    verbose_name="the related poll",
)

sites = models.ManyToManyField(Site, verbose_name="list of sites")

place = models.OneToOneField(
    Place,
    on_delete=models.CASCADE,
    verbose_name="related place",
)
```


# Extra fields on many-to-many relationships

associate data with the relationship between two models.

> **For example**, consider the case of an application tracking the musical groups which musicians belong to. There is a *many-to-many relationship* between a person and the groups of which they are a member, so you could use a ManyToManyField to represent this relationship. However, there is a lot of detail about the membership that you might want to collect, such as the date at which the person joined the group.

> For these situations, Django allows you to specify the model that will be used to govern the many-to-many relationship. You can then put extra fields on the intermediate model. The intermediate model is associated with the ManyToManyField using the **through** argument to point to the model that will act as an intermediary. For our musician example, the code would look something like this:

```python
from django.db import models


class Person(models.Model):
    name = models.CharField(max_length=128)

    def __str__(self):
        return self.name

class Group(models.Model):
    name = models.CharField(max_length=128)
    members = models.ManyToManyField(Person, through='Membership')

    def __str__(self):
        return self.name

class Membership(models.Model):
    person = models.ForeignKey(Person, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    date_joined = models.DateField()
    invite_reason = models.CharField(max_length=64)

```

> this will create 3 table
> 1. person table (add only name)
> 1. group  table (add only name)
> 1. membership table (person id, group id, date_joined, invite_reason)
>  so any person can join any group and any group has any person
> **note** Your intermediate model must contain one - and only one - foreign key to the source model (this would be Group in our example)



```python
>>> ringo = Person.objects.create(name="Ringo Starr")
>>> paul = Person.objects.create(name="Paul McCartney")
>>> beatles = Group.objects.create(name="The Beatles")

>>> m1 = Membership(person=ringo, group=beatles,
...     date_joined=date(1962, 8, 16),
...     invite_reason="Needed a new drummer.")
>>> m1.save()
>>> beatles.members.all()
<QuerySet [<Person: Ringo Starr>]>
>>> ringo.group_set.all()
<QuerySet [<Group: The Beatles>]>
>>> m2 = Membership.objects.create(person=paul, group=beatles,
...     date_joined=date(1960, 8, 1),
...     invite_reason="Wanted to form a band.")
>>> beatles.members.all()
<QuerySet [<Person: Ringo Starr>, <Person: Paul McCartney>]>
```
> You can also use `add()`, `create()`, or `set()` to create relationships, as long as you specify `through_defaults` for any required fields:


```python
>>> beatles.members.add(john, through_defaults={'date_joined': date(1960, 8, 1)})
>>> beatles.members.create(name="George Harrison", through_defaults={'date_joined': date(1960, 8, 1)})
>>> beatles.members.set([john, paul, ringo, george], through_defaults={'date_joined': date(1960, 8, 1)})
```

> You may prefer to create instances of the intermediate model directly.

> If the custom through table defined by the intermediate model does not enforce uniqueness on the (model1, model2) pair, allowing multiple values, the `remove()` call will remove all intermediate model instances:

```python
>>> Membership.objects.create(person=ringo, group=beatles,
...     date_joined=date(1968, 9, 4),
...     invite_reason="You've been gone for a month and we miss you.")
>>> beatles.members.all()
<QuerySet [<Person: Ringo Starr>, <Person: Paul McCartney>, <Person: Ringo Starr>]>
>>> # This deletes both of the intermediate model instances for Ringo Starr
>>> beatles.members.remove(ringo)
>>> beatles.members.all()
<QuerySet [<Person: Paul McCartney>]>
```
> The clear() method can be used to remove all many-to-many relationships for an instance:

```python
>>> # Beatles have broken up
>>> beatles.members.clear()
>>> # Note that this deletes the intermediate model instances
>>> Membership.objects.all()
<QuerySet []>

# Find all the members of the Beatles that joined after 1 Jan 1961
>>> Person.objects.filter(
...     group__name='The Beatles',
...     membership__date_joined__gt=date(1961,1,1))
<QuerySet [<Person: Ringo Starr]>
```

###  access a membership’s information

1. ```python
    >>> ringos_membership = Membership.objects.get(group=beatles, person=ringo)
    >>> ringos_membership.date_joined
    datetime.date(1962, 8, 16)
    >>> ringos_membership.invite_reason
    'Needed a new drummer.'
    ```
1. ```python
    >>> ringos_membership = ringo.membership_set.get(group=beatles)
    >>> ringos_membership.date_joined
    datetime.date(1962, 8, 16)
    >>> ringos_membership.invite_reason
    'Needed a new drummer.'
    ```

### properties for all fields
    
   1.  max_length = n
   2.  null   : If True, Django will store empty values as NULL in the database. Default is False.
   3.  blank  : If True, the field is allowed to be blank. Default is False.
   4.  unique : If True, this field must be unique throughout the table.
   5.  help_text = 'string...'
   6.  default = 'str' | int        # The default value for the field
   7.  choice = [('db','site')]     # [('db', 'view')]
   8.  db_column = 'name'       # change the column name
   9.  verbose_name = 'name'    # change label name on admin view
   10. editable : If False, the field will not be displayed in the admin or any other ModelForm Default is True
   11. error_message = { 'error': 'str' }
   12. db_index     : If True, a database index will be created for this field.
   13. db_tablespace  : The name of the database tablespace to use for this field’s index
   14. primary_key  : If True, this field is the primary key for the model.

> **Note** that when `unique` is True, you don’t need to specify db_index, because unique implies the creation of an index.

### class Meta

```python
class Meta:
    managed = False
    db_table = 'film'               # change database column name
    verbose_name = 'new_name'       # change admin filed name
    verbose_name_plural = 'name'    # in case have any sum name
    ordering = ['film_id']
    abstract = True | False         # If abstract = True, this model will be an abstract base class.
    order_with_respect_to = 'name'  # makes this object orderable with respect to the given field, usually a ForeignKey
    indexes                         # A list of indexes that you want to define on the model
    unique_together = ['driver', 'restaurant']
```

### meta indexes

```python
from django.db import models

class Customer(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)

    class Meta:
        indexes = [
            models.Index(fields=['last_name', 'first_name']),
            models.Index(fields=['first_name'], name='first_name_idx'),
        ]
```


## change upload images names
```python
def upload_jobs_image(instance, file_name):
	image_name, image_extension = file_name.split('.')
	return f'jobs_images/job_{instance.id}_image.{image_extension}'
```

```python
def user_directory_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    return 'user_{0}/{1}'.format(instance.user.id, filename)

class MyModel(models.Model):
    upload = models.FileField(upload_to=user_directory_path)
```

in `model.py` in class name

```python
img = models.ImageField(upload_to=upload_jobs_image, default='job_images/default.jpg')
```

------

## There are three styles of inheritance that are possible in Django.

1. Often, you will just want to use the parent class to hold information that you don’t want to have to type out for each child model. This class isn’t going to ever be used in isolation, so `Abstract base classes` are what you’re after.

1. If you’re subclassing an existing model (perhaps something from another application entirely) and want each model to have its own database table, `Multi-table inheritance` is the way to go.
   
1. Finally, if you only want to modify the Python-level behavior of a model, without changing the models fields in any way, you can use `Proxy models`.



## Abstract base classes


> Abstract base classes are useful when you want to put some common information into a number of other models. You write your base class and put `abstract=True` in the `Meta` class. **This model will then not be used to create any database table**. Instead, when it is used as a base class for other models, its fields will be added to those of the child class.

```python
from django.db import models

class CommonInfo(models.Model):
    name = models.CharField(max_length=100)
    age = models.PositiveIntegerField()

    class Meta:
        abstract = True

class Student(CommonInfo):
    home_group = models.CharField(max_length=5)

```
> The Student model will have three fields: `name`, `age` and `home_group`. The CommonInfo model cannot be used as a normal Django model, since it is an abstract base class. It does not generate a database table or have a manager, and cannot be instantiated or saved directly.


## `Meta` inheritance

> When an abstract base class is created, Django makes any `Meta` inner class you declared in the base class available as an attribute. If a child class does not declare its own `Meta` class, it will inherit the parent’s `Meta`. If the child wants to extend the parent’s `Meta` class, it can subclass it. For example:


```python 
from django.db import models

class CommonInfo(models.Model):
    # ...
    class Meta:
        abstract = True
        ordering = ['name']

class Student(CommonInfo):
    # ...
    class Meta(CommonInfo.Meta):    # the point is here
        db_table = 'student_info'

```

### note

- To make an abstract base class that inherits from another abstract base class, you need to explicitly set `abstract=True` on the child
- Some attributes won’t make sense to include in the `Meta` class of an abstract base class For example, including `db_table` would mean that all the child classes (the ones that don’t specify their own Meta) would use the same database table, which is almost certainly not what you want.
- To inherit Meta options from multiple abstract base classes, you must explicitly declare the Meta inheritance.
    ```python
    from django.db import models

    class CommonInfo(models.Model):
        name = models.CharField(max_length=100)
        age = models.PositiveIntegerField()

        class Meta:
            abstract = True
            ordering = ['name']

    class Unmanaged(models.Model):
        class Meta:
            abstract = True
            managed = False

    class Student(CommonInfo, Unmanaged):
        home_group = models.CharField(max_length=5)

        class Meta(CommonInfo.Meta, Unmanaged.Meta):    # the point is here
            pass
    ```

# Model class reference

## Attributes

    django.core.exceptions.ObjectDoesNotExist

- `DoesNotExist`
- `MultipleObjectsReturned`