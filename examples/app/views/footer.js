/*
    author:xinglie.lkf@taobao.com
 */
var Relax = require('../../../index');
module.exports = Relax.View.extend({
    tmpl: '@footer.html',
    render: function() {
        var me = this;
        setTimeout(function() {
            me.setHTML(me.id, me.tmpl);
        }, 3000);
    }
});