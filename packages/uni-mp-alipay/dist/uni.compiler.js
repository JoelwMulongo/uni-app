'use strict';

var initMiniProgramPlugin = require('@dcloudio/uni-mp-vite');
var path = require('path');
var shared = require('@vue/shared');
var uniCliShared = require('@dcloudio/uni-cli-shared');
var compilerCore = require('@vue/compiler-core');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var initMiniProgramPlugin__default = /*#__PURE__*/_interopDefaultLegacy(initMiniProgramPlugin);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);

const BUILT_IN_TAGS = [
    'ad',
    'ad-content-page',
    'ad-draw',
    'audio',
    'button',
    'camera',
    'canvas',
    'checkbox',
    'checkbox-group',
    'cover-image',
    'cover-view',
    'editor',
    'form',
    'functional-page-navigator',
    'icon',
    'image',
    'input',
    'label',
    'live-player',
    'live-pusher',
    'map',
    'movable-area',
    'movable-view',
    'navigator',
    'official-account',
    'open-data',
    'picker',
    'picker-view',
    'picker-view-column',
    'progress',
    'radio',
    'radio-group',
    'rich-text',
    'scroll-view',
    'slider',
    'swiper',
    'swiper-item',
    'switch',
    'text',
    'textarea',
    'video',
    'view',
    'web-view',
].map((tag) => 'uni-' + tag);
function isBuiltInComponent(tag) {
    return BUILT_IN_TAGS.indexOf('uni-' + tag) !== -1;
}
function isNativeTag(tag) {
    return shared.isHTMLTag(tag) || shared.isSVGTag(tag) || isBuiltInComponent(tag);
}
function isCustomElement$1(_tag) {
    return false;
}

var component2 = true;
var enableAppxNg = true;
var source = {
	component2: component2,
	enableAppxNg: enableAppxNg
};

function transformRef(node, context) {
    if (!uniCliShared.isUserComponent(node, context)) {
        return;
    }
    addVueRef(node, context);
}
function addVueRef(node, context) {
    // 仅配置了 ref 属性的，才需要增补 vue-ref
    const refProp = compilerCore.findProp(node, 'ref');
    if (!refProp) {
        return;
    }
    const dataRef = 'data-' +
        (context.inVFor
            ? uniCliShared.VUE_REF_IN_FOR
            : uniCliShared.VUE_REF);
    if (refProp.type === 6 /* ATTRIBUTE */) {
        refProp.name = dataRef;
    }
    else {
        refProp.arg.content = dataRef;
    }
    const { props } = node;
    props.splice(props.indexOf(refProp), 0, uniCliShared.createAttributeNode('ref', '__r'));
}

const event = {
    format(name, { isCatch, isComponent }) {
        if (!isComponent && name === 'click') {
            name = 'tap';
        }
        name = eventMap[name] || name;
        return `${isCatch ? 'catch' : 'on'}${shared.capitalize(shared.camelize(name))}`;
    },
};
const eventMap = {
    touchstart: 'touchStart',
    touchmove: 'touchMove',
    touchend: 'touchEnd',
    touchcancel: 'touchCancel',
    longtap: 'longTap',
    longpress: 'longTap',
    transitionend: 'transitionEnd',
    animationstart: 'animationStart',
    animationiteration: 'animationIteration',
    animationend: 'animationEnd',
    firstappear: 'firstAppear',
    // map
    markertap: 'markerTap',
    callouttap: 'calloutTap',
    controltap: 'controlTap',
    regionchange: 'regionChange',
    paneltap: 'panelTap',
    // scroll-view
    scrolltoupper: 'scrollToUpper',
    scrolltolower: 'scrollToLower',
    // movable-view
    changeend: 'changeEnd',
    // video
    timeupdate: 'timeUpdate',
    waiting: 'loading',
    fullscreenchange: 'fullScreenChange',
    useraction: 'userAction',
    renderstart: 'renderStart',
    loadedmetadata: 'renderStart',
    // swiper
    animationfinish: 'animationEnd',
};

