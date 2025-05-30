import '@progress/kendo-ui/src/kendo.window.js';
import '@progress/kendo-ui/src/kendo.dropdownlist.js';
import { asyncTest } from '../../helpers/unit/async-utils.js';

function cleanup() {
    Mocha.fixture
        .closest("body")
        .find(".k-window-content")
        .each(function(idx, element) {
            $(element)
                .data("kendoWindow")
                .destroy();
        });
    Mocha.fixture
        .closest("body")
        .find(".k-overlay")
        .remove();
}

function createWindow(options, element) {
    element = element || $("<div class='wnd' />").appendTo(Mocha.fixture);
    return element.kendoWindow(options).data("kendoWindow");
}

let Widget = kendo.ui.Widget;

let ResizableWidget = Widget.extend({
    init: function(element, options) {
        Widget.fn.init.call(this, element, options);
        this.element.css({ width: "100%", height: "100%" });
    },
    options: {
        name: "ResizableWidget"
    }
});

let dialog;
let initialSize = 200;
let resizeChange = 20;

function resize(direction, left, top, absolute) {
    let handle = dialog.wrapper.find(".k-resize-" + direction);
    let start = handle.offset();
    let userEvents = dialog.resizing._draggable.userEvents;

    let end = {
        left: absolute ? left : start.left + left,
        top: absolute ? top : start.top + top
    };

    userEvents.press(start.left, start.top, handle[0]);
    userEvents.move(end.left, end.top);
    userEvents.end(end.left, end.top);
}

describe("interaction", function() {
    beforeEach(function() { });
    afterEach(function() {
        cleanup();
    });

    it("double-clicking refresh does not maximize window", function() {
        dialog = createWindow({
            actions: ["refresh"]
        });

        dialog.wrapper.find(".k-i-arrow-rotate-cw").trigger("dblclick");

        assert.isOk(!dialog.options.isMaximized);
    });

    asyncTest("resizing window resizes inner widgets", function(done) {
        kendo.ui.plugin(ResizableWidget);

        dialog = createWindow({});
        let widgetElement = $("<div />").kendoResizableWidget();

        widgetElement.appendTo(dialog.element);

        widgetElement
            .data("kendoResizableWidget")
            .bind("resize", function() {
                done(() => assert.isOk(true));
            });

        dialog.resize();
    });

    it("closing a non-modal Window does not execute toFront() of the other modal instance", function() {
        let executed = false;

        let modalDialog = createWindow({
            modal: true
        });
        let nonModalDialog = createWindow({
            modal: false
        });

        modalDialog.toFront = function() {
            executed = true;
        };

        nonModalDialog.close();

        assert.isOk(!executed);
    });

    it("restoring a Window sets the correct dimensions when width and height are set in percentages", function() {
        let dialog = createWindow({ width: "50%", height: "50%" }),
            initialWidth = dialog.wrapper.width(),
            initialHeight = dialog.wrapper.height();

        dialog.minimize();
        dialog.restore();

        assert.equal(initialWidth, dialog.wrapper.width());
        assert.equal(initialHeight, dialog.wrapper.height());
    });

    it("closing an iframe Window removes focused state", function() {
        let dialog = createWindow({
            iframe: true,
            modal: true,
            visible: false
        });
        let dialogWrapper = dialog.wrapper;

        dialog.open();
        dialog.close();

        assert.isOk(!dialogWrapper.hasClass("k-focus"));
        assert.isOk(document.activeElement !== dialogWrapper);
    });
});

describe("resizing", function() {
    beforeEach(function() {
        dialog = createWindow({
            width: initialSize,
            height: initialSize,
            position: {
                top: "0",
                left: "0"
            }
        });
    });
    afterEach(function() {
        cleanup();
    });

    it("resizing window out of viewport", function() {
        resize("nw", -10, -10, true);

        assert.equal(parseInt(dialog.wrapper.css("top"), 10), 0);
        assert.equal(parseInt(dialog.wrapper.css("left"), 10), 0);
    });

    it("resizing window updates widget options", function() {
        resize("se", 100, 100);

        assert.equal(dialog.options.width, dialog.wrapper.outerWidth() + "px");
        assert.equal(dialog.options.height, dialog.wrapper.outerHeight() + "px");
    });

    it("resizing window horizontally does not update vertical positioning", function() {
        let initialHeight = dialog.wrapper.outerHeight();

        resize("w", 100, 0);

        assert.equal(dialog.wrapper.outerHeight(), initialHeight);
    });

    it("resizing window vertically does not update horizontal positioning", function() {
        let initialWidth = dialog.wrapper.outerWidth();

        resize("n", 0, 100);

        assert.equal(dialog.wrapper.outerWidth(), initialWidth);
    });
});

describe("integration", function() {
    beforeEach(function() {
        dialog = createWindow();
    });
    afterEach(function() {
        cleanup();
    });

    it("popups are closed when closing window", function() {
        let ddl = $("<input id='ddl' />")
            .appendTo(dialog.element)
            .kendoDropDownList({
                dataSource: ["foo", "bar"],
                animation: false
            })
            .data("kendoDropDownList");

        ddl.open();

        dialog.wrapper.find(".k-window-titlebar").trigger("mousedown");

        assert.isFalse(ddl.popup.visible());
    });
});
