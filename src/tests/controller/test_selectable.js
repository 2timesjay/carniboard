var test = require('tape');
var Selectable = require('../../src/controller/selectable.js.js').Selectable;
var TreeSelectable = require('../../src/controller/selectable.js.js').TreeSelectable;

var Unit = require('../../src/model/entity.js.js').Unit;
var MoveAction = require('../../src/model/entity.js.js').MoveAction;

test('testSelectableConstruction', function (t) {
    
    t.plan(1);
    u = new Unit();
    ma = new MoveAction(0, null);
    ma_sel = new Selectable(ma, true);
    t.equals(true, ma_sel.isConfirmable);

});

test('testTreeSelectableConstruction', function (t) {
    
    t.plan(1);
    u = new Unit();
    ma = new MoveAction(0, null);
    ma_sel = new Selectable(ma, true);
    t.equals(true, ma_sel.isConfirmable);

});