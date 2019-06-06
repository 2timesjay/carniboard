var test = require('tape');
var Selectable = require('../../controller/selectable.js').Selectable;
var TreeSelectable = require('../../controller/selectable.js').TreeSelectable;

var Unit = require('../../model/entity.js').Unit;
var MoveAction = require('../../model/entity.js').MoveAction;

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