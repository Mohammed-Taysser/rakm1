## My Stander

- `view.py` variable : `db_name_objects`
- `forms.py` , `models.py` classes name `CapitalLetter`
- every project you create named it `project`
- better make `template` dir for each apps
    ```text
        app_name
            static
                app_name
                    css
                    js
                    image
                    fonts
            templates
                admin
                    ModelClassName (like Post or comment)   # to override admin change list
                        change_list.html
                        change_form.html
                            ....
                app_name
                    base.html
                    pages
                        blog
                            dashboard.html
                                  ....

                        accounts
                            profile.html
                                ....
                    parts
                        navbar.html
                        footer.html
                        pagination.html
    ```


## Django Basics

1. virtualenv
1. git & github
1. models   `basics learn`
    - managers
    - queryset
    - instance view `mid-level learn`
    - transaction `mid-level learn`
1. views    `basics learn`
    - class based view
    - function based view
    - generic based view
    - mixins    `mid-level learn`
1. templates    `basics learn`
    - template language (custom template) `mid-level learn`
    - filters    (custom tags)   `mid-level learn`
1. forms    `basics learn`
    - forms set
1. admin panel
1. databases
1. django packages
1. reset API (Authentication)   `mid-level learn`
1. translation  `mid-level learn`
1. admin panel customization (themes)
1. deploy `basics learn`
   1. Heroku
   1. DigitalOcean
   1. SSL certificate
   1. connect domain
   

## Also Need
1. testing ^_^  `mid-level learn`
1. ajax
1. recaptcha
1. send mails to gmail
1. social media login (facebook | github)
1. check django support (LTS)
1. payment (pay money throughout django website)
1. component customization
1. different between write code in `modes.py` and `views.py`
1. cookies  `mid-level learn`
1. sessions `mid-level learn`
1. 404 error page
1. postman
1. postgresql , mysql , nosql , database technology and fundamental
1. python advanced
1. templates from `colorlib` website
1. popular django packages
1. design patterns
1. TDD, AWS
1. linux
1. react or vue
1. google app engine
1. webapp2
1. agile methodology
1. documentation
1. personal website
    - get any personal template from any website 
    - edit it
    - add skills 
    - projects
    - make it live (deploy)
    - active ssl
    - create api for it
    - write docs for it
    - test the website
    - for advanced projects write all the project with CBV (class base view)
    - docker 
    -  [celery](https://docs.celeryproject.org/en/stable/)
    - middleware use


## senior level

- custom mode field
- js framework
- powerfull testing
- docker
- django security



# Some Suggested Projects

1. Online Book (library)
1. souq.com
1. facebook
1. blog
1. online cloth (like wordpress)
1. text editor
1. image uploader (like pixel)
1. udemy

## devices
1. part the project into apps like facebook
app for groups and app for post , comment,  pages.



# Virtual Environment

### Install
    pip install viryualenv

### Create Virtual Environment

    virtualenve project_name

### Activate The Virtual Environment

1. on linux     
   `source venv/bin/activate`

1. on window    
   `./scripts/activate`


### List Installed Library On The Virtual Environment

    pip freeze

### Add Installed Library To Requirement File

    pip freeze > requirements.txt

    pip install -r requirements.txt


------


## Create Project

    django-admin startproject project_name .

## Run Server

    python manage.py runserver

## Create App

    python manage.py startapp app_name



-----

## Play With Databases

`default`

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': 'mydatabase',
    }
}
```

<br>

### Explain
ENGINE

The database backend to use. The built-in database backends are:

1. `django.db.backends.postgresql`
1. `django.db.backends.mysql`
1. `django.db.backends.sqlite3`
1. `django.db.backends.oracle`


`PostgreSQL`

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'mydatabasename',
        'USER': 'mydatabaseuser',
        'PASSWORD': 'mypassword',
        'HOST': '127.0.0.1',
        'PORT': '5432',
    }
}
```



-------

# General Tips
 
always name the project dir with `project` to make it easy to copy app from project to another and name the virtual environment with the real name you like 

## before upload images 

1. be sure that we add `encrypt = 'multipart/form-data'` to form
1. add `{% csrf_token %}` on POST method
1. add request.FILES `form = forms.ApplyForm(request.POST, request.FILES)`

## Play With Interactive Shell

    python manage.py shell

