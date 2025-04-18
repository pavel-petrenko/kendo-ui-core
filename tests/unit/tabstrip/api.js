import '@progress/kendo-ui/src/kendo.tabstrip.js';
import { TimerUtils } from '../../helpers/unit/timer-utils.js';

let isRaised, isActivateRaised;
let argsCheck = false;

function getRootItem(index) {
    return $('#tabstrip').find('.k-item').eq(index);
}

function getTabStrip(selector) {
    return $(selector || "#tabstrip").data("kendoTabStrip");
}

//handlers
function Select(e) {
    if (argsCheck) {
        isRaised = !!e.contentElement;
        argsCheck = false;
    } else { isRaised = true; }
}

function Activate(e) {
    if ($(e.contentElement).is(":visible")) { isActivateRaised = true; }
}


function Load(e) {
    isRaised = true;
}

describe('tabstrip api', function() {
    beforeEach(function() {
        TimerUtils.initTimer();

        Mocha.fixture.append(
            ' <div class="k-tabstrip k-header" id="tabstrip" style="visibility: hidden;">' +
            '    <ul class="k-reset k-tabstrip-items">' +
            '        <li class="k-item k-active"><a class="k-link" href="#tabstrip-1">ASP.NET MVC</a></li>' +
            '        <li class="k-item"><a class="k-link" href="#tabstrip-2">Silverlight</a></li>' +
            '        <li class="k-item"><a class="k-link" href="#tabstrip-3">ASP.NET AJAX</a></li>' +
            '        <li class="k-item"><a class="k-link" href="#tabstrip-4">OpenAccess ORM</a></li>' +
            '        <li class="k-item"><a class="k-link" href="#tabstrip-5">Reporting</a></li>' +
            '        <li class="k-item"><a class="k-link" href="#tabstrip-6">Sitefinity ASP.NET CMS</a></li>' +
            '        <li class="k-item"><a class="k-link" href="http://www.google.com">Sitefinity ASP.NET CMS</a></li>' +
            '    </ul>' +
            '    <div class="k-content k-active" id="tabstrip-1" style="display: block;">' +
            '        <ul>' +
            '            <li>Pure ASP.NET MVC components</li>' +
            '            <li>Completely Open Source</li>' +
            '            <li>Exceptional Performance</li>' +
            '            <li>Based on jQuery</li>' +
            '            <li>Search Engine Optimized</li>' +
            '            <li>Cross-browser support</li>' +
            '        </ul>' +
            '    </div>' +
            '    <div class="k-content" id="tabstrip-2">' +
            '        <ul>' +
            '            <li>Built on Silverlight 3</li>' +
            '            <li>RIA services support</li>' +
            '            <li>Validation support</li>' +
            '            <li>Out of browser support</li>' +
            '            <li>The first commercial 3D chart</li>' +
            '            <li>Free testing framework</li>' +
            '        </ul>' +
            '    </div>' +
            '    <div class="k-content" id="tabstrip-3">' +
            '        <ul>' +
            '            <li>Built on top of Microsoft ASP.NET AJAX framework</li>' +
            '            <li>Rich client-side capabilities; nearly identical client-side and server-side APIs</li>' +
            '            <li>.NET 3.5 built-in support for LINQ, EntityDataSource, ADO.NET DataServices, WCF, etc</li>' +
            '            <li>Performance optimization helper controls and HTTP compression</li>' +
            '            <li>SharePoint and DotNetNuke Integration; ASP.NET MVC-ready</li>' +
            '            <li>Wide cross-browser compatible and XHTML compliant</li>' +
            '        </ul>' +
            '    </div>' +
            '    <div class="k-content" id="tabstrip-4">' +
            '        <ul>' +
            '            <li>Model First and Schema First approaches</li>' +
            '            <li>Stored Procedures for Multiple Databases</li>' +
            '            <li>Views for Multiple Databases</li>' +
            '            <li>Generic Metadata Access and artificial fields API in the runtime</li>' +
            '            <li>Support for Ado.Net Data Services and WCF</li>' +
            '            <li>Support for LINQ, OQL, and SQL Languages</li>' +
            '        </ul>' +
            '    </div>' +
            '    <div class="k-content" id="tabstrip-5">' +
            '        <ul>' +
            '            <li>Excellent data presentation and analysis: Crosstabs, Charts, Tables, Lists</li>' +
            '            <li>SubReports, Barcodes, Images, Shapes, and more</li>' +
            '            <li>Revolutionary WYSIWYG design surface in Visual Studio</li>' +
            '            <li>Easy conditional formatting, sorting, filtering, grouping</li>' +
            '            <li>Powerful styling, data binging and data processing models</li>' +
            '            <li>Significantly reduced development time through wizards and builders</li>' +
            '        </ul>' +
            '    </div>' +
            '    <div class="k-content" id="tabstrip-6">' +
            '        <ul>' +
            '            <li>Multi-lingual Content Integration</li>' +
            '            <li>Workflow Engine</li>' +
            '            <li>Document versioning</li>' +
            '            <li>Permissions</li>' +
            '            <li>Interface Localization</li>' +
            '            <li>Wide cross-browser compatible and XHTML compliant</li>' +
            '        </ul>' +
            '    </div>' +
            '</div>' +
            '<div id="parent-tabstrip" class="k-tabstrip k-header" style="visibility: hidden; position: absolute;">' +
            '    <ul class="k-reset k-tabstrip-items">' +
            '        <li class="k-item">Tab 1</li>' +
            '        <li class="k-item k-active">Tab 2</li>' +
            '    </ul>' +
            '    <div id="parent-tabstrip-1" class="k-content">foo</div>' +
            '    <div id="parent-tabstrip-2" class="k-content" style="display: block;">' +
            '        <div id="child-tabstrip" class="k-tabstrip k-header">' +
            '            <ul class="k-reset k-tabstrip-items">' +
            '                <li class="k-item">foo</li>' +
            '                <li class="k-item k-active">bar</li>' +
            '            </ul>' +
            '            <div id="child-tabstrip-1">foo</div>' +
            '            <div id="child-tabstrip-2" style="display: block;">bar</div>' +
            '        </div>' +
            '    </div>' +
            '</div>'
        );

        $("#tabstrip").kendoTabStrip({ animation: false, select: Select, activate: Activate });
        $("#parent-tabstrip").kendoTabStrip({ animation: false });
        $("#child-tabstrip").kendoTabStrip({ animation: false });

        $.mockjax({
            url: "index1.html",
            response: function() {
                this.responseText = 'Content 1';
            },
            responseTime: 0
        });

        $.mockjax({
            url: "index2.html",
            response: function() {
                this.responseText = 'Content 2';
            },
            responseTime: 0
        });

        $.mockjax({
            url: "index3.html",
            response: function() {
                this.responseText = 'Content 3';
            },
            responseTime: 0
        });

    });

    afterEach(function() {
        TimerUtils.destroyTimer();

        kendo.destroy(Mocha.fixture);
    });

    it('select method should select second item', function() {
        let tabstrip = getTabStrip();
        let item = getRootItem(1);

        assert.isOk(item.attr("aria-controls") !== undefined);
        assert.isOk(item.attr("aria-controls") !== "undefined");

        tabstrip.select(item);

        assert.isOk(item.hasClass('k-active'));
    });

    it('clicking item with url should navigate', function() {
        let tabstrip = getTabStrip();
        let $item = $(getRootItem(6));

        let e = new $.Event('click');

        $item.find('> .k-link').trigger(e);

        assert.isOk(!e.isDefaultPrevented());

        //stop navigation after assert
        e.preventDefault();
    });

    it('trigger input select should not bubble', function() {
        isRaised = false;

        let tabstrip = getTabStrip();
        let content = tabstrip.contentElement(1);

        $(content).find('input').first().trigger('select');

        assert.isOk(!isRaised);
    });

    it('reload method should call ajaxRequest', function() {
        let tabstrip = getTabStrip();
        let isCalled = false;
        let $item = $(getRootItem(4));

        $item.find('> .k-link').data('contentUrl', 'fake');
        tabstrip.ajaxRequest = function() { isCalled = true; };

        tabstrip.reload($item);

        assert.isOk(isCalled);
    });

    it('clicking should raise onSelect event', function() {
        let item = getRootItem(2);

        isRaised = false;

        item.find('> .k-link').trigger('click');

        assert.isOk(isRaised);
    });

    it('clicking first item should select it', function() {
        let item = getRootItem(0);

        item.find('.k-link').trigger('click');

        assert.isOk(item.hasClass('k-active'));
    });

    it('select method should be able to select by number', function() {
        let tabstrip = getTabStrip();

        tabstrip.select(3);

        assert.isOk(getRootItem(3).hasClass('k-active'));
    });

    it('disable method should disable item', function() {
        let tabstrip = getTabStrip();

        let item = getRootItem(4);

        tabstrip.disable(item);

        assert.isOk(item.hasClass('k-disabled'));
        assert.isOk(item.is('[aria-disabled="true"]'));
    });

    it('enable method should enable disabled item', function() {
        let tabstrip = getTabStrip();

        let item = getRootItem(3);

        tabstrip.enable(item);

        assert.isOk(!item.hasClass('k-disabled'));
        assert.isOk(item.is('[aria-disabled="false"]'));
    });

    it('select method should show content', function() {
        let tabstrip = getTabStrip();

        let item = getRootItem(5);
        tabstrip.select(item);

        let content = $(tabstrip.contentElement(5));
        assert.isOk(item.hasClass('k-active'));
    });

    it('contentElement should return content of seventh tab', function() {
        let tabstrip = getTabStrip();

        let expectedContent = $(tabstrip.element).find('> .k-tabstrip-content').eq(6); //second content under Tab-7

        assert.equal($(tabstrip.contentElement(6)).index(), expectedContent.index());
    });

    it('contentElement should not return tab content if passed argument is not number', function() {
        let tabstrip = getTabStrip();

        assert.equal(tabstrip.contentElement("a"), undefined);
    });

    it('contentElement should not return tab content if passed argument is not in range', function() {
        let tabstrip = getTabStrip();

        assert.equal(tabstrip.contentElement(100), undefined);
    });

    it('getSelectedTab should return current selected tab', function() {
        let tabstrip = getTabStrip();

        let item = getRootItem(0);
        tabstrip.select(item);

        assert.equal(tabstrip.select()[0], item[0]);
    });

    it('getSelectedTab should return negative if no selected tabs', function() {
        let tabstrip = getTabStrip();
        tabstrip.element.find('.k-active').removeClass('k-active');

        assert.equal(tabstrip.select().length, 0);
    });

    it('click should raise select event and pass corresponding content', function() {
        argsCheck = true;

        let item = getRootItem(3);

        isRaised = false;

        item.find('> .k-link').trigger('click');

        assert.isOk(isRaised);
    });

    it('animated text-only content is opened on load', function() {
        assert.equal($('#tabstrip .k-tabstrip-content').css('opacity'), '1');
    });

    it('remove method removes several tabs and their content elements', function() {
        let tabStrip = $("<ul><li>Tab 1</li><li>Tab 2</li></ul>").kendoTabStrip().data("kendoTabStrip");

        try {
            tabStrip.remove("li");

            assert.isOk(tabStrip.tabGroup.is(":empty"));
            assert.isOk(!tabStrip.tabGroup.next()[0]);
        } finally {
            tabStrip.destroy();
        }
    });

    it('insertAfter method moves a tab and its content elements if called with existing tab', function() {
        let tabStrip = $("<div><ul><li>Tab 1</li><li>Tab 2</li></ul><div>Content 1</div><div>Content 2</div></div>").kendoTabStrip().data("kendoTabStrip");

        try {
            tabStrip.insertAfter("li:contains(Tab 1)", "li:last-child");
            assert.equal(tabStrip.tabGroup.children("li:last-child").text(), "Tab 1");
            assert.equal(tabStrip.element.children("div:last-child").text(), "Content 1");
        } finally {
            tabStrip.destroy();
        }
    });

    it('insertAfter regenerates tabs and content IDs', function() {
        let tabStrip = $("<div id='tabstrip'><ul><li>Tab 1</li><li>Tab 2</li></ul><div>Content 1</div><div>Content 2</div></div>").kendoTabStrip().data("kendoTabStrip");

        assert.equal(tabStrip.wrapper.find(".k-item").length, 2);
        assert.equal(tabStrip.wrapper.find(".k-item")[0].id, "tabstrip-tab-1");
        assert.equal(tabStrip.wrapper.find(".k-item")[1].id, "tabstrip-tab-2");
        assert.equal(tabStrip.wrapper.find(".k-tabstrip-content")[0].id, "tabstrip-1");
        assert.equal(tabStrip.wrapper.find(".k-tabstrip-content")[1].id, "tabstrip-2");

        try {
            tabStrip.insertAfter({ text: "new", content: "inserted" }, "li:last-child");

            assert.equal(tabStrip.wrapper.find(".k-item").length, 3);
            assert.equal(tabStrip.wrapper.find(".k-item")[0].id, "tabstrip-tab-1");
            assert.equal(tabStrip.wrapper.find(".k-item")[1].id, "tabstrip-tab-2");
            assert.equal(tabStrip.wrapper.find(".k-item")[2].id, "tabstrip-tab-3");

            assert.equal(tabStrip.wrapper.find(".k-tabstrip-content")[0].id, "tabstrip-1");
            assert.equal(tabStrip.wrapper.find(".k-tabstrip-content")[1].id, "tabstrip-2");
            assert.equal(tabStrip.wrapper.find(".k-tabstrip-content")[2].id, "tabstrip-3");
        } finally {
            tabStrip.destroy();
        }
    });

    it('insertAfter method moves a tab and its content elements when contentUrls option is used', function() {
        let tabStrip = $("<div><ul><li>Tab 1</li><li>Tab 2</li></ul></div>").appendTo(Mocha.fixture).kendoTabStrip({
            contentUrls: [
                'index1.html',
                'index2.html'
            ]
        }).data("kendoTabStrip");

        try {
            tabStrip.insertAfter("li:contains(Tab 1)", "li:last-child");
            tabStrip.activateTab(tabStrip.tabGroup.children("li:last-child"));
            TimerUtils.advanceTimer();

            assert.equal(tabStrip.tabGroup.children("li:last-child").text(), "Tab 1");
            assert.equal(tabStrip.element.children("div:last-child").text(), "Content 1");
            assert.equal(tabStrip._contentUrls[1], 'index1.html');
        } finally {
            tabStrip.destroy();
        }
    });

    it('insertAfter method adds contentUrl', function() {
        let tabStrip = $("<div><ul><li>Tab 2</li></ul></div>").kendoTabStrip({
            contentUrls: [
                'index2.html'
            ]
        }).data("kendoTabStrip");

        try {
            tabStrip.insertAfter({ text: "Tab 1", contentUrl: "index1.html" }, "li:last-child");
            tabStrip.activateTab(tabStrip.tabGroup.children("li:last-child"));
            TimerUtils.advanceTimer();

            assert.equal(tabStrip.tabGroup.children("li:last-child").text(), "Tab 1");
            assert.equal(tabStrip.element.children("div:last-child").text(), "Content 1");
            assert.equal(tabStrip._contentUrls[1], 'index1.html');
        } finally {
            tabStrip.destroy();
        }
    });

    it('insertBefore method moves a tab and its content elements when contentUrls option is used', function() {
        let tabStrip = $("<div><ul><li>Tab 1</li><li>Tab 2</li></ul></div>").kendoTabStrip({
            contentUrls: [
                'index1.html',
                'index2.html'
            ]
        }).data("kendoTabStrip");

        try {
            tabStrip.insertBefore("li:contains(Tab 2)", "li:first-child");
            tabStrip.activateTab(tabStrip.tabGroup.children("li:first-child"));
            TimerUtils.advanceTimer();

            assert.equal(tabStrip.tabGroup.children("li:first-child").text(), "Tab 2");
            assert.equal($(tabStrip.element.children("div")[1]).text(), "Content 2");
            assert.equal(tabStrip._contentUrls[0], 'index2.html');
        } finally {
            tabStrip.destroy();
        }
    });

    it('insertBefore regenerates tabs and content IDs', function() {
        let tabStrip = $("<div id='tabstrip'><ul><li>Tab 1</li><li>Tab 2</li></ul><div>Content 1</div><div>Content 2</div></div>").kendoTabStrip().data("kendoTabStrip");

        assert.equal(tabStrip.wrapper.find(".k-item").length, 2);
        assert.equal(tabStrip.wrapper.find(".k-item")[0].id, "tabstrip-tab-1");
        assert.equal(tabStrip.wrapper.find(".k-item")[1].id, "tabstrip-tab-2");
        assert.equal(tabStrip.wrapper.find(".k-tabstrip-content")[0].id, "tabstrip-1");
        assert.equal(tabStrip.wrapper.find(".k-tabstrip-content")[1].id, "tabstrip-2");

        try {
            tabStrip.insertBefore({ text: "new", content: "inserted" }, "li:first-child");

            assert.equal(tabStrip.wrapper.find(".k-item").length, 3);
            assert.equal(tabStrip.wrapper.find(".k-item")[0].id, "tabstrip-tab-1");
            assert.equal(tabStrip.wrapper.find(".k-item")[1].id, "tabstrip-tab-2");
            assert.equal(tabStrip.wrapper.find(".k-item")[2].id, "tabstrip-tab-3");

            assert.equal(tabStrip.wrapper.find(".k-tabstrip-content")[0].id, "tabstrip-1");
            assert.equal(tabStrip.wrapper.find(".k-tabstrip-content")[1].id, "tabstrip-2");
            assert.equal(tabStrip.wrapper.find(".k-tabstrip-content")[2].id, "tabstrip-3");
        } finally {
            tabStrip.destroy();
        }
    });

    it('insertBefore method moves a tab and its content elements to new index', function() {
        let tabStrip = $("<div><ul><li>Tab 1</li><li>Tab 2</li></ul></div>").kendoTabStrip({
            contentUrls: [
                'index1.html',
                'index2.html'
            ]
        }).data("kendoTabStrip");

        try {
            tabStrip.element.find("li:first").before(tabStrip.element.find("li:last"));
            tabStrip.insertBefore("li:contains(Tab 2)", "li:contains(Tab 1)");
            tabStrip.activateTab(tabStrip.tabGroup.children("li:first-child"));
            TimerUtils.advanceTimer();

            assert.equal(tabStrip.tabGroup.children("li:first-child").text(), "Tab 2");
            assert.equal($(tabStrip.element.children("div")[1]).text(), "Content 2");
            assert.equal(tabStrip._contentUrls[0], 'index2.html');
        } finally {
            tabStrip.destroy();
        }
    });

    it('insertBefore method works when the same tab is passed to both parameters', function() {
        let tabStrip = $("<div><ul><li>Tab 1</li><li>Tab 2</li><li>Tab 3</li></ul></div>").kendoTabStrip({
            contentUrls: [
                'index1.html',
                'index2.html',
                'index3.html'
            ]
        }).data("kendoTabStrip");

        try {
            tabStrip.activateTab(tabStrip.tabGroup.children("li:first-child"));
            TimerUtils.advanceTimer();

            tabStrip.element.find("li:first").before(tabStrip.element.find("li:contains(Tab 2)"));
            tabStrip.insertBefore("li:contains(Tab 2)", "li:contains(Tab 2)");

            //required as the animations currently can't be turned off'
            tabStrip.tabGroup.children("[data-animating]").removeAttr("data-animating");
            tabStrip.contentAnimators.filter(".k-active").each(function() {
                $(this).removeClass("k-active");
            });

            tabStrip.activateTab(tabStrip.tabGroup.children("li:first-child"));
            TimerUtils.advanceTimer();

            assert.equal(tabStrip.tabGroup.children("li:first-child").text(), "Tab 2");
            assert.equal($(tabStrip.element.children("div")[1]).text(), "Content 2");
            assert.equal(tabStrip._contentUrls[0], 'index2.html');
        } finally {
            tabStrip.destroy();
        }
    });

    it('insertAfter method works when the same tab is passed to both parameters', function() {
        let tabStrip = $("<div><ul><li>Tab 1</li><li>Tab 2</li><li>Tab 3</li></ul></div>").kendoTabStrip({
            contentUrls: [
                'index1.html',
                'index2.html',
                'index3.html'
            ]
        }).data("kendoTabStrip");

        try {
            tabStrip.activateTab(tabStrip.tabGroup.children("li:last-child"));
            TimerUtils.advanceTimer();

            tabStrip.element.find("li:last").after(tabStrip.element.find("li:contains(Tab 2)"));
            tabStrip.insertAfter("li:contains(Tab 2)", "li:contains(Tab 2)");

            //required as the animations currently can't be turned off'
            tabStrip.tabGroup.children("[data-animating]").removeAttr("data-animating");
            tabStrip.contentAnimators.filter(".k-active").each(function() {
                $(this).removeClass("k-active");
            });

            tabStrip.activateTab(tabStrip.tabGroup.children("li:last-child"));
            TimerUtils.advanceTimer();

            assert.equal(tabStrip.tabGroup.children("li:last-child").text(), "Tab 2");
            assert.equal($(tabStrip.element.children("div")[3]).text(), "Content 2");
            assert.equal(tabStrip._contentUrls[2], 'index2.html');
        } finally {
            tabStrip.destroy();
        }
    });


    it('insertBefore method adds contentUrl', function() {
        let tabStrip = $("<div><ul><li>Tab 3</li><li>Tab 1</li></ul></div>").kendoTabStrip({
            contentUrls: [
                //null, this scenario is not supported!
                "index3.html",
                'index1.html'
            ]
        }).data("kendoTabStrip");

        try {
            tabStrip.insertBefore({ text: "Tab 2", contentUrl: "index2.html" }, "li:last-child");
            tabStrip.activateTab(tabStrip.tabGroup.children("li:nth-child(2)"));
            TimerUtils.advanceTimer();

            assert.equal(tabStrip.tabGroup.children("li:nth-child(2)").text(), "Tab 2");
            assert.equal($(tabStrip.element.children("div")[2]).text(), "Content 2");
            assert.equal(tabStrip._contentUrls[1], 'index2.html');
            assert.equal(tabStrip._contentUrls.length, 3);
        } finally {
            tabStrip.destroy();
        }
    });

    it('remove method removes corresponding content url', function() {
        let tabStrip = $("<div><ul><li>Tab 1</li><li>Tab 2</li><li>Tab 3</li></ul></div>").kendoTabStrip({
            contentUrls: [
                'index1.html',
                'index2.html',
                'index3.html'
            ]
        }).data("kendoTabStrip");

        try {
            tabStrip.remove(tabStrip.tabGroup.find("li:nth-child(2)"));

            assert.equal(tabStrip.tabGroup.children("li:nth-child(2)").text(), "Tab 3");
            assert.equal(tabStrip._contentUrls[1], 'index3.html');
        } finally {
            tabStrip.destroy();
        }
    });

    it('append method adds corresponding content url', function() {
        let tabStrip = $("<div><ul><li>Tab 1</li></ul></div>").kendoTabStrip({
            contentUrls: [
                'index1.html'
            ]
        }).data("kendoTabStrip");

        try {
            tabStrip.append({
                text: "Tab 3",
                content: "someContent",
                contentUrl: "index3.html"
            });

            assert.equal(tabStrip.tabGroup.children("li:nth-child(2)").text(), "Tab 3");
            assert.equal(tabStrip._contentUrls[1], 'index3.html');
        } finally {
            tabStrip.destroy();
        }
    });

    it('append method works with ObservableArray', function() {
        let tabStrip = $("<div><ul><li>Tab 1</li></ul></div>").kendoTabStrip({
            contentUrls: [
                'index1.html'
            ]
        }).data("kendoTabStrip");

        try {
            tabStrip.append(new kendo.data.ObservableArray([{
                text: "Tab 3",
                content: "someContent",
                contentUrl: "index3.html"
            }]));

            assert.equal(tabStrip.tabGroup.children("li:nth-child(2)").text(), "Tab 3");
            assert.equal(tabStrip._contentUrls[1], 'index3.html');
        } finally {
            tabStrip.destroy();
        }
    });

    it('setOptions method update content Urls', function() {
        let tabStrip = $("<div><ul><li>Tab 1</li><li>Tab 2</li><li>Tab 3</li></ul></div>").kendoTabStrip({
            contentUrls: [
                'index1.html',
                'index2.html'
            ]
        }).data("kendoTabStrip");

        try {
            tabStrip.setOptions({
                contentUrls: [
                    'index1.html',
                    'index3.html'
                ]
            });

            assert.equal(tabStrip._contentUrls[1], 'index3.html');
        } finally {
            tabStrip.destroy();
        }
    });

    it('select method ignores nested TabStrips', function() {
        let parentTabstrip = getTabStrip("#parent-tabstrip"),
            idx = parentTabstrip.select().index();

        assert.equal(idx, 1);
    });

    function createTabStrip(options) {
        if (Array.isArray(options)) {
            options = { dataSource: options };
        }

        return $("<div />").appendTo(Mocha.fixture).kendoTabStrip($.extend({
            dataTextField: "text",
            dataContentField: "content"
        }, options)).data("kendoTabStrip");
    }

    it("remove method calls kendo.destroy on removed contentElements", function() {
        let tabStrip = createTabStrip([{ text: "foo" }, { text: "bar" }]);
        let destroy = kendo.destroy;

        try {
            kendo.destroy = function() { assert.isOk(true); };

            tabStrip.remove("li");
        } finally {
            kendo.destroy = destroy;
        }
    });

    it("remove method removes the specified tab", function() {
        let tabStrip = createTabStrip([{ text: "foo" }, { text: "bar" }]);

        tabStrip.remove("li:eq(0)");

        let items = tabStrip.element.find("li");
        assert.equal(items.length, 1);
        assert.equal(items.text(), "bar");
    });

    it("remove method removes the content of the tab", function() {
        let tabStrip = createTabStrip([
            { text: "foo", content: "fcontent" },
            { text: "bar", content: "bcontent" }
        ]);

        tabStrip.remove("li:eq(1)");

        let items = tabStrip.element.find("div.k-tabstrip-content");
        assert.equal(items.text(), "fcontent");
    });

    it("append method appends content containers at the end of the wrapper by default", function() {
        let tabStrip = createTabStrip({
            dataSource: [
                { text: "foo", content: "fcontent" },
                { text: "bar", content: "bcontent" }
            ]
        });

        tabStrip.append({
            text: "baz",
            content: "zcontent"
        });

        let newDiv = tabStrip.element.children().last();
        assert.equal(newDiv.text(), "zcontent");
    });

    it("append method appends content containers before the scroll buttons when scrolling mode is active", function() {
        Mocha.fixture.append(
            '<div id="scrollable-tabstrip" style="width:200px;">' +
            '    <ul>' +
            '        <li class="k-active">some item text 1</li>' +
            '        <li>some item text 2</li>' +
            '        <li>some item text 3</li>' +
            '        <li>some item text 4</li>' +
            '        <li>some item text 5</li>' +
            '        <li>some item text 6</li>' +
            '        <li>some item text 7</li>' +
            '        <li>some item text 8</li>' +
            '        <li>some item text 9</li>' +
            '        <li>some item text 10</li>' +
            '    </ul>' +
            '    <div>content 1</div>' +
            '    <div>content 2</div>' +
            '    <div>content 3</div>' +
            '    <div>content 4</div>' +
            '    <div>content 5</div>' +
            '    <div>content 6</div>' +
            '    <div>content 7</div>' +
            '    <div>content 8</div>' +
            '    <div>content 9</div>' +
            '    <div>content 10</div>' +
            '</div>'
        );

        let tabStrip = $("#scrollable-tabstrip").kendoTabStrip({
            animation: false
        }).data("kendoTabStrip");

        tabStrip.append({
            text: "baz",
            content: "zcontent"
        });

        let tabWrapper = tabStrip.element.children("div").first();
        assert.isOk(tabWrapper.hasClass('k-tabstrip-items-wrapper'));
    });

    it("append method appends content containers before the tabGroup when tabPosition is bottom", function() {
        let tabStrip = createTabStrip({
            tabPosition: "bottom",
            dataSource: [
                { text: "foo", content: "fcontent" },
                { text: "bar", content: "bcontent" }
            ]
        });

        tabStrip.append({
            text: "baz",
            content: "zcontent"
        });

        let tabWrapper = tabStrip.element.children("div").last();
        assert.isOk(tabWrapper.hasClass('k-tabstrip-items-wrapper'));
    });

    it("value option is correctly set", function() {
        let tabStrip = createTabStrip({
            value: "Tab1",
            dataTextField: "Name",
            dataContentField: "Content",
            dataSource: [
                { Name: "Tab1", Content: "Tab1: content" },
                { Name: "Tab2", Content: "Tab2: content" }
            ]
        });

        assert.isOk(tabStrip.element.find("li").first().hasClass("k-active"));
    });

    it("value() method correctly selects active tab", function() {
        let tabStrip = createTabStrip({
            dataTextField: "Name",
            dataContentField: "Content",
            dataSource: [
                { Name: "Tab1", Content: "Tab1: content" },
                { Name: "Tab2", Content: "Tab2: content" }
            ]
        });
        tabStrip.value("Tab2");
        assert.isOk(tabStrip.element.find("li").eq(1).hasClass("k-active"));
    });

    it("value() method does not select tab when value is null", function() {
        let tabStrip = createTabStrip({
            dataTextField: "Name",
            dataContentField: "Content",
            dataSource: [
                { Name: "Tab1", Content: "Tab1: content" },
                { Name: "Tab2", Content: "Tab2: content" }
            ]
        });
        tabStrip.value(null);
        assert.isOk(!tabStrip.element.find("li").eq(1).hasClass("k-active"));
    });

    it("value() method does not select tab when value is undefined", function() {
        let tabStrip = createTabStrip({
            dataTextField: "Name",
            dataContentField: "Content",
            dataSource: [
                { Name: "Tab1", Content: "Tab1: content" },
                { Name: "Tab2", Content: "Tab2: content" }
            ]
        });
        let value;
        tabStrip.value(value);
        assert.isOk(!tabStrip.element.find("li").eq(1).hasClass("k-active"));
    });

});
