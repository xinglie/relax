var Relax = require('../../../index');
module.exports = Relax.View.extend({
    tmpl: '@default.html',
    css: '@default.css',
    render: function() {
        var me = this;
        me.setHTML(me.id, me.tmpl);
    }
});