``` 
>>> p = Person(name="Fred Flintstone", shirt_size="L")
>>> p.save()
>>> p.shirt_size
'L'
>>> p.get_shirt_size_display()
'Large'
```

## Generate Models For An Existing Database

    python manage.py inspectdb

## Use Shell Of Database

    python manage.py dbshell

## namespace for app

on `urls.py` on main project
it used as link to the app for use in `{% url 'orders:view_name' %}`
```python
urlpatterns = [
    path('order', include('Order.urls', namespace='orders')),
]
```

## on `model.py` if the class after needed class
we can but the class name between  ''

   category = models.ForeignKey('Category', on_delete=models.CASCADE)


## redirect after operation
   redirect('/app_name/detail'+str(form.slud))


-------


## Static Files
`setting.py`
```python
TIME_ZONE = 'Africa/Cairo'

STATIC_URL = '/static/'

MEDIA_ROOT = BASE_DIR / 'media'

MEDIA_URL = '/media/'

CRISPY_TEMPLATE_PACK = 'bootstrap4'

MESSAGE_TAGS = {
    messages.ERROR: 'danger',
}


```

<br>

`urls.py`
```python
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('learn/', include('learn_app.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```



------

## models

any change to `model.py` should run the two command to save change

   python manage.py makemigration

   python manage.py migrate

django model fields
   - html widget
   - validation (like password validation)
   - db size (choose the best one to save on a db)



### model fields

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
## different between auto_now_add and auto_now

`auto_now_add` save the last update of the object
but `auto_now` save the creation date of the object


### relations

- one to one [foregin key] (user have one profile)
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



### properties for all fields

   1.  max_length = n
   2.  null   = False | True
   3.  blank  = False | True
   4.  unique = Fasle | True
   5.  help_text = 'string...'
   6.  default = 'str' | int
   7.  choice = [('db','site')]
   8.  db_column = 'name'       # change the column name
   9.  verbose_name = 'name'    # change lable name on admin view
   10. editable = True | False
   11. error_message = { 'error': 'str' }


### class Meta

```python
class Meta:
    managed = False
    db_table = 'film'               # change database column name
    verbose_name = 'new_name'       # change admin filed name
    verbose_name_plural = 'name'    # in case have any sum name
    ordering = ['film_id']
```


## change upload images names
```python
def upload_jobs_image(instance, file_name):
	image_name, image_extension = file_name.split('.')
	return f'jobs_images/job_{instance.id}_image.{image_extension}'
```

in `model.py` in class name

```python
img = models.ImageField(upload_to=upload_jobs_image, default='job_images/default.jpg')
```

------

## pagination

on `view.py`

```python
def job_list(request):
	jobs = models.Job.objects.all()
	paginator = Paginator(jobs, 5)
	page_number = request.GET.get('page')
	page_obj = paginator.get_page(page_number)
	return render(request, 'job_board_mahmoud_ahmed/jobs/jobs.html',{
		'page_name': 'job list',
		'jobs_objects_db':page_obj,
	})
```

on `template.html` page 

    {% include 'e_commerce_mahmoud_ahmed/parts/pagination.html' with page=db_objects_products %}

on `pagination.html` page

```html

{% if page.has_other_pages%}
    <nav aria-label="Page navigation example mt-5">
      <ul class="pagination justify-content-center">
      {% if page.has_previous %}
        <li class="page-item"><a class="page-link" href="?page={{ page.previous_page_number }}">Previous</a></li>
      {% endif %}
        <li class="page-item disabled"><a class="page-link" href="#">page {{ page.number }} of {{ page.paginator.num_pages }}</a></li>
      {% if page.has_next %}
        <li class="page-item"><a class="page-link" href="?page={{ page.next_page_number }}">Next</a></li>
      {% endif %}
      </ul>
    </nav>
{% endif %}
```


## save images with condition
```python
 def save(self, *args, **kwargs):
     super().save(*args, **kwargs)
     img = Image.open(self.image.path)
     img.thumbnail((300, 300))
     img.save(self.image.path)
```

------

## slug

on `template.html` page

```html
<a href="{% url 'job-board:job_detail' job.slug %}"><h4>{{ job.title}}</h4></a>
```


on 'urls.py'
```python
path('job-detail/<str:job_slug>', views.job_detail, name='job_detail'),
```

