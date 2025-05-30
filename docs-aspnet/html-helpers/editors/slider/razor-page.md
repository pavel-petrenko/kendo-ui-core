---
title: Razor Pages
page_title: Razor Pages
description: "An example on how to configure the Telerik UI Slider component for {{ site.framework }} in a Razor Page."
slug: htmlhelpers_slider_razorpage_aspnetcore
position: 4
---

# Slider in Razor Pages

Razor Pages is an alternative to the MVC pattern that makes page-focused coding easier and more productive. This approach consists of a `cshtml` file and a `cshtml.cs` file (by design, the two files have the same name). 

You can seamlessly integrate the Telerik UI Slider for {{ site.framework }} in Razor Pages applications.

This article describes how to configure the Slider component in a Razor Pages scenario.

For the complete project, refer to the [Slider in Razor Pages example](https://github.com/telerik/ui-for-aspnet-core-examples/blob/master/Telerik.Examples.RazorPages/Telerik.Examples.RazorPages/Pages/Slider/SliderIndex.cshtml).

```HtmlHelper
@page
@model Telerik.Examples.RazorPages.Pages.Slider.SliderIndexModel
@{
	ViewData["Title"] = "SliderIndex";
}

@inject Microsoft.AspNetCore.Antiforgery.IAntiforgery Xsrf
@Html.AntiForgeryToken()

<h1>SliderIndex</h1>

<h4>Horizontal orientation:</h4>
<div class="slider-container">
@(Html.Kendo().Slider()
    .Name("slider")
    .IncreaseButtonTitle("Right")
    .DecreaseButtonTitle("Left")
    .Min(-10)
    .Max(10)
    .SmallStep(2)
    .LargeStep(5)
    .Value(0)
    .HtmlAttributes(new { @class = "balSlider", title = "slider" })
)
</div>
<h4>Vertical orientation:</h4>
<div class="slider-container">
@(Html.Kendo().Slider()
    .Name("eqSlider1")
    .Orientation(SliderOrientation.Vertical)
    .Min(-20)
    .Max(20)
    .SmallStep(1)
    .LargeStep(20)
    .ShowButtons(false)
    .Value(10)
    .HtmlAttributes(new { @class = "eqSlider", title = "eqSlider1" })
)
</div>

<style>
	.slider-container {
		padding-top: 20px;
		padding-bottom: 20px;
	}
	div.balSlider {
		width: 100%;
	}
	div.balSlider .k-slider-selection {
		display: none;
	}
	div.eqSlider {
		display: inline-block;
		margin: 1em;
		height: 122px;
		vertical-align: top;
	}
</style>
```
{% if site.core %}
```TagHelper
    @page
    @model Telerik.Examples.RazorPages.Pages.Slider.SliderIndexModel
    @{
        ViewData["Title"] = "SliderIndex";
    }

    @inject Microsoft.AspNetCore.Antiforgery.IAntiforgery Xsrf
    @Html.AntiForgeryToken()

    <h1>SliderIndex</h1>

    <h4>Horizontal orientation:</h4>
    <div class="slider-container">
        <kendo-slider name="Slider"
            increase-button-title="Right"
            decrease-button-title="Left"
            min="-10" max="10"
            small-step="2"
            large-step="5"
            value="0" class="balSlider" title="slider">
        </kendo-slider>
        </div>
    <h4>Vertical orientation:</h4>
    <div class="slider-container">
        <kendo-slider name="eqSlider1"
            orientation="SliderOrientation.Vertical"
            increase-button-title="Right"
            decrease-button-title="Left"
            min="-20" max="20"
            small-step="1"
            large-step="20"
            show-buttons="false"
            value="10" class="eqSlider" title="slider">
        </kendo-slider>
    </div>

    <style>
        .slider-container {
            padding-top: 20px;
            padding-bottom: 20px;
        }
        div.balSlider {
            width: 100%;
        }
        div.balSlider .k-slider-selection {
            display: none;
        }
        div.eqSlider {
            display: inline-block;
            margin: 1em;
            height: 122px;
            vertical-align: top;
        }
    </style>
```
{% endif %}

```C# PageModel
    public void OnGet()
    {

    }
```


## See Also

* [Razor Pages Support]({% slug razor_pages_integration_aspnetmvc6_aspnetmvc %})
* [Slider Overview]({% slug overview_sliderhelper_aspnetcore %})
