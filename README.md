# Chooser

For those of you that don't know, chooser is a completely angular-esque
version of [Select2](http://ivaynberg.github.io/select2/). The design is
a bit different, but the functionality mimics that of what select2 offers.

## Directives Available
A good example of chooser's possibilities can be found in this project at
`src/app/components/chooser`.

#### <chooser>
This is your standard, single item chooser. Basically it's a fancy `<select>`
that has a search textbox in the dropdown.

```html
<chooser ng-model="singleModel" options="items" placeholder="Select an Option" label-key="title" value-key="value"></chooser>
```

#### <chooser-multiple>
This is a multiple item chooser. Basically the same of the standard
chooser but works with arrays instead of single values.

```html
<chooser-multiple ng-model="multipleModel" options="items" placeholder="Select Some Options" label-key="title"></chooser-multiple>
```

#### <chooser-tags>
The tags directive is a bit different. Tags are, by definition, simply
an array of strings. Using this directive, that's basically what you get.
You are allowed to add your own items to a list. You can pre-populate the
list of tags with ng-model.

```html
<chooser-tags ng-model="tagsModel" placeholder="Add Tags"></chooser-tags>
```

## Attributes

#### ng-model
Scope variable that is 2-way-binded with the chooser. Any changes to this
variable in the controller will be reflected in the view (chooser), and
visa versa.

#### options (not available in chooser-tags)
Array of items for the chooser user to pick from. Can be made up of strings
or, more commonly, objects.

#### placeholder
Placeholder lets you show a grayed out text when nothing has been selected
in the chooser.

#### label-key
This is the least obvious of all the attributes. If your options are just
an array of strings, you can leave this blank. If your options are a list
of objects, you need to tell the directive which property you want to use
as the "display" property of each object. (ex. putting "title" here would
print the "title" property of each object).

#### value-key
This attribute allows you specify which object property to bind to when a
selection is made.  It's similar to "label-key" except for the model value.
The default is to bind to the entire object.