on `model.py`

```python
def save(self, *args, **kwargs):
     self.slug = slugify(self.title)
     super(Job, self).save(*args, **kwargs)
```

on `view.py`

```python
def job_detail(request, job_slug):
	job = get_object_or_404(models.Job, slug=job_slug)
	return render(request, 'job_board_mahmoud_ahmed/jobs/job_details.html',{
		'page_name': 'job detail',
		'job_object_db':job,
	})
```



------


# Forms

create `forms.py` along within `urls.py` in the same dir

<br>

on `forms.py`

```python
from django import forms
from . import view

# create form to take input from user in website and go to the model to save data
class PostForm(forms.ModelForm):
    class Meta:
        model = view.Post
        fields = ['title', 'img']    # needed fields to appeare and use
```

<br>

on `view.py`

```python
from . import forms

def create_post(request, post_id):
    post = get_object_or_404(model.Post, post_id)
    all_posts = Post.objects.filter(active=True)    # get all 'posts' that have boolean field and active
    if request.POST:
        form = forms.PostForm(request.POST)
        # form variable will return form object has the fields we choose in `forms.py`
        if form.is_valid:   # check that the value come from request.POST is valid
           new_form = form.save(commit=False)
           new_form.user = request.user
           new_form.save()      # save the values into database
    else:
        form = forms.PostForm()
    
    return render(request, 'edit.html',{'form':form})
```


## create an instance | copy of exist data to the html page

the same as above on `view.py`

```python
form = forms.PostForm(request.POST, instance=post_id) # get the data from database and return it into the 'form' variable with the data
```

it will be in real project as
```python
def create_post(request, post_id):
   post = get_object_or_404(model.Post, post_id)
    if request.POST:
        form = forms.PostForm(request.POST, instance=post_id)
        if form.is_valid:  
           new_form = form.save(commit=False)
           new_form.user = request.user
           new_form.save()    
    else:
        form = forms.PostForm(instance=post_id)
    
    return render(request, 'edit.html',{'form':form})
```

on `view.py`
```python
 job = get_object_or_404(models.Job, slug=job_slug)
 if request.POST:
     form = forms.ApplyForm(request.POST, request.FILES)
     if form.is_valid():
         my_form = form.save(commit=False)
         my_form.job = job
         my_form.save()
 else:
     form = forms.ApplyForm()
```

in `forms.py`

```python
from . import models
from django import forms


class ApplyForm(forms.ModelForm):
	class Meta:
		model = models.Application
		fields = ['name', 'email', 'website_link', 'cv', 'cover_letter']

```
**not we already use django bootstrap 4**
in `template.html` page

```html
<form method="post" enctype="multipart/form-data">
      {% csrf_token %}
      {% bootstrap_form form %}
    <button class="boxed-btn3 w-100" type="submit">Apply Now</button>
</form>
```


## send class name to input view
```python
class AddNewBook(forms.ModelForm):

    class Meta:
        model = models.Book
        fields = '__all__'
        # widgets = {
        # 	'title': forms.TextInput(attrs={'class': 'form-control'}),
        # 	'author': forms.TextInput(attrs={'class': 'form-control'}),
        # 	'img': forms.FileInput(attrs={'class': 'form-control'}),
        # 	'pages': forms.TextInput(attrs={'class': 'form-control'}),
        # 	'buy_price': forms.NumberInput(attrs={'class': 'form-control'}),
        # 	'rent_price': forms.NumberInput(attrs={'class': 'form-control'}),
        # 	'rent_date': forms.TextInput(attrs={'class': 'form-control'}),
        # 	'active': forms.CheckboxInput(attrs={'class': 'form-control'}),
        # 	'status': forms.Select(attrs={'class': 'form-control'}),
        # 	'category': forms.Select(attrs={'class': 'form-control'}),
        # 	'star': forms.NumberInput(attrs={'class': 'form-control'}),
        # 	'star_rate': forms.NumberInput(attrs={'class': 'form-control'}),
        # 	'date_create': forms.DateInput(attrs={'class': 'form-control'}),
        # }
```


-------

## signals

on `models.py`

```python
from django.db.models.signals import post_save
from django.dispatch import receiver


@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


```

-------

## login with user name or email

on `backends.py`

