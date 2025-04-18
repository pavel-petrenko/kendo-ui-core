import '@progress/kendo-ui/src/kendo.fx.js';

describe("kendo.effects utils", function() {
    let box = kendo.effects.box;
    let transformOrigin = kendo.effects.transformOrigin;
    let fillScale = kendo.effects.fillScale;


    function createElement(top, left, width, height) {
        return $("<div style='width:" + width + "px; height: " + height + "px; position: absolute; top: " + top + "px; left: " + left + "px;'>Div</div>").appendTo(Mocha.fixture);
    }

    it("box returns element offset and dimensions", function() {
        let div = createElement(200, 300, 200, 200);
        let result = box(div);
        assert.equal(result.width, 200);
        assert.equal(result.height, 200);
        assert.equal(result.top, 200);
        assert.equal(result.left, 300);
    });

    it("transformOrigin calculates the center of the element as origin, relative to the outer element", function() {
        let outer = createElement(100, 100, 200, 200);
        let inner = createElement(150, 150, 100, 100);
        let origin = transformOrigin(box(inner), box(outer));
        assert.equal(origin.x, 100);
        assert.equal(origin.y, 100);
    });

    it("transformOrigin offsets the origin correctly, relative to the outer element", function() {
        let outer = createElement(100, 100, 300, 300);
        let inner = createElement(150, 150, 100, 100);
        let origin = transformOrigin(box(inner), box(outer));
        assert.equal(origin.x, 75);
        assert.equal(origin.y, 75);
    });

    it("transformOrigin works if the inner element lies on the outer element side", function() {
        let outer = createElement(100, 100, 300, 300);
        let inner = createElement(100, 150, 100, 100);
        let origin = transformOrigin(box(inner), box(outer));
        assert.equal(origin.x, 75);
        assert.equal(origin.y, 0);
    });

    it("transformOrigin works with same sized elements", function() {
        let outer = createElement(100, 100, 300, 300);
        let origin = kendo.effects.transformOrigin(box(outer), box(outer));
        assert.equal(origin.x, 0);
        assert.equal(origin.y, 0);
    });

    it("fillScale picks the larger scale from the two dimensions", function() {
        let outer = createElement(0, 0, 300, 300);
        let inner = createElement(0, 0, 150, 300);
        assert.equal(fillScale(box(inner), box(outer)), .5);

        outer = createElement(0, 0, 300, 300);
        inner = createElement(0, 0, 300, 150);
        assert.equal(fillScale(box(inner), box(outer)), .5);
    });
});
