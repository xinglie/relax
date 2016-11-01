/*
    author:xinglie.lkf@taobao.com
 */
var util = require('util');
var url = require('url');

var fs = require('fs');
var Offline = { //离线部分,这部分要用离线工具提前做好，目前先动态实现
    resolve: function(T, info) {
        var proto = T.prototype;
        if (proto.tmpl) {
            proto.tmpl = fs.readFileSync(Configs.views + info.pathname + '.html') + '';
        }
    }
};
var Configs = {
    views: '', //view根目录
    routes: { //路由映射
        // '/list':'app/views/default'
    },
    rootId: 'rx_root'
};
var ViewPlaceholder = String.fromCharCode(18, 30, 31); //临时占位符
var RegVframe = /<vframe([^>]+)>[\s\S]*?<\/vframe>/g;
var RegAttrView = /view\s*=\s*(['"])([^'"]+)\1/;
var RegAttrId = /id\s*=\s*(['"])([^'"]+)\1/;
var ViewRequire = function(view) {
    try {
        return require(Configs.views + view);
    } catch (e) {
        console.log('view require error:', e);
        return View;
    }
};
var Mix = function(aim, src) {
    for (var p in src) {
        aim[p] = src[p];
    }
    return aim;
};
var Relax = function(request, response, next) {
    var temp = url.parse(request.url, true, true);
    var view = Configs.routes[temp.pathname];
    if (view) {
        var vf = new Vframe({
            id: Configs.rootId,
            request: request,
            response: response,
            vframes: {}
        });
        vf.onComplete = function(e) {
            next({
                code: 200,
                html: e.html
            });
        };
        vf.mountView(view);
    } else {
        next({
            code: 404,
            html: 'not found'
        });
    }
};
Relax.config = function(configs) {
    var temp = configs.routes;
    if (temp) {
        configs.routes = Mix(Configs.routes, temp);
    }
    Mix(Configs, configs);
};
/******** vframe ************/
var Vframe = function(options) {
    var me = this;
    Mix(me, options);
    me.vframesCount = 0;
    me.readyCount = 0;
    me.counter = 0;
    me.vframes[me.id] = me;
};
Mix(Vframe.prototype, {
    mountView: function(view, viewCtorParams) {
        if (view) {
            var info = url.parse(view, true);
            var T = ViewRequire(info.pathname);
            Offline.resolve(T, info);
            var me = this;
            var t = new T({
                id: me.id,
                owner: me,
                path: info.pathname,
                request: me.request,
                response: me.response
            }, Mix(info.query, viewCtorParams));
            t.render();
        }
    },
    mountVframe: function(id, view) {
        var me = this;
        var vf = new Vframe({
            id: id,
            vframes: me.vframes,
            request: me.request,
            response: me.response
        });
        vf.pId = me.id;
        vf.mountView(view);
        return vf;
    },
    notifyCreated: function() {
        var me = this;
        if (me.readyCount == me.vframesCount) { //就绪的view与总数相等
            var parent = me.vframes[me.pId];
            if (parent) {
                //从父html中换掉自已那部分的html
                parent.viewHTML = parent.viewHTML.replace(ViewPlaceholder + me.id + ViewPlaceholder, me.viewHTML);
                parent.readyCount++;
                parent.notifyCreated();
            } else {
                me.onComplete({
                    html: me.viewHTML
                });
            }
        }
    },
    notifyRender: function(html) {
        var me = this;
        var vframes = [];
        html = html || '';
        var counter = 0;
        html = html.replace(RegVframe, function(match, attrs) {
            var id = attrs.match(RegAttrId);
            if (id) id = id[2];
            else id = 'rx_' + me.id + '_' + counter++;
            var view = attrs.match(RegAttrView);
            if (view) view = view[2];
            vframes.push({
                id: id,
                view: view
            });
            return ViewPlaceholder + id + ViewPlaceholder;
        });
        me.viewHTML = html;
        me.vframesCount = vframes.length;
        for (var i = 0, vf; i < vframes.length; i++) {
            vf = vframes[i];
            me.mountVframe(vf.id, vf.view);
        }
        if (!vframes.length) { //未找到子vframe,则通知当前view就绪
            me.notifyCreated();
        }
    },
    onComplete: function() {

    }
});

var View = function(options) {
    var me = this;
    Mix(me, options);
};
Mix(View.prototype, {
    setHTML: function(id, html) {
        var me = this;
        me.owner.notifyRender(html);
    },
    findVframe: function(id) {
        return this.owner.vframes[id];
    },
    render: function() {
        this.setHTML(this.id, 'unfoud:' + this.path);
    }
});
View.extend = function(props) {
    var me = this;
    var ctor = props.ctor;
    var TView = function(options, ctorParams) {
        me.call(this, options);
        if (ctor) {
            ctor.call(this, ctorParams);
        }
    };
    util.inherits(TView, me);
    Mix(TView.prototype, props);
    return TView;
};
Relax.View = View;
module.exports = Relax;