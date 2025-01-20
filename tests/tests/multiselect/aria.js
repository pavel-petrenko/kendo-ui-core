import '@progress/kendo-ui/src/kendo.multiselect.js';

let MultiSelect = kendo.ui.MultiSelect,
    keys = kendo.keys,
    input;

describe("kendo.ui.MultiSelect WAI-ARIA with AXE", function() {
    beforeEach(function() {
        kendo.ns = "kendo-";
        input = $("<select multiple id='ms'/>").appendTo(Mocha.fixture);
        $("<label for='ms'>Label</label>").appendTo(Mocha.fixture);
        Mocha.fixture.attr("role", "main");
    });
    afterEach(function() {
        kendo.ns = "";
        if (input.data("kendoMultiSelect")) {
            input.data("kendoMultiSelect").destroy();
        }
    });

    it("MultiSelect is accessible", async function() {
        let ms = new MultiSelect(input, {
            dataSource: ["foo", "bar"]
        });

        await axeRunFixture();
    });

    it("MultiSelect with search term is accessible", async function() {
        let ms = new MultiSelect(input, {
            dataSource: ["foo", "bar"],
            filter: "contains",
            animation: false
        });

        ms.open();
        ms.search("f");

        await axeRunFixture();
    });

    it("MultiSelect with search term has accessible popup", async function() {
        let ms = new MultiSelect(input, {
            dataSource: ["foo", "bar"],
            filter: "contains",
            animation: false
        });

        ms.open();
        ms.search("f");

        await axeRun(ms.popup.element.closest(".k-animation-container").parent());
    });

    it("MultiSelect with value is accessible", async function() {
        let ms = new MultiSelect(input, {
            dataSource: ["foo", "bar"],
            value: "bar"
        });

        await axeRunFixture();
    });

    it("MultiSelect with value and single tagMode is accessible", async function() {
        let ms = new MultiSelect(input, {
            dataSource: ["foo", "bar"],
            value: ["bar", "foo"],
            tagMode: "single"
        });

        await axeRunFixture();
    });

    it("MultiSelect with value and single tagMode has accessible popup", async function() {
        let ms = new MultiSelect(input, {
            dataSource: ["foo", "bar"],
            value: ["bar", "foo"],
            tagMode: "single",
            animation: false
        });

        ms.open();

        await axeRun(ms.popup.element.closest(".k-animation-container").parent());
    });

    it("MultiSelect with templates has accessible popup", async function() {
        let ms = new MultiSelect(input, {
            dataSource: ["foo", "bar"],
            footerTemplate: () => 'Total items found',
            headerTemplate: () => 'Total items found',
            filter: "contains",
            animation: false
        });

        ms.open();
        ms.search("f");

        await axeRun(ms.popup.element[0]);
    });
});