```python

from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import User
from django.db.models import Q


class EmailBackend(ModelBackend):
	def authenticate(self, request, username=None, password=None, **kwargs):
		try:
			user = User.objects.get(Q(username__iexact=username) | Q(email__iexact=username))
		except User.DoesNotExist:
			return None
		except User.MultipleObjectsReturned:		# week choice
			return User.objects.filter(email=username).order_by('id').first()
		
		else:
			if user.check_password(password) and self.user_can_authenticate(user):
				return user
			
	def get_user(self, user_id):
		try:
			user = User.objects.get(pk=user_id)
		except User.DoesNotExist:
			return None
		return user if self.user_can_authenticate(user) else None

```

on `setting.py`

```python
AUTHENTICATION_BACKENDS = ['app_name.backends.EmailBackend']
```

-------

# django bootstrap 4

on `setting.py`

```python
INSTALLED_APPS = [
     "bootstrap4",
]
```

on `template.html` page

   {% load bootstrap4 %}


then usage
```html
<form method="post" enctype="multipart/form-data">
      {% csrf_token %}
      {% bootstrap_form form %}
    <button class="boxed-btn3 w-100" type="submit">Apply Now</button>
</form>
```

------

# Change Admin Site


on `admin.py`

```python
from . import model

class PostAdmin(admin.ModelAdmin):
    list_filter = ['created', 'title']  # on right show 'filter by' date or any choose from model fields
    list_display = ['title', 'created', 'active'] # on the table show column with chosen fields
    search_fields = ['title', 'content']    # add search fields on the top that search on title and content

admin.site.register(model.Post, PostAdmin)
```

    project_name
        manage.py
        templates
            admin
                base_site.html

## Inside Base_site.Html

```html
{% extends 'admin/base.html' %}
{% load static %}

{% block branding %}
    <h1 id="head">My Coffee Administration</h1>
{% endblock branding %}
```


------

## about django and reset api

here we get the data from model and turn it into JSON
 there are 3 ways to deal with REST
 
- class based view 
      - fast development
      - not deal with complex app
  
- function based view ( what we use in django view.py )
      - simple
      - deal with complex app
      - customize
  
- view sets
      - api ---> (model+ url) {CRUD}
  

## search about it

```text
هذا موضوعه كبير .. انصحك تستخدم مزود خدمة بريد مثل جي ميل او اوت لوك او zoho .. لتفادي الفلاتر وكل شركة لها سياسة وبالاصل هذي الشركات تعمل هذا الشي عشان تشترك ب  احد الخدمات منهم ..... المهم  ان الموضوع اذا تبي يوصل على الانبوكس 
1 تاكد ان لديك سيرفر خاص وايبي ثابت خاص فيك .. لان اذا كنت على استضافة مشاركة راح تفشل 
2 - اضبك اعدادات spof في dns واعمل text.recard وخلي الدومين يرسل من الايبي نفسه علىةشان ما تتزور الرساله
3- تشفير البريد الالكتروني ووضع هيدر dmarc

4- تجنب استخدام رموز $$ والاكواد  وكل مزود خدمة له فلاتر معينه 

ذعطيتك روؤس اقلام .. واذا ماتعرف . انصحك تستخدم gsuite او outlock او mailgun او zoho 
لتخطي هذا كله
```

```text
يعطيك العافية باش مهندس..
بعد اذنك عندي سؤال..
على فرض اني رفعت الموقع تبعي وبدي استخدمو sql وتكون موجودة ع النت ما ع الجهاز بدال sqllite..
كيف ممكن بعد مارفعت موقعي اربطو بقاعدة بيانات خارجية online
عم اسأل لانو الحساب المجاني بالpythonanywhere بعطيك 500 ميغا بس ك تخزين انا محتاج اكتر.. لهيك كيف ممكن حل هي المشكلة
```

```text
محتاجينك بس تعرفنا ازاى نطلب منتجات من الموقع( Add to cart)
-وكمان ازاى نعمل product rating بالخمس نجوم
```

```text
 شرح تقسيم user في Django الى مجموعة و اعطاء كل مجموعة صلاحيات و لكل مجموعة profile خاص بيها
```

