import { createInput } from "../../helpers/maskedtextbox-utils.js";
import { stub } from "../../helpers/stub.js";

let MaskedTextBox = kendo.ui.MaskedTextBox,
    input;

describe("kendo.ui.MaskedTextBox label", function() {
    beforeEach(function() {
        input = createInput();
    });
    afterEach(function() {
        kendo.destroy(Mocha.fixture);
    });

    it("create a label with inner HTML equal to configuration text", function() {
        let maskedtextbox = new MaskedTextBox(input, {
            label: "<b>text</b>"
        });

        assert.equal(maskedtextbox.wrapper.parent().find(".k-label")[0].innerHTML, "<b>text</b>");
    });

    it("create a label with inner HTML equal to configuration function", function() {
        let maskedtextbox = new MaskedTextBox(input, {
            label: function() {
                return "<b>function</b>";
            }
        });

        assert.equal(maskedtextbox.wrapper.parent().find(".k-label")[0].innerHTML, "<b>function</b>");
    });

    it("create a label with inner HTML equal to configuration object text", function() {
        let maskedtextbox = new MaskedTextBox(input, {
            label: {
                content: "<b>content text</b>"
            }
        });

        assert.equal(maskedtextbox.wrapper.parent().find(".k-label")[0].innerHTML, "<b>content text</b>");
    });

    it("create a label with inner HTML equal to configuration object function", function() {
        let maskedtextbox = new MaskedTextBox(input, {
            label: {
                content: function() {
                    return "<b>content function</b>";
                }
            }
        });

        assert.equal(maskedtextbox.wrapper.parent().find(".k-label")[0].innerHTML, "<b>content function</b>");
    });

    it("floating label wraps the widget", function() {
        let maskedtextbox = new MaskedTextBox(input, {
            label: {
                content: "test",
                floating: true
            }
        });

        assert.isOk(maskedtextbox.wrapper.parent().hasClass("k-floating-label-container"));
        assert.isOk(maskedtextbox.wrapper.parent().hasClass("k-empty"));
    });

    it("floating label removes k-empty class when the input has value", function() {
        let maskedtextbox = new MaskedTextBox(input, {
            value: "val",
            label: {
                content: "test",
                floating: true
            }
        });

        assert.isNotOk(maskedtextbox.floatingLabel.element.hasClass("k-empty"));
    });

    it("floating label removes k-empty on focusout when the input has value", function() {
        let maskedtextbox = new MaskedTextBox(input, {
            label: {
                content: "test",
                floating: true
            }
        });

        assert.isOk(maskedtextbox.floatingLabel.element.hasClass("k-empty"));

        maskedtextbox.value("val");
        maskedtextbox.element.trigger("focusout");

        assert.isNotOk(maskedtextbox.floatingLabel.element.hasClass("k-empty"));
    });

    it("floating label adds k-focus when the user focuses the input", function() {
        let maskedtextbox = new MaskedTextBox(input, {
            label: {
                content: "test",
                floating: true
            }
        });

        maskedtextbox.element.trigger("focus");

        assert.isOk(maskedtextbox.floatingLabel.element.hasClass("k-focus"));
    });

    it("floating label removes k-focus on blur", function() {
        let maskedtextbox = new MaskedTextBox(input, {
            label: {
                content: "test",
                floating: true
            }
        });

        maskedtextbox.element.trigger("focus");

        assert.isOk(maskedtextbox.floatingLabel.element.hasClass("k-focus"));

        $(document.activeElement).trigger("blur");

        assert.isNotOk(maskedtextbox.floatingLabel.element.hasClass("k-focus"));
    });

    it("maskedtextbox enable calls floating label enable", function() {
        let maskedtextbox = new MaskedTextBox(input, {
            label: {
                content: "test",
                floating: true
            }
        });

        stub(maskedtextbox, { enable: maskedtextbox.floatingLabel.enable });

        maskedtextbox.enable();

        assert.equal(maskedtextbox.calls("enable"), 1);
    });

    it("maskedtextbox readonly calls floating label readonly", function() {
        let maskedtextbox = new MaskedTextBox(input, {
            label: {
                content: "test",
                floating: true
            }
        });

        stub(maskedtextbox, { readonly: maskedtextbox.floatingLabel.readonly });

        maskedtextbox.readonly();

        assert.equal(maskedtextbox.calls("readonly"), 1);
    });

    it("maskedtextbox destroy calls floating label destroy", function() {
        let maskedtextbox = new MaskedTextBox(input, {
            label: {
                content: "test",
                floating: true
            }
        });

        stub(maskedtextbox, { destroy: maskedtextbox.floatingLabel.destroy });

        maskedtextbox.destroy();

        assert.equal(maskedtextbox.calls("destroy"), 1);
    });
});
