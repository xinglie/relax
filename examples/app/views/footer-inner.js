/*
    author:xinglie.lkf@taobao.com
 */
var Relax = require('../../../index');
module.exports = Relax.View.extend({
    tmpl: '@footer-inner.html',
    render: function() {
        var me = this;
        me.setHTML(me.id, me.tmpl);
    }
});