```text
ماتور العربية اهم ولا الجسم بتاعها ... الاتنين مهمين ... ابدا فرونت واتعلم اساسياته و طبق عليه وبعد كدة بص بصة ع الباك .. عجبك دوس معجبكش ارجع و اتخصص فى الفرونت ..... لان كدة كدة الباك لازم يبقى عارف فرونت
```

```text
هو مش الى بيبقى بيعمل شيفت كارير بيخش يدور ويفهم هو داخل على ايه و هيدرس ايه وبعدين يدرس ... يعنى طلع العيب من الراجل .. انت كخة يا حودة وحش انك شرحت حاجة و قعدته فى البيت وفتحتله اليوتيوب غصب عنه و فرجته على محتواك الوحش الى ملوش شغل ......... ما حضرتك الى بيدور بيلاقى وبيفهم وبيعرف ان المجال ده ليه فرونت ايند ومتطلباته واحد اتنين تلاتة والباك اند واحد اتنين تلاتة و اللغات الاكثر طلبا بتبقى كذا وكذا ..... الى انت بتكلمه فيه ده مش غلط منه ده غلط منك انت .... زى واحد داخل يدرس فرنساوى عشان قالوله لغة سهلة طيب يا عم انت بتدرسه ليه لا معرفش والله بس اكيد هلاقى بيه شغل ....... وفى الاخر احب اقولك انك اتعلمت واستفدت يعنى وقتك مرحش ع الفاضى وبدام اتعلمت حاجة لغة هتلاقى تقريبا كل اللغات شبها يعنى الوقت الى فات مضعش ع الفاضى ضاع للتعلم لما تحب تنقل للغة تانية هتلاقى الدنيا سهلة مش معقدة ........ واسف على اسلوب الكلام بس بستخدم نفس اسلوبك مع الراجل
```

```text
- what need to apply for django job
- how to write django code in the right way
- decorator
- model manager django
- instance method django
- fast api
- dajax in django
- django backend
- override admin on django
- django context processor
- api puplic
- django send email
- breaking bad api
- player time api
- django phone number field
- postman
- django rest api
- https://ionicframework.com/
- https://api.github.com/
- https://github.com/carltongibson/django-filter
- https://simpleisbetterthancomplex.com/tutorial/2016/07/28/how-to-create-django-signals.html
- https://sunscrapers.com/blog/10-django-packages-you-should-know/
- https://www.udemy.com/courses/search/?lang=en&price=price-free&q=django&sort=relevance&src=ukw
- https://github.com/SmileyChris/django-countries
- https://restfulapi.net/
- https://github.com/Pythondeveloper6?tab=repositories
- https://ccbv.co.uk/
- https://mdbootstrap.com/docs/standard/?
- https://diveinto.org/python3/table-of-contents.html
- https://developer.mozilla.org/en-US/docs/Learn/Server-side/Django/Authentication
- https://www.youtube.com/results?search_query=Elearning+Platform+Developed+Using+Django
- https://www.django-rest-framework.org/tutorial/quickstart/
- https://realpython.com/tutorials/django/

- python : str to time https://strftime.org/
- https://www.programiz.com/dsa
- popular module for python
- hash table
- https://www.geeksforgeeks.org/fundamentals-of-algorithms/

```


```text
unit testing بالجانجو و ال ٍRESTfull API و موضوع ال integration
```



