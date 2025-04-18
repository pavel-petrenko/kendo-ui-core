import "./kendo.data.js";
import { valueMapperOptions } from "./utils/valueMapper.js";

export const __meta__ = {
    id: "virtuallist",
    name: "VirtualList",
    category: "framework",
    depends: [ "data" ],
    hidden: true
};

(function($, undefined) {
    var kendo = window.kendo,
        ui = kendo.ui,
        encode = kendo.htmlEncode,
        Widget = ui.Widget,
        DataBoundWidget = ui.DataBoundWidget,
        percentageUnitsRegex = /^\d+(\.\d+)?%$/i,
        LIST_CONTENT = "k-list-content k-virtual-content",
        TABLE_CONTENT = "k-table-body k-table-scroller",
        HEADER = "k-list-group-sticky-header",
        LIST_ITEM = "k-list-item",
        TABLE_ITEM = "k-table-row",
        HEIGHTCONTAINER = "k-height-container",
        GROUPITEM = "k-list-item-group-label",
        LIST_UL = "k-list-ul",
        TABLE_LIST = "k-table-list",

        SELECTED = "k-selected",
        FOCUSED = "k-focus",
        HOVER = "k-hover",
        CHANGE = "change",
        CLICK = "click",
        LISTBOUND = "listBound",
        ITEMCHANGE = "itemChange",

        ACTIVATE = "activate",
        DEACTIVATE = "deactivate",

        GROUP_ROW_SEL = ".k-table-group-row",

        VIRTUAL_LIST_NS = ".VirtualList";

    function lastFrom(array) {
        return array[array.length - 1];
    }

    function toArray(value) {
        return value instanceof Array ? value : [value];
    }

    function isPrimitive(dataItem) {
        return typeof dataItem === "string" || typeof dataItem === "number" || typeof dataItem === "boolean";
    }

    function getItemCount(screenHeight, listScreens, itemHeight) {
        return Math.ceil(screenHeight * listScreens / itemHeight);
    }

    function appendChild(parent, className, tagName) {
        var element = document.createElement(tagName || "div");
        if (className) {
            element.className = className;
        }
        parent.appendChild(element);

        return element;
    }

    function getDefaultItemHeight(listSize) {
        var mockList = $('<div class="k-list ' + listSize + ' k-virtual-list">' +
                '<div class="k-list-content k-virtual-content">' +
                    '<ul class="k-list-ul">' +
                        '<li class="k-list-item">' +
                            '<span class="k-list-item-text">test</span>' +
                        '</li>' +
                    '</ul>' +
                '</div>' +
            '</div>');
        var lineHeight;

        mockList.css({
            position: "absolute",
            left: "-200000px",
            visibility: "hidden"
        });
        mockList.appendTo(document.body);
        lineHeight = parseFloat(kendo.getComputedStyles(mockList.find(".k-list-item")[0], ["height"]).height);
        mockList.remove();

        return lineHeight;
    }

    function bufferSizes(screenHeight, listScreens, opposite) { //in pixels
        return {
            down: screenHeight * opposite,
            up: screenHeight * (listScreens - 1 - opposite)
        };
    }

    function listValidator(options, screenHeight) {
        var downThreshold = (options.listScreens - 1 - options.threshold) * screenHeight;
        var upThreshold = options.threshold * screenHeight;

        return function(list, scrollTop, lastScrollTop) {
            if (scrollTop > lastScrollTop) {
                return scrollTop - list.top < downThreshold;
            } else {
                return list.top === 0 || scrollTop - list.top > upThreshold;
            }
        };
    }

    function scrollCallback(element, callback) {
        return function(force) {
            return callback(element.scrollTop, force);
        };
    }

    function syncList(reorder) {
        return function(list, force) {
            reorder(list.items, list.index, force);
            return list;
        };
    }

    function position(element, y) {
        element.style.webkitTransform = 'translateY(' + y + "px)";
        element.style.transform = 'translateY(' + y + "px)";
    }

    function map2(callback, templates) {
        return function(arr1, arr2) {
            for (var i = 0, len = arr1.length; i < len; i++) {
                callback(arr1[i], arr2[i], templates);
                if (arr2[i].item) {
                    this.trigger(ITEMCHANGE, { item: $(arr1[i]), data: arr2[i].item, ns: kendo.ui });
                }
            }
        };
    }

    function reshift(items, diff) {
        var range;

        if (diff > 0) { // down
            range = items.splice(0, diff);
            items.push.apply(items, range);
        } else { // up
            range = items.splice(diff, -diff);
            items.unshift.apply(items, range);
        }

        return range;
    }

    function render(element, data, templates) {
        var itemTemplate = templates.template,
            hasColumns = this.options.columns && this.options.columns.length,
            altRow = data.index % 2 === 1 ? "k-table-alt-row" : "";

        element = $(element);

        if (!data.item) {
            itemTemplate = templates.placeholderTemplate;
        }

        if (data.index === 0 && this.header && data.group) {
            this.header.html(templates.fixedGroupTemplate(data.group));
        }

        element
            .attr("data-uid", data.item ? data.item.uid : "")
            .attr("data-offset-index", data.index);

        if (hasColumns && data.item) {
            if (altRow.length > 0) {
                element.addClass(altRow);
            } else {
                element.removeClass("k-table-alt-row");
            }

            let renderedColumns = $(renderColumns(this.options, data.item, templates));
            kendo.applyStylesFromKendoAttributes(renderedColumns, ["width", "max-width"]);
            element.empty().append(renderedColumns);
        } else {
            element.find("." + GROUPITEM).remove();
            element.find(".k-list-item-text").html(itemTemplate(data.item || {}));
        }

        element.toggleClass(FOCUSED, data.current);
        element.toggleClass(SELECTED, data.selected);
        element.toggleClass("k-first", data.newGroup);
        element.toggleClass("k-last", data.isLastGroupedItem);
        element.toggleClass("k-loading-item", !data.item);

        if (data.index !== 0 && data.newGroup) {
            if (hasColumns) {
                $('<span class="k-table-td k-table-group-td"><span>' + templates.groupTemplate(data.group) + '</span></span>')
                    .appendTo(element);
            } else {
                $("<div class=" + GROUPITEM + "></div>")
                    .appendTo(element)
                    .html(templates.groupTemplate(data.group));
            }
        } else if (data.group && hasColumns) {
            element.append($('<span class="k-table-td k-table-spacer-td"></span>'));
        }

        if (data.top !== undefined) {
            position(element[0], data.top);
        }
    }

    function renderColumns(options, dataItem, templates) {
        var item = "";

        for (var i = 0; i < options.columns.length; i++) {
            var currentWidth = options.columns[i].width;
            var currentWidthInt = parseInt(currentWidth, 10);
            var widthStyle = '';

            if (currentWidth) {
                let widthValue = `${currentWidthInt}${percentageUnitsRegex.test(currentWidth) ? "%" : "px"}`;
                widthStyle = `${kendo.attr("style-width")}="${widthValue}" ${kendo.attr("style-max-width")}="${widthValue}"`;
            }

            item += "<span class='k-table-td' " + widthStyle + ">";
            item += templates["column" + i](dataItem);
            item += "</span>";
        }

        return item;
    }

    function mapChangedItems(selected, itemsToMatch) {
        var itemsLength = itemsToMatch.length;
        var selectedLength = selected.length;
        var dataItem;
        var found;
        var i, j;

        var changed = [];
        var unchanged = [];

        if (selectedLength) {
            for (i = 0; i < selectedLength; i++) {
                dataItem = selected[i];
                found = false;

                for (j = 0; j < itemsLength; j++) {
                    if (dataItem === itemsToMatch[j]) {
                        found = true;
                        changed.push({ index: i, item: dataItem });
                        break;
                    }
                }

                if (!found) {
                    unchanged.push(dataItem);
                }
            }
        }

        return {
            changed: changed,
            unchanged: unchanged
        };
    }

    function isActivePromise(promise) {
        return promise && promise.state() !== "resolved";
    }

    var VirtualList = DataBoundWidget.extend({
        init: function(element, options) {
            var that = this,
                contentClasses = options.columns && options.columns.length ? TABLE_CONTENT : LIST_CONTENT;

            that.bound(false);
            that._fetching = false;

            Widget.fn.init.call(that, element, options);

            if (!that.options.itemHeight) {
                that.options.itemHeight = getDefaultItemHeight(options.listSize);
            }

            options = that.options;

            that.element.attr("role", "listbox");

            var contentSelector = "." + contentClasses.split(' ').join('.');
            var wrapper = that.element.closest(contentSelector);

            that.content = that.wrapper = wrapper.length ? wrapper : that.element.wrap("<div unselectable='on' class='" + contentClasses + "'></div>").parent();

            if (that.options.columns && that.options.columns.length) {
                var thead = that.element.closest(".k-data-table").find('.k-table-thead');
                var row = $('<tr class="k-table-group-row">' +
                    '<th class="k-table-th" colspan="' + that.options.columns.length + '"></th>' +
                '</tr>');

                thead.append(row);

                that.header = row.find(".k-table-th");
                that.element.addClass(TABLE_LIST + " k-virtual-table");
            } else {
                that.header = that.content.before("<div class='" + HEADER + "'></div>").prev();
                that.element.addClass(LIST_UL);
            }

            if (options.ariaLabel) {
                this.element.attr("aria-label", options.ariaLabel);
            } else if (options.ariaLabelledBy) {
                this.element.attr("aria-labelledby", options.ariaLabelledBy);
            }

            that.element.on("mouseenter" + VIRTUAL_LIST_NS, "li:not(.k-loading-item)", function() { $(this).addClass(HOVER); })
                        .on("mouseleave" + VIRTUAL_LIST_NS, "li", function() { $(this).removeClass(HOVER); });

            that._values = toArray(that.options.value);
            that._selectedDataItems = [];
            that._selectedIndexes = [];
            that._rangesList = {};
            that._promisesList = [];
            that._optionID = kendo.guid();

            that._templates();

            that.setDataSource(options.dataSource);

            that.content.on("scroll" + VIRTUAL_LIST_NS, kendo.throttle(function() {
                that._renderItems();
                that._triggerListBound();
            }, options.delay));

            that._selectable();
        },

        options: {
            name: "VirtualList",
            autoBind: true,
            delay: 100,
            height: null,
            listScreens: 4,
            threshold: 0.5,
            itemHeight: null,
            oppositeBuffer: 1,
            type: "flat",
            selectable: false,
            value: [],
            dataValueField: null,
            template: (data) => encode(data),
            placeholderTemplate: () => "loading...",
            groupTemplate: (data) => encode(data),
            fixedGroupTemplate: (data) => encode(data),
            mapValueTo: "index",
            valueMapper: null,
            ariaLabel: null,
            ariaLabelledBy: null
        },

        events: [
            CHANGE,
            CLICK,
            LISTBOUND,
            ITEMCHANGE,
            ACTIVATE,
            DEACTIVATE
        ],

        setOptions: function(options) {
            var itemClass = this.options.columns && this.options.columns.length ? TABLE_ITEM : LIST_ITEM;

            Widget.fn.setOptions.call(this, options);

            if (this._selectProxy && this.options.selectable === false) {
                this.element.off(CLICK, "." + itemClass, this._selectProxy);
            } else if (!this._selectProxy && this.options.selectable) {
                this._selectable();
            }

            this._templates();
            this.refresh();
        },

        items: function() {
            return $(this._items);
        },

        destroy: function() {
            this.wrapper.off(VIRTUAL_LIST_NS);
            this.dataSource.unbind(CHANGE, this._refreshHandler);
            Widget.fn.destroy.call(this);
        },

        setDataSource: function(source) {
            var that = this;
            var dataSource = source || {};
            var value;

            dataSource = Array.isArray(dataSource) ? { data: dataSource } : dataSource;
            dataSource = kendo.data.DataSource.create(dataSource);

            if (that.dataSource) {
                that.dataSource.unbind(CHANGE, that._refreshHandler);

                that._clean();
                that.bound(false);

                that._deferValueSet = true;
                value = that.value();

                that.value([]);
                that.mute(function() {
                    that.value(value);
                });
            } else {
                that._refreshHandler = that.refresh.bind(that);
            }

            that.dataSource = dataSource.bind(CHANGE, that._refreshHandler);

            that.setDSFilter(dataSource.filter());

            if (dataSource.view().length !== 0) {
                that.refresh();
            } else if (that.options.autoBind) {
                dataSource.fetch();
            }
        },

        skip: function() {
            return this.dataSource.currentRangeStart();
        },

        _triggerListBound: function() {
            var that = this;
            var skip = that.skip();

            if (that.bound() && !that._selectingValue && that._skip !== skip) {
                that._skip = skip;
                that.trigger(LISTBOUND);
            }
        },

        _getValues: function(dataItems) {
            var getter = this._valueGetter;

            return $.map(dataItems, function(dataItem) {
                return getter(dataItem);
            });
        },

        _highlightSelectedItems: function() {
            for (var i = 0; i < this._selectedDataItems.length; i++) {
                var item = this._getElementByDataItem(this._selectedDataItems[i]);
                if (item.length) {
                    item.addClass(SELECTED);
                }
            }
        },

        refresh: function(e) {
            var that = this;
            var action = e && e.action;
            var isItemChange = action === "itemchange";
            var filtered = this.isFiltered();
            var result;

            if (that._mute) { return; }

            that._deferValueSet = false;

            if (!that._fetching) {
                if (filtered) {
                    that.focus(0);
                }

                that._createList();
                if (!action && that._values.length && !filtered &&
                     !that.options.skipUpdateOnBind && !that._emptySearch) {
                    that._selectingValue = true;

                    that.bound(true);
                    that.value(that._values, true).done(function() {
                        that._selectingValue = false;
                        that._triggerListBound();
                    });
                } else {
                    that.bound(true);
                    that._highlightSelectedItems();
                    that._triggerListBound();
                }
            } else {
                if (that._renderItems) {
                    that._renderItems(true);
                }

                that._triggerListBound();
            }

            if (isItemChange || action === "remove") {
                result = mapChangedItems(that._selectedDataItems, e.items);
                if (result.changed.length) {
                    if (isItemChange) {
                        that.trigger("selectedItemChange", {
                            items: result.changed
                        });
                    } else {
                        that.value(that._getValues(result.unchanged));
                    }
                }
            }

            that._fetching = false;
        },

        removeAt: function(position) {
            var value = this._values.splice(position, 1)[0];

            return {
                position: position,
                dataItem: this._removeSelectedDataItem(value)
            };
        },

        _removeSelectedDataItem: function(value) {
            var that = this,
                valueGetter = that._valueGetter;

            for (var idx in that._selectedDataItems) {
                if (valueGetter(that._selectedDataItems[idx]) === value) {
                    that._selectedIndexes.splice(idx, 1);
                    return that._selectedDataItems.splice(idx, 1)[0];
                }
            }
        },

        setValue: function(value) {
            this._values = toArray(value);
        },

        value: function(value, _forcePrefetch) {
            var that = this;

            if (value === undefined) {
                return that._values.slice();
            }

            if (value === null) {
                value = [];
            }

            value = toArray(value);

            if (!that._valueDeferred || that._valueDeferred.state() === "resolved") {
                that._valueDeferred = $.Deferred();
            }

            var shouldClear = that.options.selectable === "multiple" && that.select().length && value.length;

            if (shouldClear || !value.length) {
                that.select(-1);
            }

            that._values = value;

            if ((that.bound() && !that._mute && !that._deferValueSet) || _forcePrefetch) {
                that._prefetchByValue(value);
            }

            return that._valueDeferred;
        },

        _checkValuesOrder: function(value) {
            if (this._removedAddedIndexes &&
                this._removedAddedIndexes.length === value.length) {
                    var newValue = this._removedAddedIndexes.slice();
                    this._removedAddedIndexes = null;
                return newValue;
            }

            return value;
        },

        _prefetchByValue: function(value) {
            var that = this,
                dataView = that._dataView,
                valueGetter = that._valueGetter,
                mapValueTo = that.options.mapValueTo,
                item, match = false,
                forSelection = [];

            //try to find the items in the loaded data
            for (var i = 0; i < value.length; i++) {
                for (var idx = 0; idx < dataView.length; idx++) {
                    item = dataView[idx].item;
                    if (item) {
                        match = isPrimitive(item) ? value[i] === item : value[i] === valueGetter(item);

                        if (match) {
                            forSelection.push(dataView[idx].index);
                        }
                    }
                }
            }

            if (forSelection.length === value.length) {
                that._values = [];
                that.select(forSelection);
                return;
            }

            //prefetch the items
            if (typeof that.options.valueMapper === "function") {
                const callback = mapValueTo === 'index' ? that.mapValueToIndex : that.mapValueToDataItem;
                that.options.valueMapper(valueMapperOptions(this.options, value, callback.bind(that)));
            } else {
                 if (!that.value()[0]) {
                     that.select([-1]);
                 } else {
                    that._selectingValue = false;
                    that._triggerListBound();
                 }
            }
        },

        mapValueToIndex: function(indexes) {
            if (indexes === undefined || indexes === -1 || indexes === null) {
                indexes = [];
            } else {
                indexes = toArray(indexes);
            }

            if (!indexes.length) {
                indexes = [-1];
            } else {
                var removed = this._deselect([]).removed;
                if (removed.length) {
                    this._triggerChange(removed, []);
                }
            }

            this.select(indexes);
        },

        mapValueToDataItem: function(dataItems) {
            var removed, added;

            if (dataItems === undefined || dataItems === null) {
                dataItems = [];
            } else {
                dataItems = toArray(dataItems);
            }

            if (!dataItems.length) {
                this.select([-1]);
            } else {
                removed = $.map(this._selectedDataItems, function(item, index) {
                    return { index: index, dataItem: item };
                });

                added = $.map(dataItems, function(item, index) {
                    return { index: index, dataItem: item };
                });

                this._selectedDataItems = dataItems;

                this._selectedIndexes = [];

                for (var i = 0; i < this._selectedDataItems.length; i++) {
                    var item = this._getElementByDataItem(this._selectedDataItems[i]);
                    this._selectedIndexes.push(this._getIndecies(item)[0]);
                    item.addClass(SELECTED);
                }

                this._triggerChange(removed, added);

                if (this._valueDeferred) {
                    this._valueDeferred.resolve();
                }
            }
        },

        deferredRange: function(index) {
            var dataSource = this.dataSource;
            var take = this.itemCount;
            var ranges = this._rangesList;
            var result = $.Deferred();
            var defs = [];

            var low = Math.floor(index / take) * take;
            var high = Math.ceil(index / take) * take;

            var pages = high === low ? [ high ] : [ low, high ];

            $.each(pages, function(_, skip) {
                var end = skip + take;
                var existingRange = ranges[skip];
                var deferred;

                if (!existingRange || (existingRange.end !== end)) {
                    deferred = $.Deferred();
                    ranges[skip] = { end: end, deferred: deferred };

                    dataSource._multiplePrefetch(skip, take, function() {
                        deferred.resolve();
                    });
                } else {
                    deferred = existingRange.deferred;
                }

                defs.push(deferred);
            });

            $.when.apply($, defs).done(function() {
                result.resolve();
            });

            return result;
        },

        prefetch: function(indexes) {
            var that = this,
                take = this.itemCount,
                isEmptyList = !that._promisesList.length;

            if (!isActivePromise(that._activeDeferred)) {
                that._activeDeferred = $.Deferred();
                that._promisesList = [];
            }

            $.each(indexes, function(_, index) {
                that._promisesList.push(that.deferredRange(that._getSkip(index, take)));
            });

            if (isEmptyList) {
                $.when.apply($, that._promisesList).done(function() {
                    that._promisesList = [];
                    that._activeDeferred.resolve();
                });
            }

            return that._activeDeferred;
        },

        _findDataItem: function(view, index) {
            var group;

            //find in grouped view
            if (this.options.type === "group") {
                for (var i = 0; i < view.length; i++) {
                    group = view[i].items;
                    if (group.length <= index) {
                        index = index - group.length;
                    } else {
                        return group[index];
                    }
                }
            }

            //find in flat view
            return view[index];
        },

        _getRange: function(skip, take) {
            return this.dataSource._findRange(skip, Math.min(skip + take, this.dataSource.total()));
        },

        dataItemByIndex: function(index) {
            var that = this;
            var take = that.itemCount;
            var skip = that._getSkip(index, take);
            var view = this._getRange(skip, take);

            //should not return item if data is not loaded
            if (!that._getRange(skip, take).length) {
                return null;
            }

            if (that.options.type === "group") {
                kendo.ui.progress($(that.wrapper), true);
                that.mute(function() {
                    that.dataSource.range(skip, take, function() {
                        kendo.ui.progress($(that.wrapper), false);
                    });
                    view = that.dataSource.view();
                });
            }

            return that._findDataItem(view, [index - skip]);
        },

        selectedDataItems: function() {
            return this._selectedDataItems.slice();
        },

        scrollWith: function(value) {
            this.content.scrollTop(this.content.scrollTop() + value);
        },

        scrollTo: function(y) {
            this.content.scrollTop(y); //works only if the element is visible
        },

        scrollToIndex: function(index) {
            this.scrollTo(index * this.options.itemHeight);
        },

        focus: function(candidate) {
            var element,
                index,
                data,
                current,
                itemHeight = this.options.itemHeight,
                id = this._optionID,
                triggerEvent = true;

            if (candidate === undefined) {
                current = this.element.find("." + FOCUSED);
                return current.length ? current : null;
            }

            if (typeof candidate === "function") {
                data = this.dataSource.flatView();
                for (var idx = 0; idx < data.length; idx++) {
                    if (candidate(data[idx])) {
                        candidate = idx;
                        break;
                    }
                }
            }

            if (candidate instanceof Array) {
                candidate = lastFrom(candidate);
            }

            if (isNaN(candidate)) {
                element = $(candidate);
                index = parseInt($(element).attr("data-offset-index"), 10);
            } else {
                index = candidate;
                element = this._getElementByIndex(index);
            }

            if (index === -1) {
                this.element.find("." + FOCUSED).removeClass(FOCUSED);
                this._focusedIndex = undefined;
                return;
            }

            if (element.length) { /*focus rendered item*/
                if (element.hasClass(FOCUSED)) {
                    triggerEvent = false;
                }
                if (this._focusedIndex !== undefined) {
                    current = this._getElementByIndex(this._focusedIndex);
                    current
                        .removeClass(FOCUSED)
                        .removeAttr("id");

                    if (triggerEvent) {
                        this.trigger(DEACTIVATE);
                    }
                }

                this._focusedIndex = index;

                element
                    .addClass(FOCUSED)
                    .attr("id", id);

                var position = this._getElementLocation(index);

                if (position === "top") {
                    this.scrollTo(index * itemHeight);
                } else if (position === "bottom") {
                    this.scrollTo((index * itemHeight + itemHeight) - this._screenHeight);
                } else if (position === "outScreen") {
                    this.scrollTo(index * itemHeight);
                }

                if (triggerEvent) {
                    this.trigger(ACTIVATE);
                }
            } else { /*focus non rendered item*/
                this._focusedIndex = index;
                this.items().removeClass(FOCUSED);
                this.scrollToIndex(index);
            }
        },

        focusIndex: function() {
            return this._focusedIndex;
        },

        focusFirst: function() {
            this.scrollTo(0);
            this.focus(0);
        },

        focusLast: function() {
            var lastIndex = this.dataSource.total();
            this.scrollTo(this.heightContainer.offsetHeight);
            this.focus(lastIndex - 1);
        },

        focusPrev: function() {
            var index = this._focusedIndex;
            var current;

            if (!isNaN(index) && index > 0) {
                index -= 1;
                this.focus(index);

                current = this.focus();
                if (current && current.hasClass("k-loading-item")) {
                    index += 1;
                    this.focus(index);
                }

                return index;
            } else {
                index = this.dataSource.total() - 1;
                this.focus(index);
                return index;
            }
        },

        focusNext: function() {
            var index = this._focusedIndex;
            var lastIndex = this.dataSource.total() - 1;
            var current;

            if (!isNaN(index) && index < lastIndex) {
                index += 1;
                this.focus(index);

                current = this.focus();
                if (current && current.hasClass("k-loading-item")) {
                    index -= 1;
                    this.focus(index);
                }

                return index;
            } else {
                index = 0;
                this.focus(index);
                return index;
            }
        },

        _triggerChange: function(removed, added) {
            removed = removed || [];
            added = added || [];

            if (removed.length || added.length) {
                 this.trigger(CHANGE, {
                    removed: removed,
                    added: added
                });
            }
        },

        select: function(candidate) {
            var that = this,
                indices,
                initialIndices,
                singleSelection = that.options.selectable !== "multiple",
                prefetchStarted = isActivePromise(that._activeDeferred),
                filtered = this.isFiltered(),
                isAlreadySelected,
                deferred,
                result,
                removed = [];

            if (candidate === undefined) {
                return that._selectedIndexes.slice();
            }

            if (!that._selectDeferred || that._selectDeferred.state() === "resolved") {
                that._selectDeferred = $.Deferred();
            }

            indices = that._getIndecies(candidate);
            isAlreadySelected = singleSelection && !filtered && lastFrom(indices) === lastFrom(this._selectedIndexes);
            removed = that._deselectCurrentValues(indices);

            if (removed.length || !indices.length || isAlreadySelected) {
                that._triggerChange(removed);

                if (that._valueDeferred) {
                    that._valueDeferred.resolve().promise();
                }

                return that._selectDeferred.resolve().promise();
            }

            if (indices.length === 1 && indices[0] === -1) {
                indices = [];
            }

            initialIndices = indices;
            result = that._deselect(indices);
            removed = result.removed;
            indices = result.indices;

            if (singleSelection) {
                prefetchStarted = false;
                if (indices.length) {
                    indices = [lastFrom(indices)];
                }
            }

            var done = function() {
                var added = that._select(indices);

                if (initialIndices.length === indices.length || singleSelection) {
                    that.focus(indices);
                }

                that._triggerChange(removed, added);

                if (that._valueDeferred) {
                    that._valueDeferred.resolve();
                }

                that._selectDeferred.resolve();
            };

            deferred = that.prefetch(indices);

            if (!prefetchStarted) {
                if (deferred) {
                    deferred.done(done);
                } else {
                    done();
                }
            }

            return that._selectDeferred.promise();
        },

        bound: function(bound) {
            if (bound === undefined) {
                return this._listCreated;
            }

            this._listCreated = bound;
        },

        mute: function(callback) {
            this._mute = true;
            callback();
            this._mute = false;
        },

        setDSFilter: function(filter) {
            this._lastDSFilter = $.extend({}, filter);
        },

        isFiltered: function() {
            if (!this._lastDSFilter) {
                this.setDSFilter(this.dataSource.filter());
            }

            return !kendo.data.Query.compareFilters(this.dataSource.filter(), this._lastDSFilter);
        },

        skipUpdate: $.noop,

        _getElementByIndex: function(index) {
            return this.items().filter(function(idx, element) {
                return index === parseInt($(element).attr("data-offset-index"), 10);
            });
        },

        _getElementByDataItem: function(dataItem) {
            var dataView = this._dataView,
            valueGetter = this._valueGetter,
                element, match;

            for (var i = 0; i < dataView.length; i++) {
                match = dataView[i].item && isPrimitive(dataView[i].item) ? dataView[i].item === dataItem : dataView[i].item && dataItem && valueGetter(dataView[i].item) == valueGetter(dataItem);
                if (match) {
                    element = dataView[i];
                    break;
                }
            }

            return element ? this._getElementByIndex(element.index) : $();
        },

        _clean: function() {
            this.result = undefined;
            this._lastScrollTop = undefined;
            this._skip = undefined;
            $(this.heightContainer).remove();
            this.heightContainer = undefined;
            this.element.empty();
        },

        _height: function() {
            var hasData = !!this.dataSource.view().length,
                height = this.options.height,
                itemHeight = this.options.itemHeight,
                total = this.dataSource.total();

            if (!hasData) {
                height = 0;
            } else if (height / itemHeight > total) {
                height = total * itemHeight;
            }

            return height;
        },

        setScreenHeight: function() {
            var height = this._height();

            this.content.height(height);
            this._screenHeight = height;
        },

        screenHeight: function() {
            return this._screenHeight;
        },

        _getElementLocation: function(index) {
            var scrollTop = this.content.scrollTop(),
                screenHeight = this._screenHeight,
                itemHeight = this.options.itemHeight,
                yPosition = index * itemHeight,
                yDownPostion = yPosition + itemHeight,
                screenEnd = scrollTop + screenHeight,
                position;

            if (yPosition === (scrollTop - itemHeight) || (yDownPostion > scrollTop && yPosition < scrollTop)) {
                position = "top";
            } else if (yPosition === screenEnd || (yPosition < screenEnd && screenEnd < yDownPostion)) {
                position = "bottom";
            } else if ((yPosition >= scrollTop) && (yPosition <= scrollTop + (screenHeight - itemHeight))) {
                position = "inScreen";
            } else {
                position = "outScreen";
            }

            return position;
        },

        _templates: function() {
            var options = this.options;
            var templates = {
                template: options.template,
                placeholderTemplate: options.placeholderTemplate,
                groupTemplate: options.groupTemplate,
                fixedGroupTemplate: options.fixedGroupTemplate
            };

            if (options.columns) {
                options.columns.forEach((column, i) => {
                    var templateText = column.field ? column.field.toString() : "text";
                    var templateFunc = data => encode(kendo.getter(templateText)(data));

                    templates["column" + i] = column.template || templateFunc;
                });
            }

            for (var key in templates) {
                if (typeof templates[key] !== "function") {
                    templates[key] = kendo.template(templates[key] || "");
                }
            }

            this.templates = templates;
        },

        _generateItems: function(element, count) {
            var items = [],
                item, text,
                itemHeight = this.options.itemHeight + "px",
                itemClass = this.options.columns && this.options.columns.length ? TABLE_ITEM : LIST_ITEM;

            while (count-- > 0) {
                text = document.createElement("span");
                text.className = "k-list-item-text";

                item = document.createElement("li");
                item.tabIndex = -1;
                item.className = itemClass;
                item.setAttribute("role", "option");
                item.style.height = itemHeight;
                item.style.minHeight = itemHeight;
                item.appendChild(text);

                element.appendChild(item);

                items.push(item);
            }

            return items;
        },

        _saveInitialRanges: function() {
            var ranges = this.dataSource._ranges;
            var deferred = $.Deferred();
            deferred.resolve();

            this._rangesList = {};
            for (var i = 0; i < ranges.length; i++) {
                this._rangesList[ranges[i].start] = { end: ranges[i].end, deferred: deferred };
            }
        },

        _createList: function() {
            var that = this,
                content = that.content.get(0),
                options = that.options,
                dataSource = that.dataSource;

            if (that.bound()) {
                that._clean();
            }

            that._saveInitialRanges();
            that._buildValueGetter();
            that.setScreenHeight();
            that.itemCount = getItemCount(that._screenHeight, options.listScreens, options.itemHeight);

            if (that.itemCount > dataSource.total()) {
                that.itemCount = dataSource.total();
            }

            that._items = that._generateItems(that.element[0], that.itemCount);

            that._setHeight(options.itemHeight * dataSource.total());
            that.options.type = (dataSource.group() || []).length ? "group" : "flat";

            if (that.options.type === "flat") {
                if (that.header.closest(GROUP_ROW_SEL).length) {
                    that.header.closest(GROUP_ROW_SEL).hide();
                } else {
                    that.header.hide();
                }
            } else {
                if (that.header.closest(GROUP_ROW_SEL).length) {
                    that.header.closest(GROUP_ROW_SEL).show();
                } else {
                    that.header.show();
                }
            }

            that.getter = that._getter(function() {
                that._renderItems(true);
            });

            that._onScroll = function(scrollTop, force) {
                var getList = that._listItems(that.getter);
                return that._fixedHeader(scrollTop, getList(scrollTop, force));
            };

            that._renderItems = that._whenChanged(
                scrollCallback(content, that._onScroll),
                syncList(that._reorderList(that._items, render.bind(that)))
            );

            that._renderItems();
            that._calculateGroupPadding(that._screenHeight);
            that._calculateColumnsHeaderPadding();
        },

        _setHeight: function(height) {
            var currentHeight,
                heightContainer = this.heightContainer;

            if (!heightContainer) {
                heightContainer = this.heightContainer = appendChild(this.content[0], HEIGHTCONTAINER);
            } else {
                currentHeight = heightContainer.offsetHeight;
            }

            if (height !== currentHeight) {
                heightContainer.innerHTML = "";

                while (height > 0) {
                    var padHeight = Math.min(height, 250000); //IE workaround, should not create elements with height larger than 250000px
                    appendChild(heightContainer).style.height = padHeight + "px";
                    height -= padHeight;
                }
            }
        },

        _getter: function() {
            var lastRequestedRange = null,
                dataSource = this.dataSource,
                lastRangeStart = dataSource.skip(),
                type = this.options.type,
                pageSize = this.itemCount,
                flatGroups = {};

            if (dataSource.pageSize() < pageSize) {
                this.mute(function() {
                    dataSource.pageSize(pageSize);
                });
            }

            return function(index, rangeStart) {
                var that = this;
                if (!dataSource.inRange(rangeStart, pageSize)) {
                    if (lastRequestedRange !== rangeStart) {
                        lastRequestedRange = rangeStart;
                        lastRangeStart = rangeStart;

                        if (that._getterDeferred) {
                            that._getterDeferred.reject();
                        }

                        that._getterDeferred = that.deferredRange(rangeStart);
                        that._getterDeferred.then(function() {
                            var firstItemIndex = that._indexConstraint(that.content[0].scrollTop);

                            that._getterDeferred = null;

                            if (rangeStart <= firstItemIndex && firstItemIndex <= (rangeStart + pageSize)) {
                                that._fetching = true;
                                dataSource.range(rangeStart, pageSize);
                            }
                        });
                    }

                    return null;
                } else {
                    if (lastRangeStart !== rangeStart) {
                        this.mute(function() {
                            dataSource.range(rangeStart, pageSize);
                            lastRangeStart = rangeStart;
                        });
                    }

                    var result;
                    if (type === "group") { //grouped list
                        if (!flatGroups[rangeStart]) {
                            var flatGroup = flatGroups[rangeStart] = [];
                            var groups = dataSource.view();
                            for (var i = 0, len = groups.length; i < len; i++) {
                                var group = groups[i];
                                for (var j = 0, groupLength = group.items.length; j < groupLength; j++) {
                                    flatGroup.push({ item: group.items[j], group: group.value });
                                }
                            }
                        }

                        result = flatGroups[rangeStart][index - rangeStart];
                    } else { //flat list
                        result = dataSource.view()[index - rangeStart];
                    }

                    return result;
                }
            };
        },

        _fixedHeader: function(scrollTop, list) {
            var group = this.currentVisibleGroup,
                itemHeight = this.options.itemHeight,
                firstVisibleDataItemIndex = Math.floor((scrollTop - list.top) / itemHeight),
                firstVisibleDataItem = list.items[firstVisibleDataItemIndex];

            if (firstVisibleDataItem && firstVisibleDataItem.item) {
                var firstVisibleGroup = firstVisibleDataItem.group;

                if (firstVisibleGroup !== group) {
                    var fixedGroupText = firstVisibleGroup || "";
                    this.header.html(this.templates.fixedGroupTemplate(fixedGroupText));
                    this.currentVisibleGroup = firstVisibleGroup;
                }
            }

            return list;
        },

        _itemMapper: function(item, index, value) {
            var listType = this.options.type,
                itemHeight = this.options.itemHeight,
                currentIndex = this._focusedIndex,
                selected = false,
                current = false,
                newGroup = false,
                group = null,
                match = false,
                valueGetter = this._valueGetter;

            if (listType === "group") {
                if (item) {
                    newGroup = index === 0 || (this._currentGroup !== false && this._currentGroup !== item.group);
                    this._currentGroup = item.group;
                }

                group = item ? item.group : null;
                item = item ? item.item : null;
            }

            if (this.options.mapValueTo === "dataItem" && this._selectedDataItems.length && item) {
                for (var i = 0; i < this._selectedDataItems.length; i++) {
                    match = valueGetter(this._selectedDataItems[i]) === valueGetter(item);
                    if (match) {
                        selected = true;
                        break;
                    }
                }
            } else if (!this.isFiltered() && value.length && item) {
                for (var j = 0; j < value.length; j++) {
                    match = isPrimitive(item) ? value[j] === item : value[j] === valueGetter(item);
                    if (match) {
                        value.splice(j , 1);
                        selected = true;
                        break;
                    }
                }
            }

            if (currentIndex === index) {
                current = true;
            }

            return {
                item: item ? item : null,
                group: group,
                newGroup: newGroup,
                selected: selected,
                current: current,
                index: index,
                top: index * itemHeight
            };
        },

        _range: function(index) {
            var itemCount = this.itemCount,
                value = this._values.slice(),
                items = [],
                item;

            this._view = {};
            this._currentGroup = false;

            for (var i = index, length = index + itemCount; i < length; i++) {
                item = this._itemMapper(this.getter(i, index), i, value);
                if (items[items.length - 1]) {
                    items[items.length - 1].isLastGroupedItem = item.newGroup;
                }
                items.push(item);
                this._view[item.index] = item;
            }

            this._dataView = items;
            return items;
        },

        _getDataItemsCollection: function(scrollTop, lastScrollTop) {
            var items = this._range(this._listIndex(scrollTop, lastScrollTop));
            return {
                index: items.length ? items[0].index : 0,
                top: items.length ? items[0].top : 0,
                items: items
            };
        },

        _listItems: function() {
            var screenHeight = this._screenHeight,
                options = this.options;

            var theValidator = listValidator(options, screenHeight);

            return (function(value, force) {
                var result = this.result,
                    lastScrollTop = this._lastScrollTop;

                if (force || !result || !theValidator(result, value, lastScrollTop)) {
                    result = this._getDataItemsCollection(value, lastScrollTop);
                }

                this._lastScrollTop = value;
                this.result = result;

                return result;
            }).bind(this);
        },

        _whenChanged: function(getter, callback) {
            var current;

            return function(force) {
                var theNew = getter(force);

                if (theNew !== current) {
                    current = theNew;
                    callback(theNew, force);
                }
            };
        },

        _reorderList: function(list, reorder) {
            var that = this;
            var length = list.length;
            var currentOffset = -Infinity;
            reorder = map2(reorder, this.templates).bind(this);

            return function(list2, offset, force) {
                var diff = offset - currentOffset;
                var range, range2;

                if (force || Math.abs(diff) >= length) { // full reorder
                    range = list;
                    range2 = list2;
                } else { // partial reorder
                    range = reshift(list, diff);
                    range2 = diff > 0 ? list2.slice(-diff) : list2.slice(0, -diff);
                }

                reorder(range, range2, that.bound());

                currentOffset = offset;
            };
        },

        _bufferSizes: function() {
            var options = this.options;

            return bufferSizes(this._screenHeight, options.listScreens, options.oppositeBuffer);
        },

        _indexConstraint: function(position) {
            var itemCount = this.itemCount,
                itemHeight = this.options.itemHeight,
                total = this.dataSource.total();

            return Math.min(Math.max(total - itemCount, 0), Math.max(0, Math.floor(position / itemHeight )));
        },

        _listIndex: function(scrollTop, lastScrollTop) {
            var buffers = this._bufferSizes(),
                position;

            position = scrollTop - ((scrollTop > lastScrollTop) ? buffers.down : buffers.up);

            return this._indexConstraint(position);
        },

        _selectable: function() {
            var itemClass = this.options.columns && this.options.columns.length ? TABLE_ITEM : LIST_ITEM;

            if (this.options.selectable) {
                this._selectProxy = this._clickHandler.bind(this);
                this.element.on(CLICK + VIRTUAL_LIST_NS, "." + itemClass, this._selectProxy);
            }
        },

        getElementIndex: function(element) {
            if (!(element instanceof jQuery)) {
                return undefined;
            }

            return parseInt(element.attr("data-offset-index"), 10);
        },

        _getIndecies: function(candidate) {
            var result = [], data;

            if (typeof candidate === "function") {
                data = this.dataSource.flatView();
                for (var idx = 0; idx < data.length; idx++) {
                    if (candidate(data[idx])) {
                        result.push(idx);
                        break;
                    }
                }
            }

            if (typeof candidate === "number") {
                result.push(candidate);
            }

            var elementIndex = this.getElementIndex(candidate);
            if (!isNaN(elementIndex)) {
                result.push(elementIndex);
            }

            if (candidate instanceof Array) {
                result = candidate;
            }

            return result;
        },

        _deselect: function(indices) {
            var removed = [],
                selectedIndex,
                dataItem,
                selectedIndexes = this._selectedIndexes,
                selectedDataItems = this._selectedDataItems,
                position = 0,
                selectable = this.options.selectable,
                removedindexesCounter = 0,
                valueGetter = this._valueGetter,
                item, match,
                result = null;

            indices = indices.slice();

            if (selectable === true || !indices.length) { //deselect everything
                for (var idx = 0; idx < selectedIndexes.length; idx++) {
                    if (selectedIndexes[idx] !== undefined) {
                        this._getElementByIndex(selectedIndexes[idx]).removeClass(SELECTED);
                    } else if (selectedDataItems[idx]) {
                        this._getElementByDataItem(selectedDataItems[idx]).removeClass(SELECTED);
                    }

                    removed.push({
                        index: selectedIndexes[idx],
                        position: idx,
                        dataItem: selectedDataItems[idx]
                    });
                }

                this._values = [];
                this._selectedDataItems = [];
                this._selectedIndexes = [];
            } else if (selectable === "multiple") {
                let i = 0;
                while (i < indices.length) {
                    result = null;
                    position = $.inArray(indices[i], selectedIndexes);
                    dataItem = this.dataItemByIndex(indices[i]);

                    if (position === -1 && dataItem) {
                        for (var j = 0; j < selectedDataItems.length; j++) {
                            match = isPrimitive(dataItem) ? selectedDataItems[j] === dataItem : valueGetter(selectedDataItems[j]) === valueGetter(dataItem);
                            if (match) {
                                item = this._getElementByIndex(indices[i]);
                                result = this._deselectSingleItem(item, j, indices[i], removedindexesCounter);
                            }
                        }
                    } else {
                        selectedIndex = selectedIndexes[position];

                        if (selectedIndex !== undefined) {
                            item = this._getElementByIndex(selectedIndex);
                            result = this._deselectSingleItem(item, position, selectedIndex, removedindexesCounter);
                        }
                    }

                    if (result) {
                        indices.splice(i, 1);
                        removed.push(result);

                        removedindexesCounter++;
                        i--;
                    }
                    i++;
                }
            }

            return {
                indices: indices,
                removed: removed
            };
        },

        _deselectSingleItem: function(item, position, selectedIndex, removedindexesCounter) {
            var dataItem;

            if (!item.hasClass(SELECTED)) {
                return;
            }

            item.removeClass(SELECTED);
            this._values.splice(position, 1);
            this._selectedIndexes.splice(position, 1);
            dataItem = this._selectedDataItems.splice(position, 1)[0];

            return {
                index: selectedIndex,
                position: position + removedindexesCounter,
                dataItem: dataItem
            };
        },

        _deselectCurrentValues: function(indices) {
            var children = this.element[0].children;
            var value, index, position;
            var values = this._values;
            var removed = [];
            var idx = 0;
            var j;

            if (this.options.selectable !== "multiple" || !this.isFiltered()) {
                return [];
            }

            if (indices[0] === -1) {
                $(children).removeClass(SELECTED);
                removed = $.map(this._selectedDataItems.slice(0), function(dataItem, idx) {
                   return {
                      dataItem: dataItem,
                      position: idx
                   };
                });
                this._selectedIndexes = [];
                this._selectedDataItems = [];
                this._values = [];
                return removed;
            }

            for (; idx < indices.length; idx++) {
                position = -1;
                index = indices[idx];
                if (this.dataItemByIndex(index)) {
                    value = this._valueGetter(this.dataItemByIndex(index));
                }

                for (j = 0; j < values.length; j++) {
                    if (value == values[j]) {
                        position = j;
                        break;
                    }
                }

                if (position > -1) {
                    removed.push(this.removeAt(position));
                    $(children[index]).removeClass(SELECTED);
                }
            }

            return removed;
        },

        _getSkip: function(index, take) {
            var page = index < take ? 1 : Math.floor(index / take) + 1;

            return (page - 1) * take;
        },

        _select: function(indexes) {
            var that = this,
                singleSelection = this.options.selectable !== "multiple",
                dataSource = this.dataSource,
                dataItem, oldSkip,
                take = this.itemCount,
                valueGetter = this._valueGetter,
                added = [];

            if (singleSelection) {
                that._selectedIndexes = [];
                that._selectedDataItems = [];
                that._values = [];
            }

            oldSkip = dataSource.skip();

            $.each(indexes, function(_, index) {
                var skip = that._getSkip(index, take);

                that.mute(function() {
                    dataSource.range(skip, take); //switch the range to get the dataItem

                    dataItem = that._findDataItem(dataSource.view(), [index - skip]);
                    that._selectedIndexes.push(index);
                    that._selectedDataItems.push(dataItem);
                    that._values.push(isPrimitive(dataItem) ? dataItem : valueGetter(dataItem));

                    added.push({
                        index: index,
                        dataItem: dataItem
                    });

                    that._getElementByIndex(index).addClass(SELECTED);

                    dataSource.range(oldSkip, take); //switch back the range
                });
            });

            that._values = that._checkValuesOrder(that._values);

            return added;
        },

        _clickHandler: function(e) {
            var item = $(e.currentTarget);

            if (!e.isDefaultPrevented() && item.attr("data-uid")) {
                this.trigger(CLICK, { item: item });
            }
        },

        _buildValueGetter: function() {
            this._valueGetter = kendo.getter(this.options.dataValueField);
        },

        _calculateGroupPadding: function(height) {
            var firstItem = this.items().first(),
                groupHeader = this.header,
                padding = 0;

            if (groupHeader[0] && groupHeader[0].style.display !== "none") {
                if (height !== "auto") {
                    padding = kendo.support.scrollbar();
                }

                padding += parseFloat(firstItem.css("border-right-width"), 10) + parseFloat(firstItem.children(".k-group").css("right"), 10);

                groupHeader.css("padding-right", padding);
            }
        },

        _calculateColumnsHeaderPadding: function() {
            if (this.options.columns && this.options.columns.length) {
                var isRtl = kendo.support.isRtl(this.wrapper);
                var scrollbar = kendo.support.scrollbar();
                var columnsHeader = this.content.parent().parent().find(".k-table-header");
                var total = this.dataSource.total();

                columnsHeader.css((isRtl ? "padding-left" : "padding-right"), total ? scrollbar : 0);
            }
        }

    });

    kendo.ui.VirtualList = VirtualList;
    kendo.ui.plugin(VirtualList);

})(window.kendo.jQuery);
export default kendo;

