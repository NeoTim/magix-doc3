/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var Data = require('data');
var Zepto = require('zepto');
var FindParent = function(name, map, inner) {
    var a = [];
    if (!inner) {
        a.push({
            name: name
        });
    }
    var info = map[name];
    if (info) {
        var temp = info.inherits && info.inherits[0];
        if (temp) {
            temp = temp.alias.split('.')[0];
            a.push({
                type: 'mix',
                name: temp
            });
            temp = FindParent(temp, map, true);
            if (temp.length) {
                a = a.concat(temp);
            }
        } else {
            temp = info.inheritsFrom && info.inheritsFrom[0];
            if (temp) {
                a.push({
                    name: temp
                });
                temp = FindParent(temp, map, true);
                if (temp.length) {
                    a = a.concat(temp);
                }
            }
        }
    }
    return a;
};
module.exports = Magix.View.extend({
    tmpl: '@class.html',
    inheritsTmpl: '@class-inherits.html',
    methodTmpl: '@class-method.html',
    ctor: function(extra) {
        this.$name = extra.name;
    },
    render: function() {
        var me = this;
        var html = me.toHTML(me.tmpl, {
            entity: Data[me.$name],
            getInherits: function(name) {
                var ir = FindParent(name, Data);
                var html = me.toHTML(me.inheritsTmpl, {
                    list: ir.reverse()
                });
                return html;
            },
            getParams: function(params) {
                var a = [];
                if (params) {
                    for (var i = 0, name, info; i < params.length; i++) {
                        info = params[i];
                        name = info.name;
                        if (name.indexOf('.') == -1) {
                            a.push(name);
                        }
                    }
                }
                return a;
            }
        });
        me.setHTML(me.id, html);
    },
    'toggleMoreInfos<click>': function(e) {
        e.preventDefault();
        var me = this;
        var cntId = me.id + '_method_details';
        var cnt = Zepto('#' + cntId);
        if (!cnt.size()) {
            cnt = document.createElement('div');
            cnt.id = cntId;
            document.body.appendChild(cnt);
            cnt = Zepto(cnt);
        }
        var current = Zepto(e.current);
        var icon = current.find('i');
        if (icon != me.$lastIcon && me.$lastIcon) {
            me.$lastIcon.removeClass('minus').addClass('plus');
        }
        var currentDD = current.parents('div').eq(0);
        if (Zepto.contains(currentDD[0], cnt[0])) {
            var none = cnt.css('display') == 'none';
            cnt.css({
                display: none ? '' : 'none'
            });
            if (none) {
                icon.removeClass('plus').addClass('minus');
            } else {
                icon.removeClass('minus').addClass('plus');
            }
        } else {
            cnt.css({
                display: '',
                paddingLeft: 24
            });
            currentDD.append(cnt);
            icon.removeClass('plus').addClass('minus');
        }
        me.$lastIcon = icon;
        var info = Data[me.$name];
        if (e.params.id) {
            var list = Data[me.$name][e.params.type];
            console.log(list);

            for (var i = list.length - 1; i >= 0; i--) {
                if (list[i].id == e.params.id) info = list[i];
            }
        }
        var html = me.toHTML(me.methodTmpl, {
            info: info,
            formatExample: function(example) {
                console.log();
                return example.replace(/ /g, '&nbsp;').replace(/\b(?:function|var|if|else|this|return|true|false|null)\b/g, '<span style="color:blue">$&</span>').replace(/(^|[^:])(\/{2}[\s\S]*?)(?:[\r\n]|$)/mg, '$1<span style="color:green">$2</span><br />').replace(/\r\n|\r|\n/g, '<br />').replace(/(?:<br\s+\/>)+/gi, '<br />');
            }
        });
        var top = icon.offset().top;
        if (top < Zepto(window).scrollTop()) {
            Zepto(window).scrollTop(top - 50);
        }
        cnt.html(html);
    }
});