```text
django core course


- Http Response & Http Response Redirect
- CRUD & Views
- Template Rendering
- Understanding Context
- User Context & Login Required Decorator
- Detail View
- Create View
- Update View
- Delete View
- Combining Crud in 1 View
- Search in List View & Q Lookups
- Base Django Project
- Your First Model Class
- Basics of Django Model Field Types
- Migrate your Django Model
- Make Changes to Models
- Delete a Field
- Delete Migrations & Squash Migrations
- Save Data via Django-managed Python Shell
- Model Field Validation
- Model Field Validation - The Clean Method
- Model Field Choices
- Model Field Choices - Advanced Options
- DateField & DateTimeField
- Model Meta Options
- Bulk Create
- Custom Model Managers & QuerySet Filters
- Django SlugField & Model Signals Basics
- Fixtures for Loading & Unloading Data
- Basics of Foreign Keys
- Testing our Model
- Boolean Field, Null, & Default Values
- CharField & TextField
- Render Model in Admin
- Django Field Choices
- Object Unicode Name
- Built-in Validation
- Custom Field Validation
- Overriding the Save Method
- Using Signals with Models
- Error Messages & Help Text
- Timestamp & DateTimeField
- Instance Methods & Properties
- Model Managers
- Custom QuerySet Methods
- Models in the Python Shell
- Render Model in Admin
- jango Field Choices
- Object Unicode Name
- Built-in Validation
- Custom Field Validation
- Overriding the Save Method
- Using Signals with Models1
- error Messages & Help Text
- Timestamp & DateTimeField
- Instance Methods & Properties
- Model Managers
- Custom QuerySet Methods
- Models in the Python Shell
- Base Django ProjectPreview
- Function Based View & Base Class ViewPreview
- TemplateViewPreview
- Django Basic RedirectViewPreview
- product Model ClassPreview
- ListView & DetailViewPreview
- Get Context DataPreview
- Proxy Model to Grasp Template Context
- Create a Basic Mixin
- Recreate a ListView
- Recreate a DetailView via Mixins
- RedirectView Based on Model instance
- Login Required Mixin & Decorator
- 7Django Model Form
- CreateView1
- View with FormMixin
- UpdateView the Hard Way
- UpdateView & DeleteView
- intro & Template ViewPreview
- Customize Template ViewPreview
- Base View and MixinsPreview
- Login Required Decorator & Custom MixinPreview
- DetailView
- ListView
- CreateView
- UpdateView
- Delete View
- Handling Exceptions with Objects
- Django Messages in a CBV
- using a FormMixin in a CBV
- Basic Overview
- An HTML Form
- Your First Django Form
- Render the FormPreview
- Form Fields
- Collecting Data via HTML Form
- Collecting Data via Django Form
- Basic Form ValidationPreview
- Initial Form DataPreview
- Form Field Label & Widgets
- Model Form
- override the Save Method in Model FormPreview
- Adjusting Model Form Data in a View
- Custom Error Messages
- Rendering Form Errors in a View
- Rendering Fields Manually within a TemplatePreview
- Reusable Form Template Snippet
- Django FormsetsPreview
- Model Formsets
- ModelForm and QuerySets in Model Formsets
- Dynamic New Form in Formsets with jQueryPreview

- Setup gettext using Homebrew
- Translate a String in a ViewPreview
- Manually Activate Translation by Language
- Django Translation in TemplatePreview

```

```text
scope of django book

    Coding Style
    The Optimal Django Environment Setup
    How To Lay Out Django Projects
    Fundamentals of Django App Design
    Settings and Requirements Files
    Model Best Practices
    Queries and the Database Layer
    Function- and Class-Based Views
    Best Practices for Function-Based Views
    Best Practices for Class-Based Views
    Asynchronous Views (3.1+)
    Form Fundamentals
    Common Patterns for Forms
    Templates: Best Practices
    Template Tags and Filters
    Django Templates and Jinja2
    Building APIs with Django Rest Framework
    Building GraphQL APIs
    JavaScript and Django
    Tradeoffs of Replacing Core Components
    Working With the Django Admin
    Dealing with the User Model
    Django's Secret Sauce: Third-Party Packages
    Testing Chapter of Doom!
    Documentation: Be Obsessed
    Finding and Reducing Bottlenecks
    Asynchronous Task Queues
    Security Best Practices
    Logging: Tips and Tools
    Signals: Use Cases and Avoidance Techniques
    What About Those Random Utilities?
    Deployment: Platforms as a Service
    Deploying Django Projects
    Continuous Integration
    The Art of Debugging
    Where and How to Ask Django Questions
    Closing Thoughts

```



## add like and dislike

on `models.py`

```python
class Product(models.Model):
    name = models.Charfield(max_length = 50)
    like = models.ManyToManyField(User, blank = True)
```

on 'template.html'

```html
{% if request.user in product.like.all %}
    <a href="{% url 'like' product.id %}">dislike</a>
{% else %}
    <a href="{% url 'like' product.id %}">like</a>
{% endif %}
```

on `views.py`

```python
def like_or_unlike(request, id):
    current_product = Product.objects.get(pk=id)
    if request.user in current_product.like.all():
        current_product.like.remove(request.user)
    else:
        current_product.like.add(request.user)

    return redirect(reverse('details', kwargs = {'id':current_product.id}))
```
