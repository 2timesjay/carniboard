var test = require('tape');
var Selectable = require('../../controller/selectable.js').Selectable;

var Unit = require('../../model/entity.js').Unit;
var MoveAction = require('../../model/entity.js').MoveAction;

test('testSelectableConstruction', function (t) {
    
    t.plan(1);
    u = new Unit();
    ma = new MoveAction(0, null);
    ma_sel = new Selectable(ma, 'action');
    t.equals('action', ma_sel.label);

});