function transformOpenType(node) {
    var _a;
    if (node.type !== 1 /* ELEMENT */ || node.tag !== 'button') {
        return;
    }
    const openTypeProp = compilerCore.findProp(node, 'open-type');
    if (!openTypeProp) {
        return;
    }
    if (openTypeProp.type !== 6 /* ATTRIBUTE */ ||
        ((_a = openTypeProp.value) === null || _a === void 0 ? void 0 : _a.content) !== 'getPhoneNumber') {
        return;
    }
    openTypeProp.value.content = 'getAuthorize';
    const { props } = node;
    props.splice(props.indexOf(openTypeProp) + 1, 0, uniCliShared.createAttributeNode('scope', 'phoneNumber'));
    let getPhoneNumberMethodName = '';
    const getPhoneNumberPropIndex = props.findIndex((prop) => {
        if (prop.type === 7 /* DIRECTIVE */ && prop.name === 'on') {
            const { arg, exp } = prop;
            if ((arg === null || arg === void 0 ? void 0 : arg.type) === 4 /* SIMPLE_EXPRESSION */ &&
                (exp === null || exp === void 0 ? void 0 : exp.type) === 4 /* SIMPLE_EXPRESSION */ &&
                arg.isStatic &&
                arg.content === 'getphonenumber') {
                getPhoneNumberMethodName = exp.content;
                return true;
            }
        }
    });
    if (!getPhoneNumberMethodName) {
        return;
    }
    props.splice(getPhoneNumberPropIndex, 1);
    props.push(uniCliShared.createOnDirectiveNode('getAuthorize', `$onAliGetAuthorize('${getPhoneNumberMethodName}',$event)`));
    props.push(uniCliShared.createOnDirectiveNode('error', `$onAliAuthError('${getPhoneNumberMethodName}',$event)`));
}

const projectConfigFilename = 'mini.project.json';
const miniProgram = {
    event,
    class: {
        array: false,
    },
    slot: {
        $slots: false,
        // 支付宝 fallback 有 bug，当多个带默认 slot 组件嵌套使用时，所有的默认slot均会显示，如uni-file-picker(image)
        fallbackContent: true,
        dynamicSlotNames: true,
    },
    directive: 'a:',
};
const nodeTransforms = [
    transformRef,
    transformOpenType,
    uniCliShared.transformMatchMedia,
    uniCliShared.createTransformComponentLink(uniCliShared.COMPONENT_ON_LINK, 6 /* ATTRIBUTE */),
];
const compilerOptions = {
    isNativeTag,
    isCustomElement,
    nodeTransforms,
};
const tags = [
    'lifestyle',
    'life-follow',
    'contact-button',
    'spread',
    'error-view',
    'poster',
    'cashier',
    'ix-grid',
    'ix-native-grid',
    'ix-native-list',
    'mkt',
];
function isCustomElement(tag) {
    return tags.includes(tag) || isCustomElement$1();
}
const options = {
    vite: {
        inject: {
            uni: [path__default["default"].resolve(__dirname, 'uni.api.esm.js'), 'default'],
        },
        alias: {
            'uni-mp-runtime': path__default["default"].resolve(__dirname, 'uni.mp.esm.js'),
        },
        copyOptions: {
            assets: ['mycomponents'],
        },
    },
    global: 'my',
    json: {
        windowOptionsMap: {
            defaultTitle: 'navigationBarTitleText',
            pullRefresh: 'enablePullDownRefresh',
            allowsBounceVertical: 'allowsBounceVertical',
            titleBarColor: 'navigationBarBackgroundColor',
            optionMenu: 'optionMenu',
            backgroundColor: 'backgroundColor',
            usingComponents: 'usingComponents',
            navigationBarShadow: 'navigationBarShadow',
            titleImage: 'titleImage',
            transparentTitle: 'transparentTitle',
            titlePenetrate: 'titlePenetrate',
        },
        tabBarOptionsMap: {
            textColor: 'color',
            selectedColor: 'selectedColor',
            backgroundColor: 'backgroundColor',
            items: 'list',
        },
        tabBarItemOptionsMap: {
            pagePath: 'pagePath',
            name: 'text',
            icon: 'iconPath',
            activeIcon: 'selectedIconPath',
        },
    },
    app: {
        darkmode: false,
        subpackages: true,
    },
    project: {
        filename: projectConfigFilename,
        source,
    },
    template: Object.assign(Object.assign({}, miniProgram), { filter: {
            extname: '.sjs',
            lang: 'sjs',
            generate(filter, filename) {
                // TODO 标签内的 code 代码需要独立生成一个 sjs 文件
                // 暂不处理，让开发者自己全部使用 src 引入
                return `<import-sjs name="${filter.name}" from="${filename}.sjs"/>`;
            },
        }, extname: '.axml', compilerOptions }),
    style: {
        extname: '.acss',
    },
};

const uniMiniProgramAlipayPlugin = {
    name: 'vite:uni-mp-alipay',
    config() {
        return {
            define: {
                __VUE_CREATED_DEFERRED__: false,
            },
            build: {
                assetsInlineLimit: 0,
            },
        };
    },
};
var index = [uniMiniProgramAlipayPlugin, ...initMiniProgramPlugin__default["default"](options)];

module.exports = index;
