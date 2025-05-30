---
title: Dynamically Adding and Removing Form Items
description: How can I add and remove fields in the Form at runtime when working with {{ site.product }}?
type: how-to
page_title: Dynamically Add and Remove Form Items
slug: form-dynamic-items
tags: form, dynamic, items, fields
ticketid: 1562665
res_type: kb
component: form
---

## Environment

<table>
	<tbody>
		<tr>
			<td>Product Version</td>
			<td>2022.2.621</td>
		</tr>
		<tr>
			<td>Product</td>
			<td>Grid for Progress® Telerik® {{ site.product_short }}</td>
		</tr>
	</tbody>
</table>

## Description

How can I dynamically add and remove items in the {{ site.product }} Form?

## Solution

This example demonstrates how to add/remove fields dynamically in the "Phones" Form group. The implementation relies on the following key steps:

1. Create a 'Add Phone" button and insert it in the Form when the page is loaded (function "insertAddPhoneButton()").
1. Append a button to each "Phone" field to make it removable (function "insertRemovePhoneButton()"). 
1. Handle the "click" event of the "Add Phone" button to insert a new Form field. Update the Form with the new item and the Form data by using the [`setOptions()` method](https://docs.telerik.com/kendo-ui/api/javascript/ui/form/methods/setoptions).
1. Handle the "click" event of the remove button to remove the specified "Phone" input.


```Razor Index.cshtml
    @model ProjectName.Models.PersonViewModel

    @(Html.Kendo().Form<PersonViewModel>()
        .Name("exampleForm")
        .HtmlAttributes(new { action = @Url.Action("Submit", "Home"), method = "POST" })
        .Orientation("horizontal")
        .FormData(Model)
        .Layout("grid")
        .Grid(g => g.Cols(2).Gutter(60))
        .Items(items =>
        {
            items.AddGroup()
            .Label("Personal details")
            .Items(i =>
            {
                i.Add()
                    .Field(f => f.FirstName)
                    .Label(l => l.Text("First Name"));
                i.Add()
                    .Field(f => f.LastName)
                    .Label(l => l.Text("Last Name"));
            });

            items.AddGroup()
            .Label("Phones")
            .Items(i =>
            {
                i.Add()
                    .Field(f => f.Phones[0])
                    .Label(l => l.Text("Phone 1"))
                    .Editor(e => e.MaskedTextBox().Mask("(999) 000-0000"));
                i.Add()
                    .Field(f => f.Phones[1])
                    .Label(l => l.Text("Phone 2"))
                    .Editor(e => e.MaskedTextBox().Mask("(999) 000-0000"));
            });
        })
    )
```
```JavaScript
    <script>
        function insertRemovePhoneButton(phoneFields) {
            $.each($(phoneFields), function(i,v){
                var deletePhoneBtn = `<em id="removePhoneBtn_${i}"></em>`;
                $(deletePhoneBtn).insertAfter($(this));
                $(`#removePhoneBtn_${i}`).kendoButton({
                    icon: "trash",
                    click: onRemoveBtnClick
                });
            });
        }
        function insertAddPhoneButton() {
            var addPhoneBtn = '<button id="addPhoneBtn">Add Phone</button>';
            $(".k-form-fieldset").eq(1).append($(addPhoneBtn));
            $("#addPhoneBtn").kendoButton({
                icon: "plus",
                click: onAddPhone
            });
        }
        function onRemoveBtnClick(e) {
            var phoneId = $(e.sender.element).attr("id").split("_")[1];
            var formComponent = $("#exampleForm").data("kendoForm");
            var formData = formComponent.options.formData;
            var phoneItems = formComponent.options.items[1].items;
            var currnetPhonesData = formComponent._model.Phones;
            formData.Phones.splice(phoneId, 1);
            phoneItems.splice(phoneId, 1);
            currnetPhonesData.splice(phoneId, 1);   

            var newPhoneItems = [];
            for(var i = 0; i < formData.Phones.length; i++) {
                newPhoneItems.push({
                    "field": `Phones[${i}]`,
                    "editor": "MaskedTextBox",
                    "editorOptions": {
                        "mask": "(999) 000-0000"
                    },
                    "label": {
                        "text": `Phone ${i + 1}`
                    },
                    "shouldRenderHidden": false
                });
                formData.Phones[i] = currnetPhonesData[i];
            }

            formComponent.options.items[1].items = newPhoneItems;
            formComponent.setOptions({
                formData: formData,
                items: formComponent.options.items
            });

            insertRemovePhoneButton($('[data-role="maskedtextbox"]'));
            insertAddPhoneButton();
        }

        function onAddPhone(e) {
            var formComponent = $("#exampleForm").data("kendoForm");
            var formData = formComponent.options.formData;
            var phoneItems = formComponent.options.items[1].items;
            var currnetPhonesData = formComponent._model.Phones;
            var totalPhones = phoneItems.length;
            formData.Phones.push("");
            phoneItems.push({
                "field": `Phones[${totalPhones}]`,
                "editor": "MaskedTextBox",
                "editorOptions": {
                    "mask": "(999) 000-0000"
                },
                "label": {
                    "text": `Phone ${totalPhones + 1}`
                },
                "shouldRenderHidden": false
            });

            for(var i = 0; i < formData.Phones.length; i++) {
                if(currnetPhonesData[i] != formData.Phones[i]) {
                    formData.Phones[i] = currnetPhonesData[i];
                }
            }

            formComponent.setOptions({
                formData: formData,
                items: formComponent.options.items
            });
            insertRemovePhoneButton($('[data-role="maskedtextbox"]'));
            insertAddPhoneButton();
        }

        $(document).ready(function(){
            insertRemovePhoneButton($('[data-role="maskedtextbox"]'));
            insertAddPhoneButton();
        });
    </script>

```

For a runnable example based on the code above, refer to the [REPL example on dynamically adding and removing Form items](https://netcorerepl.telerik.com/cGaqQMPU08cIofKs54).

## More {{ site.framework }} Form Resources

* [{{ site.framework }} Form Documentation]({%slug htmlhelpers_form_aspnetcore_overview%})

* [{{ site.framework }} Form Demos](https://demos.telerik.com/{{ site.platform }}/form)

{% if site.core %}
* [{{ site.framework }} Form Product Page](https://www.telerik.com/aspnet-core-ui/form)

* [Telerik UI for {{ site.framework }} Video Onboarding Course (Free for trial users and license holders)]({%slug virtualclass_uiforcore%})

* [Telerik UI for {{ site.framework }} Forums](https://www.telerik.com/forums/aspnet-core-ui)

{% else %}
* [{{ site.framework }} Form Product Page](https://www.telerik.com/aspnet-mvc/form)

* [Telerik UI for {{ site.framework }} Video Onboarding Course (Free for trial users and license holders)]({%slug virtualclass_uiformvc%})

* [Telerik UI for {{ site.framework }} Forums](https://www.telerik.com/forums/aspnet-mvc)
{% endif %}

## See Also

* [Telerik REPL: Dynamically Adding and Removing Form Items](https://netcorerepl.telerik.com/cGaqQMPU08cIofKs54)
* [Client-Side API Reference of the Form for {{ site.framework }}](https://docs.telerik.com/kendo-ui/api/javascript/ui/form)
* [Server-Side API Reference of the Form for {{ site.framework }}](https://docs.telerik.com/{{ site.platform }}/api/form)
* [Telerik UI for {{ site.framework }} Breaking Changes]({%slug breakingchanges_2023%})
* [Telerik UI for {{ site.framework }} Knowledge Base](https://docs.telerik.com/{{ site.platform }}/knowledge-base)
