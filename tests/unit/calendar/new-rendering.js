import '@progress/kendo-ui/src/kendo.calendar.js';
import { stub } from '../../helpers/unit/stub.js';

let Calendar = kendo.ui.Calendar;
let div;

describe("kendo.ui.Calendar API", function() {
    beforeEach(function() {

        div = $("<div />").appendTo(Mocha.fixture);
    });
    afterEach(function() {

        kendo.destroy(Mocha.fixture);
    });

    it("calendar header should contain k-calendar-header class when componentType is set to modern", function() {
        let cal = new Calendar(div, {
            componentType: 'modern'
        });

        assert.isTrue(cal.element.find(".k-calendar-header").length > 0);
    });

    it("calendar header should not contain k-calendar-header class when componentType is set to classic", function() {
        let cal = new Calendar(div);

        assert.isTrue(cal.element.find(".k-calendar-header").length === 0);
    });

    it("calendar header should contain four buttons tags when componentType is set to modern", function() {
        let cal = new Calendar(div, {
            componentType: 'modern'
        });

        assert.equal(cal.element.find(".k-calendar-header button").length, 4);
    });

    it("calendar header should contain three anchor tags when componentType is set to classic", function() {
        let cal = new Calendar(div);

        assert.equal(cal.element.find(".k-header span.k-button").length, 3);
    });

    it("calendar header should contain today navigation link", function() {
        let cal = new Calendar(div, {
            componentType: 'modern'
        });

        assert.equal(cal.element.find(".k-calendar-header .k-calendar-nav-today").length, 1);
    });

    it("calendar should not create a footer when componentType is set to modern", function() {
        let cal = new Calendar(div, {
            componentType: 'modern'
        });

        assert.equal(cal.element.find(".k-calendar-footer").length, 0);
    });

    it("calendar should not call _footer when componentType is set to modern and setOptions is called", function() {
        let cal = new Calendar(div, {
            componentType: 'modern'
        });

        let calendarStub = stub(cal, {
            _footer: $.noop
        });

        cal.setOptions({
            value: new Date()
        });

        assert.equal(calendarStub.calls('_footer'), 0);
    });

    it("calendar view element should contain k-calendar-monthview class when componentType is set to classic", function() {
        let cal = new Calendar(div);

        assert.equal(cal.element.find(".k-calendar-monthview").length, 1);
    });

    it("calendar table element should not contain k-calendar-content class when componentType is set to classic", function() {
        let cal = new Calendar(div);

        assert.equal(cal.element.find(".k-calendar-content").length, 0);
    });

    it("calendar should disable today link when todays date is disabled", function() {
        let cal = new Calendar(div, {
            componentType: "modern",
            value: new Date("2/7/2021"),
            dates: [
                new Date(),
            ],
            disableDates: function(date) {
                function compareDates(date, dates) {
                    for (let i = 0; i < dates.length; i++) {
                        if (dates[i].getDate() == date.getDate() &&
                            dates[i].getMonth() == date.getMonth() &&
                            dates[i].getYear() == date.getYear()) {
                            return true;
                        }
                    }
                }
                let dates = div.data("kendoCalendar").options.dates;
                if (date && compareDates(date, dates)) {
                    return true;
                } else {
                    return false;
                }
            }
        });

        assert.isTrue(cal._today.is('.k-disabled'));
    });
});