describe("kendo.ui.MultiSelect ARIA", function() {
    beforeEach(function() {

        kendo.ns = "kendo-";
        input = $("<select multiple id='ms'/>").appendTo(Mocha.fixture);
    });
    afterEach(function() {

        kendo.ns = "";
        if (input.data("kendoMultiSelect")) {
            input.data("kendoMultiSelect").destroy();
        }
    });

    it("MultiSelect adds aria-controls pointing to its popup list", function() {
        let multiselect = new MultiSelect(input);

        assert.equal(multiselect.input.attr("aria-controls"), multiselect.ul.attr("id"));
    });

    it("MultiSelect adds aria-disabled='true'", function() {
        let multiselect = new MultiSelect(input.attr("disabled", "disabled"));

        assert.equal(multiselect.input.attr("aria-disabled"), "true");
    });

    it("MultiSelect adds aria-expanded='false'", function() {
        let multiselect = new MultiSelect(input);

        assert.equal(multiselect.input.attr("aria-expanded"), "false");
    });

    it("MultiSelect adds aria-expanded='true'", function() {
        let multiselect = new MultiSelect(input, {
            dataSource: ["item1", "item2"],
            animation: false
        });

        multiselect.open();

        assert.equal(multiselect.input.attr("aria-expanded"), "true");
    });

    it("MultiSelect sets aria-expanded to false on close", function() {
        let multiselect = new MultiSelect(input, {
            dataSource: ["item1", "item2"],
            animation: false
        });

        multiselect.open();
        multiselect.close();

        assert.isOk(!multiselect.popup.visible());
        assert.equal(multiselect.input.attr("aria-expanded"), "false");
    });

    it("MultiSelect adds aria-hidden to the popup element", function() {
        let multiselect = new MultiSelect(input, {
            dataSource: ["item1", "item2"],
            animation: false
        });

        assert.equal(multiselect.ul.attr("aria-hidden"), "true");

        multiselect.open();

        assert.equal(multiselect.ul.attr("aria-hidden"), "false");

        multiselect.close();

        assert.equal(multiselect.ul.attr("aria-hidden"), "true");
    });

    it("MultiSelect calls progress handler when loader is shown", function() {
        let multiselect = new MultiSelect(input, {
            filter: "startswith"
        });

        multiselect._showBusy = function() { assert.isOk(true); };
        multiselect.setDataSource(["item1", "item2"]);
        multiselect.dataSource.trigger("progress");
    });

    it("MultiSelect adds aria-busy=true when loader is shown", function() {
        let multiselect = new MultiSelect(input, {
            dataSource: ["item1", "item2"],
            filter: "startswith"
        });

        multiselect._showBusyHandler();
        assert.equal(multiselect.input.attr("aria-busy"), "true");
    });

    it("MultiSelect adds aria-busy=false when loader is hidden", function() {
        let multiselect = new MultiSelect(input, {
            dataSource: ["item1", "item2"],
            filter: "startswith"
        });

        multiselect._hideBusy();
        assert.equal(multiselect.input.attr("aria-busy"), "false");
    });

    it("MultiSelect sets activedescendant on refresh", function() {
        let multiselect = new MultiSelect(input.attr("id", "test"), {
            highlightFirst: false,
            dataSource: ["item1", "item2"],
            filter: "startswith"
        });

        assert.isOk(!multiselect.input.attr("aria-activedescendant"));
    });

    it("MultiSelect makes first item active on open", function() {
        let multiselect = new MultiSelect(input.attr("id", "test"), {
            dataSource: ["item1", "item2"],
            value: "item1",
            animation: false
        });

        multiselect.open();
        assert.equal(multiselect.input.attr("aria-activedescendant"), multiselect.current().attr("id"));
    });

    //aria-activedescendent interfere reading of all selected items
    it("MultiSelect remove aria-activedescendant on close", function() {
        let multiselect = new MultiSelect(input.attr("id", "test"), {
            dataSource: ["item1", "item2"],
            value: "item1",
            animation: false
        });

        multiselect.open();
        multiselect.close();
        assert.isOk(!multiselect.input.attr("aria-activedescendant"));
    });

    it("MultiSelect sets aria-activedescendant attr to the last li of tagList", function() {
        let multiselect = new MultiSelect(input.attr("id", "test"), {
            dataSource: ["item1", "item2"],
            value: "item1"
        });

        multiselect.input.focus().trigger({
            type: "keydown",
            keyCode: kendo.keys.LEFT
        });

        assert.isOk(multiselect.currentTag().attr("id"));
        assert.equal(multiselect.input.attr("aria-activedescendant"), multiselect.currentTag().attr("id"));
    });

    it("widget takes aria-label attribute", function() {
        let multiselect = new MultiSelect(input.attr("aria-label", "labeltext"));

        assert.equal(multiselect.input.attr("aria-label"), "labeltext");
    });

    it("widget takes aria-labelledby attribute", function() {
        let multiselect = new MultiSelect(input.attr("aria-labelledby", "labelID"));

        assert.equal(multiselect.input.attr("aria-labelledby"), "labelID");
    });

    it("widget sets aria-labelledby attribute to label's id", function() {
        let label = input.before("<label id='labelID' for='msInput'>labeltext</label>").prev("label");
        let multiselect = new MultiSelect(input.attr("id", "msInput"));

        assert.isOk(multiselect.input.attr("aria-labelledby"));
        assert.equal(multiselect.input.attr("aria-labelledby"), label.attr("id"));

        label.remove();
    });

    it("widget sets aria-labelledby attribute to label's generated id", function() {
        let label = input.before("<label for='msInput'>labeltext</label>").prev("label");
        let multiselect = new MultiSelect(input.attr("id", "msInput"));

        assert.isOk(multiselect.input.attr("aria-labelledby"));
        assert.equal(multiselect.input.attr("aria-labelledby"), label.attr("id"));

        label.remove();
    });

    it("MultiSelect input has combobox role", function() {
        let multiselect = new MultiSelect(input);

        assert.equal(multiselect.input.attr("role"), "combobox");
    });

    it("MultiSelect adds aria-describedby pointing to the taglist", function() {
        let multiselect = new MultiSelect(input);

        assert.isOk(!!multiselect.input.attr("aria-describedby"));
        assert.equal(multiselect.input.attr("aria-describedby"), multiselect.tagList.attr("id"));
    });

    it("MultiSelect adds aria-autocomplete", function() {
        let multiselect = new MultiSelect(input);

        assert.equal(multiselect.input.attr("aria-autocomplete"), "list");
    });

    it("MultiSelect adds aria-autocomplete set to 'none' when filter is 'none'", function() {
        input.attr("id", "test");

        let multiselect = new MultiSelect(input, { filter: "none" });

        assert.equal(multiselect.input.attr("aria-autocomplete"), "none");
    });

    it("MultiSelect adds aria-multiselectable to the popup listbox", function() {
        let multiselect = new MultiSelect(input, {
            dataSource: ["item1", "item2"],
            animation: false
        });

        assert.equal(multiselect.ul.attr("aria-multiselectable"), "true");
    });

    it("MultiSelect adds role to the popup items", function() {
        let multiselect = new MultiSelect(input, {
            dataSource: ["item1", "item2"],
            animation: false
        });

        assert.equal(multiselect.ul.children().first().attr("role"), "option");

        multiselect.open();

        assert.equal(multiselect.ul.children().last().attr("role"), "option");

        multiselect.close();

        assert.equal(multiselect.ul.children().first().attr("role"), "option");
    });

    it("MultiSelect toggles aria-hidden of the tag list items", function() {
        let multiselect = new MultiSelect(input, {
            dataSource: ["item1", "item2"],
            value: "item1"
        });
        let tag = multiselect.tagList.children(".k-chip").first().find(".k-chip-action");

        assert.equal(tag.attr("aria-hidden"), "true");

        multiselect.input.focus();

        multiselect.input.trigger({
            type: "keydown",
            keyCode: keys.LEFT
        });

        assert.isOk(!tag.attr("aria-hidden"));
    });

    it("MultiSelect does not assign role to its TagList", function() {
        let multiselect = new MultiSelect(input, {
            dataSource: ["item1", "item2"]
        });

        assert.equal(multiselect.tagList.attr("role"), undefined);
    });

    it("MultiSelect renders aria-activedescendant", function() {
        let multiselect = new MultiSelect(input, {
            dataSource: ["Item", "Item2"],
            animation: false,
            value: ["Item"]
        });

        multiselect.open();

        assert.isOk(!!multiselect.input.attr("aria-activedescendant"));
        assert.equal(multiselect.input.attr("aria-activedescendant"), multiselect.current()[0].id);
    });
});
