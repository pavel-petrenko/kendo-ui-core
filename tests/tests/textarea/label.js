import '@progress/kendo-ui/src/kendo.textarea.js';
import { stub } from '../../helpers/stub.js';

let TextArea = kendo.ui.TextArea,
    textarea;

describe("kendo.ui.TextArea label", function() {
    beforeEach(function() {
        textarea = $("<textarea />").appendTo(Mocha.fixture);
    });
    afterEach(function() {
        kendo.destroy(Mocha.fixture);
    });

    it("create a label with inner HTML equal to configuration text", function() {
        let widget = new TextArea(textarea, {
            label: "<b>text</b>"
        });

        assert.equal(widget.wrapper.parent().find(".k-label")[0].innerHTML, "<b>text</b>");
    });

    it("create a label with inner HTML equal to configuration function", function() {
        let widget = new TextArea(textarea, {
            label: function() {
                return "<b>function</b>";
            }
        });

        assert.equal(widget.wrapper.parent().find(".k-label")[0].innerHTML, "<b>function</b>");
    });

    it("create a label with inner HTML equal to configuration object text", function() {
        let widget = new TextArea(textarea, {
            label: {
                content: "<b>content text</b>"
            }
        });

        assert.equal(widget.wrapper.parent().find(".k-label")[0].innerHTML, "<b>content text</b>");
    });

    it("create a label with inner HTML equal to configuration object function", function() {
        let widget = new TextArea(textarea, {
            label: {
                content: function() {
                    return "<b>content function</b>";
                }
            }
        });

        assert.equal(widget.wrapper.parent().find(".k-label")[0].innerHTML, "<b>content function</b>");
    });

    it("floating label wraps the widget", function() {
        let widget = new TextArea(textarea, {
            label: {
                content: "test",
                floating: true
            }
        });

        assert.isOk(widget.wrapper.parent().hasClass("k-floating-label-container"));
        assert.isOk(widget.wrapper.parent().hasClass("k-empty"));
    });

    it("floating label removes k-empty class when the textarea has value", function() {
        let widget = new TextArea(textarea, {
            value: "val",
            label: {
                content: "test",
                floating: true
            }
        });

        assert.isNotOk(widget.floatingLabel.element.hasClass("k-empty"));
    });

    it("floating label removes k-empty on focusout when the textarea has value", function() {
        let widget = new TextArea(textarea, {
            label: {
                content: "test",
                floating: true
            }
        });

        assert.isOk(widget.floatingLabel.element.hasClass("k-empty"));

        widget.value("val");
        widget.element.trigger("focusout");

        assert.isNotOk(widget.floatingLabel.element.hasClass("k-empty"));
    });

    it("floating label adds k-focus when the user focuses the textarea", function() {
        let widget = new TextArea(textarea, {
            label: {
                content: "test",
                floating: true
            }
        });

        widget.focus();
        widget.element.trigger("focusin");

        assert.isOk(widget.floatingLabel.element.hasClass("k-focus"));
    });

    it("floating label removes k-focus on blur", function() {
        let widget = new TextArea(textarea, {
            label: {
                content: "test",
                floating: true
            }
        });

        widget.focus();
        widget.element.trigger("focusin");

        assert.isOk(widget.floatingLabel.element.hasClass("k-focus"));

        document.activeElement.blur();
        widget.element.trigger("focusout");

        assert.isNotOk(widget.floatingLabel.element.hasClass("k-focus"));
    });

    it("floating label adds k-readonly when textarea is set to readonly", function() {
        let widget = new TextArea(textarea, {
            label: {
                content: "test",
                floating: true
            }
        });

        widget.readonly();

        assert.isOk(widget.floatingLabel.element.hasClass("k-readonly"));
    });

    it("widget enable calls floating label enable", function() {
        let widget = new TextArea(textarea, {
            label: {
                content: "test",
                floating: true
            }
        });

        stub(widget, { enable: widget.floatingLabel.enable });

        widget.enable();

        assert.equal(widget.calls("enable"), 1);
    });

    it("widget readonly calls floating label readonly", function() {
        let widget = new TextArea(textarea, {
            label: {
                content: "test",
                floating: true
            }
        });

        stub(widget, { readonly: widget.floatingLabel.readonly });

        widget.readonly();

        assert.equal(widget.calls("readonly"), 1);
    });

    it("widget destroy calls floating label destroy", function() {
        let widget = new TextArea(textarea, {
            label: {
                content: "test",
                floating: true
            }
        });

        stub(widget, { destroy: widget.floatingLabel.destroy });

        widget.destroy();

        assert.equal(widget.calls("destroy"), 1);
    });

    it("k-textarea-container class is added to the floating label element", function() {
        let widget = new TextArea(textarea, {
            label: {
                content: "test",
                floating: true
            }
        });

        assert.isOk(widget.floatingLabel.element.hasClass("k-textarea-container"));
    });
});
