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
            var vf = me.findVframe('footer');
            if (vf) {
                vf.mountView('app/views/footer-inner');
            }
        }, 3000);
    }
});