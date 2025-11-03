// Vanilla Tram.js (cleaned from Webflow specifics)
(function(window) {
  "use strict";

  // Core Tram function
  window.tram = function(e) {
    function init(e, t) {
      return (new Bare).init(e, t);
    }

    function hexToRgb(hex) {
      var t = parseInt(hex.slice(1), 16);
      return [t >> 16 & 255, t >> 8 & 255, 255 & t];
    }

    function rgbToHex(r, g, b) {
      return "#" + (0x1000000 | r << 16 | g << 8 | b).toString(16).slice(1);
    }

    function toNumber(value, fallback, multiplier) {
      if (multiplier === undefined) multiplier = value;
      if (value === undefined) return multiplier;
      var n = multiplier;
      return /ms/.test(value) || !/[s\.]/.test(value) ? n = parseInt(value, 10) : n = 1e3 * parseFloat(value),
             n < 0 && (n = 0),
             isNaN(n) ? multiplier : n;
    }

    function warn(msg) {
      // debug logging removed
    }

    // Basic OOP helper
    var Class = (function(protoKey, hasOwn) {
      return function extend(Parent, props) {
        function Child() {
          if (this.init) this.init.apply(this, arguments);
        }
        Child.prototype = Object.create(Parent.prototype);
        Child.prototype.constructor = Child;

        if (props) {
          for (var key in props) {
            if (hasOwn.call(props, key)) {
              Child.prototype[key] = props[key];
            }
          }
        }
        return Child;
      };
    })("prototype", {}.hasOwnProperty);

    // Easing functions
    var easing = {
      ease: ["ease", function(t, b, c, d) { var p = t/d; return b + c*p; }],
      linear: ["linear", function(t, b, c, d) { return b + c*t/d; }],
      // other easing functions simplified for brevity
    };

    var requestFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(f) { setTimeout(f, 16); };
    var now = window.performance && (performance.now || performance.webkitNow) ? performance.now.bind(performance) : Date.now;

    // Core animation class
    var Bare = Class(Object, {
      init: function(el) {
        this.el = el instanceof jQuery ? el[0] : el;
        this.props = {};
        this.queue = [];
        this.active = false;
      },
      set: function(props) { this.props = props; this.redraw(); },
      redraw: function() { this.el.offsetHeight; },
      start: function(props) { this.set(props); this.active = true; }
      // other core methods trimmed for clarity
    });

    // Tween class
    var Tween = Class(Object, {
      init: function(options) {
        this.duration = options.duration || 0;
        this.delay = options.delay || 0;
        this.ease = options.ease || easing.ease[1];
        this.update = options.update || function(){};
        this.complete = options.complete || function(){};
        this.context = options.context || this;
      },
      play: function() { /* simplified */ },
      stop: function() { /* simplified */ }
    });

    // Tram config
    var config = {
      defaultUnit: "px",
      defaultAngle: "deg",
      fallback: false
    };

    return {
      init: init,
      Bare: Bare,
      Tween: Tween,
      easing: easing,
      config: config
    };
  }(window);

})(window);
             // Utility functions (underscore-like)
var _ = {
    map: function(e, fn, ctx) { var res=[]; if(e==null)return res; for(var k in e)res.push(fn.call(ctx,e[k],k,e)); return res; },
    find: function(e, fn, ctx) { for(var k in e) if(fn.call(ctx,e[k],k,e)) return e[k]; },
    filter: function(e, fn, ctx) { var res=[]; for(var k in e) fn.call(ctx,e[k],k,e)&&res.push(e[k]); return res; },
    some: function(e, fn, ctx){ for(var k in e) if(fn.call(ctx,e[k],k,e)) return true; return false; },
    contains: function(e, v){ for(var k in e) if(e[k]===v) return true; return false; },
    delay: function(fn, t){ var args=[].slice.call(arguments,2); return setTimeout(function(){ fn.apply(null,args); },t); },
    throttle: function(fn){ var busy=false; return function(){ if(!busy){ busy=true; var args=arguments, self=this; requestAnimationFrame(function(){ busy=false; fn.apply(self,args); }); } }; },
    debounce: function(fn, wait, immediate){ var timeout,saved,args,self; return function(){ args=arguments; self=this; var callNow=immediate&&!timeout; clearTimeout(timeout); timeout=setTimeout(function(){ timeout=null; if(!immediate) fn.apply(self,args); },wait); if(callNow) fn.apply(self,args); }; }
};

// Webflow core
var Webflow=(function($){
    var modules={},readyQueue=[],loaded=false;
    function define(name, module) {
        if(modules[name]) remove(name);
        modules[name]=module($,_,undefined);
        ready(modules[name]);
        return modules[name];
    }
    function ready(mod) { if(mod.ready) readyQueue.push(mod.ready); if(loaded) flush(); }
    function flush(){ readyQueue.forEach(function(fn){ fn(); }); readyQueue=[]; }
    function remove(name){ if(modules[name]&&modules[name].ready) readyQueue=readyQueue.filter(fn=>fn!==modules[name].ready); delete modules[name]; }
    function env(key){ var d=window.__wf_design; return key==='design'?!!d : key==='preview'?!!d&&!window.__wf_design : key==='editor'?!!window.WebflowEditor:undefined; }
    $(function(){ loaded=true; flush(); });
    return { define:define, require:function(name){ return modules[name]; }, env:env, ready:flush };
})(jQuery);

// Example: dropdown module simplified
Webflow.define("dropdown", function($, _){
    var module={};
    var OPEN_CLASS="w--open";
    module.ready=function(){
        $(".w-dropdown").each(function(){
            var $el=$(this), $toggle=$el.children(".w-dropdown-toggle"), $list=$el.children(".w-dropdown-list");
            $toggle.on("click",function(e){
                e.preventDefault();
                var open=$el.hasClass(OPEN_CLASS);
                $(".w-dropdown").removeClass(OPEN_CLASS);
                if(!open) $el.addClass(OPEN_CLASS);
            });
            $el.on("mouseleave", function(){ $el.removeClass(OPEN_CLASS); });
        });
    };
    return module;
});

              // ------------------ UTILITY ------------------
const keyCodes = {
    ARROW_LEFT: 37,
    ARROW_UP: 38,
    ARROW_RIGHT: 39,
    ARROW_DOWN: 40,
    ESCAPE: 27,
    SPACE: 32,
    ENTER: 13,
    HOME: 36,
    END: 35
};

function debounce(func, wait = 50) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

function closest(el, selector) {
    while (el && el !== document) {
        if (el.matches(selector)) return el;
        el = el.parentNode;
    }
    return null;
}

// ------------------ DROPDOWN ------------------
class Dropdown {
    constructor(dropdownEl) {
        this.el = dropdownEl;
        this.toggle = this.el.querySelector('.dropdown-toggle');
        this.list = this.el.querySelector('.dropdown-list');
        this.links = Array.from(this.list.querySelectorAll('a'));
        this.open = false;
        this.hovering = false;
        this.selectedIdx = -1;
        this.config = {
            hover: this.el.dataset.hover === 'true',
            delay: parseInt(this.el.dataset.delay) || 0
        };

        this.init();
    }

    init() {
        this.toggle.setAttribute('aria-haspopup', 'menu');
        this.toggle.setAttribute('aria-expanded', 'false');
        this.toggle.addEventListener('click', () => this.toggleDropdown());
        this.links.forEach((link, idx) => {
            link.setAttribute('tabindex', '0');
            link.addEventListener('click', () => this.closeDropdown());
        });
        this.el.addEventListener('keydown', (e) => this.handleKeydown(e));
        if (this.config.hover) {
            this.el.addEventListener('mouseenter', () => this.openDropdown());
            this.el.addEventListener('mouseleave', () => this.closeDropdown());
        }
    }

    toggleDropdown() {
        this.open ? this.closeDropdown() : this.openDropdown();
    }

    openDropdown() {
        if (!this.open) {
            this.open = true;
            this.list.classList.add('open');
            this.toggle.classList.add('open');
            this.toggle.setAttribute('aria-expanded', 'true');
        }
    }

    closeDropdown() {
        if (this.open) {
            this.open = false;
            this.list.classList.remove('open');
            this.toggle.classList.remove('open');
            this.toggle.setAttribute('aria-expanded', 'false');
        }
    }

    handleKeydown(e) {
        const len = this.links.length;
        if (!len) return;

        switch (e.keyCode) {
            case keyCodes.HOME:
                this.selectedIdx = 0;
                this.links[this.selectedIdx].focus();
                e.preventDefault();
                break;
            case keyCodes.END:
                this.selectedIdx = len - 1;
                this.links[this.selectedIdx].focus();
                e.preventDefault();
                break;
            case keyCodes.ARROW_DOWN:
                this.selectedIdx = Math.min(this.selectedIdx + 1, len - 1);
                this.links[this.selectedIdx].focus();
                e.preventDefault();
                break;
            case keyCodes.ARROW_UP:
                this.selectedIdx = Math.max(this.selectedIdx - 1, 0);
                this.links[this.selectedIdx].focus();
                e.preventDefault();
                break;
            case keyCodes.ESCAPE:
                this.closeDropdown();
                this.toggle.focus();
                e.stopPropagation();
                break;
            case keyCodes.ENTER:
            case keyCodes.SPACE:
                this.toggleDropdown();
                e.preventDefault();
                e.stopPropagation();
                break;
        }
    }
}

// ------------------ NAVBAR ------------------
class Navbar {
    constructor(navEl) {
        this.el = navEl;
        this.menu = this.el.querySelector('.nav-menu');
        this.links = Array.from(this.menu.querySelectorAll('.nav-link'));
        this.dropdowns = Array.from(this.menu.querySelectorAll('.dropdown'));
        this.button = this.el.querySelector('.nav-button');
        this.open = false;

        this.init();
    }

    init() {
        this.button.setAttribute('role', 'button');
        this.button.setAttribute('tabindex', '0');
        this.button.setAttribute('aria-controls', 'nav-menu');
        this.button.setAttribute('aria-haspopup', 'menu');
        this.button.setAttribute('aria-expanded', 'false');
        this.button.addEventListener('click', () => this.toggleMenu());
        this.el.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    toggleMenu() {
        this.open ? this.closeMenu() : this.openMenu();
    }

    openMenu() {
        this.open = true;
        this.menu.classList.add('open');
        this.button.classList.add('open');
        this.button.setAttribute('aria-expanded', 'true');
    }

    closeMenu() {
        this.open = false;
        this.menu.classList.remove('open');
        this.button.classList.remove('open');
        this.button.setAttribute('aria-expanded', 'false');
    }

    handleKeydown(e) {
        if (!this.open) return;
        switch (e.keyCode) {
            case keyCodes.ESCAPE:
                this.closeMenu();
                this.button.focus();
                e.preventDefault();
                break;
        }
    }
}

// ------------------ SLIDER ------------------
class Slider {
    constructor(sliderEl) {
        this.el = sliderEl;
        this.mask = this.el.querySelector('.slider-mask');
        this.slides = Array.from(this.mask.children);
        this.index = 0;
        this.config = {
            duration: parseInt(this.el.dataset.duration) || 500,
            easing: this.el.dataset.easing || 'ease',
            animation: this.el.dataset.animation || 'slide'
        };

        this.init();
    }

    init() {
        this.slides.forEach((slide, idx) => {
            slide.setAttribute('role', 'group');
            slide.setAttribute('aria-label', `Slide ${idx + 1} of ${this.slides.length}`);
        });
    }

    goTo(index) {
        this.index = Math.max(0, Math.min(index, this.slides.length - 1));
        this.updateSlides();
    }

    next() {
        this.goTo(this.index + 1);
    }

    prev() {
        this.goTo(this.index - 1);
    }

    updateSlides() {
        const offsetX = -this.slides[this.index].offsetLeft;
        this.slides.forEach((slide) => {
            slide.style.transform = `translateX(${offsetX}px)`;
        });
    }
}

// ------------------ INIT ------------------
document.querySelectorAll('.dropdown').forEach(el => new Dropdown(el));
document.querySelectorAll('.navbar').forEach(el => new Navbar(el));
document.querySelectorAll('.slider').forEach(el => new Slider(el));

        // Redux action exports for IX2 Engine
Object.defineProperty(t, "__esModule", { value: true });

const actionTypes = {
    actionListPlaybackChanged: () => H,
    animationFrameChanged: () => P,
    clearRequested: () => k,
    elementStateChanged: () => W,
    eventListenerAdded: () => G,
    eventStateChanged: () => w,
    instanceAdded: () => F,
    instanceRemoved: () => X,
    instanceStarted: () => Q,
    mediaQueriesDefined: () => z,
    parameterChanged: () => D,
    playbackRequested: () => U,
    previewRequested: () => V,
    rawDataImported: () => S,
    sessionInitialized: () => h,
    sessionStarted: () => C,
    sessionStopped: () => M,
    stopRequested: () => x,
    testFrameRendered: () => B,
    viewportWidthChanged: () => Y
};

for (const key in actionTypes) {
    Object.defineProperty(t, key, { enumerable: true, get: actionTypes[key] });
}

// Imports
import IX2EngineActionTypes from '7087';
import { reifyState } from '9468';

// Destructuring action types
const {
    IX2_RAW_DATA_IMPORTED: RAW_DATA_IMPORTED,
    IX2_SESSION_INITIALIZED: SESSION_INITIALIZED,
    IX2_SESSION_STARTED: SESSION_STARTED,
    IX2_SESSION_STOPPED: SESSION_STOPPED,
    IX2_PREVIEW_REQUESTED: PREVIEW_REQUESTED,
    IX2_PLAYBACK_REQUESTED: PLAYBACK_REQUESTED,
    IX2_STOP_REQUESTED: STOP_REQUESTED,
    IX2_CLEAR_REQUESTED: CLEAR_REQUESTED,
    IX2_EVENT_LISTENER_ADDED: EVENT_LISTENER_ADDED,
    IX2_TEST_FRAME_RENDERED: TEST_FRAME_RENDERED,
    IX2_EVENT_STATE_CHANGED: EVENT_STATE_CHANGED,
    IX2_ANIMATION_FRAME_CHANGED: ANIMATION_FRAME_CHANGED,
    IX2_PARAMETER_CHANGED: PARAMETER_CHANGED,
    IX2_INSTANCE_ADDED: INSTANCE_ADDED,
    IX2_INSTANCE_STARTED: INSTANCE_STARTED,
    IX2_INSTANCE_REMOVED: INSTANCE_REMOVED,
    IX2_ELEMENT_STATE_CHANGED: ELEMENT_STATE_CHANGED,
    IX2_ACTION_LIST_PLAYBACK_CHANGED: ACTION_LIST_PLAYBACK_CHANGED,
    IX2_VIEWPORT_WIDTH_CHANGED: VIEWPORT_WIDTH_CHANGED,
    IX2_MEDIA_QUERIES_DEFINED: MEDIA_QUERIES_DEFINED
} = IX2EngineActionTypes;

// Action creators
const S = (payload) => ({
    type: RAW_DATA_IMPORTED,
    payload: { ...reifyState(payload) }
});

const h = ({ hasBoundaryNodes, reducedMotion }) => ({
    type: SESSION_INITIALIZED,
    payload: { hasBoundaryNodes, reducedMotion }
});

const C = () => ({ type: SESSION_STARTED });
const M = () => ({ type: SESSION_STOPPED });

const V = ({ rawData, defer }) => ({
    type: PREVIEW_REQUESTED,
    payload: { rawData, defer }
});

const U = ({
    actionTypeId = IX2EngineActionTypes.ActionTypeConsts.GENERAL_START_ACTION,
    actionListId, actionItemId, eventId, allowEvents, immediate, testManual, verbose, rawData
}) => ({
    type: PLAYBACK_REQUESTED,
    payload: { actionTypeId, actionListId, actionItemId, testManual, eventId, allowEvents, immediate, verbose, rawData }
});

const x = (actionListId) => ({ type: STOP_REQUESTED, payload: { actionListId } });
const k = () => ({ type: CLEAR_REQUESTED });

const G = (target, listenerParams) => ({
    type: EVENT_LISTENER_ADDED,
    payload: { target, listenerParams }
});

const B = (step = 1) => ({
    type: TEST_FRAME_RENDERED,
    payload: { step }
});

const w = (stateKey, newState) => ({
    type: EVENT_STATE_CHANGED,
    payload: { stateKey, newState }
});

const P = (now, parameters) => ({
    type: ANIMATION_FRAME_CHANGED,
    payload: { now, parameters }
});

const D = (key, value) => ({
    type: PARAMETER_CHANGED,
    payload: { key, value }
});

const F = (payload) => ({
    type: INSTANCE_ADDED,
    payload: { ...payload }
});

const Q = (instanceId, time) => ({
    type: INSTANCE_STARTED,
    payload: { instanceId, time }
});

const X = (instanceId) => ({
    type: INSTANCE_REMOVED,
    payload: { instanceId }
});

const W = (elementId, actionTypeId, current, actionItem) => ({
    type: ELEMENT_STATE_CHANGED,
    payload: { elementId, actionTypeId, current, actionItem }
});

const H = ({ actionListId, isPlaying }) => ({
    type: ACTION_LIST_PLAYBACK_CHANGED,
    payload: { actionListId, isPlaying }
});

const Y = ({ width, mediaQueries }) => ({
    type: VIEWPORT_WIDTH_CHANGED,
    payload: { width, mediaQueries }
});

const z = () => ({ type: MEDIA_QUERIES_DEFINED });

                                          m.forEach(({ element, key }) => {
    const actionGroups = g[key];
    const firstActionItem = d.default(actionGroups, "[0].actionItems[0]", {});
    const { actionTypeId } = firstActionItem;

    const pluginInstance =
        (actionTypeId === E.ActionTypeConsts.PLUGIN_RIVE
            ? (firstActionItem.config?.target?.selectorGuids || []).length === 0
            : Y(actionTypeId))
            ? z(actionTypeId)?.(element, firstActionItem)
            : null;

    const destination = h({ element, actionItem: firstActionItem, elementApi: T }, pluginInstance);

    eI({
        store: e,
        element,
        eventId: n,
        actionListId: l,
        actionItem: firstActionItem,
        destination,
        continuous: true,
        parameterId: O,
        actionGroups,
        smoothing: s,
        restingValue: c,
        pluginInstance
    });
})({
    store: t,
    eventStateKey: r + R + n,
    eventTarget: e,
    eventId: r,
    eventConfig: a,
    actionListId: u,
    parameterGroup: o,
    smoothing: s,
    restingValue: f
});

// Handle start actions
(o.actionTypeId === E.ActionTypeConsts.GENERAL_START_ACTION || O(o.actionTypeId)) &&
    ef({ store: t, actionListId: u, eventId: r });

// Event handling
const handleEvent = e => {
    const { ixSession } = t.getState();

    ec(r, (targetElements, index, key) => {
        const eventConfig = a[index];
        const eventState = ixSession.eventState[key];
        const { action, mediaQueries = s.mediaQueryKeys } = eventConfig;

        if (!D(mediaQueries, ixSession.mediaQueryKey)) return;

        const updateState = (config = {}) => {
            const newState = i({ store: t, element: targetElements, event: eventConfig, eventConfig: config, nativeEvent: e }, eventState);
            if (!H(newState, eventState)) t.dispatch(I.eventStateChanged(key, newState));
        };

        action.actionTypeId === E.ActionTypeConsts.GENERAL_CONTINUOUS_ACTION
            ? (Array.isArray(eventConfig.config) ? eventConfig.config : [eventConfig.config]).forEach(updateState)
            : updateState();
    });
};

const throttledEventHandler = u.default(handleEvent, 12);
const addEventListeners = ({ target = document, types, throttle }) => {
    types.split(" ").filter(Boolean).forEach(type => {
        const handler = throttle ? throttledEventHandler : handleEvent;
        target.addEventListener(type, handler);
        t.dispatch(I.eventListenerAdded(target, [type, handler]));
    });
};

Array.isArray(n) ? n.forEach(addEventListeners) : typeof n === "string" && addEventListeners(e);

// Global session setup
const { ixSession } = e.getState();

if (ixSession.eventListeners.length) {
    const attachResizeHandler = () => {
        eo(e);
    };

    ed.forEach(type => {
        window.addEventListener(type, attachResizeHandler);
        e.dispatch(I.eventListenerAdded(window, [type, attachResizeHandler]));
    });

    attachResizeHandler();
}

// Add IX2 class to HTML element if not present
(() => {
    const { documentElement } = document;
    if (!documentElement.className.includes(_)) {
        documentElement.className += ` ${_}`;
    }
})();

// Media query listener
if (e.getState().ixSession.hasDefinedMediaQueries) {
    C({
        store: e,
        select: ({ ixSession }) => ixSession.mediaQueryKey,
        onChange: () => {
            ei(e);
            U({ store: e, elementApi: T });
            en({ store: e, allowEvents: true });
            J();
        }
    });
}

// Start session
e.dispatch(I.sessionStarted());

// Animation frame loop
((store, useTick) => {
    const frameLoop = now => {
        const { ixSession, ixParameters } = store.getState();
        if (!ixSession.active) return;

        store.dispatch(I.animationFrameChanged(now, ixParameters));

        if (useTick) {
            const stopListener = C({
                store,
                select: ({ ixSession }) => ixSession.tick,
                onChange: e => {
                    frameLoop(e);
                    stopListener();
                }
            });
        } else {
            requestAnimationFrame(frameLoop);
        }
    };

    frameLoop(window.performance.now());
})(e, n);

        // Helper functions
const isWithin = (point, rect) =>
  point.left > rect.left && point.left < rect.right &&
  point.top > rect.top && point.top < rect.bottom;

const clickHandlerWrapper = (handler) => (event, state = { clickCount: 0 }) => {
  let newState = { clickCount: (state.clickCount % 2) + 1 };
  return newState.clickCount !== state.clickCount && handler(event, newState) || newState;
};

const createHandler = (useW = true) => ({
  ...q,
  handler: j(useW ? W : Q, el((event, state) => state.isActive ? $.handler(event, state) : state))
});

const createFallbackHandler = (useW = true) => ({
  ...q,
  handler: j(useW ? W : Q, el((event, state) => state.isActive ? state : $.handler(event, state)))
});

// Element visibility handler
const elementVisibilityHandler = {
  ...J,
  handler: (defaultHandler = (eventData, state) => {
    const { elementVisible } = state;
    const { event, store } = eventData;
    const { ixData } = store.getState();
    const { events } = ixData;

    if (!events[event.action.config.autoStopEventId] && state.triggered) return state;

    return event.eventTypeId === S === elementVisible ? (
      z(eventData),
      { ...state, triggered: true }
    ) : state;
  }, eventUpdater = (eventData, state) => {
    const updatedState = { ...state, elementVisible: ei(eventData) };
    return (state ? updatedState.elementVisible !== state.elementVisible : updatedState.elementVisible) 
      && defaultHandler(eventData, updatedState) 
      || updatedState;
  })
};

// Main event map
const eventMap = {
  [b]: createHandler(),
  [O]: createFallbackHandler(),
  [m]: createHandler(),
  [g]: createFallbackHandler(),
  [N]: createHandler(false),
  [v]: createFallbackHandler(false),
  [R]: createHandler(),
  [L]: createFallbackHandler(),
  [x]: { types: "ecommerce-cart-open", handler: j(W, z) },
  [U]: { types: "ecommerce-cart-close", handler: j(W, z) },
  [u]: { types: "click", handler: j(W, clickHandlerWrapper((event, { clickCount }) => {
    Y(event) ? clickCount === 1 && z(event) : z(event);
  })) },
  [E]: { types: "click", handler: j(W, clickHandlerWrapper((event, { clickCount }) => {
    clickCount === 2 && z(event);
  })) },
  [p]: { ...$, types: "mousedown" },
  [I]: { ...$, types: "mouseup" },
  [T]: { types: Z, handler: j(W, ed((event, state) => state.elementHovered && z(event))) },
  [y]: { types: Z, handler: j(W, ed((event, state) => !state.elementHovered && z(event))) },
  [_]: {
    types: "mousemove mouseout scroll",
    handler: ({ store, element, eventConfig, nativeEvent, eventStateKey }, lastState = { clientX: 0, clientY: 0, pageX: 0, pageY: 0 }) => {
      const { basedOn, selectedAxis, continuousParameterGroupId, reverse, restingState = 0 } = eventConfig;
      const { clientX = lastState.clientX, clientY = lastState.clientY, pageX = lastState.pageX, pageY = lastState.pageY } = nativeEvent;
      const isX = selectedAxis === "X_AXIS";
      const isMouseOut = nativeEvent.type === "mouseout";
      let progress = restingState / 100;
      let paramId = continuousParameterGroupId;
      let hovered = false;

      switch (basedOn) {
        case o.EventBasedOn.VIEWPORT:
          progress = isX ? Math.min(clientX, window.innerWidth) / window.innerWidth
                         : Math.min(clientY, window.innerHeight) / window.innerHeight;
          break;
        case o.EventBasedOn.PAGE: {
          const { scrollLeft, scrollTop, scrollWidth, scrollHeight } = et();
          progress = isX ? Math.min(scrollLeft + pageX, scrollWidth) / scrollWidth
                         : Math.min(scrollTop + pageY, scrollHeight) / scrollHeight;
          break;
        }
        case o.EventBasedOn.ELEMENT:
        default: {
          paramId = D(eventStateKey, continuousParameterGroupId);
          const isMouseEvent = nativeEvent.type.startsWith("mouse");
          if (isMouseEvent && !W({ element, nativeEvent })) break;

          const rect = element.getBoundingClientRect();
          if (!isMouseEvent && !isWithin({ left: clientX, top: clientY }, rect)) break;

          hovered = true;
          progress = isX ? (clientX - rect.left) / rect.width
                         : (clientY - rect.top) / rect.height;
        }
      }

      if (isMouseOut && (progress > 0.95 || progress < 0.05)) progress = Math.round(progress);
      if (basedOn !== o.EventBasedOn.ELEMENT || hovered || hovered !== lastState.elementHovered) {
        progress = reverse ? 1 - progress : progress;
        store.dispatch(c.parameterChanged(paramId, progress));
      }

      return { elementHovered: hovered, clientX, clientY, pageX, pageY };
    }
  },
  [G]: {
    types: K,
    handler: ({ store, eventConfig }) => {
      const { continuousParameterGroupId, reverse } = eventConfig;
      const { scrollTop, scrollHeight, clientHeight } = et();
      let scrollProgress = scrollTop / (scrollHeight - clientHeight);
      if (reverse) scrollProgress = 1 - scrollProgress;
      store.dispatch(c.parameterChanged(continuousParameterGroupId, scrollProgress));
    }
  },
  [M]: {
    types: K,
    handler: ({ element, store, eventConfig, eventStateKey }, lastState = { scrollPercent: 0 }) => {
      const { scrollLeft, scrollTop, scrollWidth, scrollHeight, clientHeight } = et();
      const { basedOn, selectedAxis, continuousParameterGroupId, startsEntering, startsExiting, addEndOffset, addStartOffset, addOffsetValue = 0, endOffsetValue = 0 } = eventConfig;

      if (basedOn === o.EventBasedOn.VIEWPORT) {
        const scrollProgress = selectedAxis === "X_AXIS" ? scrollLeft / scrollWidth : scrollTop / scrollHeight;
        if (scrollProgress !== lastState.scrollPercent)
          store.dispatch(c.parameterChanged(continuousParameterGroupId, scrollProgress));
        return { scrollPercent: scrollProgress };
      }

      const paramId = D(eventStateKey, continuousParameterGroupId);
      const rect = element.getBoundingClientRect();
      let startOffset = addStartOffset ? addOffsetValue / 100 : 0;
      let endOffset = addEndOffset ? endOffsetValue / 100 : 0;

      if (!startsEntering) startOffset = 1 - startOffset;
      if (!startsExiting) endOffset = 1 - endOffset;

      const visibleStart = rect.top + Math.min(rect.height * startOffset, clientHeight);
      const visibleEnd = Math.min(clientHeight + (rect.top + rect.height * endOffset - visibleStart), scrollHeight);
      const scrollPercent = Math.min(Math.max(0, clientHeight - visibleStart), visibleEnd) / visibleEnd;

      if (scrollPercent !== lastState.scrollPercent)
        store.dispatch(c.parameterChanged(paramId, scrollPercent));

      return { scrollPercent };
    }
  },
  [S]: elementVisibilityHandler,
  [h]: elementVisibilityHandler,
  [A]: { ...J, handler: eo((event, state) => state.scrollingDown && z(event)) },
  [C]: { ...J, handler: eo((event, state) => !state.scrollingDown && z(event)) },
  [V]: { types: "readystatechange IX2_PAGE_UPDATE", handler: j(Q, (event, state) => {
    const finished = document.readyState === "complete";
    if (finished && !(state?.finished)) z(event);
    return { finished };
  }) },
  [k]: { types: "readystatechange IX2_PAGE_UPDATE", handler: j(Q, (event, state) => (state || z(event), { started: true })) }
};

             function a() {
    let stateInputs = e.stateMachineInputs(c);
    if (stateInputs != null) {
        if (e.isPlaying || e.play(c, false), i in r || l in r) {
            let layout = e.layout;
            let fit = r[i] ?? layout.fit;
            let alignment = r[l] ?? layout.alignment;
            if (fit !== layout.fit || alignment !== layout.alignment) {
                e.layout = layout.copyWith({ fit, alignment });
            }
        }

        for (let key in r) {
            if (key === i || key === l) continue;

            let input = stateInputs.find(t => t.name === key);
            if (input != null) {
                switch (input.type) {
                    case s.Boolean:
                        if (r[key] != null) input.value = !!r[key];
                        break;

                    case s.Number: {
                        let val = t[key];
                        if (val != null) input.value = val;
                        break;
                    }

                    case s.Trigger:
                        if (r[key]) input.fire();
                        break;
                }
            }
        }
    }
}

d?.rive ? f(d.rive) : n.setLoadHandler(e, f);
const p = (e, t) => null;
javascript
Copy code
// Spline plugin helpers
const i = e => document.querySelector(`[data-w-id="${e}"]`);
const l = () => window.Webflow.require("spline");
const d = (arr, exclude) => arr.filter(e => !exclude.includes(e));
const o = (e, key) => e.value[key];
const s = () => null;

const defaultTransform = Object.freeze({
    positionX: 0, positionY: 0, positionZ: 0,
    rotationX: 0, rotationY: 0, rotationZ: 0,
    scaleX: 1, scaleY: 1, scaleZ: 1
});

const r = (existing, config) => {
    let keys = Object.keys(config.config.value);
    if (existing) {
        let missing = d(keys, Object.keys(existing));
        if (missing.length) return missing.reduce((acc, key) => (acc[key] = defaultTransform[key], acc), existing);
        return existing;
    }
    return keys.reduce((acc, key) => (acc[key] = defaultTransform[key], acc), {});
};

const f = e => e.value;

const u = (e, t) => {
    let pluginElement = t?.config?.target?.pluginElement;
    return pluginElement ? i(pluginElement) : null;
};

const E = (e, t, a) => {
    let splineLib = l();
    if (!splineLib) return;

    let instance = splineLib.getInstance(e);
    let objectId = a.config.target.objectId;

    const applyTransform = (spline) => {
        if (!spline) throw Error("Invalid spline app passed to renderSpline");
        let obj = objectId && spline.findObjectById(objectId);
        if (!obj) return;

        let vals = t.PLUGIN_SPLINE;
        if (vals.positionX != null) obj.position.x = vals.positionX;
        if (vals.positionY != null) obj.position.y = vals.positionY;
        if (vals.positionZ != null) obj.position.z = vals.positionZ;
        if (vals.rotationX != null) obj.rotation.x = vals.rotationX;
        if (vals.rotationY != null) obj.rotation.y = vals.rotationY;
        if (vals.rotationZ != null) obj.rotation.z = vals.rotationZ;
        if (vals.scaleX != null) obj.scale.x = vals.scaleX;
        if (vals.scaleY != null) obj.scale.y = vals.scaleY;
        if (vals.scaleZ != null) obj.scale.z = vals.scaleZ;
    };

    instance ? applyTransform(instance.spline) : splineLib.setLoadHandler(e, applyTransform);
};

const p = () => null;
           // Transform and style constants
const i = "|",
      l = "data-wf-page",
      d = "w-mod-js",
      o = "w-mod-ix",
      s = ".w-dyn-item",
      c = "xValue",
      r = "yValue",
      f = "zValue",
      u = "value",
      E = "xUnit",
      p = "yUnit",
      I = "zUnit",
      T = "unit",
      y = "transform",
      g = "translateX",
      m = "translateY",
      b = "translateZ",
      O = "translate3d",
      R = "scaleX",
      L = "scaleY",
      v = "scaleZ",
      N = "scale3d",
      _ = "rotateX",
      A = "rotateY",
      S = "rotateZ",
      h = "skew",
      C = "skewX",
      M = "skewY",
      V = "opacity",
      U = "filter",
      x = "font-variation-settings",
      k = "width",
      G = "height",
      B = "backgroundColor",
      w = "background",
      P = "borderColor",
      D = "color",
      F = "display",
      Q = "flex",
      X = "willChange",
      W = "AUTO",
      H = ",",
      Y = ":",
      z = "|",
      j = "CHILDREN",
      $ = "IMMEDIATE_CHILDREN",
      q = "SIBLINGS",
      K = "PARENT",
      Z = "preserve-3d",
      J = "HTML_ELEMENT",
      ee = "PLAIN_OBJECT",
      et = "ABSTRACT_NODE",
      ea = "RENDER_TRANSFORM",
      en = "RENDER_GENERAL",
      ei = "RENDER_STYLE",
      el = "RENDER_PLUGIN";

// Mapping for easy access
const a = {
    TRANSLATE_3D: () => O,
    TRANSLATE_X: () => g,
    TRANSLATE_Y: () => m,
    TRANSLATE_Z: () => b,
    WF_PAGE: () => l,
    WIDTH: () => k,
    WILL_CHANGE: () => X,
    W_MOD_IX: () => o,
    W_MOD_JS: () => d
};

for (let n in a) {
    Object.defineProperty(t, n, {
        enumerable: true,
        get: a[n]
    });
}

// Action type constants
const ActionTypeConsts = {
    TRANSFORM_MOVE: "TRANSFORM_MOVE",
    TRANSFORM_SCALE: "TRANSFORM_SCALE",
    TRANSFORM_ROTATE: "TRANSFORM_ROTATE",
    TRANSFORM_SKEW: "TRANSFORM_SKEW",
    STYLE_OPACITY: "STYLE_OPACITY",
    STYLE_SIZE: "STYLE_SIZE",
    STYLE_FILTER: "STYLE_FILTER",
    STYLE_FONT_VARIATION: "STYLE_FONT_VARIATION",
    STYLE_BACKGROUND_COLOR: "STYLE_BACKGROUND_COLOR",
    STYLE_BORDER: "STYLE_BORDER",
    STYLE_TEXT_COLOR: "STYLE_TEXT_COLOR",
    OBJECT_VALUE: "OBJECT_VALUE",
    PLUGIN_LOTTIE: "PLUGIN_LOTTIE",
    PLUGIN_SPLINE: "PLUGIN_SPLINE",
    PLUGIN_RIVE: "PLUGIN_RIVE",
    PLUGIN_VARIABLE: "PLUGIN_VARIABLE",
    GENERAL_DISPLAY: "GENERAL_DISPLAY",
    GENERAL_START_ACTION: "GENERAL_START_ACTION",
    GENERAL_CONTINUOUS_ACTION: "GENERAL_CONTINUOUS_ACTION",
    GENERAL_COMBO_CLASS: "GENERAL_COMBO_CLASS",
    GENERAL_STOP_ACTION: "GENERAL_STOP_ACTION",
    GENERAL_LOOP: "GENERAL_LOOP",
    STYLE_BOX_SHADOW: "STYLE_BOX_SHADOW"
};

// Action applies to constants
const ActionAppliesTo = {
    ELEMENT: "ELEMENT",
    ELEMENT_CLASS: "ELEMENT_CLASS",
    TRIGGER_ELEMENT: "TRIGGER_ELEMENT"
};

// Event constants
const EventTypeConsts = {
    NAVBAR_OPEN: "NAVBAR_OPEN",
    NAVBAR_CLOSE: "NAVBAR_CLOSE",
    TAB_ACTIVE: "TAB_ACTIVE",
    TAB_INACTIVE: "TAB_INACTIVE",
    SLIDER_ACTIVE: "SLIDER_ACTIVE",
    SLIDER_INACTIVE: "SLIDER_INACTIVE",
    DROPDOWN_OPEN: "DROPDOWN_OPEN",
    DROPDOWN_CLOSE: "DROPDOWN_CLOSE",
    MOUSE_CLICK: "MOUSE_CLICK",
    MOUSE_SECOND_CLICK: "MOUSE_SECOND_CLICK",
    MOUSE_DOWN: "MOUSE_DOWN",
    MOUSE_UP: "MOUSE_UP",
    MOUSE_OVER: "MOUSE_OVER",
    MOUSE_OUT: "MOUSE_OUT",
    MOUSE_MOVE: "MOUSE_MOVE",
    MOUSE_MOVE_IN_VIEWPORT: "MOUSE_MOVE_IN_VIEWPORT",
    SCROLL_INTO_VIEW: "SCROLL_INTO_VIEW",
    SCROLL_OUT_OF_VIEW: "SCROLL_OUT_OF_VIEW",
    SCROLLING_IN_VIEW: "SCROLLING_IN_VIEW",
    ECOMMERCE_CART_OPEN: "ECOMMERCE_CART_OPEN",
    ECOMMERCE_CART_CLOSE: "ECOMMERCE_CART_CLOSE",
    PAGE_START: "PAGE_START",
    PAGE_FINISH: "PAGE_FINISH",
    PAGE_SCROLL_UP: "PAGE_SCROLL_UP",
    PAGE_SCROLL_DOWN: "PAGE_SCROLL_DOWN",
    PAGE_SCROLL: "PAGE_SCROLL"
};

const EventAppliesTo = {
    ELEMENT: "ELEMENT",
    CLASS: "CLASS",
    PAGE: "PAGE"
};

const EventBasedOn = {
    ELEMENT: "ELEMENT",
    VIEWPORT: "VIEWPORT"
};

const EventContinuousMouseAxes = {
    X_AXIS: "X_AXIS",
    Y_AXIS: "Y_AXIS"
};

const EventLimitAffectedElements = {
    CHILDREN: "CHILDREN",
    SIBLINGS: "SIBLINGS",
    IMMEDIATE_CHILDREN: "IMMEDIATE_CHILDREN"
};

const QuickEffectIds = {
    FADE_EFFECT: "FADE_EFFECT",
    SLIDE_EFFECT: "SLIDE_EFFECT",
    GROW_EFFECT: "GROW_EFFECT",
    SHRINK_EFFECT: "SHRINK_EFFECT",
    SPIN_EFFECT: "SPIN_EFFECT",
    FLY_EFFECT: "FLY_EFFECT",
    POP_EFFECT: "POP_EFFECT",
    FLIP_EFFECT: "FLIP_EFFECT",
    JIGGLE_EFFECT: "JIGGLE_EFFECT",
    PULSE_EFFECT: "PULSE_EFFECT",
    DROP_EFFECT: "DROP_EFFECT",
    BLINK_EFFECT: "BLINK_EFFECT",
    BOUNCE_EFFECT: "BOUNCE_EFFECT",
    FLIP_LEFT_TO_RIGHT_EFFECT: "FLIP_LEFT_TO_RIGHT_EFFECT",
    FLIP_RIGHT_TO_LEFT_EFFECT: "FLIP_RIGHT_TO_LEFT_EFFECT",
    RUBBER_BAND_EFFECT: "RUBBER_BAND_EFFECT",
    JELLO_EFFECT: "JELLO_EFFECT",
    GROW_BIG_EFFECT: "GROW_BIG_EFFECT",
    SHRINK_BIG_EFFECT: "SHRINK_BIG_EFFECT",
    PLUGIN_LOTTIE_EFFECT: "PLUGIN_LOTTIE_EFFECT"
};

// Quick effect directions
const QuickEffectDirectionConsts = {
    LEFT: "LEFT",
    RIGHT: "RIGHT",
    BOTTOM: "BOTTOM",
    TOP: "TOP",
    BOTTOM_LEFT: "BOTTOM_LEFT",
    BOTTOM_RIGHT: "BOTTOM_RIGHT",
    TOP_RIGHT: "TOP_RIGHT",
    TOP_LEFT: "TOP_LEFT",
    CLOCKWISE: "CLOCKWISE",
    COUNTER_CLOCKWISE: "COUNTER_CLOCKWISE"
};

       // Named CSS colors
const namedColors = {
    aliceblue: "#F0F8FF",
    antiquewhite: "#FAEBD7",
    aqua: "#00FFFF",
    aquamarine: "#7FFFD4",
    azure: "#F0FFFF",
    beige: "#F5F5DC",
    bisque: "#FFE4C4",
    black: "#000000",
    blanchedalmond: "#FFEBCD",
    blue: "#0000FF",
    blueviolet: "#8A2BE2",
    brown: "#A52A2A",
    burlywood: "#DEB887",
    cadetblue: "#5F9EA0",
    chartreuse: "#7FFF00",
    chocolate: "#D2691E",
    coral: "#FF7F50",
    cornflowerblue: "#6495ED",
    cornsilk: "#FFF8DC",
    crimson: "#DC143C",
    cyan: "#00FFFF",
    darkblue: "#00008B",
    darkcyan: "#008B8B",
    darkgoldenrod: "#B8860B",
    darkgray: "#A9A9A9",
    darkgreen: "#006400",
    darkgrey: "#A9A9A9",
    darkkhaki: "#BDB76B",
    darkmagenta: "#8B008B",
    darkolivegreen: "#556B2F",
    darkorange: "#FF8C00",
    darkorchid: "#9932CC",
    darkred: "#8B0000",
    darksalmon: "#E9967A",
    darkseagreen: "#8FBC8F",
    darkslateblue: "#483D8B",
    darkslategray: "#2F4F4F",
    darkslategrey: "#2F4F4F",
    darkturquoise: "#00CED1",
    darkviolet: "#9400D3",
    deeppink: "#FF1493",
    deepskyblue: "#00BFFF",
    dimgray: "#696969",
    dimgrey: "#696969",
    dodgerblue: "#1E90FF",
    firebrick: "#B22222",
    floralwhite: "#FFFAF0",
    forestgreen: "#228B22",
    fuchsia: "#FF00FF",
    gainsboro: "#DCDCDC",
    ghostwhite: "#F8F8FF",
    gold: "#FFD700",
    goldenrod: "#DAA520",
    gray: "#808080",
    green: "#008000",
    greenyellow: "#ADFF2F",
    grey: "#808080",
    honeydew: "#F0FFF0",
    hotpink: "#FF69B4",
    indianred: "#CD5C5C",
    indigo: "#4B0082",
    ivory: "#FFFFF0",
    khaki: "#F0E68C",
    lavender: "#E6E6FA",
    lavenderblush: "#FFF0F5",
    lawngreen: "#7CFC00",
    lemonchiffon: "#FFFACD",
    lightblue: "#ADD8E6",
    lightcoral: "#F08080",
    lightcyan: "#E0FFFF",
    lightgoldenrodyellow: "#FAFAD2",
    lightgray: "#D3D3D3",
    lightgreen: "#90EE90",
    lightgrey: "#D3D3D3",
    lightpink: "#FFB6C1",
    lightsalmon: "#FFA07A",
    lightseagreen: "#20B2AA",
    lightskyblue: "#87CEFA",
    lightslategray: "#778899",
    lightslategrey: "#778899",
    lightsteelblue: "#B0C4DE",
    lightyellow: "#FFFFE0",
    lime: "#00FF00",
    limegreen: "#32CD32",
    linen: "#FAF0E6",
    magenta: "#FF00FF",
    maroon: "#800000",
    mediumaquamarine: "#66CDAA",
    mediumblue: "#0000CD",
    mediumorchid: "#BA55D3",
    mediumpurple: "#9370DB",
    mediumseagreen: "#3CB371",
    mediumslateblue: "#7B68EE",
    mediumspringgreen: "#00FA9A",
    mediumturquoise: "#48D1CC",
    mediumvioletred: "#C71585",
    midnightblue: "#191970",
    mintcream: "#F5FFFA",
    mistyrose: "#FFE4E1",
    moccasin: "#FFE4B5",
    navajowhite: "#FFDEAD",
    navy: "#000080",
    oldlace: "#FDF5E6",
    olive: "#808000",
    olivedrab: "#6B8E23",
    orange: "#FFA500",
    orangered: "#FF4500",
    orchid: "#DA70D6",
    palegoldenrod: "#EEE8AA",
    palegreen: "#98FB98",
    paleturquoise: "#AFEEEE",
    palevioletred: "#DB7093",
    papayawhip: "#FFEFD5",
    peachpuff: "#FFDAB9",
    peru: "#CD853F",
    pink: "#FFC0CB",
    plum: "#DDA0DD",
    powderblue: "#B0E0E6",
    purple: "#800080",
    rebeccapurple: "#663399",
    red: "#FF0000",
    rosybrown: "#BC8F8F",
    royalblue: "#4169E1",
    saddlebrown: "#8B4513",
    salmon: "#FA8072",
    sandybrown: "#F4A460",
    seagreen: "#2E8B57",
    seashell: "#FFF5EE",
    sienna: "#A0522D",
    silver: "#C0C0C0",
    skyblue: "#87CEEB",
    slateblue: "#6A5ACD",
    slategray: "#708090",
    slategrey: "#708090",
    snow: "#FFFAFA",
    springgreen: "#00FF7F",
    steelblue: "#4682B4",
    tan: "#D2B48C",
    teal: "#008080",
    thistle: "#D8BFD8",
    tomato: "#FF6347",
    turquoise: "#40E0D0",
    violet: "#EE82EE",
    wheat: "#F5DEB3",
    white: "#FFFFFF",
    whitesmoke: "#F5F5F5",
    yellow: "#FFFF00",
    yellowgreen: "#9ACD32"
};

// Normalize any CSS color to RGBA
function normalizeColor(input) {
    let r, g, b, a = 1;
    const str = input.replace(/\s/g, "").toLowerCase();
    const color = (namedColors[str] || str).toLowerCase();

    if (color.startsWith("#")) {
        const hex = color.slice(1);
        if (hex.length === 3 || hex.length === 4) {
            r = parseInt(hex[0] + hex[0], 16);
            g = parseInt(hex[1] + hex[1], 16);
            b = parseInt(hex[2] + hex[2], 16);
            if (hex.length === 4) a = parseInt(hex[3] + hex[3], 16) / 255;
        } else if (hex.length === 6 || hex.length === 8) {
            r = parseInt(hex.slice(0, 2), 16);
            g = parseInt(hex.slice(2, 4), 16);
            b = parseInt(hex.slice(4, 6), 16);
            if (hex.length === 8) a = parseInt(hex.slice(6, 8), 16) / 255;
        }
    } else if (color.startsWith("rgba")) {
        const [red, green, blue, alpha] = color.match(/rgba\(([^)]+)\)/)[1].split(",");
        r = parseInt(red, 10);
        g = parseInt(green, 10);
        b = parseInt(blue, 10);
        a = parseFloat(alpha);
    } else if (color.startsWith("rgb")) {
        const [red, green, blue] = color.match(/rgb\(([^)]+)\)/)[1].split(",");
        r = parseInt(red, 10);
        g = parseInt(green, 10);
        b = parseInt(blue, 10);
    } else if (color.startsWith("hsla")) {
        const [h, s, l, alpha] = color.match(/hsla\(([^)]+)\)/)[1].split(",");
        const hue = parseFloat(h);
        const sat = parseFloat(s.replace("%", "")) / 100;
        const light = parseFloat(l.replace("%", "")) / 100;
        a = parseFloat(alpha);

        const C = (1 - Math.abs(2 * light - 1)) * sat;
        const X = C * (1 - Math.abs((hue / 60) % 2 - 1));
        const m = light - C / 2;

        let r1, g1, b1;
        if (hue >= 0 && hue < 60) [r1, g1, b1] = [C, X, 0];
        else if (hue < 120) [r1, g1, b1] = [X, C, 0];
        else if (hue < 180) [r1, g1, b1] = [0, C, X];
        else if (hue < 240) [r1, g1, b1] = [0, X, C];
        else if (hue < 300) [r1, g1, b1] = [X, 0, C];
        else [r1, g1, b1] = [C, 0, X];

        r = Math.round((r1 + m) * 255);
        g = Math.round((g1 + m) * 255);
        b = Math.round((b1 + m) * 255);
    } else if (color.startsWith("hsl")) {
        const [h, s, l] = color.match(/hsl\(([^)]+)\)/)[1].split(",");
        const hue = parseFloat(h);
        const sat = parseFloat(s.replace("%", "")) / 100;
        const light = parseFloat(l.replace("%", "")) / 100;

        const C = (1 - Math.abs(2 * light - 1)) * sat;
        const X = C * (1 - Math.abs((hue / 60) % 2 - 1));
        const m = light - C / 2;

        let r1, g1, b1;
        if (hue >= 0 && hue < 60) [r1, g1, b1] = [C, X, 0];
        else if (hue < 120) [r1, g1, b1] = [X, C, 0];
        else if (hue < 180) [r1, g1, b1] = [0, C, X];
        else if (hue < 240) [r1, g1, b1] = [0, X, C];
        else if (hue < 300) [r1, g1, b1] = [X, 0, C];
        else [r1, g1, b1] = [C, 0, X];

        r = Math.round((r1 + m) * 255);
        g = Math.round((g1 + m) * 255);
        b = Math.round((b1 + m) * 255);
    }

    if ([r, g, b].some(v => Number.isNaN(v))) {
        throw new Error(`Invalid color in [ix2/shared/utils/normalizeColor.js]: '${input}'`);
    }

    return { red: r, green: g, blue: b, alpha: a };
}

      // Module helpers for handling imports and WeakMap caching
function createWeakMapCache(target) {
    if (typeof WeakMap !== "function") return null;
    const cacheA = new WeakMap();
    const cacheB = new WeakMap();
    return (target) => (target ? cacheB : cacheA);
}

function interopRequireDefault(module, useCache) {
    if (!useCache && module && module.__esModule) return module;
    if (module === null || (typeof module !== "object" && typeof module !== "function")) {
        return { default: module };
    }

    const cache = createWeakMapCache(useCache);
    if (cache && cache.has(module)) return cache.get(module);

    const newModule = { __proto__: null };
    const descriptor = Object.getOwnPropertyDescriptor;

    for (const key in module) {
        if (key !== "default" && Object.prototype.hasOwnProperty.call(module, key)) {
            const desc = descriptor ? descriptor(module, key) : null;
            if (desc && (desc.get || desc.set)) Object.defineProperty(newModule, key, desc);
            else newModule[key] = module[key];
        }
    }

    newModule.default = module;
    if (cache) cache.set(module, newModule);
    return newModule;
}

// Browser/environment utilities (2662)
const IS_BROWSER_ENV = typeof window !== "undefined";
const withBrowser = (fn, fallback) => IS_BROWSER_ENV ? fn() : fallback;

// Detect supported element.matches method
const ELEMENT_MATCHES = withBrowser(
    () => require(9777).default([
        "matches",
        "matchesSelector",
        "mozMatchesSelector",
        "msMatchesSelector",
        "oMatchesSelector",
        "webkitMatchesSelector"
    ], prop => prop in Element.prototype)
);

// Detect flex display prefix
const FLEX_PREFIXED = withBrowser(() => {
    const el = document.createElement("i");
    const flexValues = ["flex", "-webkit-flex", "-ms-flexbox", "-moz-box", "-webkit-box"];
    try {
        for (const val of flexValues) {
            el.style.display = val;
            if (el.style.display === val) return val;
        }
        return "";
    } catch {
        return "";
    }
}, "flex");

// Detect transform and transform-style prefixes
const TRANSFORM_PREFIXED = withBrowser(() => {
    const el = document.createElement("i");
    if (el.style.transform == null) {
        const prefixes = ["Webkit", "Moz", "ms"];
        for (const p of prefixes) {
            const prop = p + "Transform";
            if (el.style[prop] !== undefined) return prop;
        }
    }
    return "transform";
}, "transform");

const TRANSFORM_STYLE_PREFIXED = (() => {
    const prefix = TRANSFORM_PREFIXED.split("transform")[0];
    return prefix ? prefix + "TransformStyle" : "transformStyle";
})();

// Easing utilities (3767)
function optimizeFloat(value, precision = 5, base = 10) {
    const factor = Math.pow(base, precision);
    const rounded = Math.round(value * factor) / factor;
    return Math.abs(rounded) > 1e-4 ? rounded : 0;
}

function createBezierEasing(...args) {
    const bezier = interopRequireDefault(require(1361)).default;
    return bezier(...args);
}

function applyEasing(easingName, t, easingFunc) {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (easingFunc) return optimizeFloat(t > 0 ? easingFunc(t) : t);
    return optimizeFloat(t > 0 && easingName && easingFunctions[easingName] ? easingFunctions[easingName](t) : t);
}

// Import easing functions
const easingFunctions = interopRequireDefault(require(8686));

   "use strict";

// Easing module
Object.defineProperty(exports, "__esModule", { value: true });

// Import Bezier utility
const bezierModule = require(1361);
const bezier = (bezierModule && bezierModule.__esModule ? bezierModule : { default: bezierModule }).default;

// Predefined Bezier curves
const ease = bezier(0.25, 0.1, 0.25, 1);
const easeIn = bezier(0.42, 0, 1, 1);
const easeOut = bezier(0, 0, 0.58, 1);
const easeInOut = bezier(0.42, 0, 0.58, 1);

// Exports
const easingFunctions = {
    // Bezier-based easings
    bounce: undefined,       // Will define below
    bouncePast: undefined,
    ease,
    easeIn,
    easeInOut,
    easeOut,

    // Polynomial
    inQuad: (t) => Math.pow(t, 2),
    outQuad: (t) => -(Math.pow(t - 1, 2) - 1),
    inOutQuad: (t) => (t /= 0.5) < 1 ? 0.5 * Math.pow(t, 2) : -0.5 * ((t -= 2) * t - 2),

    inCubic: (t) => Math.pow(t, 3),
    outCubic: (t) => Math.pow(t - 1, 3) + 1,
    inOutCubic: (t) => (t /= 0.5) < 1 ? 0.5 * Math.pow(t, 3) : 0.5 * (Math.pow(t - 2, 3) + 2),

    inQuart: (t) => Math.pow(t, 4),
    outQuart: (t) => -(Math.pow(t - 1, 4) - 1),
    inOutQuart: (t) => (t /= 0.5) < 1 ? 0.5 * Math.pow(t, 4) : -0.5 * ((t -= 2) * Math.pow(t, 3) - 2),

    inQuint: (t) => Math.pow(t, 5),
    outQuint: (t) => Math.pow(t - 1, 5) + 1,
    inOutQuint: (t) => (t /= 0.5) < 1 ? 0.5 * Math.pow(t, 5) : 0.5 * (Math.pow(t - 2, 5) + 2),

    inSine: (t) => -Math.cos((Math.PI / 2) * t) + 1,
    outSine: (t) => Math.sin((Math.PI / 2) * t),
    inOutSine: (t) => -0.5 * (Math.cos(Math.PI * t) - 1),

    inExpo: (t) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
    outExpo: (t) => t === 1 ? 1 : -Math.pow(2, -10 * t) + 1,
    inOutExpo: (t) => t === 0 ? 0 : t === 1 ? 1 : (t /= 0.5) < 1
        ? 0.5 * Math.pow(2, 10 * (t - 1))
        : 0.5 * (-Math.pow(2, -10 * --t) + 2),

    inCirc: (t) => -(Math.sqrt(1 - t * t) - 1),
    outCirc: (t) => Math.sqrt(1 - Math.pow(t - 1, 2)),
    inOutCirc: (t) => (t /= 0.5) < 1
        ? -0.5 * (Math.sqrt(1 - t * t) - 1)
        : 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1),

    // Back easing
    inBack: (t) => t * t * (2.70158 * t - 1.70158),
    outBack: (t) => (t -= 1) * t * (2.70158 * t + 1.70158) + 1,
    inOutBack: (t) => {
        let s = 1.70158 * 1.525;
        return (t /= 0.5) < 1
            ? 0.5 * (t * t * ((s + 1) * t - s))
            : 0.5 * ((t -= 2) * t * ((s + 1) * t + s) + 2);
    },

    // Elastic easing
    inElastic: (t) => {
        let a = 1.70158, p = 0, n = 1;
        if (t === 0) return 0;
        if (t === 1) return 1;
        if (!p) p = 0.3;
        if (n < 1) { n = 1; a = p / 4; }
        else a = p / (2 * Math.PI) * Math.asin(1 / n);
        return -(n * Math.pow(2, 10 * (t - 1)) * Math.sin(2 * Math.PI * (t - a) / p));
    },
    inOutElastic: undefined, // Could define similarly

    // Swing functions
    swingFrom: (t) => t * t * (2.70158 * t - 1.70158),
    swingTo: (t) => (t -= 1) * t * (2.70158 * t + 1.70158),
    swingFromTo: undefined, // Placeholder

    // Bounce
    outBounce: (t) => {
        if (t < 1 / 2.75) return 7.5625 * t * t;
        else if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        else if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        else return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    },
};

// Attach each easing as a getter for export
for (const key in easingFunctions) {
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: () => easingFunctions[key],
    });
}

       "use strict";

// Easing Functions - continued from previous chunk
function easeOutBack(t) {
    return (t -= 1) * t * (2.70158 * t + 1.70158) + 1;
}

function inOutBack(t) {
    let s = 1.70158;
    return (t /= 0.5) < 1
        ? 0.5 * (t * t * (((s *= 1.525) + 1) * t - s))
        : 0.5 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2);
}

function inBack(t) {
    return t * t * (2.70158 * t - 1.70158);
}

// Elastic easing
function inElastic(t) {
    let s = 1.70158, a = 0.3, n = 1;
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (n < 1) { n = 1; s = a / 4; } 
    else s = a / (2 * Math.PI) * Math.asin(1 / n);
    return -(n * Math.pow(2, 10 * (t - 1)) * Math.sin(2 * Math.PI * (t - s) / a));
}

function outElastic(t) {
    let s = 1.70158, a = 0.3, n = 1;
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (n < 1) { n = 1; s = a / 4; } 
    else s = a / (2 * Math.PI) * Math.asin(1 / n);
    return n * Math.pow(2, -10 * t) * Math.sin(2 * Math.PI * (t - s) / a) + 1;
}

function inOutElastic(t) {
    let s = 1.70158, a = 0.45, n = 1; // a = 0.3 * 1.5
    if (t === 0) return 0;
    if ((t /= 0.5) === 2) return 1;
    if (n < 1) { n = 1; s = a / 4; } 
    else s = a / (2 * Math.PI) * Math.asin(1 / n);
    if (t < 1) return -0.5 * (n * Math.pow(2, 10 * (t - 1)) * Math.sin(2 * Math.PI * (t - s) / a));
    return n * Math.pow(2, -10 * (t - 1)) * Math.sin(2 * Math.PI * (t - s) / a) * 0.5 + 1;
}

// Bounce
function outBounce(t) {
    if (t < 1 / 2.75) return 7.5625 * t * t;
    if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
}

function bounce(t) {
    if (t < 1 / 2.75) return 7.5625 * t * t;
    if (t < 2 / 2.75) return 2 - (7.5625 * (t -= 1.5 / 2.75) * t + 0.75);
    if (t < 2.5 / 2.75) return 2 - (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375);
    return 2 - (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375);
}

// Back swing
function swingFromTo(t) {
    let s = 1.70158;
    return (t /= 0.5) < 1
        ? 0.5 * (t * t * (((s *= 1.525) + 1) * t - s))
        : 0.5 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2);
}

function swingFrom(t) {
    return t * t * (2.70158 * t - 1.70158);
}

function swingTo(t) {
    return (t -= 1) * t * (2.70158 * t + 1.70158) + 1;
}


// IX2 Plugin Utils
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const browserUtils = require(2662);
const pluginData = require(3690);

function isPluginType(type) {
    return pluginData.pluginMethodMap.has(type);
}

const getPluginMethod = (method) => (pluginType) => {
    if (!browserUtils.IS_BROWSER_ENV) return () => null;
    const pluginConfig = pluginData.pluginMethodMap.get(pluginType);
    if (!pluginConfig) throw Error(`IX2 no plugin configured for: ${pluginType}`);
    const fn = pluginConfig[method];
    if (!fn) throw Error(`IX2 invalid plugin method: ${method}`);
    return fn;
};

const getPluginConfig = getPluginMethod("getPluginConfig");
const getPluginOrigin = getPluginMethod("getPluginOrigin");
const getPluginDuration = getPluginMethod("getPluginDuration");
const getPluginDestination = getPluginMethod("getPluginDestination");
const createPluginInstance = getPluginMethod("createPluginInstance");
const renderPlugin = getPluginMethod("renderPlugin");
const clearPlugin = getPluginMethod("clearPlugin");


// IX2 DOM / Element Utils
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const I = require(4075);
const Q = require(1455);
const R = require(5720);
const ActionConsts = require(7087);
const easing = require(3767);
const PluginUtils = require(1799);
const BrowserUtils = require(2662);

let instanceCounter = 1;
function getInstanceId() { return "i" + instanceCounter++; }

let elementCounter = 1;
function getElementId(elements, ref) {
    for (let key in elements) {
        const el = elements[key];
        if (el && el.ref === ref) return el.id;
    }
    return "e" + elementCounter++;
}

function reifyState({ events, actionLists, site } = {}) {
    const eventTypeMap = Q.default(
        events,
        (map, action) => {
            const { eventTypeId } = action;
            map[eventTypeId] = map[eventTypeId] || {};
            map[eventTypeId][action.id] = action;
            return map;
        },
        {}
    );

    const mediaQueries = site?.mediaQueries || [];
    if (!site?.mediaQueries) console.warn("IX2 missing mediaQueries in site data");

    const mediaQueryKeys = mediaQueries.map(mq => mq.key) || [];

    return {
        ixData: {
            events,
            actionLists,
            eventTypeMap,
            mediaQueries,
            mediaQueryKeys
        }
    };
}

// I STOPPED HERE

        let ey = (e, t) => e === t;
        function eg({store: e, select: t, onChange: a, comparator: n=ey}) {
            let {getState: i, subscribe: l} = e
              , d = l(function() {
                let l = t(i());
                if (null == l)
                    return void d();
                n(l, o) || a(o = l, e)
            })
              , o = t(i());
            return d
        }
        function em(e) {
            let t = typeof e;
            if ("string" === t)
                return {
                    id: e
                };
            if (null != e && "object" === t) {
                let {id: t, objectId: a, selector: n, selectorGuids: i, appliesTo: l, useEventTarget: d} = e;
                return {
                    id: t,
                    objectId: a,
                    selector: n,
                    selectorGuids: i,
                    appliesTo: l,
                    useEventTarget: d
                }
            }
            return {}
        }
        function eb({config: e, event: t, eventTarget: a, elementRoot: n, elementApi: i}) {
            let l, d, o;
            if (!i)
                throw Error("IX2 missing elementApi");
            let {targets: s} = e;
            if (Array.isArray(s) && s.length > 0)
                return s.reduce( (e, l) => e.concat(eb({
                    config: {
                        target: l
                    },
                    event: t,
                    eventTarget: a,
                    elementRoot: n,
                    elementApi: i
                })), []);
            let {getValidDocument: r, getQuerySelector: f, queryDocument: u, getChildElements: E, getSiblingElements: I, matchSelector: T, elementContains: y, isSiblingNode: g} = i
              , {target: m} = e;
            if (!m)
                return [];
            let {id: b, objectId: O, selector: R, selectorGuids: L, appliesTo: v, useEventTarget: N} = em(m);
            if (O)
                return [er.has(O) ? er.get(O) : er.set(O, {}).get(O)];
            if (v === c.EventAppliesTo.PAGE) {
                let e = r(b);
                return e ? [e] : []
            }
            let _ = (t?.action?.config?.affectedElements ?? {})[b || R] || {}
              , A = !!(_.id || _.selector)
              , S = t && f(em(t.target));
            if (A ? (l = _.limitAffectedElements,
            d = S,
            o = f(_)) : d = o = f({
                id: b,
                selector: R,
                selectorGuids: L
            }),
            t && N) {
                let e = a && (o || !0 === N) ? [a] : u(S);
                if (o) {
                    if (N === B)
                        return u(o).filter(t => e.some(e => y(t, e)));
                    if (N === x)
                        return u(o).filter(t => e.some(e => y(e, t)));
                    if (N === G)
                        return u(o).filter(t => e.some(e => g(e, t)))
                }
                return e
            }
            return null == d || null == o ? [] : p.IS_BROWSER_ENV && n ? u(o).filter(e => n.contains(e)) : l === x ? u(d, o) : l === k ? E(u(d)).filter(T(o)) : l === G ? I(u(d)).filter(T(o)) : u(o)
        }
        function eO({element: e, actionItem: t}) {
            if (!p.IS_BROWSER_ENV)
                return {};
            let {actionTypeId: a} = t;
            switch (a) {
            case et:
            case ea:
            case en:
            case ei:
            case el:
                return window.getComputedStyle(e);
            default:
                return {}
            }
        }
        let eR = /px/
          , eL = (e, t) => t.reduce( (e, t) => (null == e[t.type] && (e[t.type] = ex[t.type]),
        e), e || {})
          , ev = (e, t) => t.reduce( (e, t) => (null == e[t.type] && (e[t.type] = ek[t.type] || t.defaultValue || 0),
        e), e || {});
        function eN(e, t={}, a={}, n, i) {
            let {getStyle: d} = i
              , {actionTypeId: o} = n;
            if ((0,
            E.isPluginType)(o))
                return (0,
                E.getPluginOrigin)(o)(t[o], n);
            switch (n.actionTypeId) {
            case j:
            case $:
            case q:
            case K:
                return t[n.actionTypeId] || eU[n.actionTypeId];
            case J:
                return eL(t[n.actionTypeId], n.config.filters);
            case ee:
                return ev(t[n.actionTypeId], n.config.fontVariations);
            case Z:
                return {
                    value: (0,
                    l.default)(parseFloat(d(e, _)), 1)
                };
            case et:
                {
                    let t, i = d(e, h), o = d(e, C);
                    return {
                        widthValue: n.config.widthUnit === D ? eR.test(i) ? parseFloat(i) : parseFloat(a.width) : (0,
                        l.default)(parseFloat(i), parseFloat(a.width)),
                        heightValue: n.config.heightUnit === D ? eR.test(o) ? parseFloat(o) : parseFloat(a.height) : (0,
                        l.default)(parseFloat(o), parseFloat(a.height))
                    }
                }
            case ea:
            case en:
            case ei:
                return function({element: e, actionTypeId: t, computedStyle: a, getStyle: n}) {
                    let i = es[t]
                      , d = n(e, i)
                      , o = (function(e, t) {
                        let a = e.exec(t);
                        return a ? a[1] : ""
                    }
                    )(eP, ew.test(d) ? d : a[i]).split(F);
                    return {
                        rValue: (0,
                        l.default)(parseInt(o[0], 10), 255),
                        gValue: (0,
                        l.default)(parseInt(o[1], 10), 255),
                        bValue: (0,
                        l.default)(parseInt(o[2], 10), 255),
                        aValue: (0,
                        l.default)(parseFloat(o[3]), 1)
                    }
                }({
                    element: e,
                    actionTypeId: n.actionTypeId,
                    computedStyle: a,
                    getStyle: d
                });
            case el:
                return {
                    value: (0,
                    l.default)(d(e, w), a.display)
                };
            case ed:
                return t[n.actionTypeId] || {
                    value: 0
                };
            default:
                return
            }
        }
        let e_ = (e, t) => (t && (e[t.type] = t.value || 0),
        e)
          , eA = (e, t) => (t && (e[t.type] = t.value || 0),
        e)
          , eS = (e, t, a) => {
            if ((0,
            E.isPluginType)(e))
                return (0,
                E.getPluginConfig)(e)(a, t);
            switch (e) {
            case J:
                {
                    let e = (0,
                    o.default)(a.filters, ({type: e}) => e === t);
                    return e ? e.value : 0
                }
            case ee:
                {
                    let e = (0,
                    o.default)(a.fontVariations, ({type: e}) => e === t);
                    return e ? e.value : 0
                }
            default:
                return a[t]
            }
        }
        ;
        function eh({element: e, actionItem: t, elementApi: a}) {
            if ((0,
            E.isPluginType)(t.actionTypeId))
                return (0,
                E.getPluginDestination)(t.actionTypeId)(t.config);
            switch (t.actionTypeId) {
            case j:
            case $:
            case q:
            case K:
                {
                    let {xValue: e, yValue: a, zValue: n} = t.config;
                    return {
                        xValue: e,
                        yValue: a,
                        zValue: n
                    }
                }
            case et:
                {
                    let {getStyle: n, setStyle: i, getProperty: l} = a
                      , {widthUnit: d, heightUnit: o} = t.config
                      , {widthValue: s, heightValue: c} = t.config;
                    if (!p.IS_BROWSER_ENV)
                        return {
                            widthValue: s,
                            heightValue: c
                        };
                    if (d === D) {
                        let t = n(e, h);
                        i(e, h, ""),
                        s = l(e, "offsetWidth"),
                        i(e, h, t)
                    }
                    if (o === D) {
                        let t = n(e, C);
                        i(e, C, ""),
                        c = l(e, "offsetHeight"),
                        i(e, C, t)
                    }
                    return {
                        widthValue: s,
                        heightValue: c
                    }
                }
            case ea:
            case en:
            case ei:
                {
                    let {rValue: n, gValue: i, bValue: l, aValue: d, globalSwatchId: o} = t.config;
                    if (o && o.startsWith("--")) {
                        let {getStyle: t} = a
                          , n = t(e, o)
                          , i = (0,
                        u.normalizeColor)(n);
                        return {
                            rValue: i.red,
                            gValue: i.green,
                            bValue: i.blue,
                            aValue: i.alpha
                        }
                    }
                    return {
                        rValue: n,
                        gValue: i,
                        bValue: l,
                        aValue: d
                    }
                }
            case J:
                return t.config.filters.reduce(e_, {});
            case ee:
                return t.config.fontVariations.reduce(eA, {});
            default:
                {
                    let {value: e} = t.config;
                    return {
                        value: e
                    }
                }
            }
        }
        function eC(e) {
            return /^TRANSFORM_/.test(e) ? W : /^STYLE_/.test(e) ? Y : /^GENERAL_/.test(e) ? H : /^PLUGIN_/.test(e) ? z : void 0
        }
        function eM(e, t) {
            return e === Y ? t.replace("STYLE_", "").toLowerCase() : null
        }
        function eV(e, t, a, n, i, l, o, s, c) {
            switch (s) {
            case W:
                var r = e
                  , f = t
                  , u = a
                  , I = i
                  , T = o;
                let y = eB.map(e => {
                    let t = eU[e]
                      , {xValue: a=t.xValue, yValue: n=t.yValue, zValue: i=t.zValue, xUnit: l="", yUnit: d="", zUnit: o=""} = f[e] || {};
                    switch (e) {
                    case j:
                        return `${g}(${a}${l}, ${n}${d}, ${i}${o})`;
                    case $:
                        return `${m}(${a}${l}, ${n}${d}, ${i}${o})`;
                    case q:
                        return `${b}(${a}${l}) ${O}(${n}${d}) ${R}(${i}${o})`;
                    case K:
                        return `${L}(${a}${l}, ${n}${d})`;
                    default:
                        return ""
                    }
                }
                ).join(" ")
                  , {setStyle: _} = T;
                eD(r, p.TRANSFORM_PREFIXED, T),
                _(r, p.TRANSFORM_PREFIXED, y),
                function({actionTypeId: e}, {xValue: t, yValue: a, zValue: n}) {
                    return e === j && void 0 !== n || e === $ && void 0 !== n || e === q && (void 0 !== t || void 0 !== a)
                }(I, u) && _(r, p.TRANSFORM_STYLE_PREFIXED, v);
                return;
            case Y:
                return function(e, t, a, n, i, l) {
                    let {setStyle: o} = l;
                    switch (n.actionTypeId) {
                    case et:
                        {
                            let {widthUnit: t="", heightUnit: i=""} = n.config
                              , {widthValue: d, heightValue: s} = a;
                            void 0 !== d && (t === D && (t = "px"),
                            eD(e, h, l),
                            o(e, h, d + t)),
                            void 0 !== s && (i === D && (i = "px"),
                            eD(e, C, l),
                            o(e, C, s + i));
                            break
                        }
                    case J:
                        var s = n.config;
                        let c = (0,
                        d.default)(a, (e, t, a) => `${e} ${a}(${t}${eG(a, s)})`, "")
                          , {setStyle: r} = l;
                        eD(e, A, l),
                        r(e, A, c);
                        break;
                    case ee:
                        n.config;
                        let f = (0,
                        d.default)(a, (e, t, a) => (e.push(`"${a}" ${t}`),
                        e), []).join(", ")
                          , {setStyle: u} = l;
                        eD(e, S, l),
                        u(e, S, f);
                        break;
                    case ea:
                    case en:
                    case ei:
                        {
                            let t = es[n.actionTypeId]
                              , i = Math.round(a.rValue)
                              , d = Math.round(a.gValue)
                              , s = Math.round(a.bValue)
                              , c = a.aValue;
                            eD(e, t, l),
                            o(e, t, c >= 1 ? `rgb(${i},${d},${s})` : `rgba(${i},${d},${s},${c})`);
                            break
                        }
                    default:
                        {
                            let {unit: t=""} = n.config;
                            eD(e, i, l),
                            o(e, i, a.value + t)
                        }
                    }
                }(e, 0, a, i, l, o);
            case H:
                var M = e
                  , V = i
                  , U = o;
                let {setStyle: x} = U;
                if (V.actionTypeId === el) {
                    let {value: e} = V.config;
                    x(M, w, e === N && p.IS_BROWSER_ENV ? p.FLEX_PREFIXED : e);
                }
                return;
            case z:
                {
                    let {actionTypeId: e} = i;
                    if ((0,
                    E.isPluginType)(e))
                        return (0,
                        E.renderPlugin)(e)(c, t, i)
                }
            }
        }
        let eU = {
            [j]: Object.freeze({
                xValue: 0,
                yValue: 0,
                zValue: 0
            }),
            [$]: Object.freeze({
                xValue: 1,
                yValue: 1,
                zValue: 1
            }),
            [q]: Object.freeze({
                xValue: 0,
                yValue: 0,
                zValue: 0
            }),
            [K]: Object.freeze({
                xValue: 0,
                yValue: 0
            })
        }
          , ex = Object.freeze({
            blur: 0,
            "hue-rotate": 0,
            invert: 0,
            grayscale: 0,
            saturate: 100,
            sepia: 0,
            contrast: 100,
            brightness: 100
        })
          , ek = Object.freeze({
            wght: 0,
            opsz: 0,
            wdth: 0,
            slnt: 0
        })
          , eG = (e, t) => {
            let a = (0,
            o.default)(t.filters, ({type: t}) => t === e);
            if (a && a.unit)
                return a.unit;
            switch (e) {
            case "blur":
                return "px";
            case "hue-rotate":
                return "deg";
            default:
                return "%"
            }
        }
          , eB = Object.keys(eU)
          , ew = /^rgb/
          , eP = RegExp("rgba?\\(([^)]+)\\)");
        function eD(e, t, a) {
            if (!p.IS_BROWSER_ENV)
                return;
            let n = ec[t];
            if (!n)
                return;
            let {getStyle: i, setStyle: l} = a
              , d = i(e, P);
            if (!d)
                return void l(e, P, n);
            let o = d.split(F).map(eo);
            -1 === o.indexOf(n) && l(e, P, o.concat(n).join(F))
        }
        function eF(e, t, a) {
            if (!p.IS_BROWSER_ENV)
                return;
            let n = ec[t];
            if (!n)
                return;
            let {getStyle: i, setStyle: l} = a
              , d = i(e, P);
            d && -1 !== d.indexOf(n) && l(e, P, d.split(F).map(eo).filter(e => e !== n).join(F))
        }
        function eQ({store: e, elementApi: t}) {
            let {ixData: a} = e.getState()
              , {events: n={}, actionLists: i={}} = a;
            Object.keys(n).forEach(e => {
                let a = n[e]
                  , {config: l} = a.action
                  , {actionListId: d} = l
                  , o = i[d];
                o && eX({
                    actionList: o,
                    event: a,
                    elementApi: t
                })
            }
            ),
            Object.keys(i).forEach(e => {
                eX({
                    actionList: i[e],
                    elementApi: t
                })
            }
            )
        }
        function eX({actionList: e={}, event: t, elementApi: a}) {
            let {actionItemGroups: n, continuousParameterGroups: i} = e;
            n && n.forEach(e => {
                eW({
                    actionGroup: e,
                    event: t,
                    elementApi: a
                })
            }
            ),
            i && i.forEach(e => {
                let {continuousActionGroups: n} = e;
                n.forEach(e => {
                    eW({
                        actionGroup: e,
                        event: t,
                        elementApi: a
                    })
                }
                )
            }
            )
        }
        function eW({actionGroup: e, event: t, elementApi: a}) {
            let {actionItems: n} = e;
            n.forEach(e => {
                let n, {actionTypeId: i, config: l} = e;
                n = (0,
                E.isPluginType)(i) ? t => (0,
                E.clearPlugin)(i)(t, e) : eY({
                    effect: ez,
                    actionTypeId: i,
                    elementApi: a
                }),
                eb({
                    config: l,
                    event: t,
                    elementApi: a
                }).forEach(n)
            }
            )
        }
        function eH(e, t, a) {
            let {setStyle: n, getStyle: i} = a
              , {actionTypeId: l} = t;
            if (l === et) {
                let {config: a} = t;
                a.widthUnit === D && n(e, h, ""),
                a.heightUnit === D && n(e, C, "")
            }
            i(e, P) && eY({
                effect: eF,
                actionTypeId: l,
                elementApi: a
            })(e)
        }
        let eY = ({effect: e, actionTypeId: t, elementApi: a}) => n => {
            switch (t) {
            case j:
            case $:
            case q:
            case K:
                e(n, p.TRANSFORM_PREFIXED, a);
                break;
            case J:
                e(n, A, a);
                break;
            case ee:
                e(n, S, a);
                break;
            case Z:
                e(n, _, a);
                break;
            case et:
                e(n, h, a),
                e(n, C, a);
                break;
            case ea:
            case en:
            case ei:
                e(n, es[t], a);
                break;
            case el:
                e(n, w, a)
            }
        }
        ;
        function ez(e, t, a) {
            let {setStyle: n} = a;
            eF(e, t, a),
            n(e, t, ""),
            t === p.TRANSFORM_PREFIXED && n(e, p.TRANSFORM_STYLE_PREFIXED, "")
        }
        function ej(e) {
            let t = 0
              , a = 0;
            return e.forEach( (e, n) => {
                let {config: i} = e
                  , l = i.delay + i.duration;
                l >= t && (t = l,
                a = n)
            }
            ),
            a
        }
        function e$(e, t) {
            let {actionItemGroups: a, useFirstGroupAsInitialState: n} = e
              , {actionItem: i, verboseTimeElapsed: l=0} = t
              , d = 0
              , o = 0;
            return a.forEach( (e, t) => {
                if (n && 0 === t)
                    return;
                let {actionItems: a} = e
                  , s = a[ej(a)]
                  , {config: c, actionTypeId: r} = s;
                i.id === s.id && (o = d + l);
                let f = eC(r) === H ? 0 : c.duration;
                d += c.delay + f
            }
            ),
            d > 0 ? (0,
            f.optimizeFloat)(o / d) : 0
        }
        function eq({actionList: e, actionItemId: t, rawData: a}) {
            let {actionItemGroups: n, continuousParameterGroups: i} = e
              , l = []
              , d = e => (l.push((0,
            s.mergeIn)(e, ["config"], {
                delay: 0,
                duration: 0
            })),
            e.id === t);
            return n && n.some( ({actionItems: e}) => e.some(d)),
            i && i.some(e => {
                let {continuousActionGroups: t} = e;
                return t.some( ({actionItems: e}) => e.some(d))
            }
            ),
            (0,
            s.setIn)(a, ["actionLists"], {
                [e.id]: {
                    id: e.id,
                    actionItemGroups: [{
                        actionItems: l
                    }]
                }
            })
        }
        function eK(e, {basedOn: t}) {
            return e === c.EventTypeConsts.SCROLLING_IN_VIEW && (t === c.EventBasedOn.ELEMENT || null == t) || e === c.EventTypeConsts.MOUSE_MOVE && t === c.EventBasedOn.ELEMENT
        }
        function eZ(e, t) {
            return e + Q + t
        }
        function eJ(e, t) {
            return null == t || -1 !== e.indexOf(t)
        }
        function e0(e, t) {
            return (0,
            r.default)(e && e.sort(), t && t.sort())
        }
        function e1(e) {
            if ("string" == typeof e)
                return e;
            if (e.pluginElement && e.objectId)
                return e.pluginElement + X + e.objectId;
            if (e.objectId)
                return e.objectId;
            let {id: t="", selector: a="", useEventTarget: n=""} = e;
            return t + X + a + X + n
        }
    },
    7164: function(e, t) {
        "use strict";
        function a(e, t) {
            return e === t ? 0 !== e || 0 !== t || 1 / e == 1 / t : e != e && t != t
        }
        Object.defineProperty(t, "__esModule", {
            value: !0
        }),
        Object.defineProperty(t, "default", {
            enumerable: !0,
            get: function() {
                return n
            }
        });
        let n = function(e, t) {
            if (a(e, t))
                return !0;
            if ("object" != typeof e || null === e || "object" != typeof t || null === t)
                return !1;
            let n = Object.keys(e)
              , i = Object.keys(t);
            if (n.length !== i.length)
                return !1;
            for (let i = 0; i < n.length; i++)
                if (!Object.hasOwn(t, n[i]) || !a(e[n[i]], t[n[i]]))
                    return !1;
            return !0
        }
    },
    5861: function(e, t, a) {
        "use strict";
        Object.defineProperty(t, "__esModule", {
            value: !0
        });
        var n = {
            createElementState: function() {
                return L
            },
            ixElements: function() {
                return R
            },
            mergeActionState: function() {
                return v
            }
        };
        for (var i in n)
            Object.defineProperty(t, i, {
                enumerable: !0,
                get: n[i]
            });
        let l = a(1185)
          , d = a(7087)
          , {HTML_ELEMENT: o, PLAIN_OBJECT: s, ABSTRACT_NODE: c, CONFIG_X_VALUE: r, CONFIG_Y_VALUE: f, CONFIG_Z_VALUE: u, CONFIG_VALUE: E, CONFIG_X_UNIT: p, CONFIG_Y_UNIT: I, CONFIG_Z_UNIT: T, CONFIG_UNIT: y} = d.IX2EngineConstants
          , {IX2_SESSION_STOPPED: g, IX2_INSTANCE_ADDED: m, IX2_ELEMENT_STATE_CHANGED: b} = d.IX2EngineActionTypes
          , O = {}
          , R = (e=O, t={}) => {
            switch (t.type) {
            case g:
                return O;
            case m:
                {
                    let {elementId: a, element: n, origin: i, actionItem: d, refType: o} = t.payload
                      , {actionTypeId: s} = d
                      , c = e;
                    return (0,
                    l.getIn)(c, [a, n]) !== n && (c = L(c, n, o, a, d)),
                    v(c, a, s, i, d)
                }
            case b:
                {
                    let {elementId: a, actionTypeId: n, current: i, actionItem: l} = t.payload;
                    return v(e, a, n, i, l)
                }
            default:
                return e
            }
        }
        ;
        function L(e, t, a, n, i) {
            let d = a === s ? (0,
            l.getIn)(i, ["config", "target", "objectId"]) : null;
            return (0,
            l.mergeIn)(e, [n], {
                id: n,
                ref: t,
                refId: d,
                refType: a
            })
        }
        function v(e, t, a, n, i) {
            let d = function(e) {
                let {config: t} = e;
                return N.reduce( (e, a) => {
                    let n = a[0]
                      , i = a[1]
                      , l = t[n]
                      , d = t[i];
                    return null != l && null != d && (e[i] = d),
                    e
                }
                , {})
            }(i);
            return (0,
            l.mergeIn)(e, [t, "refState", a], n, d)
        }
        let N = [[r, p], [f, I], [u, T], [E, y]]
    },
    9371: function() {
        Webflow.require("ix2").init({
            events: {
                "e-3": {
                    id: "e-3",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "NAVBAR_OPEN",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-18",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-4"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "9edf84aa-1c78-d247-2c17-fa546717f184",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "9edf84aa-1c78-d247-2c17-fa546717f184",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x195449462b9
                },
                "e-4": {
                    id: "e-4",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "NAVBAR_CLOSE",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-19",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-3"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "9edf84aa-1c78-d247-2c17-fa546717f184",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "9edf84aa-1c78-d247-2c17-fa546717f184",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x195449462b9
                },
                "e-5": {
                    id: "e-5",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-6"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfb9|933ed1a1-8392-905a-859b-fe75811699d0",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfb9|933ed1a1-8392-905a-859b-fe75811699d0",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x1926e1c7773
                },
                "e-7": {
                    id: "e-7",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-4",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-8"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfb9|933ed1a1-8392-905a-859b-fe75811699d3",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfb9|933ed1a1-8392-905a-859b-fe75811699d3",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x193c763cce3
                },
                "e-9": {
                    id: "e-9",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-6",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-10"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfb9|933ed1a1-8392-905a-859b-fe75811699d7",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfb9|933ed1a1-8392-905a-859b-fe75811699d7",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x193c763e7e3
                },
                "e-13": {
                    id: "e-13",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "PAGE_SCROLL_UP",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-23",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-14"
                        }
                    },
                    mediaQueries: ["main"],
                    target: {
                        id: "68221c5b4392811788febfb7",
                        appliesTo: "PAGE",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfb7",
                        appliesTo: "PAGE",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x19547aaf3c8
                },
                "e-14": {
                    id: "e-14",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "PAGE_SCROLL_DOWN",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-22",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-13"
                        }
                    },
                    mediaQueries: ["main"],
                    target: {
                        id: "68221c5b4392811788febfb7",
                        appliesTo: "PAGE",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfb7",
                        appliesTo: "PAGE",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x19547aaf3c8
                },
                "e-15": {
                    id: "e-15",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "DROPDOWN_OPEN",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-24",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-16"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "9edf84aa-1c78-d247-2c17-fa546717f193",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "9edf84aa-1c78-d247-2c17-fa546717f193",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x1946c19f89d
                },
                "e-16": {
                    id: "e-16",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "DROPDOWN_CLOSE",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-25",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-15"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "9edf84aa-1c78-d247-2c17-fa546717f193",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "9edf84aa-1c78-d247-2c17-fa546717f193",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x1946c19f8a1
                },
                "e-20": {
                    id: "e-20",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-31",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-21"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "76989604-8bdb-7cc7-5204-656ce5a8a981",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "76989604-8bdb-7cc7-5204-656ce5a8a981",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196c5937a0c
                },
                "e-21": {
                    id: "e-21",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-32",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-85"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "76989604-8bdb-7cc7-5204-656ce5a8a981",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "76989604-8bdb-7cc7-5204-656ce5a8a981",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196c5937a0d
                },
                "e-25": {
                    id: "e-25",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_MOVE",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_CONTINUOUS_ACTION",
                        config: {
                            actionListId: "a-30",
                            affectedElements: {},
                            duration: 0
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "76989604-8bdb-7cc7-5204-656ce5a8a981",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "76989604-8bdb-7cc7-5204-656ce5a8a981",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: [{
                        continuousParameterGroupId: "a-30-p",
                        selectedAxis: "X_AXIS",
                        basedOn: "ELEMENT",
                        reverse: !1,
                        smoothing: 0,
                        restingState: 50
                    }, {
                        continuousParameterGroupId: "a-30-p-2",
                        selectedAxis: "Y_AXIS",
                        basedOn: "ELEMENT",
                        reverse: !1,
                        smoothing: 0,
                        restingState: 50
                    }],
                    createdOn: 0x196c5959e1b
                },
                "e-26": {
                    id: "e-26",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-31",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-27"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "9419c7f0-c69d-4b6a-106a-97793a2cf30c",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "9419c7f0-c69d-4b6a-106a-97793a2cf30c",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196c59b11e5
                },
                "e-27": {
                    id: "e-27",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-32",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-26"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "9419c7f0-c69d-4b6a-106a-97793a2cf30c",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "9419c7f0-c69d-4b6a-106a-97793a2cf30c",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196c59b11e5
                },
                "e-28": {
                    id: "e-28",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_MOVE",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_CONTINUOUS_ACTION",
                        config: {
                            actionListId: "a-30",
                            affectedElements: {},
                            duration: 0
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "9419c7f0-c69d-4b6a-106a-97793a2cf30c",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "9419c7f0-c69d-4b6a-106a-97793a2cf30c",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: [{
                        continuousParameterGroupId: "a-30-p",
                        selectedAxis: "X_AXIS",
                        basedOn: "ELEMENT",
                        reverse: !1,
                        smoothing: 0,
                        restingState: 50
                    }, {
                        continuousParameterGroupId: "a-30-p-2",
                        selectedAxis: "Y_AXIS",
                        basedOn: "ELEMENT",
                        reverse: !1,
                        smoothing: 0,
                        restingState: 50
                    }],
                    createdOn: 0x196c59b11e5
                },
                "e-29": {
                    id: "e-29",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-36",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-30"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfb7|4695cb39-d177-6352-49b0-11a5c85b440c",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfb7|4695cb39-d177-6352-49b0-11a5c85b440c",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196c63951df
                },
                "e-31": {
                    id: "e-31",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-32"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        selector: ".scroll-into-view",
                        originalId: "0cc42562-0a91-be3f-5a16-6c05d0877056",
                        appliesTo: "CLASS"
                    },
                    targets: [{
                        selector: ".scroll-into-view",
                        originalId: "0cc42562-0a91-be3f-5a16-6c05d0877056",
                        appliesTo: "CLASS"
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196c676eebe
                },
                "e-35": {
                    id: "e-35",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-36"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "60530279-5339-f4c8-5cc0-9e5b513f299e",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "60530279-5339-f4c8-5cc0-9e5b513f299e",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196c67ae57d
                },
                "e-37": {
                    id: "e-37",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-38"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "60530279-5339-f4c8-5cc0-9e5b513f29a1",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "60530279-5339-f4c8-5cc0-9e5b513f29a1",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196c67b311d
                },
                "e-39": {
                    id: "e-39",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-40"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "60530279-5339-f4c8-5cc0-9e5b513f29b0",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "60530279-5339-f4c8-5cc0-9e5b513f29b0",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196c67b49ee
                },
                "e-41": {
                    id: "e-41",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-42"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "60530279-5339-f4c8-5cc0-9e5b513f29ab",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "60530279-5339-f4c8-5cc0-9e5b513f29ab",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196c67b4b56
                },
                "e-43": {
                    id: "e-43",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-44"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "60530279-5339-f4c8-5cc0-9e5b513f29a6",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "60530279-5339-f4c8-5cc0-9e5b513f29a6",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196c67b4f33
                },
                "e-57": {
                    id: "e-57",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-58"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfb7|867708eb-1aca-4ff6-4197-b39e52cd4629",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfb7|867708eb-1aca-4ff6-4197-b39e52cd4629",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196c6d9b412
                },
                "e-59": {
                    id: "e-59",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-60"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfb7|e3560cb1-35a1-dedb-9b35-cbf63c7aba22",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfb7|e3560cb1-35a1-dedb-9b35-cbf63c7aba22",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196c6da92f6
                },
                "e-61": {
                    id: "e-61",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-62"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfb7|aa7da5c5-e8d6-9f39-c236-7e6f078c24b8",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfb7|aa7da5c5-e8d6-9f39-c236-7e6f078c24b8",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196c6de53b7
                },
                "e-63": {
                    id: "e-63",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-64"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfb7|7872552a-aa1b-0d68-38c6-4d243fc4d48d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfb7|7872552a-aa1b-0d68-38c6-4d243fc4d48d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196c6e96222
                },
                "e-65": {
                    id: "e-65",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-66"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfb7|993071af-28e7-b5af-a04c-801cbedc69ab",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfb7|993071af-28e7-b5af-a04c-801cbedc69ab",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ca1ebab7
                },
                "e-69": {
                    id: "e-69",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLLING_IN_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_CONTINUOUS_ACTION",
                        config: {
                            actionListId: "a-38",
                            affectedElements: {},
                            duration: 0
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfb7|696f08e0-14a5-5001-08a2-809ad85b511a",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfb7|696f08e0-14a5-5001-08a2-809ad85b511a",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: [{
                        continuousParameterGroupId: "a-38-p",
                        smoothing: 90,
                        startsEntering: !0,
                        addStartOffset: !1,
                        addOffsetValue: 50,
                        startsExiting: !1,
                        addEndOffset: !1,
                        endOffsetValue: 50
                    }],
                    createdOn: 0x196ca20d003
                },
                "e-70": {
                    id: "e-70",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLLING_IN_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_CONTINUOUS_ACTION",
                        config: {
                            actionListId: "a-38",
                            affectedElements: {},
                            duration: 0
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfb7|e3560cb1-35a1-dedb-9b35-cbf63c7aba23",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfb7|e3560cb1-35a1-dedb-9b35-cbf63c7aba23",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: [{
                        continuousParameterGroupId: "a-38-p",
                        smoothing: 90,
                        startsEntering: !0,
                        addStartOffset: !1,
                        addOffsetValue: 50,
                        startsExiting: !1,
                        addEndOffset: !1,
                        endOffsetValue: 50
                    }],
                    createdOn: 0x196ca227691
                },
                "e-71": {
                    id: "e-71",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLLING_IN_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_CONTINUOUS_ACTION",
                        config: {
                            actionListId: "a-38",
                            affectedElements: {},
                            duration: 0
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfb7|aa7da5c5-e8d6-9f39-c236-7e6f078c24b9",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfb7|aa7da5c5-e8d6-9f39-c236-7e6f078c24b9",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: [{
                        continuousParameterGroupId: "a-38-p",
                        smoothing: 90,
                        startsEntering: !0,
                        addStartOffset: !1,
                        addOffsetValue: 50,
                        startsExiting: !1,
                        addEndOffset: !1,
                        endOffsetValue: 50
                    }],
                    createdOn: 0x196ca22a852
                },
                "e-72": {
                    id: "e-72",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLLING_IN_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_CONTINUOUS_ACTION",
                        config: {
                            actionListId: "a-38",
                            affectedElements: {},
                            duration: 0
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfb7|7872552a-aa1b-0d68-38c6-4d243fc4d48e",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfb7|7872552a-aa1b-0d68-38c6-4d243fc4d48e",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: [{
                        continuousParameterGroupId: "a-38-p",
                        smoothing: 90,
                        startsEntering: !0,
                        addStartOffset: !1,
                        addOffsetValue: 50,
                        startsExiting: !1,
                        addEndOffset: !1,
                        endOffsetValue: 50
                    }],
                    createdOn: 0x196ca22c9ff
                },
                "e-73": {
                    id: "e-73",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLLING_IN_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_CONTINUOUS_ACTION",
                        config: {
                            actionListId: "a-38",
                            affectedElements: {},
                            duration: 0
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfb7|654f23d5-be43-dc12-bf01-0c76b9ad2df1",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfb7|654f23d5-be43-dc12-bf01-0c76b9ad2df1",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: [{
                        continuousParameterGroupId: "a-38-p",
                        smoothing: 90,
                        startsEntering: !0,
                        addStartOffset: !1,
                        addOffsetValue: 50,
                        startsExiting: !1,
                        addEndOffset: !1,
                        endOffsetValue: 50
                    }],
                    createdOn: 0x196ca235342
                },
                "e-74": {
                    id: "e-74",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLLING_IN_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_CONTINUOUS_ACTION",
                        config: {
                            actionListId: "a-38",
                            affectedElements: {},
                            duration: 0
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfb7|5aae5e1b-1b3f-9cf4-837e-40c34bc92286",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfb7|5aae5e1b-1b3f-9cf4-837e-40c34bc92286",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: [{
                        continuousParameterGroupId: "a-38-p",
                        smoothing: 90,
                        startsEntering: !0,
                        addStartOffset: !1,
                        addOffsetValue: 50,
                        startsExiting: !1,
                        addEndOffset: !1,
                        endOffsetValue: 50
                    }],
                    createdOn: 0x196ca23700f
                },
                "e-75": {
                    id: "e-75",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-76"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfb7|23a0e5a8-a4cc-da16-9422-7ddf83dc090a",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfb7|23a0e5a8-a4cc-da16-9422-7ddf83dc090a",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ca33c37b
                },
                "e-77": {
                    id: "e-77",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLLING_IN_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_CONTINUOUS_ACTION",
                        config: {
                            actionListId: "a-39",
                            affectedElements: {},
                            duration: 0
                        }
                    },
                    mediaQueries: ["main", "medium"],
                    target: {
                        id: "5669287f-f1b0-44b2-76c6-5a3b1d77dfdb",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "5669287f-f1b0-44b2-76c6-5a3b1d77dfdb",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: [{
                        continuousParameterGroupId: "a-39-p",
                        smoothing: 50,
                        startsEntering: !0,
                        addStartOffset: !0,
                        addOffsetValue: 50,
                        startsExiting: !1,
                        addEndOffset: !1,
                        endOffsetValue: -20
                    }],
                    createdOn: 0x196ca88fc11
                },
                "e-78": {
                    id: "e-78",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-79"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "5669287f-f1b0-44b2-76c6-5a3b1d77dfdd",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "5669287f-f1b0-44b2-76c6-5a3b1d77dfdd",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196cf828635
                },
                "e-82": {
                    id: "e-82",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-40",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-83"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "5669287f-f1b0-44b2-76c6-5a3b1d77dfdf",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "5669287f-f1b0-44b2-76c6-5a3b1d77dfdf",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196cf831017
                },
                "e-84": {
                    id: "e-84",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-85"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "06809811-7801-97a3-75cf-decce17b794f",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "06809811-7801-97a3-75cf-decce17b794f",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196cf9cfab9
                },
                "e-86": {
                    id: "e-86",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SLIDER_ACTIVE",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-41",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-87"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "06809811-7801-97a3-75cf-decce17b7951",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "06809811-7801-97a3-75cf-decce17b7951",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196cfe70c14
                },
                "e-87": {
                    id: "e-87",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SLIDER_INACTIVE",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-42",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-86"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "06809811-7801-97a3-75cf-decce17b7951",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "06809811-7801-97a3-75cf-decce17b7951",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196cfe70c15
                },
                "e-88": {
                    id: "e-88",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SLIDER_ACTIVE",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-41",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-89"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "06809811-7801-97a3-75cf-decce17b795d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "06809811-7801-97a3-75cf-decce17b795d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196cfeece4a
                },
                "e-89": {
                    id: "e-89",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SLIDER_INACTIVE",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-42",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-88"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "06809811-7801-97a3-75cf-decce17b795d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "06809811-7801-97a3-75cf-decce17b795d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196cfeece4a
                },
                "e-90": {
                    id: "e-90",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SLIDER_ACTIVE",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-41",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-91"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "06809811-7801-97a3-75cf-decce17b7969",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "06809811-7801-97a3-75cf-decce17b7969",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196cfeef397
                },
                "e-91": {
                    id: "e-91",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SLIDER_INACTIVE",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-42",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-90"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "06809811-7801-97a3-75cf-decce17b7969",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "06809811-7801-97a3-75cf-decce17b7969",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196cfeef398
                },
                "e-92": {
                    id: "e-92",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SLIDER_ACTIVE",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-41",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-93"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "06809811-7801-97a3-75cf-decce17b7975",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "06809811-7801-97a3-75cf-decce17b7975",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196cfef1d1a
                },
                "e-93": {
                    id: "e-93",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SLIDER_INACTIVE",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-42",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-92"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "06809811-7801-97a3-75cf-decce17b7975",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "06809811-7801-97a3-75cf-decce17b7975",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196cfef1d1b
                },
                "e-94": {
                    id: "e-94",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-4",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-742"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "b759b822-e249-6511-a68b-9128a3dae9a9",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "b759b822-e249-6511-a68b-9128a3dae9a9",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d080609c
                },
                "e-96": {
                    id: "e-96",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-6",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-748"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "b759b822-e249-6511-a68b-9128a3dae9ab",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "b759b822-e249-6511-a68b-9128a3dae9ab",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d0808aef
                },
                "e-98": {
                    id: "e-98",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-747"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "b759b822-e249-6511-a68b-9128a3dae9af",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "b759b822-e249-6511-a68b-9128a3dae9af",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d080abcc
                },
                "e-100": {
                    id: "e-100",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-745"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "b759b822-e249-6511-a68b-9128a3dae9dd",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "b759b822-e249-6511-a68b-9128a3dae9dd",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d080c59f
                },
                "e-102": {
                    id: "e-102",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-749"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "b759b822-e249-6511-a68b-9128a3daea0b",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "b759b822-e249-6511-a68b-9128a3daea0b",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d080ddb5
                },
                "e-107": {
                    id: "e-107",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-189"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec23e",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec23e",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d08919f8
                },
                "e-109": {
                    id: "e-109",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-156"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec282",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec282",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d08919f8
                },
                "e-113": {
                    id: "e-113",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-163"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec245",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec245",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d08919f8
                },
                "e-117": {
                    id: "e-117",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-6",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-182"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec275",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec275",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d08919f8
                },
                "e-119": {
                    id: "e-119",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-174"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec217",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec217",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d08919f8
                },
                "e-121": {
                    id: "e-121",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-193"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec262",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec262",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d08919f8
                },
                "e-123": {
                    id: "e-123",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-110"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec252",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec252",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d08919f8
                },
                "e-124": {
                    id: "e-124",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-112"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec22d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec22d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d08919f8
                },
                "e-125": {
                    id: "e-125",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-178"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec255",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec255",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d08919f8
                },
                "e-126": {
                    id: "e-126",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-151"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec25d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec25d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d08919f8
                },
                "e-128": {
                    id: "e-128",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-146"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec241",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec241",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d08919f8
                },
                "e-130": {
                    id: "e-130",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-135"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec269",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec269",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d08919f8
                },
                "e-133": {
                    id: "e-133",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-131"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec265",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec265",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d08919f8
                },
                "e-137": {
                    id: "e-137",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-4",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-139"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec288",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec288",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d08919f8
                },
                "e-143": {
                    id: "e-143",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-179"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec285",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec285",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d08919f8
                },
                "e-144": {
                    id: "e-144",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-6",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-134"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec28b",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec28b",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d08919f8
                },
                "e-147": {
                    id: "e-147",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-122"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec235",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec235",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d08919f8
                },
                "e-150": {
                    id: "e-150",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-160"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec22a",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec22a",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d08919f8
                },
                "e-157": {
                    id: "e-157",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-6",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-181"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec272",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec272",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d08919f8
                },
                "e-164": {
                    id: "e-164",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-105"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec273",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec273",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d08919f8
                },
                "e-166": {
                    id: "e-166",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-6",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-177"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec279",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec279",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d08919f8
                },
                "e-170": {
                    id: "e-170",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-148"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec249",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec249",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d08919f8
                },
                "e-173": {
                    id: "e-173",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-6",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-154"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec27d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec27d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d08919f8
                },
                "e-176": {
                    id: "e-176",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-187"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec239",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec239",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d08919f8
                },
                "e-180": {
                    id: "e-180",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-115"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec24d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec24d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d08919f8
                },
                "e-183": {
                    id: "e-183",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-108"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec26d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec26d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d08919f8
                },
                "e-186": {
                    id: "e-186",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-167"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec213",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec213",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d08919f8
                },
                "e-190": {
                    id: "e-190",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-194"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec231",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec231",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d08919f8
                },
                "e-191": {
                    id: "e-191",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-175"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec259",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec259",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d08919f8
                },
                "e-196": {
                    id: "e-196",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-4",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-118"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec218",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "7aa53b39-6d8e-a02c-3673-b3ae1b5ec218",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d08919f8
                },
                "e-206": {
                    id: "e-206",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-207"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "137566d9-001c-9e0f-af99-aff4c7a54897",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "137566d9-001c-9e0f-af99-aff4c7a54897",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d089d015
                },
                "e-266": {
                    id: "e-266",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-46",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-267"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "137566d9-001c-9e0f-af99-aff4c7a54897",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "137566d9-001c-9e0f-af99-aff4c7a54897",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d089d015
                },
                "e-267": {
                    id: "e-267",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-47",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-266"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "137566d9-001c-9e0f-af99-aff4c7a54897",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "137566d9-001c-9e0f-af99-aff4c7a54897",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d089d015
                },
                "e-294": {
                    id: "e-294",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-46",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1101"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "ab047cd1-3e47-a0a3-1617-e2b7438fe7c7",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "ab047cd1-3e47-a0a3-1617-e2b7438fe7c7",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09a702e
                },
                "e-295": {
                    id: "e-295",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-47",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-294"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "ab047cd1-3e47-a0a3-1617-e2b7438fe7c7",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "ab047cd1-3e47-a0a3-1617-e2b7438fe7c7",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09a702e
                },
                "e-296": {
                    id: "e-296",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1112"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "ab047cd1-3e47-a0a3-1617-e2b7438fe7c7",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "ab047cd1-3e47-a0a3-1617-e2b7438fe7c7",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09a702e
                },
                "e-298": {
                    id: "e-298",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-46",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1110"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "d33babda-114a-390d-cf1f-9496727bd250",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "d33babda-114a-390d-cf1f-9496727bd250",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09a99d8
                },
                "e-299": {
                    id: "e-299",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-47",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1105"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "d33babda-114a-390d-cf1f-9496727bd250",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "d33babda-114a-390d-cf1f-9496727bd250",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09a99d8
                },
                "e-300": {
                    id: "e-300",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-301"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "d33babda-114a-390d-cf1f-9496727bd250",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "d33babda-114a-390d-cf1f-9496727bd250",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09a99d8
                },
                "e-302": {
                    id: "e-302",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-46",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-303"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "de8f7f32-613e-d553-d85c-877179c509a1",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "de8f7f32-613e-d553-d85c-877179c509a1",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09a9aba
                },
                "e-303": {
                    id: "e-303",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-47",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-302"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "de8f7f32-613e-d553-d85c-877179c509a1",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "de8f7f32-613e-d553-d85c-877179c509a1",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09a9aba
                },
                "e-304": {
                    id: "e-304",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-305"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "de8f7f32-613e-d553-d85c-877179c509a1",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "de8f7f32-613e-d553-d85c-877179c509a1",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09a9aba
                },
                "e-306": {
                    id: "e-306",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-46",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-307"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "cf67074e-4ecf-8e6d-ac5d-6a30bef6937a",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "cf67074e-4ecf-8e6d-ac5d-6a30bef6937a",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09a9f1f
                },
                "e-307": {
                    id: "e-307",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-47",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-306"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "cf67074e-4ecf-8e6d-ac5d-6a30bef6937a",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "cf67074e-4ecf-8e6d-ac5d-6a30bef6937a",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09a9f1f
                },
                "e-308": {
                    id: "e-308",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-309"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "cf67074e-4ecf-8e6d-ac5d-6a30bef6937a",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "cf67074e-4ecf-8e6d-ac5d-6a30bef6937a",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09a9f1f
                },
                "e-310": {
                    id: "e-310",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-46",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-311"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "e41cf9fa-eb87-2deb-1761-8a927c04b67b",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "e41cf9fa-eb87-2deb-1761-8a927c04b67b",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09b1b93
                },
                "e-311": {
                    id: "e-311",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-47",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-310"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "e41cf9fa-eb87-2deb-1761-8a927c04b67b",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "e41cf9fa-eb87-2deb-1761-8a927c04b67b",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09b1b93
                },
                "e-312": {
                    id: "e-312",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-4",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-313"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "e41cf9fa-eb87-2deb-1761-8a927c04b67b",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "e41cf9fa-eb87-2deb-1761-8a927c04b67b",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09b1b93
                },
                "e-314": {
                    id: "e-314",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-46",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-315"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "e41cf9fa-eb87-2deb-1761-8a927c04b67f",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "e41cf9fa-eb87-2deb-1761-8a927c04b67f",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09b1b93
                },
                "e-315": {
                    id: "e-315",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-47",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-314"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "e41cf9fa-eb87-2deb-1761-8a927c04b67f",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "e41cf9fa-eb87-2deb-1761-8a927c04b67f",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09b1b93
                },
                "e-316": {
                    id: "e-316",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-4",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-317"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "e41cf9fa-eb87-2deb-1761-8a927c04b67f",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "e41cf9fa-eb87-2deb-1761-8a927c04b67f",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09b1b93
                },
                "e-318": {
                    id: "e-318",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-46",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-319"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "e41cf9fa-eb87-2deb-1761-8a927c04b683",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "e41cf9fa-eb87-2deb-1761-8a927c04b683",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09b1b93
                },
                "e-319": {
                    id: "e-319",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-47",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-318"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "e41cf9fa-eb87-2deb-1761-8a927c04b683",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "e41cf9fa-eb87-2deb-1761-8a927c04b683",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09b1b93
                },
                "e-320": {
                    id: "e-320",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-4",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-321"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "e41cf9fa-eb87-2deb-1761-8a927c04b683",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "e41cf9fa-eb87-2deb-1761-8a927c04b683",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09b1b93
                },
                "e-322": {
                    id: "e-322",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-46",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-323"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "e41cf9fa-eb87-2deb-1761-8a927c04b687",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "e41cf9fa-eb87-2deb-1761-8a927c04b687",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09b1b93
                },
                "e-323": {
                    id: "e-323",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-47",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-322"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "e41cf9fa-eb87-2deb-1761-8a927c04b687",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "e41cf9fa-eb87-2deb-1761-8a927c04b687",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09b1b93
                },
                "e-324": {
                    id: "e-324",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-4",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-325"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "e41cf9fa-eb87-2deb-1761-8a927c04b687",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "e41cf9fa-eb87-2deb-1761-8a927c04b687",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09b1b93
                },
                "e-326": {
                    id: "e-326",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-46",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-327"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "e41cf9fa-eb87-2deb-1761-8a927c04b68b",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "e41cf9fa-eb87-2deb-1761-8a927c04b68b",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09b1b93
                },
                "e-327": {
                    id: "e-327",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-47",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-326"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "e41cf9fa-eb87-2deb-1761-8a927c04b68b",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "e41cf9fa-eb87-2deb-1761-8a927c04b68b",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09b1b93
                },
                "e-328": {
                    id: "e-328",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-4",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-329"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "e41cf9fa-eb87-2deb-1761-8a927c04b68b",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "e41cf9fa-eb87-2deb-1761-8a927c04b68b",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09b1b93
                },
                "e-330": {
                    id: "e-330",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-46",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-331"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "59a4fb80-dc05-be69-48f2-5fbcc5a98e95",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "59a4fb80-dc05-be69-48f2-5fbcc5a98e95",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09babe4
                },
                "e-331": {
                    id: "e-331",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-47",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-330"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "59a4fb80-dc05-be69-48f2-5fbcc5a98e95",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "59a4fb80-dc05-be69-48f2-5fbcc5a98e95",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09babe4
                },
                "e-332": {
                    id: "e-332",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-6",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-333"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "59a4fb80-dc05-be69-48f2-5fbcc5a98e95",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "59a4fb80-dc05-be69-48f2-5fbcc5a98e95",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09babe4
                },
                "e-334": {
                    id: "e-334",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-46",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-335"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "59a4fb80-dc05-be69-48f2-5fbcc5a98e99",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "59a4fb80-dc05-be69-48f2-5fbcc5a98e99",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09babe4
                },
                "e-335": {
                    id: "e-335",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-47",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-334"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "59a4fb80-dc05-be69-48f2-5fbcc5a98e99",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "59a4fb80-dc05-be69-48f2-5fbcc5a98e99",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09babe4
                },
                "e-336": {
                    id: "e-336",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-6",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-337"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "59a4fb80-dc05-be69-48f2-5fbcc5a98e99",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "59a4fb80-dc05-be69-48f2-5fbcc5a98e99",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09babe4
                },
                "e-338": {
                    id: "e-338",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-46",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-339"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "59a4fb80-dc05-be69-48f2-5fbcc5a98e9d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "59a4fb80-dc05-be69-48f2-5fbcc5a98e9d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09babe4
                },
                "e-339": {
                    id: "e-339",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-47",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-338"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "59a4fb80-dc05-be69-48f2-5fbcc5a98e9d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "59a4fb80-dc05-be69-48f2-5fbcc5a98e9d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09babe4
                },
                "e-340": {
                    id: "e-340",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-6",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-341"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "59a4fb80-dc05-be69-48f2-5fbcc5a98e9d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "59a4fb80-dc05-be69-48f2-5fbcc5a98e9d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09babe4
                },
                "e-342": {
                    id: "e-342",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-46",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-343"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfb7|6122bba7-bb93-6571-e06a-640602b4b045",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfb7|6122bba7-bb93-6571-e06a-640602b4b045",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09ded5a
                },
                "e-343": {
                    id: "e-343",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-47",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-342"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfb7|6122bba7-bb93-6571-e06a-640602b4b045",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfb7|6122bba7-bb93-6571-e06a-640602b4b045",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d09ded5a
                },
                "e-346": {
                    id: "e-346",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-46",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-347"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "bb792e4a-0326-94c8-0ca7-af2f4653cbda",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "bb792e4a-0326-94c8-0ca7-af2f4653cbda",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d0a442d5
                },
                "e-347": {
                    id: "e-347",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-47",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-346"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "bb792e4a-0326-94c8-0ca7-af2f4653cbda",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "bb792e4a-0326-94c8-0ca7-af2f4653cbda",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d0a442d6
                },
                "e-350": {
                    id: "e-350",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-351"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "6122bba7-bb93-6571-e06a-640602b4b045",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "6122bba7-bb93-6571-e06a-640602b4b045",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d0a4d0a2
                },
                "e-354": {
                    id: "e-354",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-355"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "bb792e4a-0326-94c8-0ca7-af2f4653cbda",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "bb792e4a-0326-94c8-0ca7-af2f4653cbda",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d0a51363
                },
                "e-356": {
                    id: "e-356",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-46",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-357"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "2d657767-1c78-177f-19a9-951e66e7d5c9",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "2d657767-1c78-177f-19a9-951e66e7d5c9",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d0a5821d
                },
                "e-357": {
                    id: "e-357",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-47",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-356"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "2d657767-1c78-177f-19a9-951e66e7d5c9",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "2d657767-1c78-177f-19a9-951e66e7d5c9",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d0a5821f
                },
                "e-358": {
                    id: "e-358",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-359"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "2d657767-1c78-177f-19a9-951e66e7d5c9",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "2d657767-1c78-177f-19a9-951e66e7d5c9",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d0a5a9cf
                },
                "e-360": {
                    id: "e-360",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-361"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "8b494d11-32d4-656f-f2ab-5ffd843231d1",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "8b494d11-32d4-656f-f2ab-5ffd843231d1",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d0a5ec07
                },
                "e-362": {
                    id: "e-362",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-363"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "eb2e292d-0318-4b59-e394-b91b31c8df3c",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "eb2e292d-0318-4b59-e394-b91b31c8df3c",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d0a60ab0
                },
                "e-364": {
                    id: "e-364",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-365"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "ca08c12a-1ed2-e1b7-793a-9ba458527d67",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "ca08c12a-1ed2-e1b7-793a-9ba458527d67",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d0a631ea
                },
                "e-366": {
                    id: "e-366",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-4",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-367"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "5992a440-ce46-a787-556f-b54dfb2cbef7",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "5992a440-ce46-a787-556f-b54dfb2cbef7",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d0a754f7
                },
                "e-368": {
                    id: "e-368",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-6",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1100"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "ddd3c88a-9807-95ac-bb9e-d166c2490839",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "ddd3c88a-9807-95ac-bb9e-d166c2490839",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d0a77291
                },
                "e-370": {
                    id: "e-370",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-48",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-371"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "00ae3401-3f25-8bcf-a123-29285707ddfe",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "00ae3401-3f25-8bcf-a123-29285707ddfe",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d0a79a8a
                },
                "e-372": {
                    id: "e-372",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-49",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1109"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfb7|16277c67-cf38-4282-f4d1-271925f161dd",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfb7|16277c67-cf38-4282-f4d1-271925f161dd",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 20,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d0d348ec
                },
                "e-374": {
                    id: "e-374",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-375"
                        }
                    },
                    mediaQueries: ["small", "tiny"],
                    target: {
                        id: "5669287f-f1b0-44b2-76c6-5a3b1d77dfe4",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "5669287f-f1b0-44b2-76c6-5a3b1d77dfe4",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d0dc0c9a
                },
                "e-376": {
                    id: "e-376",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1107"
                        }
                    },
                    mediaQueries: ["small", "tiny"],
                    target: {
                        id: "5669287f-f1b0-44b2-76c6-5a3b1d77dfe9",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "5669287f-f1b0-44b2-76c6-5a3b1d77dfe9",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d0dc3f33
                },
                "e-378": {
                    id: "e-378",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-379"
                        }
                    },
                    mediaQueries: ["small", "tiny"],
                    target: {
                        id: "5669287f-f1b0-44b2-76c6-5a3b1d77dfee",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "5669287f-f1b0-44b2-76c6-5a3b1d77dfee",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d0dc7406
                },
                "e-380": {
                    id: "e-380",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-381"
                        }
                    },
                    mediaQueries: ["small", "tiny"],
                    target: {
                        id: "5669287f-f1b0-44b2-76c6-5a3b1d77dff3",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "5669287f-f1b0-44b2-76c6-5a3b1d77dff3",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d0dc9c38
                },
                "e-390": {
                    id: "e-390",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "PAGE_SCROLL_UP",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-23",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-391"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfc0",
                        appliesTo: "PAGE",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfc0",
                        appliesTo: "PAGE",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d0e7608b
                },
                "e-391": {
                    id: "e-391",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "PAGE_SCROLL_DOWN",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-22",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-390"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfc0",
                        appliesTo: "PAGE",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfc0",
                        appliesTo: "PAGE",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d0e7608c
                },
                "e-392": {
                    id: "e-392",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-51",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-393"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfc0|a85f2cd4-810e-e730-5880-77c4b356d8e5",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfc0|a85f2cd4-810e-e730-5880-77c4b356d8e5",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 20,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d0f9b674
                },
                "e-394": {
                    id: "e-394",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-50",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-395"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfc0|75d05c90-a079-a12e-8ec4-d13f359d6151",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfc0|75d05c90-a079-a12e-8ec4-d13f359d6151",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d1035c93
                },
                "e-406": {
                    id: "e-406",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-407"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "e70992c8-7d53-5901-381c-0814ffbc12e6",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "e70992c8-7d53-5901-381c-0814ffbc12e6",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d118db74
                },
                "e-408": {
                    id: "e-408",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-409"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "e70992c8-7d53-5901-381c-0814ffbc12eb",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "e70992c8-7d53-5901-381c-0814ffbc12eb",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d118f3fe
                },
                "e-410": {
                    id: "e-410",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-411"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "e70992c8-7d53-5901-381c-0814ffbc12f0",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "e70992c8-7d53-5901-381c-0814ffbc12f0",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d1190074
                },
                "e-412": {
                    id: "e-412",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-413"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "e70992c8-7d53-5901-381c-0814ffbc12e3",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "e70992c8-7d53-5901-381c-0814ffbc12e3",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d119cc9b
                },
                "e-450": {
                    id: "e-450",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-451"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e222",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e222",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d4852ee4
                },
                "e-452": {
                    id: "e-452",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-453"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e225",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e225",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d4852ee4
                },
                "e-474": {
                    id: "e-474",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-475"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e229",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e229",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d4853ecc
                },
                "e-476": {
                    id: "e-476",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLLING_IN_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_CONTINUOUS_ACTION",
                        config: {
                            actionListId: "a-38",
                            affectedElements: {},
                            duration: 0
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e234",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e234",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: [{
                        continuousParameterGroupId: "a-38-p",
                        smoothing: 90,
                        startsEntering: !0,
                        addStartOffset: !1,
                        addOffsetValue: 50,
                        startsExiting: !1,
                        addEndOffset: !1,
                        endOffsetValue: 50
                    }],
                    createdOn: 0x196d4853ecc
                },
                "e-479": {
                    id: "e-479",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLLING_IN_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_CONTINUOUS_ACTION",
                        config: {
                            actionListId: "a-38",
                            affectedElements: {},
                            duration: 0
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e241",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e241",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: [{
                        continuousParameterGroupId: "a-38-p",
                        smoothing: 90,
                        startsEntering: !0,
                        addStartOffset: !1,
                        addOffsetValue: 50,
                        startsExiting: !1,
                        addEndOffset: !1,
                        endOffsetValue: 50
                    }],
                    createdOn: 0x196d4853ecc
                },
                "e-482": {
                    id: "e-482",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLLING_IN_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_CONTINUOUS_ACTION",
                        config: {
                            actionListId: "a-38",
                            affectedElements: {},
                            duration: 0
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e24e",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e24e",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: [{
                        continuousParameterGroupId: "a-38-p",
                        smoothing: 90,
                        startsEntering: !0,
                        addStartOffset: !1,
                        addOffsetValue: 50,
                        startsExiting: !1,
                        addEndOffset: !1,
                        endOffsetValue: 50
                    }],
                    createdOn: 0x196d4853ecc
                },
                "e-483": {
                    id: "e-483",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLLING_IN_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_CONTINUOUS_ACTION",
                        config: {
                            actionListId: "a-38",
                            affectedElements: {},
                            duration: 0
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e250",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e250",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: [{
                        continuousParameterGroupId: "a-38-p",
                        smoothing: 90,
                        startsEntering: !0,
                        addStartOffset: !1,
                        addOffsetValue: 50,
                        startsExiting: !1,
                        addEndOffset: !1,
                        endOffsetValue: 50
                    }],
                    createdOn: 0x196d4853ecc
                },
                "e-484": {
                    id: "e-484",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLLING_IN_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_CONTINUOUS_ACTION",
                        config: {
                            actionListId: "a-38",
                            affectedElements: {},
                            duration: 0
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e252",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e252",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: [{
                        continuousParameterGroupId: "a-38-p",
                        smoothing: 90,
                        startsEntering: !0,
                        addStartOffset: !1,
                        addOffsetValue: 50,
                        startsExiting: !1,
                        addEndOffset: !1,
                        endOffsetValue: 50
                    }],
                    createdOn: 0x196d4853ecc
                },
                "e-493": {
                    id: "e-493",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-494"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e223",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e223",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d49181c4
                },
                "e-495": {
                    id: "e-495",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-496"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e226",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e226",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d4919c7d
                },
                "e-497": {
                    id: "e-497",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-498"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e22c",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e22c",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d491bcd9
                },
                "e-499": {
                    id: "e-499",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-500"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e22e",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e22e",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d491e9ce
                },
                "e-501": {
                    id: "e-501",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-502"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e230",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e230",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d4920a87
                },
                "e-503": {
                    id: "e-503",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1101"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e233",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e233",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d492353e
                },
                "e-505": {
                    id: "e-505",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-506"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e236",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e236",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d4929667
                },
                "e-507": {
                    id: "e-507",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1099"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e239",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e239",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d4929667
                },
                "e-509": {
                    id: "e-509",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-510"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e23b",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e23b",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d4929667
                },
                "e-511": {
                    id: "e-511",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1097"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e23d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e23d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d4929667
                },
                "e-513": {
                    id: "e-513",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1108"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e240",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e240",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d4929667
                },
                "e-517": {
                    id: "e-517",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-518"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e243",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e243",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d4957087
                },
                "e-519": {
                    id: "e-519",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-520"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e246",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e246",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d4957087
                },
                "e-521": {
                    id: "e-521",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-522"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e248",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e248",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d4957087
                },
                "e-523": {
                    id: "e-523",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-524"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e24a",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e24a",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d4957087
                },
                "e-525": {
                    id: "e-525",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-526"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e24d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e24d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d4957087
                },
                "e-531": {
                    id: "e-531",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-532"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e254",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e254",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d499e96c
                },
                "e-533": {
                    id: "e-533",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-534"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e257",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e257",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d499e96c
                },
                "e-535": {
                    id: "e-535",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-536"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e259",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e259",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d499e96c
                },
                "e-537": {
                    id: "e-537",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-538"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e25b",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e25b",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d499e96c
                },
                "e-539": {
                    id: "e-539",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-540"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e25e",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e25e",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d499e96c
                },
                "e-541": {
                    id: "e-541",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLLING_IN_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_CONTINUOUS_ACTION",
                        config: {
                            actionListId: "a-38",
                            affectedElements: {},
                            duration: 0
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e25f",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "70665a78-9a5a-6578-0e72-0aea5fa2e25f",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: [{
                        continuousParameterGroupId: "a-38-p",
                        smoothing: 90,
                        startsEntering: !0,
                        addStartOffset: !1,
                        addOffsetValue: 50,
                        startsExiting: !1,
                        addEndOffset: !1,
                        endOffsetValue: 50
                    }],
                    createdOn: 0x196d49a521b
                },
                "e-572": {
                    id: "e-572",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-573"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "282f8349-1cc9-cc0e-316b-bba9d0e62312",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "282f8349-1cc9-cc0e-316b-bba9d0e62312",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d4b1e5e3
                },
                "e-574": {
                    id: "e-574",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-575"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "282f8349-1cc9-cc0e-316b-bba9d0e6230f",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "282f8349-1cc9-cc0e-316b-bba9d0e6230f",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d4b205c4
                },
                "e-577": {
                    id: "e-577",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-578"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "282f8349-1cc9-cc0e-316b-bba9d0e6231a",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "282f8349-1cc9-cc0e-316b-bba9d0e6231a",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d4b36ca7
                },
                "e-580": {
                    id: "e-580",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-581"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "282f8349-1cc9-cc0e-316b-bba9d0e62322",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "282f8349-1cc9-cc0e-316b-bba9d0e62322",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d4b3ac61
                },
                "e-583": {
                    id: "e-583",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-584"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "282f8349-1cc9-cc0e-316b-bba9d0e6232a",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "282f8349-1cc9-cc0e-316b-bba9d0e6232a",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d4b3ee35
                },
                "e-585": {
                    id: "e-585",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SLIDER_ACTIVE",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-41",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-586"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "06809811-7801-97a3-75cf-decce17b7981",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "06809811-7801-97a3-75cf-decce17b7981",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d4c66ee3
                },
                "e-586": {
                    id: "e-586",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SLIDER_INACTIVE",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-42",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-585"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "06809811-7801-97a3-75cf-decce17b7981",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "06809811-7801-97a3-75cf-decce17b7981",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d4c66ee3
                },
                "e-587": {
                    id: "e-587",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SLIDER_ACTIVE",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-41",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-588"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "06809811-7801-97a3-75cf-decce17b798d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "06809811-7801-97a3-75cf-decce17b798d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d4c7e467
                },
                "e-588": {
                    id: "e-588",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SLIDER_INACTIVE",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-42",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-587"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "06809811-7801-97a3-75cf-decce17b798d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "06809811-7801-97a3-75cf-decce17b798d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d4c7e467
                },
                "e-589": {
                    id: "e-589",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-739"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "cf1c70d9-c81c-2889-fe77-ef6bbc156769",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "cf1c70d9-c81c-2889-fe77-ef6bbc156769",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d4c95d8d
                },
                "e-593": {
                    id: "e-593",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-52",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-594"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "5b07f8aa-6d65-aff1-fc75-f3bbc149ac24",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "5b07f8aa-6d65-aff1-fc75-f3bbc149ac24",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d5a27eac
                },
                "e-594": {
                    id: "e-594",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-53",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-593"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "5b07f8aa-6d65-aff1-fc75-f3bbc149ac24",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "5b07f8aa-6d65-aff1-fc75-f3bbc149ac24",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d5a27eae
                },
                "e-595": {
                    id: "e-595",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-52",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-596"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "5b07f8aa-6d65-aff1-fc75-f3bbc149ac88",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "5b07f8aa-6d65-aff1-fc75-f3bbc149ac88",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d5a29cf9
                },
                "e-596": {
                    id: "e-596",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-53",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-595"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "5b07f8aa-6d65-aff1-fc75-f3bbc149ac88",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "5b07f8aa-6d65-aff1-fc75-f3bbc149ac88",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d5a29cf9
                },
                "e-597": {
                    id: "e-597",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-52",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-598"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "5b07f8aa-6d65-aff1-fc75-f3bbc149ac74",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "5b07f8aa-6d65-aff1-fc75-f3bbc149ac74",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d5a29ee8
                },
                "e-598": {
                    id: "e-598",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-53",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-597"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "5b07f8aa-6d65-aff1-fc75-f3bbc149ac74",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "5b07f8aa-6d65-aff1-fc75-f3bbc149ac74",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d5a29ee8
                },
                "e-599": {
                    id: "e-599",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-52",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-600"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "5b07f8aa-6d65-aff1-fc75-f3bbc149ac60",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "5b07f8aa-6d65-aff1-fc75-f3bbc149ac60",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d5a2a07d
                },
                "e-600": {
                    id: "e-600",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-53",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-599"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "5b07f8aa-6d65-aff1-fc75-f3bbc149ac60",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "5b07f8aa-6d65-aff1-fc75-f3bbc149ac60",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d5a2a07d
                },
                "e-601": {
                    id: "e-601",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-52",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-602"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "5b07f8aa-6d65-aff1-fc75-f3bbc149ac4c",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "5b07f8aa-6d65-aff1-fc75-f3bbc149ac4c",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d5a2a281
                },
                "e-602": {
                    id: "e-602",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-53",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-601"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "5b07f8aa-6d65-aff1-fc75-f3bbc149ac4c",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "5b07f8aa-6d65-aff1-fc75-f3bbc149ac4c",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d5a2a281
                },
                "e-603": {
                    id: "e-603",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-52",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-604"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "5b07f8aa-6d65-aff1-fc75-f3bbc149ac38",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "5b07f8aa-6d65-aff1-fc75-f3bbc149ac38",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d5a2a42d
                },
                "e-604": {
                    id: "e-604",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-53",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-603"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "5b07f8aa-6d65-aff1-fc75-f3bbc149ac38",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "5b07f8aa-6d65-aff1-fc75-f3bbc149ac38",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d5a2a42d
                },
                "e-615": {
                    id: "e-615",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-616"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfc1|f7d55a43-7ea7-f4af-14b9-5ef607ff55db",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfc1|f7d55a43-7ea7-f4af-14b9-5ef607ff55db",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d5c4a7b2
                },
                "e-617": {
                    id: "e-617",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-4",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-618"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfc1|8940ff2d-6fc1-8dba-6841-42e04765984a",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfc1|8940ff2d-6fc1-8dba-6841-42e04765984a",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d5c4bf92
                },
                "e-619": {
                    id: "e-619",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-6",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-620"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfc1|8023981b-0f54-b541-8e3e-128b1132f023",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfc1|8023981b-0f54-b541-8e3e-128b1132f023",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d5c4dd3b
                },
                "e-621": {
                    id: "e-621",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-54",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-622"
                        }
                    },
                    mediaQueries: ["main", "medium", "small"],
                    target: {
                        id: "68221c5b4392811788febfc1|7ec721f8-2335-c0d4-9945-efd4eeda261c",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfc1|7ec721f8-2335-c0d4-9945-efd4eeda261c",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d5c9fc53
                },
                "e-623": {
                    id: "e-623",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-37",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-624"
                        }
                    },
                    mediaQueries: ["tiny"],
                    target: {
                        id: "68221c5b4392811788febfc1|77b2406e-bc3e-4332-83c6-b3915662a098",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfc1|77b2406e-bc3e-4332-83c6-b3915662a098",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d5d0c5d4
                },
                "e-625": {
                    id: "e-625",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-626"
                        }
                    },
                    mediaQueries: ["tiny"],
                    target: {
                        id: "68221c5b4392811788febfc1|6ac9ed6d-eb6f-3d11-cc11-cd166306d134",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfc1|6ac9ed6d-eb6f-3d11-cc11-cd166306d134",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d5d35d6c
                },
                "e-661": {
                    id: "e-661",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-662"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfc1|77a22207-c862-6d58-1ea5-6795052a1d0b",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfc1|77a22207-c862-6d58-1ea5-6795052a1d0b",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d5f593e7
                },
                "e-663": {
                    id: "e-663",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-664"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfc1|77a22207-c862-6d58-1ea5-6795052a1d0e",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfc1|77a22207-c862-6d58-1ea5-6795052a1d0e",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d5f593e7
                },
                "e-706": {
                    id: "e-706",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLLING_IN_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_CONTINUOUS_ACTION",
                        config: {
                            actionListId: "a-38",
                            affectedElements: {},
                            duration: 0
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfc1|ef325735-5ab7-f238-bc90-b4513f10e968",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfc1|ef325735-5ab7-f238-bc90-b4513f10e968",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: [{
                        continuousParameterGroupId: "a-38-p",
                        smoothing: 90,
                        startsEntering: !0,
                        addStartOffset: !1,
                        addOffsetValue: 50,
                        startsExiting: !1,
                        addEndOffset: !1,
                        endOffsetValue: 50
                    }],
                    createdOn: 0x196d61f7778
                },
                "e-707": {
                    id: "e-707",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLLING_IN_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_CONTINUOUS_ACTION",
                        config: {
                            actionListId: "a-38",
                            affectedElements: {},
                            duration: 0
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfc1|ef325735-5ab7-f238-bc90-b4513f10e96a",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfc1|ef325735-5ab7-f238-bc90-b4513f10e96a",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: [{
                        continuousParameterGroupId: "a-38-p",
                        smoothing: 90,
                        startsEntering: !0,
                        addStartOffset: !1,
                        addOffsetValue: 50,
                        startsExiting: !1,
                        addEndOffset: !1,
                        endOffsetValue: 50
                    }],
                    createdOn: 0x196d61f7778
                },
                "e-710": {
                    id: "e-710",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-711"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "e887922c-0c43-a09c-57ae-50768e121cba",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "e887922c-0c43-a09c-57ae-50768e121cba",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d632e379
                },
                "e-712": {
                    id: "e-712",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-713"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "e887922c-0c43-a09c-57ae-50768e121cc2",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "e887922c-0c43-a09c-57ae-50768e121cc2",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d632e379
                },
                "e-714": {
                    id: "e-714",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-715"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "e887922c-0c43-a09c-57ae-50768e121cca",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "e887922c-0c43-a09c-57ae-50768e121cca",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d632e379
                },
                "e-716": {
                    id: "e-716",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-717"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "e887922c-0c43-a09c-57ae-50768e121cb6",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "e887922c-0c43-a09c-57ae-50768e121cb6",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d63c6609
                },
                "e-718": {
                    id: "e-718",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-719"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "e887922c-0c43-a09c-57ae-50768e121cb3",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "e887922c-0c43-a09c-57ae-50768e121cb3",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d63cb2f5
                },
                "e-724": {
                    id: "e-724",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-725"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "e887922c-0c43-a09c-57ae-50768e121cc0",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "e887922c-0c43-a09c-57ae-50768e121cc0",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d974f0cb
                },
                "e-738": {
                    id: "e-738",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-739"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfc1|287eb356-6d10-6f4d-df5c-380940e6cb7f",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfc1|287eb356-6d10-6f4d-df5c-380940e6cb7f",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d4c95d8d
                },
                "e-743": {
                    id: "e-743",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-748"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfc1|3570d792-74bf-ebf0-cc3a-bc3fa327af6a",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfc1|3570d792-74bf-ebf0-cc3a-bc3fa327af6a",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d0808aef
                },
                "e-746": {
                    id: "e-746",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-742"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfc1|3570d792-74bf-ebf0-cc3a-bc3fa327af68",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfc1|3570d792-74bf-ebf0-cc3a-bc3fa327af68",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d080609c
                },
                "e-749": {
                    id: "e-749",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-46",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-750"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "6122bba7-bb93-6571-e06a-640602b4b045",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "6122bba7-bb93-6571-e06a-640602b4b045",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d9b3576a
                },
                "e-750": {
                    id: "e-750",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-47",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-749"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "6122bba7-bb93-6571-e06a-640602b4b045",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "6122bba7-bb93-6571-e06a-640602b4b045",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d9b3576c
                },
                "e-751": {
                    id: "e-751",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-752"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68275be9e04e285df4a099a7|d9fb2388-7a38-e79d-6c8d-d2e4b1e7b2da",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68275be9e04e285df4a099a7|d9fb2388-7a38-e79d-6c8d-d2e4b1e7b2da",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d9dea607
                },
                "e-753": {
                    id: "e-753",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-4",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-754"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68275be9e04e285df4a099a7|1d90c4f6-fe17-7ac9-e579-f87d2de08d66",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68275be9e04e285df4a099a7|1d90c4f6-fe17-7ac9-e579-f87d2de08d66",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d9debafe
                },
                "e-755": {
                    id: "e-755",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-6",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-756"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68275be9e04e285df4a099a7|914cd6ae-dbf9-be6a-31d9-ea164c61a9da",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68275be9e04e285df4a099a7|914cd6ae-dbf9-be6a-31d9-ea164c61a9da",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d9defc3c
                },
                "e-757": {
                    id: "e-757",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-55",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-758"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68275be9e04e285df4a099a7|0a6bd0dd-8de3-e83d-fdaa-1662c2558c26",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68275be9e04e285df4a099a7|0a6bd0dd-8de3-e83d-fdaa-1662c2558c26",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196d9df8ad2
                },
                "e-761": {
                    id: "e-761",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "PAGE_SCROLL_UP",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-23",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-762"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfc1",
                        appliesTo: "PAGE",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfc1",
                        appliesTo: "PAGE",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196da00dfc9
                },
                "e-762": {
                    id: "e-762",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "PAGE_SCROLL_DOWN",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-22",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-761"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfc1",
                        appliesTo: "PAGE",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfc1",
                        appliesTo: "PAGE",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196da00dfcb
                },
                "e-763": {
                    id: "e-763",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "PAGE_SCROLL_UP",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-23",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-764"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68275be9e04e285df4a099a7",
                        appliesTo: "PAGE",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68275be9e04e285df4a099a7",
                        appliesTo: "PAGE",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196da01b5db
                },
                "e-764": {
                    id: "e-764",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "PAGE_SCROLL_DOWN",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-22",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-763"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68275be9e04e285df4a099a7",
                        appliesTo: "PAGE",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68275be9e04e285df4a099a7",
                        appliesTo: "PAGE",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196da01b5dd
                },
                "e-765": {
                    id: "e-765",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "PAGE_SCROLL_UP",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-23",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-766"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "6827675a78e6fa0197a877a1",
                        appliesTo: "PAGE",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "6827675a78e6fa0197a877a1",
                        appliesTo: "PAGE",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196da021e84
                },
                "e-766": {
                    id: "e-766",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "PAGE_SCROLL_DOWN",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-22",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-765"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "6827675a78e6fa0197a877a1",
                        appliesTo: "PAGE",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "6827675a78e6fa0197a877a1",
                        appliesTo: "PAGE",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196da021e86
                },
                "e-767": {
                    id: "e-767",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-768"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68276e6af4aef884568058a0|78e6019c-899d-f46c-7886-95f181377abe",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68276e6af4aef884568058a0|78e6019c-899d-f46c-7886-95f181377abe",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196da2f20ee
                },
                "e-769": {
                    id: "e-769",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-4",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-770"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68276e6af4aef884568058a0|8e822307-5e06-9104-f5e6-c528a69b1022",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68276e6af4aef884568058a0|8e822307-5e06-9104-f5e6-c528a69b1022",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196da2f3c7f
                },
                "e-771": {
                    id: "e-771",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-56",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-772"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68276e6af4aef884568058a0|9babf21f-04ec-2fa9-e15f-27cd358cde59",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68276e6af4aef884568058a0|9babf21f-04ec-2fa9-e15f-27cd358cde59",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196da33d64f
                },
                "e-773": {
                    id: "e-773",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLLING_IN_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_CONTINUOUS_ACTION",
                        config: {
                            actionListId: "a-57",
                            affectedElements: {},
                            duration: 0
                        }
                    },
                    mediaQueries: ["main", "medium"],
                    target: {
                        id: "68276e6af4aef884568058a0|7592a698-d3b3-3716-3b99-e2bfd00b737b",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68276e6af4aef884568058a0|7592a698-d3b3-3716-3b99-e2bfd00b737b",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: [{
                        continuousParameterGroupId: "a-57-p",
                        smoothing: 50,
                        startsEntering: !0,
                        addStartOffset: !0,
                        addOffsetValue: 50,
                        startsExiting: !1,
                        addEndOffset: !1,
                        endOffsetValue: -20
                    }],
                    createdOn: 0x196da3bc6ff
                },
                "e-790": {
                    id: "e-790",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-60",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-791"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "412c6839-75b8-5bd0-e471-34d4797d2a2d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "412c6839-75b8-5bd0-e471-34d4797d2a2d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196dae753dd
                },
                "e-792": {
                    id: "e-792",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-60",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-793"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "412c6839-75b8-5bd0-e471-34d4797d2a21",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "412c6839-75b8-5bd0-e471-34d4797d2a21",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196dae754c3
                },
                "e-794": {
                    id: "e-794",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-60",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-795"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "412c6839-75b8-5bd0-e471-34d4797d2a15",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "412c6839-75b8-5bd0-e471-34d4797d2a15",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196dae755bc
                },
                "e-796": {
                    id: "e-796",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-60",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-797"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "412c6839-75b8-5bd0-e471-34d4797d2a09",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "412c6839-75b8-5bd0-e471-34d4797d2a09",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196dae75653
                },
                "e-798": {
                    id: "e-798",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-60",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-799"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "412c6839-75b8-5bd0-e471-34d4797d29fd",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "412c6839-75b8-5bd0-e471-34d4797d29fd",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196dae758cb
                },
                "e-800": {
                    id: "e-800",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-61",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-801"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "412c6839-75b8-5bd0-e471-34d4797d29f1",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "412c6839-75b8-5bd0-e471-34d4797d29f1",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196db14350b
                },
                "e-801": {
                    id: "e-801",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-62",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-800"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "412c6839-75b8-5bd0-e471-34d4797d29f1",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "412c6839-75b8-5bd0-e471-34d4797d29f1",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196db14350d
                },
                "e-802": {
                    id: "e-802",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-60",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-803"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "412c6839-75b8-5bd0-e471-34d4797d29f1",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "412c6839-75b8-5bd0-e471-34d4797d29f1",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196db1e9b7d
                },
                "e-804": {
                    id: "e-804",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-61",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-805"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "412c6839-75b8-5bd0-e471-34d4797d29fd",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "412c6839-75b8-5bd0-e471-34d4797d29fd",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196db1f2571
                },
                "e-805": {
                    id: "e-805",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-62",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-804"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "412c6839-75b8-5bd0-e471-34d4797d29fd",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "412c6839-75b8-5bd0-e471-34d4797d29fd",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196db1f2573
                },
                "e-806": {
                    id: "e-806",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-61",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-807"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "412c6839-75b8-5bd0-e471-34d4797d2a09",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "412c6839-75b8-5bd0-e471-34d4797d2a09",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196db1f850e
                },
                "e-807": {
                    id: "e-807",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-62",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-806"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "412c6839-75b8-5bd0-e471-34d4797d2a09",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "412c6839-75b8-5bd0-e471-34d4797d2a09",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196db1f8510
                },
                "e-808": {
                    id: "e-808",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-61",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-809"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "412c6839-75b8-5bd0-e471-34d4797d2a15",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "412c6839-75b8-5bd0-e471-34d4797d2a15",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196db1fd55a
                },
                "e-809": {
                    id: "e-809",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-62",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-808"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "412c6839-75b8-5bd0-e471-34d4797d2a15",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "412c6839-75b8-5bd0-e471-34d4797d2a15",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196db1fd55c
                },
                "e-810": {
                    id: "e-810",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-61",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-811"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "412c6839-75b8-5bd0-e471-34d4797d2a21",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "412c6839-75b8-5bd0-e471-34d4797d2a21",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196db20254e
                },
                "e-811": {
                    id: "e-811",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-62",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-810"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "412c6839-75b8-5bd0-e471-34d4797d2a21",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "412c6839-75b8-5bd0-e471-34d4797d2a21",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196db202550
                },
                "e-812": {
                    id: "e-812",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-61",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-813"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "412c6839-75b8-5bd0-e471-34d4797d2a2d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "412c6839-75b8-5bd0-e471-34d4797d2a2d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196db20846d
                },
                "e-813": {
                    id: "e-813",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-62",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-812"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "412c6839-75b8-5bd0-e471-34d4797d2a2d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "412c6839-75b8-5bd0-e471-34d4797d2a2d",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196db20846f
                },
                "e-820": {
                    id: "e-820",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-821"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "6827b9078a6fd61d1441b207|8de5b136-05ca-6165-64fa-456a790b0c88",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "6827b9078a6fd61d1441b207|8de5b136-05ca-6165-64fa-456a790b0c88",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196db3a684e
                },
                "e-822": {
                    id: "e-822",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-4",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-823"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "6827b9078a6fd61d1441b207|26db8af9-31ab-4f50-3561-9777cd8bfb6c",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "6827b9078a6fd61d1441b207|26db8af9-31ab-4f50-3561-9777cd8bfb6c",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196db3abe22
                },
                "e-824": {
                    id: "e-824",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-37",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-825"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "6827b9078a6fd61d1441b207|8c9b2ed6-6611-94de-80b1-9fadbbb5f15e",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "6827b9078a6fd61d1441b207|8c9b2ed6-6611-94de-80b1-9fadbbb5f15e",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196db3b03da
                },
                "e-842": {
                    id: "e-842",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-37",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-843"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "3d7e9cc6-741c-3f8c-c75d-067ca6ba9aad",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "3d7e9cc6-741c-3f8c-c75d-067ca6ba9aad",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196db4da589
                },
                "e-846": {
                    id: "e-846",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-63",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-847"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "6827c4550d29e70e64d6ef67|f2e0c8a3-bd97-ac39-97c7-91869b08fb08",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "6827c4550d29e70e64d6ef67|f2e0c8a3-bd97-ac39-97c7-91869b08fb08",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 20,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196e94bb148
                },
                "e-848": {
                    id: "e-848",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-849"
                        }
                    },
                    mediaQueries: ["small", "tiny"],
                    target: {
                        id: "6827c4550d29e70e64d6ef67|f1386bef-1005-bbdb-c26f-5d465d9efe76",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "6827c4550d29e70e64d6ef67|f1386bef-1005-bbdb-c26f-5d465d9efe76",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196e95e560f
                },
                "e-850": {
                    id: "e-850",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-4",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-851"
                        }
                    },
                    mediaQueries: ["small", "tiny"],
                    target: {
                        id: "6827c4550d29e70e64d6ef67|bf196e4f-cfca-ddf8-b3f8-3072db4371aa",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "6827c4550d29e70e64d6ef67|bf196e4f-cfca-ddf8-b3f8-3072db4371aa",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196e95e7222
                },
                "e-852": {
                    id: "e-852",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-6",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-853"
                        }
                    },
                    mediaQueries: ["small", "tiny"],
                    target: {
                        id: "6827c4550d29e70e64d6ef67|50244553-5cd2-cbe1-48c6-4d9917d853e3",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "6827c4550d29e70e64d6ef67|50244553-5cd2-cbe1-48c6-4d9917d853e3",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196e95e90fc
                },
                "e-854": {
                    id: "e-854",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-64",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-855"
                        }
                    },
                    mediaQueries: ["main", "medium"],
                    target: {
                        id: "6827c4550d29e70e64d6ef67|1990b13d-4d91-ab20-4768-ae599f6e947a",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "6827c4550d29e70e64d6ef67|1990b13d-4d91-ab20-4768-ae599f6e947a",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196e96d498e
                },
                "e-880": {
                    id: "e-880",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-61",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-881"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "5e912906-ae0c-5259-b089-02a8e7ad8198",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "5e912906-ae0c-5259-b089-02a8e7ad8198",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196e97ada04
                },
                "e-881": {
                    id: "e-881",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-62",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-880"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "5e912906-ae0c-5259-b089-02a8e7ad8198",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "5e912906-ae0c-5259-b089-02a8e7ad8198",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196e97ada04
                },
                "e-890": {
                    id: "e-890",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-61",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-891"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "5e912906-ae0c-5259-b089-02a8e7ad81b2",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "5e912906-ae0c-5259-b089-02a8e7ad81b2",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196e97ada04
                },
                "e-891": {
                    id: "e-891",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-62",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-890"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "5e912906-ae0c-5259-b089-02a8e7ad81b2",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "5e912906-ae0c-5259-b089-02a8e7ad81b2",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196e97ada04
                },
                "e-892": {
                    id: "e-892",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-61",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-893"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "5e912906-ae0c-5259-b089-02a8e7ad81bf",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "5e912906-ae0c-5259-b089-02a8e7ad81bf",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196e97ada04
                },
                "e-893": {
                    id: "e-893",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-62",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-892"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "5e912906-ae0c-5259-b089-02a8e7ad81bf",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "5e912906-ae0c-5259-b089-02a8e7ad81bf",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196e97ada04
                },
                "e-896": {
                    id: "e-896",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-61",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-897"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "5e912906-ae0c-5259-b089-02a8e7ad81cc",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "5e912906-ae0c-5259-b089-02a8e7ad81cc",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196e97ada04
                },
                "e-897": {
                    id: "e-897",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-62",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-896"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "5e912906-ae0c-5259-b089-02a8e7ad81cc",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "5e912906-ae0c-5259-b089-02a8e7ad81cc",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196e97ada04
                },
                "e-902": {
                    id: "e-902",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-61",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-903"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "5e912906-ae0c-5259-b089-02a8e7ad81d9",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "5e912906-ae0c-5259-b089-02a8e7ad81d9",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196e97ada04
                },
                "e-903": {
                    id: "e-903",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-62",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-902"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "5e912906-ae0c-5259-b089-02a8e7ad81d9",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "5e912906-ae0c-5259-b089-02a8e7ad81d9",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196e97ada04
                },
                "e-904": {
                    id: "e-904",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-905"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "5e912906-ae0c-5259-b089-02a8e7ad8195",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "5e912906-ae0c-5259-b089-02a8e7ad8195",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196e97c1ac7
                },
                "e-930": {
                    id: "e-930",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-61",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-931"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "5e912906-ae0c-5259-b089-02a8e7ad81a5",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "5e912906-ae0c-5259-b089-02a8e7ad81a5",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196e99bc71c
                },
                "e-931": {
                    id: "e-931",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-62",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-930"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "5e912906-ae0c-5259-b089-02a8e7ad81a5",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "5e912906-ae0c-5259-b089-02a8e7ad81a5",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196e99bc71f
                },
                "e-956": {
                    id: "e-956",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-52",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-957"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682b762d967d895481a47da2|8dd3efb6-33a7-31e2-1471-e1e138aac1c9",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682b762d967d895481a47da2|8dd3efb6-33a7-31e2-1471-e1e138aac1c9",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196e9ff43b0
                },
                "e-957": {
                    id: "e-957",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-53",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-956"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682b762d967d895481a47da2|8dd3efb6-33a7-31e2-1471-e1e138aac1c9",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682b762d967d895481a47da2|8dd3efb6-33a7-31e2-1471-e1e138aac1c9",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196e9ff43b2
                },
                "e-958": {
                    id: "e-958",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-52",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-959"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682629b146c19572ee79ccb9|c3f01d6a-177f-5409-7f83-1eb2e55488f2",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682629b146c19572ee79ccb9|c3f01d6a-177f-5409-7f83-1eb2e55488f2",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea02633b
                },
                "e-959": {
                    id: "e-959",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-53",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-958"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682629b146c19572ee79ccb9|c3f01d6a-177f-5409-7f83-1eb2e55488f2",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682629b146c19572ee79ccb9|c3f01d6a-177f-5409-7f83-1eb2e55488f2",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea02633b
                },
                "e-970": {
                    id: "e-970",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-52",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1086"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682629b146c19572ee79ccb9|cdc70671-c162-ac99-5a67-c26038482f07",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682629b146c19572ee79ccb9|cdc70671-c162-ac99-5a67-c26038482f07",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea0343bc
                },
                "e-971": {
                    id: "e-971",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-53",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-970"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682629b146c19572ee79ccb9|cdc70671-c162-ac99-5a67-c26038482f07",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682629b146c19572ee79ccb9|cdc70671-c162-ac99-5a67-c26038482f07",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea0343bc
                },
                "e-974": {
                    id: "e-974",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-52",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-975"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682629b146c19572ee79ccb9|73d2dbd7-f516-0d9c-15fb-8b6d3bac8938",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682629b146c19572ee79ccb9|73d2dbd7-f516-0d9c-15fb-8b6d3bac8938",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea0375d4
                },
                "e-975": {
                    id: "e-975",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-53",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1079"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682629b146c19572ee79ccb9|73d2dbd7-f516-0d9c-15fb-8b6d3bac8938",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682629b146c19572ee79ccb9|73d2dbd7-f516-0d9c-15fb-8b6d3bac8938",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea0375d4
                },
                "e-978": {
                    id: "e-978",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-52",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-979"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682629b146c19572ee79ccb9|12aeed2e-52c2-d9ac-d67b-1d1d20aa002a",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682629b146c19572ee79ccb9|12aeed2e-52c2-d9ac-d67b-1d1d20aa002a",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea03a264
                },
                "e-979": {
                    id: "e-979",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-53",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-978"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682629b146c19572ee79ccb9|12aeed2e-52c2-d9ac-d67b-1d1d20aa002a",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682629b146c19572ee79ccb9|12aeed2e-52c2-d9ac-d67b-1d1d20aa002a",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea03a264
                },
                "e-982": {
                    id: "e-982",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-52",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-983"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682629b146c19572ee79ccb9|c9fd26f0-1741-9309-acfc-7d110aff77cd",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682629b146c19572ee79ccb9|c9fd26f0-1741-9309-acfc-7d110aff77cd",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea03c1f2
                },
                "e-983": {
                    id: "e-983",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-53",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-982"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682629b146c19572ee79ccb9|c9fd26f0-1741-9309-acfc-7d110aff77cd",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682629b146c19572ee79ccb9|c9fd26f0-1741-9309-acfc-7d110aff77cd",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea03c1f2
                },
                "e-986": {
                    id: "e-986",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-37",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-987"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682629b146c19572ee79ccb9|2355c4eb-39a1-2a2a-76c6-5be149459e3c",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682629b146c19572ee79ccb9|2355c4eb-39a1-2a2a-76c6-5be149459e3c",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea137233
                },
                "e-988": {
                    id: "e-988",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-989"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682629b146c19572ee79ccb9|09053b3b-9666-d1e1-e749-178d9736f695",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682629b146c19572ee79ccb9|09053b3b-9666-d1e1-e749-178d9736f695",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea13bcf0
                },
                "e-990": {
                    id: "e-990",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-991"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682629b146c19572ee79ccb9|0996165b-c179-6c57-5946-e6edbe392268",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682629b146c19572ee79ccb9|0996165b-c179-6c57-5946-e6edbe392268",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea1491a1
                },
                "e-992": {
                    id: "e-992",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-4",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-993"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682629b146c19572ee79ccb9|124484ba-ee8f-6d9f-1972-7e00e04000fe",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682629b146c19572ee79ccb9|124484ba-ee8f-6d9f-1972-7e00e04000fe",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea14a6f5
                },
                "e-994": {
                    id: "e-994",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-995"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682629b146c19572ee79ccb9|c581ad0e-c4fb-8757-777a-96bf24be1241",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682629b146c19572ee79ccb9|c581ad0e-c4fb-8757-777a-96bf24be1241",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea14c05f
                },
                "e-996": {
                    id: "e-996",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-4",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-997"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682629b146c19572ee79ccb9|6819aa0e-670a-072c-20bc-03ed1427f2f3",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682629b146c19572ee79ccb9|6819aa0e-670a-072c-20bc-03ed1427f2f3",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea14db04
                },
                "e-998": {
                    id: "e-998",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-6",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-999"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682629b146c19572ee79ccb9|b6ad04db-4ada-bb55-6519-257cb99aa84e",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682629b146c19572ee79ccb9|b6ad04db-4ada-bb55-6519-257cb99aa84e",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea14ecc2
                },
                "e-1000": {
                    id: "e-1000",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-48",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1001"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682629b146c19572ee79ccb9|680902ef-971d-232d-9bc1-ee1e8f40a284",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682629b146c19572ee79ccb9|680902ef-971d-232d-9bc1-ee1e8f40a284",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea1500a3
                },
                "e-1002": {
                    id: "e-1002",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-31",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1003"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682b8e40e47efb3f7d410edf|5003d005-ea69-0c3b-822d-3c7d15301397",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682b8e40e47efb3f7d410edf|5003d005-ea69-0c3b-822d-3c7d15301397",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea6947d6
                },
                "e-1003": {
                    id: "e-1003",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-32",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1002"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682b8e40e47efb3f7d410edf|5003d005-ea69-0c3b-822d-3c7d15301397",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682b8e40e47efb3f7d410edf|5003d005-ea69-0c3b-822d-3c7d15301397",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea6947d6
                },
                "e-1004": {
                    id: "e-1004",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_MOVE",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_CONTINUOUS_ACTION",
                        config: {
                            actionListId: "a-30",
                            affectedElements: {},
                            duration: 0
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682b8e40e47efb3f7d410edf|5003d005-ea69-0c3b-822d-3c7d15301397",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682b8e40e47efb3f7d410edf|5003d005-ea69-0c3b-822d-3c7d15301397",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: [{
                        continuousParameterGroupId: "a-30-p",
                        selectedAxis: "X_AXIS",
                        basedOn: "ELEMENT",
                        reverse: !1,
                        smoothing: 0,
                        restingState: 50
                    }, {
                        continuousParameterGroupId: "a-30-p-2",
                        selectedAxis: "Y_AXIS",
                        basedOn: "ELEMENT",
                        reverse: !1,
                        smoothing: 0,
                        restingState: 50
                    }],
                    createdOn: 0x196ea6947d6
                },
                "e-1005": {
                    id: "e-1005",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1006"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682b8e40e47efb3f7d410edf|5025130e-c58f-31b2-127e-6b18f0a11483",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682b8e40e47efb3f7d410edf|5025130e-c58f-31b2-127e-6b18f0a11483",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea842a30
                },
                "e-1007": {
                    id: "e-1007",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-4",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1008"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682b8e40e47efb3f7d410edf|506ba3c3-5ad3-e382-7d60-949a4b940b25",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682b8e40e47efb3f7d410edf|506ba3c3-5ad3-e382-7d60-949a4b940b25",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea844922
                },
                "e-1009": {
                    id: "e-1009",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-6",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1010"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682b8e40e47efb3f7d410edf|6959d431-f7b3-d8b7-1bad-5bc4f67fc253",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682b8e40e47efb3f7d410edf|6959d431-f7b3-d8b7-1bad-5bc4f67fc253",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea8460ee
                },
                "e-1011": {
                    id: "e-1011",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-48",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1012"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682b8e40e47efb3f7d410edf|f77f32f1-4fe9-8681-4d70-30b9220b7332",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682b8e40e47efb3f7d410edf|f77f32f1-4fe9-8681-4d70-30b9220b7332",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea8474f5
                },
                "e-1013": {
                    id: "e-1013",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-73",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1014"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682b8e40e47efb3f7d410edf|4d964819-5b2c-0233-574f-5939bf5dfde1",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682b8e40e47efb3f7d410edf|4d964819-5b2c-0233-574f-5939bf5dfde1",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea84899b
                },
                "e-1015": {
                    id: "e-1015",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1016"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682b8e40e47efb3f7d410edf|786176e8-60f7-ca10-d3a2-a917a718700f",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682b8e40e47efb3f7d410edf|786176e8-60f7-ca10-d3a2-a917a718700f",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea84f789
                },
                "e-1017": {
                    id: "e-1017",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-4",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1018"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682b8e40e47efb3f7d410edf|0a43f4c2-7d21-23c2-4a87-ccd134749922",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682b8e40e47efb3f7d410edf|0a43f4c2-7d21-23c2-4a87-ccd134749922",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea8509b4
                },
                "e-1019": {
                    id: "e-1019",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-6",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1020"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682b8e40e47efb3f7d410edf|29965187-ac1a-426a-8c6b-59787d2c0a9b",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682b8e40e47efb3f7d410edf|29965187-ac1a-426a-8c6b-59787d2c0a9b",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea85215d
                },
                "e-1021": {
                    id: "e-1021",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-48",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1022"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682b8e40e47efb3f7d410edf|1c0fa841-5160-1ead-247c-e32c5e64c872",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682b8e40e47efb3f7d410edf|1c0fa841-5160-1ead-247c-e32c5e64c872",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea85859c
                },
                "e-1023": {
                    id: "e-1023",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1024"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682ba7709f194522c17ac715|d77913df-8f6b-906b-02b2-5fe379e412d4",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682ba7709f194522c17ac715|d77913df-8f6b-906b-02b2-5fe379e412d4",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea86747a
                },
                "e-1025": {
                    id: "e-1025",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-48",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1026"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682ba7709f194522c17ac715|d77913df-8f6b-906b-02b2-5fe379e412d6",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682ba7709f194522c17ac715|d77913df-8f6b-906b-02b2-5fe379e412d6",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea86747a
                },
                "e-1027": {
                    id: "e-1027",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-6",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1028"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682ba7709f194522c17ac715|d77913df-8f6b-906b-02b2-5fe379e412db",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682ba7709f194522c17ac715|d77913df-8f6b-906b-02b2-5fe379e412db",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea86747a
                },
                "e-1029": {
                    id: "e-1029",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-4",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1030"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682ba7709f194522c17ac715|d77913df-8f6b-906b-02b2-5fe379e412e0",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682ba7709f194522c17ac715|d77913df-8f6b-906b-02b2-5fe379e412e0",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea86747a
                },
                "e-1033": {
                    id: "e-1033",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1034"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682ba7709f194522c17ac715|d77913df-8f6b-906b-02b2-5fe379e412fc",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682ba7709f194522c17ac715|d77913df-8f6b-906b-02b2-5fe379e412fc",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea86747a
                },
                "e-1035": {
                    id: "e-1035",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-4",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1036"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682ba7709f194522c17ac715|d77913df-8f6b-906b-02b2-5fe379e41300",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682ba7709f194522c17ac715|d77913df-8f6b-906b-02b2-5fe379e41300",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea86747a
                },
                "e-1037": {
                    id: "e-1037",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-6",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1038"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682ba7709f194522c17ac715|d77913df-8f6b-906b-02b2-5fe379e41304",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682ba7709f194522c17ac715|d77913df-8f6b-906b-02b2-5fe379e41304",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea86747a
                },
                "e-1039": {
                    id: "e-1039",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-48",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1040"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682ba7709f194522c17ac715|d77913df-8f6b-906b-02b2-5fe379e41308",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682ba7709f194522c17ac715|d77913df-8f6b-906b-02b2-5fe379e41308",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea86747a
                },
                "e-1041": {
                    id: "e-1041",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_MOVE",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_CONTINUOUS_ACTION",
                        config: {
                            actionListId: "a-30",
                            affectedElements: {},
                            duration: 0
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682ba7709f194522c17ac715|d77913df-8f6b-906b-02b2-5fe379e41309",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682ba7709f194522c17ac715|d77913df-8f6b-906b-02b2-5fe379e41309",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: [{
                        continuousParameterGroupId: "a-30-p",
                        selectedAxis: "X_AXIS",
                        basedOn: "ELEMENT",
                        reverse: !1,
                        smoothing: 0,
                        restingState: 50
                    }, {
                        continuousParameterGroupId: "a-30-p-2",
                        selectedAxis: "Y_AXIS",
                        basedOn: "ELEMENT",
                        reverse: !1,
                        smoothing: 0,
                        restingState: 50
                    }],
                    createdOn: 0x196ea86747a
                },
                "e-1042": {
                    id: "e-1042",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-31",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1043"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682ba7709f194522c17ac715|d77913df-8f6b-906b-02b2-5fe379e41309",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682ba7709f194522c17ac715|d77913df-8f6b-906b-02b2-5fe379e41309",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea86747a
                },
                "e-1043": {
                    id: "e-1043",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-32",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1042"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682ba7709f194522c17ac715|d77913df-8f6b-906b-02b2-5fe379e41309",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682ba7709f194522c17ac715|d77913df-8f6b-906b-02b2-5fe379e41309",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea86747a
                },
                "e-1044": {
                    id: "e-1044",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1045"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682baac2c1933cab61354176|351fdaf4-03f7-61bd-574d-10ddf397134b",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682baac2c1933cab61354176|351fdaf4-03f7-61bd-574d-10ddf397134b",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea933991
                },
                "e-1054": {
                    id: "e-1054",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-4",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1055"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682baac2c1933cab61354176|351fdaf4-03f7-61bd-574d-10ddf3971373",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682baac2c1933cab61354176|351fdaf4-03f7-61bd-574d-10ddf3971373",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea933991
                },
                "e-1056": {
                    id: "e-1056",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-6",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1057"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682baac2c1933cab61354176|351fdaf4-03f7-61bd-574d-10ddf3971377",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682baac2c1933cab61354176|351fdaf4-03f7-61bd-574d-10ddf3971377",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea933991
                },
                "e-1058": {
                    id: "e-1058",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-48",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1059"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682baac2c1933cab61354176|351fdaf4-03f7-61bd-574d-10ddf397137b",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682baac2c1933cab61354176|351fdaf4-03f7-61bd-574d-10ddf397137b",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea933991
                },
                "e-1060": {
                    id: "e-1060",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-73",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1061"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682baac2c1933cab61354176|351fdaf4-03f7-61bd-574d-10ddf397137f",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682baac2c1933cab61354176|351fdaf4-03f7-61bd-574d-10ddf397137f",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea933991
                },
                "e-1062": {
                    id: "e-1062",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_MOVE",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_CONTINUOUS_ACTION",
                        config: {
                            actionListId: "a-30",
                            affectedElements: {},
                            duration: 0
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682baac2c1933cab61354176|351fdaf4-03f7-61bd-574d-10ddf3971380",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682baac2c1933cab61354176|351fdaf4-03f7-61bd-574d-10ddf3971380",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: [{
                        continuousParameterGroupId: "a-30-p",
                        selectedAxis: "X_AXIS",
                        basedOn: "ELEMENT",
                        reverse: !1,
                        smoothing: 0,
                        restingState: 50
                    }, {
                        continuousParameterGroupId: "a-30-p-2",
                        selectedAxis: "Y_AXIS",
                        basedOn: "ELEMENT",
                        reverse: !1,
                        smoothing: 0,
                        restingState: 50
                    }],
                    createdOn: 0x196ea933991
                },
                "e-1063": {
                    id: "e-1063",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-31",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1064"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682baac2c1933cab61354176|351fdaf4-03f7-61bd-574d-10ddf3971380",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682baac2c1933cab61354176|351fdaf4-03f7-61bd-574d-10ddf3971380",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea933991
                },
                "e-1064": {
                    id: "e-1064",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-32",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1063"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682baac2c1933cab61354176|351fdaf4-03f7-61bd-574d-10ddf3971380",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682baac2c1933cab61354176|351fdaf4-03f7-61bd-574d-10ddf3971380",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea933991
                },
                "e-1065": {
                    id: "e-1065",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-37",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1066"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682baac2c1933cab61354176|202cc7e1-d242-e0de-4cd3-025079964dd6",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682baac2c1933cab61354176|202cc7e1-d242-e0de-4cd3-025079964dd6",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x196ea9800bd
                },
                "e-1067": {
                    id: "e-1067",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-4",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1068"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "5fe9f0d2-f529-759d-d234-2cc039bface2",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "5fe9f0d2-f529-759d-d234-2cc039bface2",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x19713dcf59c
                },
                "e-1069": {
                    id: "e-1069",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-74",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1070"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682b8e40e47efb3f7d410edf|eaf13c40-1a84-070e-9e3e-62ca24d3a309",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682b8e40e47efb3f7d410edf|eaf13c40-1a84-070e-9e3e-62ca24d3a309",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x19713e9846a
                },
                "e-1070": {
                    id: "e-1070",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-75",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1069"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682b8e40e47efb3f7d410edf|eaf13c40-1a84-070e-9e3e-62ca24d3a309",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682b8e40e47efb3f7d410edf|eaf13c40-1a84-070e-9e3e-62ca24d3a309",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x19713e9846d
                },
                "e-1071": {
                    id: "e-1071",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-74",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1072"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682b8e40e47efb3f7d410edf|907f74e3-17b8-80a9-0c3e-883fd9d8c604",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682b8e40e47efb3f7d410edf|907f74e3-17b8-80a9-0c3e-883fd9d8c604",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x19713eabfcb
                },
                "e-1072": {
                    id: "e-1072",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-75",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1071"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682b8e40e47efb3f7d410edf|907f74e3-17b8-80a9-0c3e-883fd9d8c604",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682b8e40e47efb3f7d410edf|907f74e3-17b8-80a9-0c3e-883fd9d8c604",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x19713eabfce
                },
                "e-1073": {
                    id: "e-1073",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-74",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1074"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682b8e40e47efb3f7d410edf|9a95f687-747b-8be8-1e6d-d2a67b25eb62",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682b8e40e47efb3f7d410edf|9a95f687-747b-8be8-1e6d-d2a67b25eb62",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x19713eaf4d6
                },
                "e-1074": {
                    id: "e-1074",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-75",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1073"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682b8e40e47efb3f7d410edf|9a95f687-747b-8be8-1e6d-d2a67b25eb62",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682b8e40e47efb3f7d410edf|9a95f687-747b-8be8-1e6d-d2a67b25eb62",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x19713eaf4d9
                },
                "e-1075": {
                    id: "e-1075",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_OVER",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-74",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1076"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682b8e40e47efb3f7d410edf|baa542ec-8ec9-10e7-78f0-a82f74049888",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682b8e40e47efb3f7d410edf|baa542ec-8ec9-10e7-78f0-a82f74049888",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x19713eb685d
                },
                "e-1076": {
                    id: "e-1076",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "MOUSE_OUT",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-75",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1075"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "682b8e40e47efb3f7d410edf|baa542ec-8ec9-10e7-78f0-a82f74049888",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "682b8e40e47efb3f7d410edf|baa542ec-8ec9-10e7-78f0-a82f74049888",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: null,
                        scrollOffsetUnit: null,
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x19713eb6860
                },
                "e-1080": {
                    id: "e-1080",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-78",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1081"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfb7|ef8f07be-b0ec-e67c-4c3b-2cc0ea1bcd0b",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfb7|ef8f07be-b0ec-e67c-4c3b-2cc0ea1bcd0b",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x19557b3a1c8
                },
                "e-1082": {
                    id: "e-1082",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1079"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfb7|ef8f07be-b0ec-e67c-4c3b-2cc0ea1bcd00",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfb7|ef8f07be-b0ec-e67c-4c3b-2cc0ea1bcd00",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x1951dc5d357
                },
                "e-1084": {
                    id: "e-1084",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-77",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1085"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfb7|ef8f07be-b0ec-e67c-4c3b-2cc0ea1bcd0e",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfb7|ef8f07be-b0ec-e67c-4c3b-2cc0ea1bcd0e",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x19557b3e564
                },
                "e-1086": {
                    id: "e-1086",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1088"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfb7|ef8f07be-b0ec-e67c-4c3b-2cc0ea1bccfd",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfb7|ef8f07be-b0ec-e67c-4c3b-2cc0ea1bccfd",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x1951dc5d357
                },
                "e-1089": {
                    id: "e-1089",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-77",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1092"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfb7|ef8f07be-b0ec-e67c-4c3b-2cc0ea1bcd06",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfb7|ef8f07be-b0ec-e67c-4c3b-2cc0ea1bcd06",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x19557b332fc
                },
                "e-1093": {
                    id: "e-1093",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-78",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1094"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfb7|ef8f07be-b0ec-e67c-4c3b-2cc0ea1bcd18",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfb7|ef8f07be-b0ec-e67c-4c3b-2cc0ea1bcd18",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x197650a813a
                },
                "e-1095": {
                    id: "e-1095",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-78",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1096"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfb7|ef8f07be-b0ec-e67c-4c3b-2cc0ea1bcd03",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfb7|ef8f07be-b0ec-e67c-4c3b-2cc0ea1bcd03",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x197650aa206
                },
                "e-1097": {
                    id: "e-1097",
                    name: "",
                    animationType: "custom",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-37",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1098"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68221c5b4392811788febfc0|31e879ed-5c07-3920-154b-ed079ece3d8b",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68221c5b4392811788febfc0|31e879ed-5c07-3920-154b-ed079ece3d8b",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x19765301c90
                },
                "e-1099": {
                    id: "e-1099",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1100"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68275be9e04e285df4a099a7|e01ef4b4-2f5a-9a4f-f22c-78e1a5a5ac06",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68275be9e04e285df4a099a7|e01ef4b4-2f5a-9a4f-f22c-78e1a5a5ac06",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x19765dff4aa
                },
                "e-1105": {
                    id: "e-1105",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-77",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1106"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68275be9e04e285df4a099a7|e01ef4b4-2f5a-9a4f-f22c-78e1a5a5ac0f",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68275be9e04e285df4a099a7|e01ef4b4-2f5a-9a4f-f22c-78e1a5a5ac0f",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x19765dff4aa
                },
                "e-1107": {
                    id: "e-1107",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-78",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1108"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68275be9e04e285df4a099a7|e01ef4b4-2f5a-9a4f-f22c-78e1a5a5ac14",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68275be9e04e285df4a099a7|e01ef4b4-2f5a-9a4f-f22c-78e1a5a5ac14",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x19765dff4aa
                },
                "e-1109": {
                    id: "e-1109",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-77",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1110"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68275be9e04e285df4a099a7|e01ef4b4-2f5a-9a4f-f22c-78e1a5a5ac17",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68275be9e04e285df4a099a7|e01ef4b4-2f5a-9a4f-f22c-78e1a5a5ac17",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 10,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x19765dff4aa
                },
                "e-1111": {
                    id: "e-1111",
                    name: "",
                    animationType: "preset",
                    eventTypeId: "SCROLL_INTO_VIEW",
                    action: {
                        id: "",
                        actionTypeId: "GENERAL_START_ACTION",
                        config: {
                            delay: 0,
                            easing: "",
                            duration: 0,
                            actionListId: "a-78",
                            affectedElements: {},
                            playInReverse: !1,
                            autoStopEventId: "e-1112"
                        }
                    },
                    mediaQueries: ["main", "medium", "small", "tiny"],
                    target: {
                        id: "68275be9e04e285df4a099a7|e01ef4b4-2f5a-9a4f-f22c-78e1a5a5ac22",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    },
                    targets: [{
                        id: "68275be9e04e285df4a099a7|e01ef4b4-2f5a-9a4f-f22c-78e1a5a5ac22",
                        appliesTo: "ELEMENT",
                        styleBlockIds: []
                    }],
                    config: {
                        loop: !1,
                        playInReverse: !1,
                        scrollOffsetValue: 0,
                        scrollOffsetUnit: "%",
                        delay: null,
                        direction: null,
                        effectIn: null
                    },
                    createdOn: 0x19765dff4aa
                }
            },
            actionLists: {
                "a-18": {
                    id: "a-18",
                    title: "Navbar - menu opens",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-18-n",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".nav-button_line.is-first",
                                    selectorGuids: ["f1687aec-8b75-37a3-c041-1eb7452af2ab", "f1687aec-8b75-37a3-c041-1eb7452af2ae"]
                                },
                                yValue: -350,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-18-n-2",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".nav-button_line.is-third",
                                    selectorGuids: ["f1687aec-8b75-37a3-c041-1eb7452af2ab", "f1687aec-8b75-37a3-c041-1eb7452af2b0"]
                                },
                                yValue: 350,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }]
                    }, {
                        actionItems: [{
                            id: "a-18-n-3",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "outQuad",
                                duration: 250,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".nav-button_line.is-first",
                                    selectorGuids: ["f1687aec-8b75-37a3-c041-1eb7452af2ab", "f1687aec-8b75-37a3-c041-1eb7452af2ae"]
                                },
                                yValue: 0,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-18-n-4",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "outQuad",
                                duration: 250,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".nav-button_line.is-third",
                                    selectorGuids: ["f1687aec-8b75-37a3-c041-1eb7452af2ab", "f1687aec-8b75-37a3-c041-1eb7452af2b0"]
                                },
                                yValue: 0,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }]
                    }, {
                        actionItems: [{
                            id: "a-18-n-5",
                            actionTypeId: "TRANSFORM_SCALE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 0,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".nav-button_line.is-second",
                                    selectorGuids: ["f1687aec-8b75-37a3-c041-1eb7452af2ab", "f1687aec-8b75-37a3-c041-1eb7452af2af"]
                                },
                                xValue: 0,
                                locked: !1
                            }
                        }]
                    }, {
                        actionItems: [{
                            id: "a-18-n-6",
                            actionTypeId: "TRANSFORM_ROTATE",
                            config: {
                                delay: 0,
                                easing: "outQuad",
                                duration: 250,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".nav-button_line.is-first",
                                    selectorGuids: ["f1687aec-8b75-37a3-c041-1eb7452af2ab", "f1687aec-8b75-37a3-c041-1eb7452af2ae"]
                                },
                                zValue: -45,
                                xUnit: "DEG",
                                yUnit: "DEG",
                                zUnit: "deg"
                            }
                        }, {
                            id: "a-18-n-7",
                            actionTypeId: "TRANSFORM_ROTATE",
                            config: {
                                delay: 0,
                                easing: "outQuad",
                                duration: 250,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".nav-button_line.is-third",
                                    selectorGuids: ["f1687aec-8b75-37a3-c041-1eb7452af2ab", "f1687aec-8b75-37a3-c041-1eb7452af2b0"]
                                },
                                zValue: 45,
                                xUnit: "DEG",
                                yUnit: "DEG",
                                zUnit: "deg"
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !0,
                    createdOn: 0x192d541e162
                },
                "a-19": {
                    id: "a-19",
                    title: "Navbar - menu closes",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-19-n",
                            actionTypeId: "TRANSFORM_ROTATE",
                            config: {
                                delay: 0,
                                easing: "outQuad",
                                duration: 250,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".nav-button_line.is-first",
                                    selectorGuids: ["f1687aec-8b75-37a3-c041-1eb7452af2ab", "f1687aec-8b75-37a3-c041-1eb7452af2ae"]
                                },
                                zValue: 0,
                                xUnit: "DEG",
                                yUnit: "DEG",
                                zUnit: "deg"
                            }
                        }, {
                            id: "a-19-n-2",
                            actionTypeId: "TRANSFORM_ROTATE",
                            config: {
                                delay: 0,
                                easing: "outQuad",
                                duration: 250,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".nav-button_line.is-third",
                                    selectorGuids: ["f1687aec-8b75-37a3-c041-1eb7452af2ab", "f1687aec-8b75-37a3-c041-1eb7452af2b0"]
                                },
                                zValue: 0,
                                xUnit: "DEG",
                                yUnit: "DEG",
                                zUnit: "deg"
                            }
                        }]
                    }, {
                        actionItems: [{
                            id: "a-19-n-3",
                            actionTypeId: "TRANSFORM_SCALE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 0,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".nav-button_line.is-second",
                                    selectorGuids: ["f1687aec-8b75-37a3-c041-1eb7452af2ab", "f1687aec-8b75-37a3-c041-1eb7452af2af"]
                                },
                                xValue: 1,
                                locked: !1
                            }
                        }]
                    }, {
                        actionItems: [{
                            id: "a-19-n-4",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "outQuad",
                                duration: 250,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".nav-button_line.is-first",
                                    selectorGuids: ["f1687aec-8b75-37a3-c041-1eb7452af2ab", "f1687aec-8b75-37a3-c041-1eb7452af2ae"]
                                },
                                yValue: -350,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-19-n-5",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "outQuad",
                                duration: 250,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".nav-button_line.is-third",
                                    selectorGuids: ["f1687aec-8b75-37a3-c041-1eb7452af2ab", "f1687aec-8b75-37a3-c041-1eb7452af2b0"]
                                },
                                yValue: 350,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !1,
                    createdOn: 0x192d541e162
                },
                a: {
                    id: "a",
                    title: "View - 0.1s",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-n",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: !0,
                                    id: "66aaa6f9df23317315a19aa3|593fb161-df47-08f4-613c-8f442471082a"
                                },
                                value: 0,
                                unit: ""
                            }
                        }, {
                            id: "a-n-2",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: !0,
                                    id: "66aaa6f9df23317315a19aa3|593fb161-df47-08f4-613c-8f442471082a"
                                },
                                yValue: 15,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }]
                    }, {
                        actionItems: [{
                            id: "a-n-3",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 100,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: !0,
                                    id: "66aaa6f9df23317315a19aa3|593fb161-df47-08f4-613c-8f442471082a"
                                },
                                value: 1,
                                unit: ""
                            }
                        }, {
                            id: "a-n-4",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 100,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: !0,
                                    id: "66aaa6f9df23317315a19aa3|593fb161-df47-08f4-613c-8f442471082a"
                                },
                                yValue: 0,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !0,
                    createdOn: 0x191450a9e51
                },
                "a-4": {
                    id: "a-4",
                    title: "View - 0.2s",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-4-n",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: !0,
                                    id: "66aaa6f9df23317315a19aa3|593fb161-df47-08f4-613c-8f442471082a"
                                },
                                value: 0,
                                unit: ""
                            }
                        }, {
                            id: "a-4-n-2",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: !0,
                                    id: "66aaa6f9df23317315a19aa3|593fb161-df47-08f4-613c-8f442471082a"
                                },
                                yValue: 15,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }]
                    }, {
                        actionItems: [{
                            id: "a-4-n-3",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 200,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: !0,
                                    id: "66aaa6f9df23317315a19aa3|593fb161-df47-08f4-613c-8f442471082a"
                                },
                                value: 1,
                                unit: ""
                            }
                        }, {
                            id: "a-4-n-4",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 200,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: !0,
                                    id: "66aaa6f9df23317315a19aa3|593fb161-df47-08f4-613c-8f442471082a"
                                },
                                yValue: 0,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !0,
                    createdOn: 0x191450a9e51
                },
                "a-6": {
                    id: "a-6",
                    title: "View - 0.3s",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-6-n",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: !0,
                                    id: "66aaa6f9df23317315a19aa3|593fb161-df47-08f4-613c-8f442471082a"
                                },
                                value: 0,
                                unit: ""
                            }
                        }, {
                            id: "a-6-n-2",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: !0,
                                    id: "66aaa6f9df23317315a19aa3|593fb161-df47-08f4-613c-8f442471082a"
                                },
                                yValue: 15,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }]
                    }, {
                        actionItems: [{
                            id: "a-6-n-3",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 300,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: !0,
                                    id: "66aaa6f9df23317315a19aa3|593fb161-df47-08f4-613c-8f442471082a"
                                },
                                value: 1,
                                unit: ""
                            }
                        }, {
                            id: "a-6-n-4",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 300,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: !0,
                                    id: "66aaa6f9df23317315a19aa3|593fb161-df47-08f4-613c-8f442471082a"
                                },
                                yValue: 0,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !0,
                    createdOn: 0x191450a9e51
                },
                "a-23": {
                    id: "a-23",
                    title: "Navbar - scroll down",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-23-n",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "outQuart",
                                duration: 1e3,
                                target: {
                                    id: "9edf84aa-1c78-d247-2c17-fa546717f184"
                                },
                                yValue: 0,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !1,
                    createdOn: 0x19547ab43e8
                },
                "a-22": {
                    id: "a-22",
                    title: "Navbar - scroll up",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-22-n",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "outQuart",
                                duration: 1e3,
                                target: {
                                    id: "9edf84aa-1c78-d247-2c17-fa546717f184"
                                },
                                yValue: -100,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !1,
                    createdOn: 0x19547ab43e8
                },
                "a-24": {
                    id: "a-24",
                    title: "Dropdown opens",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-24-n",
                            actionTypeId: "STYLE_SIZE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".nav_dropdown-wrap",
                                    selectorGuids: ["c89483b9-1f34-d725-c9a0-54e33601cc42"]
                                },
                                heightValue: 0,
                                widthUnit: "PX",
                                heightUnit: "px",
                                locked: !1
                            }
                        }, {
                            id: "a-24-n-2",
                            actionTypeId: "TRANSFORM_ROTATE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".nav_link-icon",
                                    selectorGuids: ["c89483b9-1f34-d725-c9a0-54e33601cc40"]
                                },
                                zValue: 0,
                                xUnit: "DEG",
                                yUnit: "DEG",
                                zUnit: "deg"
                            }
                        }]
                    }, {
                        actionItems: [{
                            id: "a-24-n-3",
                            actionTypeId: "STYLE_SIZE",
                            config: {
                                delay: 0,
                                easing: "outQuad",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".nav_dropdown-wrap",
                                    selectorGuids: ["c89483b9-1f34-d725-c9a0-54e33601cc42"]
                                },
                                widthUnit: "PX",
                                heightUnit: "AUTO",
                                locked: !1
                            }
                        }, {
                            id: "a-24-n-4",
                            actionTypeId: "TRANSFORM_ROTATE",
                            config: {
                                delay: 0,
                                easing: "inQuad",
                                duration: 300,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".nav_link-icon",
                                    selectorGuids: ["c89483b9-1f34-d725-c9a0-54e33601cc40"]
                                },
                                zValue: 180,
                                xUnit: "DEG",
                                yUnit: "DEG",
                                zUnit: "deg"
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !0,
                    createdOn: 0x1946c1a1076
                },
                "a-25": {
                    id: "a-25",
                    title: "Dropdown closes",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-25-n",
                            actionTypeId: "STYLE_SIZE",
                            config: {
                                delay: 0,
                                easing: "outQuad",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".nav_dropdown-wrap",
                                    selectorGuids: ["c89483b9-1f34-d725-c9a0-54e33601cc42"]
                                },
                                heightValue: 0,
                                widthUnit: "PX",
                                heightUnit: "px",
                                locked: !1
                            }
                        }, {
                            id: "a-25-n-2",
                            actionTypeId: "TRANSFORM_ROTATE",
                            config: {
                                delay: 0,
                                easing: "outQuad",
                                duration: 300,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".nav_link-icon",
                                    selectorGuids: ["c89483b9-1f34-d725-c9a0-54e33601cc40"]
                                },
                                zValue: 0,
                                xUnit: "DEG",
                                yUnit: "DEG",
                                zUnit: "deg"
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !1,
                    createdOn: 0x1946c1a1076
                },
                "a-31": {
                    id: "a-31",
                    title: "Button - hover on",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-31-n",
                            actionTypeId: "TRANSFORM_SCALE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".button-background",
                                    selectorGuids: ["f1348b0b-9d3b-69e9-f57a-5116e413c66a"]
                                },
                                xValue: 0,
                                yValue: 0,
                                locked: !0
                            }
                        }]
                    }, {
                        actionItems: [{
                            id: "a-31-n-2",
                            actionTypeId: "TRANSFORM_SCALE",
                            config: {
                                delay: 0,
                                easing: [.55, .094, .749, .252],
                                duration: 400,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".button-background",
                                    selectorGuids: ["f1348b0b-9d3b-69e9-f57a-5116e413c66a"]
                                },
                                xValue: 2.1,
                                yValue: 2.1,
                                locked: !0
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !0,
                    createdOn: 0x1933602bc8a
                },
                "a-32": {
                    id: "a-32",
                    title: "Button - hover off",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-32-n",
                            actionTypeId: "TRANSFORM_SCALE",
                            config: {
                                delay: 0,
                                easing: "outQuad",
                                duration: 100,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".button-background",
                                    selectorGuids: ["f1348b0b-9d3b-69e9-f57a-5116e413c66a"]
                                },
                                xValue: 2,
                                yValue: 2,
                                locked: !0
                            }
                        }, {
                            id: "a-32-n-2",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "outQuad",
                                duration: 100,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".button-background",
                                    selectorGuids: ["f1348b0b-9d3b-69e9-f57a-5116e413c66a"]
                                },
                                value: 0,
                                unit: ""
                            }
                        }]
                    }, {
                        actionItems: [{
                            id: "a-32-n-3",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 0,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".button-background",
                                    selectorGuids: ["f1348b0b-9d3b-69e9-f57a-5116e413c66a"]
                                },
                                value: 1,
                                unit: ""
                            }
                        }, {
                            id: "a-32-n-4",
                            actionTypeId: "TRANSFORM_SCALE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 0,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".button-background",
                                    selectorGuids: ["f1348b0b-9d3b-69e9-f57a-5116e413c66a"]
                                },
                                xValue: 0,
                                yValue: 0,
                                locked: !0
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !1,
                    createdOn: 0x1933602bc8a
                },
                "a-30": {
                    id: "a-30",
                    title: "button - hover move",
                    continuousParameterGroups: [{
                        id: "a-30-p",
                        type: "MOUSE_X",
                        parameterLabel: "Mouse X",
                        continuousActionGroups: [{
                            keyframe: 0,
                            actionItems: [{
                                id: "a-30-n",
                                actionTypeId: "TRANSFORM_MOVE",
                                config: {
                                    delay: 0,
                                    easing: "",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".button-background",
                                        selectorGuids: ["f1348b0b-9d3b-69e9-f57a-5116e413c66a"]
                                    },
                                    xValue: -50,
                                    xUnit: "%",
                                    yUnit: "PX",
                                    zUnit: "PX"
                                }
                            }]
                        }, {
                            keyframe: 100,
                            actionItems: [{
                                id: "a-30-n-2",
                                actionTypeId: "TRANSFORM_MOVE",
                                config: {
                                    delay: 0,
                                    easing: "",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".button-background",
                                        selectorGuids: ["f1348b0b-9d3b-69e9-f57a-5116e413c66a"]
                                    },
                                    xValue: 50,
                                    xUnit: "%",
                                    yUnit: "PX",
                                    zUnit: "PX"
                                }
                            }]
                        }]
                    }, {
                        id: "a-30-p-2",
                        type: "MOUSE_Y",
                        parameterLabel: "Mouse Y",
                        continuousActionGroups: [{
                            keyframe: 0,
                            actionItems: [{
                                id: "a-30-n-3",
                                actionTypeId: "TRANSFORM_MOVE",
                                config: {
                                    delay: 0,
                                    easing: "",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".button-background",
                                        selectorGuids: ["f1348b0b-9d3b-69e9-f57a-5116e413c66a"]
                                    },
                                    yValue: -1.25,
                                    xUnit: "PX",
                                    yUnit: "rem",
                                    zUnit: "PX"
                                }
                            }]
                        }, {
                            keyframe: 100,
                            actionItems: [{
                                id: "a-30-n-4",
                                actionTypeId: "TRANSFORM_MOVE",
                                config: {
                                    delay: 0,
                                    easing: "",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".button-background",
                                        selectorGuids: ["f1348b0b-9d3b-69e9-f57a-5116e413c66a"]
                                    },
                                    yValue: 1.25,
                                    xUnit: "PX",
                                    yUnit: "rem",
                                    zUnit: "PX"
                                }
                            }]
                        }]
                    }],
                    createdOn: 0x1934025e6b5
                },
                "a-36": {
                    id: "a-36",
                    title: "Hero one - animation",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-36-n-16",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".heading-style-h1",
                                    selectorGuids: ["07815991-952a-8d98-0e00-e4c25af2710c"]
                                },
                                yValue: 5,
                                xUnit: "PX",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-36-n-18",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".heading-style-h1",
                                    selectorGuids: ["07815991-952a-8d98-0e00-e4c25af2710c"]
                                },
                                value: 0,
                                unit: ""
                            }
                        }, {
                            id: "a-36-n-20",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-color-secondary.is-hero-one-description",
                                    selectorGuids: ["07815991-952a-8d98-0e00-e4c25af270fe", "872babe3-96bb-b914-da8a-b07db9310ae9"]
                                },
                                yValue: 5,
                                xUnit: "PX",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-36-n-22",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-color-secondary.is-hero-one-description",
                                    selectorGuids: ["07815991-952a-8d98-0e00-e4c25af270fe", "872babe3-96bb-b914-da8a-b07db9310ae9"]
                                },
                                value: 0,
                                unit: ""
                            }
                        }, {
                            id: "a-36-n-24",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_button-wrapper",
                                    selectorGuids: ["50b90280-7acb-5e0d-8589-186e53498af2"]
                                },
                                yValue: 5,
                                xUnit: "PX",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-36-n-26",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_button-wrapper",
                                    selectorGuids: ["50b90280-7acb-5e0d-8589-186e53498af2"]
                                },
                                value: 0,
                                unit: ""
                            }
                        }, {
                            id: "a-36-n-28",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_info.is-first",
                                    selectorGuids: ["8f045a61-ad13-0db7-360e-05b3ce74ecc7", "ad2b6077-198a-0f60-fb6d-e4db3c4090a3"]
                                },
                                xValue: 5,
                                xUnit: "rem",
                                yUnit: "PX",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-36-n-30",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_info.is-first",
                                    selectorGuids: ["8f045a61-ad13-0db7-360e-05b3ce74ecc7", "ad2b6077-198a-0f60-fb6d-e4db3c4090a3"]
                                },
                                value: 0,
                                unit: ""
                            }
                        }, {
                            id: "a-36-n-32",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_info.is-second",
                                    selectorGuids: ["8f045a61-ad13-0db7-360e-05b3ce74ecc7", "343c2928-3973-4021-ad4b-f06f96255f30"]
                                },
                                xValue: 5,
                                xUnit: "rem",
                                yUnit: "PX",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-36-n-34",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_info.is-second",
                                    selectorGuids: ["8f045a61-ad13-0db7-360e-05b3ce74ecc7", "343c2928-3973-4021-ad4b-f06f96255f30"]
                                },
                                value: 0,
                                unit: ""
                            }
                        }, {
                            id: "a-36-n-36",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_info.is-thirth",
                                    selectorGuids: ["8f045a61-ad13-0db7-360e-05b3ce74ecc7", "c268e9e8-40c8-7f18-c521-35027ca8ba37"]
                                },
                                xValue: 5,
                                xUnit: "rem",
                                yUnit: "PX",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-36-n-38",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_info.is-thirth",
                                    selectorGuids: ["8f045a61-ad13-0db7-360e-05b3ce74ecc7", "c268e9e8-40c8-7f18-c521-35027ca8ba37"]
                                },
                                value: 0,
                                unit: ""
                            }
                        }, {
                            id: "a-36-n-40",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_info.is-fourth",
                                    selectorGuids: ["8f045a61-ad13-0db7-360e-05b3ce74ecc7", "d2eed518-1219-b81c-42eb-2f483d294e7c"]
                                },
                                xValue: 5,
                                xUnit: "rem",
                                yUnit: "PX",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-36-n-42",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_info.is-fourth",
                                    selectorGuids: ["8f045a61-ad13-0db7-360e-05b3ce74ecc7", "d2eed518-1219-b81c-42eb-2f483d294e7c"]
                                },
                                value: 0,
                                unit: ""
                            }
                        }, {
                            id: "a-36-n-44",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-color-secondary.is-hero-bottom-text",
                                    selectorGuids: ["07815991-952a-8d98-0e00-e4c25af270fe", "704cd4b8-4b48-7882-c86b-343da98d312a"]
                                },
                                yValue: 5,
                                xUnit: "PX",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-36-n-46",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-color-secondary.is-hero-bottom-text",
                                    selectorGuids: ["07815991-952a-8d98-0e00-e4c25af270fe", "704cd4b8-4b48-7882-c86b-343da98d312a"]
                                },
                                value: 0,
                                unit: ""
                            }
                        }]
                    }, {
                        actionItems: [{
                            id: "a-36-n-17",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 100,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".heading-style-h1",
                                    selectorGuids: ["07815991-952a-8d98-0e00-e4c25af2710c"]
                                },
                                yValue: 0,
                                xUnit: "PX",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-36-n-19",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 100,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".heading-style-h1",
                                    selectorGuids: ["07815991-952a-8d98-0e00-e4c25af2710c"]
                                },
                                value: 1,
                                unit: ""
                            }
                        }, {
                            id: "a-36-n-21",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 200,
                                easing: "outQuart",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-color-secondary.is-hero-one-description",
                                    selectorGuids: ["07815991-952a-8d98-0e00-e4c25af270fe", "872babe3-96bb-b914-da8a-b07db9310ae9"]
                                },
                                yValue: 0,
                                xUnit: "PX",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-36-n-23",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 200,
                                easing: "outQuart",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-color-secondary.is-hero-one-description",
                                    selectorGuids: ["07815991-952a-8d98-0e00-e4c25af270fe", "872babe3-96bb-b914-da8a-b07db9310ae9"]
                                },
                                value: 1,
                                unit: ""
                            }
                        }, {
                            id: "a-36-n-25",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 300,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_button-wrapper",
                                    selectorGuids: ["50b90280-7acb-5e0d-8589-186e53498af2"]
                                },
                                yValue: 0,
                                xUnit: "PX",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-36-n-27",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 300,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_button-wrapper",
                                    selectorGuids: ["50b90280-7acb-5e0d-8589-186e53498af2"]
                                },
                                value: 1,
                                unit: ""
                            }
                        }, {
                            id: "a-36-n-29",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 400,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_info.is-first",
                                    selectorGuids: ["8f045a61-ad13-0db7-360e-05b3ce74ecc7", "ad2b6077-198a-0f60-fb6d-e4db3c4090a3"]
                                },
                                xValue: 0,
                                xUnit: "rem",
                                yUnit: "PX",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-36-n-31",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 400,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_info.is-first",
                                    selectorGuids: ["8f045a61-ad13-0db7-360e-05b3ce74ecc7", "ad2b6077-198a-0f60-fb6d-e4db3c4090a3"]
                                },
                                value: 1,
                                unit: ""
                            }
                        }, {
                            id: "a-36-n-33",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 500,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_info.is-second",
                                    selectorGuids: ["8f045a61-ad13-0db7-360e-05b3ce74ecc7", "343c2928-3973-4021-ad4b-f06f96255f30"]
                                },
                                xValue: 0,
                                xUnit: "rem",
                                yUnit: "PX",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-36-n-35",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 500,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_info.is-second",
                                    selectorGuids: ["8f045a61-ad13-0db7-360e-05b3ce74ecc7", "343c2928-3973-4021-ad4b-f06f96255f30"]
                                },
                                value: 1,
                                unit: ""
                            }
                        }, {
                            id: "a-36-n-45",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 500,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-color-secondary.is-hero-bottom-text",
                                    selectorGuids: ["07815991-952a-8d98-0e00-e4c25af270fe", "704cd4b8-4b48-7882-c86b-343da98d312a"]
                                },
                                yValue: 0,
                                xUnit: "PX",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-36-n-47",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 500,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-color-secondary.is-hero-bottom-text",
                                    selectorGuids: ["07815991-952a-8d98-0e00-e4c25af270fe", "704cd4b8-4b48-7882-c86b-343da98d312a"]
                                },
                                value: 1,
                                unit: ""
                            }
                        }, {
                            id: "a-36-n-37",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 600,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_info.is-thirth",
                                    selectorGuids: ["8f045a61-ad13-0db7-360e-05b3ce74ecc7", "c268e9e8-40c8-7f18-c521-35027ca8ba37"]
                                },
                                xValue: 0,
                                xUnit: "rem",
                                yUnit: "PX",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-36-n-39",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 600,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_info.is-thirth",
                                    selectorGuids: ["8f045a61-ad13-0db7-360e-05b3ce74ecc7", "c268e9e8-40c8-7f18-c521-35027ca8ba37"]
                                },
                                value: 1,
                                unit: ""
                            }
                        }, {
                            id: "a-36-n-41",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 700,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_info.is-fourth",
                                    selectorGuids: ["8f045a61-ad13-0db7-360e-05b3ce74ecc7", "d2eed518-1219-b81c-42eb-2f483d294e7c"]
                                },
                                xValue: 0,
                                xUnit: "rem",
                                yUnit: "PX",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-36-n-43",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 700,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_info.is-fourth",
                                    selectorGuids: ["8f045a61-ad13-0db7-360e-05b3ce74ecc7", "d2eed518-1219-b81c-42eb-2f483d294e7c"]
                                },
                                value: 1,
                                unit: ""
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !0,
                    createdOn: 0x196c6395ce9
                },
                "a-38": {
                    id: "a-38",
                    title: "Dashboard - image parallax",
                    continuousParameterGroups: [{
                        id: "a-38-p",
                        type: "SCROLL_PROGRESS",
                        parameterLabel: "Scroll",
                        continuousActionGroups: [{
                            keyframe: 0,
                            actionItems: [{
                                id: "a-38-n",
                                actionTypeId: "TRANSFORM_MOVE",
                                config: {
                                    delay: 0,
                                    easing: "",
                                    duration: 500,
                                    target: {
                                        useEventTarget: !0,
                                        id: "68221c5b4392811788febfb7|696f08e0-14a5-5001-08a2-809ad85b511a"
                                    },
                                    yValue: -10,
                                    xUnit: "PX",
                                    yUnit: "%",
                                    zUnit: "PX"
                                }
                            }]
                        }, {
                            keyframe: 100,
                            actionItems: [{
                                id: "a-38-n-2",
                                actionTypeId: "TRANSFORM_MOVE",
                                config: {
                                    delay: 0,
                                    easing: "",
                                    duration: 500,
                                    target: {
                                        useEventTarget: !0,
                                        id: "68221c5b4392811788febfb7|696f08e0-14a5-5001-08a2-809ad85b511a"
                                    },
                                    yValue: 10,
                                    xUnit: "PX",
                                    yUnit: "%",
                                    zUnit: "PX"
                                }
                            }]
                        }]
                    }],
                    createdOn: 0x196ca20dd4b
                },
                "a-39": {
                    id: "a-39",
                    title: "Features - scroll animation",
                    continuousParameterGroups: [{
                        id: "a-39-p",
                        type: "SCROLL_PROGRESS",
                        parameterLabel: "Scroll",
                        continuousActionGroups: [{
                            keyframe: 20,
                            actionItems: [{
                                id: "a-39-n",
                                actionTypeId: "TRANSFORM_MOVE",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".features_image-wrapper.is-one",
                                        selectorGuids: ["b8362909-d21d-8777-e631-3240977bd6bd", "47329e4b-6927-52d8-0641-74a64da2d59e"]
                                    },
                                    yValue: 0,
                                    xUnit: "PX",
                                    yUnit: "%",
                                    zUnit: "PX"
                                }
                            }, {
                                id: "a-39-n-4",
                                actionTypeId: "TRANSFORM_MOVE",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".features_image-wrapper.is-two",
                                        selectorGuids: ["b8362909-d21d-8777-e631-3240977bd6bd", "858a1ab3-68ab-34d6-4ff6-02d799b89287"]
                                    },
                                    yValue: 100,
                                    xUnit: "PX",
                                    yUnit: "%",
                                    zUnit: "PX"
                                }
                            }, {
                                id: "a-39-n-6",
                                actionTypeId: "STYLE_TEXT_COLOR",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".heading-style-h3.is-one",
                                        selectorGuids: ["07815991-952a-8d98-0e00-e4c25af27103", "7e485437-b8a3-a2bd-3188-fceb639349ae"]
                                    },
                                    globalSwatchId: "--text-color--text-primary",
                                    rValue: 19,
                                    bValue: 19,
                                    gValue: 19,
                                    aValue: 1
                                }
                            }, {
                                id: "a-39-n-8",
                                actionTypeId: "STYLE_TEXT_COLOR",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".heading-style-h3.is-two",
                                        selectorGuids: ["07815991-952a-8d98-0e00-e4c25af27103", "0ba0fce2-cbf4-ac73-0bb2-4cd187290486"]
                                    },
                                    globalSwatchId: "--text-color--text-tertiary",
                                    rValue: 175,
                                    bValue: 175,
                                    gValue: 175,
                                    aValue: 1
                                }
                            }]
                        }, {
                            keyframe: 25,
                            actionItems: [{
                                id: "a-39-n-3",
                                actionTypeId: "TRANSFORM_MOVE",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".features_image-wrapper.is-one",
                                        selectorGuids: ["b8362909-d21d-8777-e631-3240977bd6bd", "47329e4b-6927-52d8-0641-74a64da2d59e"]
                                    },
                                    yValue: -100,
                                    xUnit: "PX",
                                    yUnit: "%",
                                    zUnit: "PX"
                                }
                            }, {
                                id: "a-39-n-5",
                                actionTypeId: "TRANSFORM_MOVE",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".features_image-wrapper.is-two",
                                        selectorGuids: ["b8362909-d21d-8777-e631-3240977bd6bd", "858a1ab3-68ab-34d6-4ff6-02d799b89287"]
                                    },
                                    yValue: 0,
                                    xUnit: "PX",
                                    yUnit: "%",
                                    zUnit: "PX"
                                }
                            }, {
                                id: "a-39-n-7",
                                actionTypeId: "STYLE_TEXT_COLOR",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".heading-style-h3.is-one",
                                        selectorGuids: ["07815991-952a-8d98-0e00-e4c25af27103", "7e485437-b8a3-a2bd-3188-fceb639349ae"]
                                    },
                                    globalSwatchId: "--text-color--text-tertiary",
                                    rValue: 175,
                                    bValue: 175,
                                    gValue: 175,
                                    aValue: 1
                                }
                            }, {
                                id: "a-39-n-9",
                                actionTypeId: "STYLE_TEXT_COLOR",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".heading-style-h3.is-two",
                                        selectorGuids: ["07815991-952a-8d98-0e00-e4c25af27103", "0ba0fce2-cbf4-ac73-0bb2-4cd187290486"]
                                    },
                                    globalSwatchId: "--text-color--text-primary",
                                    rValue: 19,
                                    bValue: 19,
                                    gValue: 19,
                                    aValue: 1
                                }
                            }]
                        }, {
                            keyframe: 40,
                            actionItems: [{
                                id: "a-39-n-10",
                                actionTypeId: "TRANSFORM_MOVE",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".features_image-wrapper.is-two",
                                        selectorGuids: ["b8362909-d21d-8777-e631-3240977bd6bd", "858a1ab3-68ab-34d6-4ff6-02d799b89287"]
                                    },
                                    yValue: 0,
                                    xUnit: "PX",
                                    yUnit: "%",
                                    zUnit: "PX"
                                }
                            }, {
                                id: "a-39-n-12",
                                actionTypeId: "TRANSFORM_MOVE",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".features_image-wrapper.is-three",
                                        selectorGuids: ["b8362909-d21d-8777-e631-3240977bd6bd", "b35c9cba-7cb1-e1b8-813a-2525c7114a40"]
                                    },
                                    yValue: 100,
                                    xUnit: "PX",
                                    yUnit: "%",
                                    zUnit: "PX"
                                }
                            }, {
                                id: "a-39-n-14",
                                actionTypeId: "STYLE_TEXT_COLOR",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".heading-style-h3.is-two",
                                        selectorGuids: ["07815991-952a-8d98-0e00-e4c25af27103", "0ba0fce2-cbf4-ac73-0bb2-4cd187290486"]
                                    },
                                    globalSwatchId: "--text-color--text-primary",
                                    rValue: 19,
                                    bValue: 19,
                                    gValue: 19,
                                    aValue: 1
                                }
                            }, {
                                id: "a-39-n-16",
                                actionTypeId: "STYLE_TEXT_COLOR",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".heading-style-h3.is-three",
                                        selectorGuids: ["07815991-952a-8d98-0e00-e4c25af27103", "996689c4-279a-f96a-801c-9e467ce87e54"]
                                    },
                                    globalSwatchId: "--text-color--text-tertiary",
                                    rValue: 175,
                                    bValue: 175,
                                    gValue: 175,
                                    aValue: 1
                                }
                            }]
                        }, {
                            keyframe: 45,
                            actionItems: [{
                                id: "a-39-n-11",
                                actionTypeId: "TRANSFORM_MOVE",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".features_image-wrapper.is-two",
                                        selectorGuids: ["b8362909-d21d-8777-e631-3240977bd6bd", "858a1ab3-68ab-34d6-4ff6-02d799b89287"]
                                    },
                                    yValue: -100,
                                    xUnit: "PX",
                                    yUnit: "%",
                                    zUnit: "PX"
                                }
                            }, {
                                id: "a-39-n-13",
                                actionTypeId: "TRANSFORM_MOVE",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".features_image-wrapper.is-three",
                                        selectorGuids: ["b8362909-d21d-8777-e631-3240977bd6bd", "b35c9cba-7cb1-e1b8-813a-2525c7114a40"]
                                    },
                                    yValue: 0,
                                    xUnit: "PX",
                                    yUnit: "%",
                                    zUnit: "PX"
                                }
                            }, {
                                id: "a-39-n-15",
                                actionTypeId: "STYLE_TEXT_COLOR",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".heading-style-h3.is-two",
                                        selectorGuids: ["07815991-952a-8d98-0e00-e4c25af27103", "0ba0fce2-cbf4-ac73-0bb2-4cd187290486"]
                                    },
                                    globalSwatchId: "--text-color--text-tertiary",
                                    rValue: 175,
                                    bValue: 175,
                                    gValue: 175,
                                    aValue: 1
                                }
                            }, {
                                id: "a-39-n-17",
                                actionTypeId: "STYLE_TEXT_COLOR",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".heading-style-h3.is-three",
                                        selectorGuids: ["07815991-952a-8d98-0e00-e4c25af27103", "996689c4-279a-f96a-801c-9e467ce87e54"]
                                    },
                                    globalSwatchId: "--text-color--text-primary",
                                    rValue: 19,
                                    bValue: 19,
                                    gValue: 19,
                                    aValue: 1
                                }
                            }]
                        }, {
                            keyframe: 60,
                            actionItems: [{
                                id: "a-39-n-18",
                                actionTypeId: "TRANSFORM_MOVE",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".features_image-wrapper.is-four",
                                        selectorGuids: ["b8362909-d21d-8777-e631-3240977bd6bd", "237fe6fa-5560-e336-f3ba-d9d9e8ad6837"]
                                    },
                                    yValue: 100,
                                    xUnit: "PX",
                                    yUnit: "%",
                                    zUnit: "PX"
                                }
                            }, {
                                id: "a-39-n-20",
                                actionTypeId: "TRANSFORM_MOVE",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".features_image-wrapper.is-three",
                                        selectorGuids: ["b8362909-d21d-8777-e631-3240977bd6bd", "b35c9cba-7cb1-e1b8-813a-2525c7114a40"]
                                    },
                                    yValue: 0,
                                    xUnit: "PX",
                                    yUnit: "%",
                                    zUnit: "PX"
                                }
                            }, {
                                id: "a-39-n-22",
                                actionTypeId: "STYLE_TEXT_COLOR",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".heading-style-h3.is-three",
                                        selectorGuids: ["07815991-952a-8d98-0e00-e4c25af27103", "996689c4-279a-f96a-801c-9e467ce87e54"]
                                    },
                                    globalSwatchId: "--text-color--text-primary",
                                    rValue: 19,
                                    bValue: 19,
                                    gValue: 19,
                                    aValue: 1
                                }
                            }, {
                                id: "a-39-n-24",
                                actionTypeId: "STYLE_TEXT_COLOR",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".heading-style-h3.is-four",
                                        selectorGuids: ["07815991-952a-8d98-0e00-e4c25af27103", "8849cfc3-0ec8-3890-3dfa-688011b44253"]
                                    },
                                    globalSwatchId: "--text-color--text-tertiary",
                                    rValue: 175,
                                    bValue: 175,
                                    gValue: 175,
                                    aValue: 1
                                }
                            }]
                        }, {
                            keyframe: 65,
                            actionItems: [{
                                id: "a-39-n-19",
                                actionTypeId: "TRANSFORM_MOVE",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".features_image-wrapper.is-four",
                                        selectorGuids: ["b8362909-d21d-8777-e631-3240977bd6bd", "237fe6fa-5560-e336-f3ba-d9d9e8ad6837"]
                                    },
                                    yValue: 0,
                                    xUnit: "PX",
                                    yUnit: "%",
                                    zUnit: "PX"
                                }
                            }, {
                                id: "a-39-n-21",
                                actionTypeId: "TRANSFORM_MOVE",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".features_image-wrapper.is-three",
                                        selectorGuids: ["b8362909-d21d-8777-e631-3240977bd6bd", "b35c9cba-7cb1-e1b8-813a-2525c7114a40"]
                                    },
                                    yValue: -100,
                                    xUnit: "PX",
                                    yUnit: "%",
                                    zUnit: "PX"
                                }
                            }, {
                                id: "a-39-n-23",
                                actionTypeId: "STYLE_TEXT_COLOR",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".heading-style-h3.is-three",
                                        selectorGuids: ["07815991-952a-8d98-0e00-e4c25af27103", "996689c4-279a-f96a-801c-9e467ce87e54"]
                                    },
                                    globalSwatchId: "--text-color--text-tertiary",
                                    rValue: 175,
                                    bValue: 175,
                                    gValue: 175,
                                    aValue: 1
                                }
                            }, {
                                id: "a-39-n-25",
                                actionTypeId: "STYLE_TEXT_COLOR",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".heading-style-h3.is-four",
                                        selectorGuids: ["07815991-952a-8d98-0e00-e4c25af27103", "8849cfc3-0ec8-3890-3dfa-688011b44253"]
                                    },
                                    globalSwatchId: "--text-color--text-primary",
                                    rValue: 19,
                                    bValue: 19,
                                    gValue: 19,
                                    aValue: 1
                                }
                            }]
                        }]
                    }],
                    createdOn: 0x196ca89043d
                },
                "a-40": {
                    id: "a-40",
                    title: "Features one - content animation",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-40-n",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".features_image-content",
                                    selectorGuids: ["cafe3dd6-5c45-96ef-0196-d78d19a734ba"]
                                },
                                yValue: 15,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-40-n-3",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".features_image-content",
                                    selectorGuids: ["cafe3dd6-5c45-96ef-0196-d78d19a734ba"]
                                },
                                value: 0,
                                unit: ""
                            }
                        }, {
                            id: "a-40-n-5",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".features_section.is-first",
                                    selectorGuids: ["e4d538ca-d85f-ccfd-fd74-4230729088d5", "4a8d708c-0b3f-a9a1-c63e-b655fffa13af"]
                                },
                                yValue: 30,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-40-n-7",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".features_section.is-first",
                                    selectorGuids: ["e4d538ca-d85f-ccfd-fd74-4230729088d5", "4a8d708c-0b3f-a9a1-c63e-b655fffa13af"]
                                },
                                value: 0,
                                unit: ""
                            }
                        }, {
                            id: "a-40-n-9",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".features_section.is-second",
                                    selectorGuids: ["e4d538ca-d85f-ccfd-fd74-4230729088d5", "71edd187-ac0a-48b8-82cd-e435a1b287de"]
                                },
                                yValue: 30,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-40-n-11",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".features_section.is-second",
                                    selectorGuids: ["e4d538ca-d85f-ccfd-fd74-4230729088d5", "71edd187-ac0a-48b8-82cd-e435a1b287de"]
                                },
                                value: 0,
                                unit: ""
                            }
                        }, {
                            id: "a-40-n-13",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".features_section.is-third",
                                    selectorGuids: ["e4d538ca-d85f-ccfd-fd74-4230729088d5", "00c2b0db-4d29-6249-a42d-cfc26424cdd1"]
                                },
                                yValue: 30,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-40-n-15",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".features_section.is-third",
                                    selectorGuids: ["e4d538ca-d85f-ccfd-fd74-4230729088d5", "00c2b0db-4d29-6249-a42d-cfc26424cdd1"]
                                },
                                value: 0,
                                unit: ""
                            }
                        }, {
                            id: "a-40-n-17",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".features_section.is-fourth",
                                    selectorGuids: ["e4d538ca-d85f-ccfd-fd74-4230729088d5", "61a0a9b6-3be4-2183-452b-f0af6261c7bd"]
                                },
                                yValue: 30,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-40-n-19",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".features_section.is-fourth",
                                    selectorGuids: ["e4d538ca-d85f-ccfd-fd74-4230729088d5", "61a0a9b6-3be4-2183-452b-f0af6261c7bd"]
                                },
                                value: 0,
                                unit: ""
                            }
                        }]
                    }, {
                        actionItems: [{
                            id: "a-40-n-2",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 100,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".features_image-content",
                                    selectorGuids: ["cafe3dd6-5c45-96ef-0196-d78d19a734ba"]
                                },
                                yValue: 0,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-40-n-4",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 100,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".features_image-content",
                                    selectorGuids: ["cafe3dd6-5c45-96ef-0196-d78d19a734ba"]
                                },
                                value: 1,
                                unit: ""
                            }
                        }, {
                            id: "a-40-n-6",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 300,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".features_section.is-first",
                                    selectorGuids: ["e4d538ca-d85f-ccfd-fd74-4230729088d5", "4a8d708c-0b3f-a9a1-c63e-b655fffa13af"]
                                },
                                yValue: 0,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-40-n-8",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 300,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".features_section.is-first",
                                    selectorGuids: ["e4d538ca-d85f-ccfd-fd74-4230729088d5", "4a8d708c-0b3f-a9a1-c63e-b655fffa13af"]
                                },
                                value: 1,
                                unit: ""
                            }
                        }, {
                            id: "a-40-n-10",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 400,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".features_section.is-second",
                                    selectorGuids: ["e4d538ca-d85f-ccfd-fd74-4230729088d5", "71edd187-ac0a-48b8-82cd-e435a1b287de"]
                                },
                                yValue: 0,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-40-n-12",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 400,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".features_section.is-second",
                                    selectorGuids: ["e4d538ca-d85f-ccfd-fd74-4230729088d5", "71edd187-ac0a-48b8-82cd-e435a1b287de"]
                                },
                                value: 1,
                                unit: ""
                            }
                        }, {
                            id: "a-40-n-14",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 500,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".features_section.is-third",
                                    selectorGuids: ["e4d538ca-d85f-ccfd-fd74-4230729088d5", "00c2b0db-4d29-6249-a42d-cfc26424cdd1"]
                                },
                                yValue: 0,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-40-n-16",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 500,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".features_section.is-third",
                                    selectorGuids: ["e4d538ca-d85f-ccfd-fd74-4230729088d5", "00c2b0db-4d29-6249-a42d-cfc26424cdd1"]
                                },
                                value: 1,
                                unit: ""
                            }
                        }, {
                            id: "a-40-n-18",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 600,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".features_section.is-fourth",
                                    selectorGuids: ["e4d538ca-d85f-ccfd-fd74-4230729088d5", "61a0a9b6-3be4-2183-452b-f0af6261c7bd"]
                                },
                                yValue: 0,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-40-n-20",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 600,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".features_section.is-fourth",
                                    selectorGuids: ["e4d538ca-d85f-ccfd-fd74-4230729088d5", "61a0a9b6-3be4-2183-452b-f0af6261c7bd"]
                                },
                                value: 1,
                                unit: ""
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !0,
                    createdOn: 0x196cf831a12
                },
                "a-41": {
                    id: "a-41",
                    title: "Testimonials - slide in view",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-41-n",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-3xl.is-testimonials",
                                    selectorGuids: ["b4fa64cc-e0cc-7288-8768-23429000acad", "e4c125cc-138e-b669-9cc1-b53cbe1390dd"]
                                },
                                xValue: 3,
                                yValue: null,
                                xUnit: "rem",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-41-n-3",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-3xl.is-testimonials",
                                    selectorGuids: ["b4fa64cc-e0cc-7288-8768-23429000acad", "e4c125cc-138e-b669-9cc1-b53cbe1390dd"]
                                },
                                value: 0,
                                unit: ""
                            }
                        }, {
                            id: "a-41-n-5",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".testimonials_card-user",
                                    selectorGuids: ["08935a53-59a2-8d69-1640-623fd34cf8f9"]
                                },
                                xValue: 3,
                                yValue: null,
                                xUnit: "rem",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-41-n-7",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".testimonials_card-user",
                                    selectorGuids: ["08935a53-59a2-8d69-1640-623fd34cf8f9"]
                                },
                                value: 0,
                                unit: ""
                            }
                        }, {
                            id: "a-41-n-9",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-2xl",
                                    selectorGuids: ["e92a3128-c6bb-c707-be38-49bd7696b679"]
                                },
                                xValue: 3,
                                yValue: null,
                                xUnit: "rem",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-41-n-11",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-2xl",
                                    selectorGuids: ["e92a3128-c6bb-c707-be38-49bd7696b679"]
                                },
                                value: 0,
                                unit: ""
                            }
                        }, {
                            id: "a-41-n-13",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-color-secondary",
                                    selectorGuids: ["07815991-952a-8d98-0e00-e4c25af270fe"]
                                },
                                xValue: 3,
                                yValue: null,
                                xUnit: "rem",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-41-n-15",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-color-secondary",
                                    selectorGuids: ["07815991-952a-8d98-0e00-e4c25af270fe"]
                                },
                                value: 0,
                                unit: ""
                            }
                        }]
                    }, {
                        actionItems: [{
                            id: "a-41-n-2",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 100,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-3xl.is-testimonials",
                                    selectorGuids: ["b4fa64cc-e0cc-7288-8768-23429000acad", "e4c125cc-138e-b669-9cc1-b53cbe1390dd"]
                                },
                                xValue: 0,
                                yValue: null,
                                xUnit: "rem",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-41-n-4",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 100,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-3xl.is-testimonials",
                                    selectorGuids: ["b4fa64cc-e0cc-7288-8768-23429000acad", "e4c125cc-138e-b669-9cc1-b53cbe1390dd"]
                                },
                                value: 1,
                                unit: ""
                            }
                        }, {
                            id: "a-41-n-6",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 200,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".testimonials_card-user",
                                    selectorGuids: ["08935a53-59a2-8d69-1640-623fd34cf8f9"]
                                },
                                xValue: 0,
                                yValue: null,
                                xUnit: "rem",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-41-n-8",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 200,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".testimonials_card-user",
                                    selectorGuids: ["08935a53-59a2-8d69-1640-623fd34cf8f9"]
                                },
                                value: 1,
                                unit: ""
                            }
                        }, {
                            id: "a-41-n-10",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 300,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-2xl",
                                    selectorGuids: ["e92a3128-c6bb-c707-be38-49bd7696b679"]
                                },
                                xValue: 0,
                                yValue: null,
                                xUnit: "rem",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-41-n-12",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 300,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-2xl",
                                    selectorGuids: ["e92a3128-c6bb-c707-be38-49bd7696b679"]
                                },
                                value: 1,
                                unit: ""
                            }
                        }, {
                            id: "a-41-n-14",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 400,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-color-secondary",
                                    selectorGuids: ["07815991-952a-8d98-0e00-e4c25af270fe"]
                                },
                                xValue: 0,
                                yValue: null,
                                xUnit: "rem",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-41-n-16",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 400,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-color-secondary",
                                    selectorGuids: ["07815991-952a-8d98-0e00-e4c25af270fe"]
                                },
                                value: 1,
                                unit: ""
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !0,
                    createdOn: 0x196cfe73c7e
                },
                "a-42": {
                    id: "a-42",
                    title: "Testimonials - slide out of view",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-42-n-9",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "outQuart",
                                duration: 300,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-3xl.is-testimonials",
                                    selectorGuids: ["b4fa64cc-e0cc-7288-8768-23429000acad", "e4c125cc-138e-b669-9cc1-b53cbe1390dd"]
                                },
                                xValue: 0,
                                yValue: null,
                                xUnit: "rem",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-42-n-10",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "outQuart",
                                duration: 300,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-3xl.is-testimonials",
                                    selectorGuids: ["b4fa64cc-e0cc-7288-8768-23429000acad", "e4c125cc-138e-b669-9cc1-b53cbe1390dd"]
                                },
                                value: 0,
                                unit: ""
                            }
                        }, {
                            id: "a-42-n-11",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "outQuart",
                                duration: 300,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".testimonials_card-user",
                                    selectorGuids: ["08935a53-59a2-8d69-1640-623fd34cf8f9"]
                                },
                                xValue: 0,
                                yValue: null,
                                xUnit: "rem",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-42-n-12",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "outQuart",
                                duration: 300,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".testimonials_card-user",
                                    selectorGuids: ["08935a53-59a2-8d69-1640-623fd34cf8f9"]
                                },
                                value: 0,
                                unit: ""
                            }
                        }, {
                            id: "a-42-n-13",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "outQuart",
                                duration: 300,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-2xl",
                                    selectorGuids: ["e92a3128-c6bb-c707-be38-49bd7696b679"]
                                },
                                xValue: 0,
                                yValue: null,
                                xUnit: "rem",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-42-n-14",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "outQuart",
                                duration: 300,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-2xl",
                                    selectorGuids: ["e92a3128-c6bb-c707-be38-49bd7696b679"]
                                },
                                value: 0,
                                unit: ""
                            }
                        }, {
                            id: "a-42-n-15",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "outQuart",
                                duration: 300,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-color-secondary",
                                    selectorGuids: ["07815991-952a-8d98-0e00-e4c25af270fe"]
                                },
                                xValue: 0,
                                yValue: null,
                                xUnit: "rem",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-42-n-16",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "outQuart",
                                duration: 300,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-color-secondary",
                                    selectorGuids: ["07815991-952a-8d98-0e00-e4c25af270fe"]
                                },
                                value: 0,
                                unit: ""
                            }
                        }]
                    }, {
                        actionItems: [{
                            id: "a-42-n",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 0,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-3xl.is-testimonials",
                                    selectorGuids: ["b4fa64cc-e0cc-7288-8768-23429000acad", "e4c125cc-138e-b669-9cc1-b53cbe1390dd"]
                                },
                                xValue: 3,
                                yValue: null,
                                xUnit: "rem",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-42-n-3",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 0,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".testimonials_card-user",
                                    selectorGuids: ["08935a53-59a2-8d69-1640-623fd34cf8f9"]
                                },
                                xValue: 3,
                                yValue: null,
                                xUnit: "rem",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-42-n-5",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 0,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-2xl",
                                    selectorGuids: ["e92a3128-c6bb-c707-be38-49bd7696b679"]
                                },
                                xValue: 3,
                                yValue: null,
                                xUnit: "rem",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-42-n-7",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 0,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-color-secondary",
                                    selectorGuids: ["07815991-952a-8d98-0e00-e4c25af270fe"]
                                },
                                xValue: 3,
                                yValue: null,
                                xUnit: "rem",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !1,
                    createdOn: 0x196cfe73c7e
                },
                "a-46": {
                    id: "a-46",
                    title: "Link - hover on",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-46-n",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".link-underline",
                                    selectorGuids: ["2480c2f7-0521-80b7-68be-9dbfa486d119"]
                                },
                                xValue: -110,
                                xUnit: "%",
                                yUnit: "PX",
                                zUnit: "PX"
                            }
                        }]
                    }, {
                        actionItems: [{
                            id: "a-46-n-2",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: [.637, .24, .152, 1.439],
                                duration: 300,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".link-underline",
                                    selectorGuids: ["2480c2f7-0521-80b7-68be-9dbfa486d119"]
                                },
                                xValue: 0,
                                xUnit: "%",
                                yUnit: "PX",
                                zUnit: "PX"
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !0,
                    createdOn: 0x1934f63965e
                },
                "a-47": {
                    id: "a-47",
                    title: "Link - hover off",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-47-n",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "outQuad",
                                duration: 300,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".link-underline",
                                    selectorGuids: ["2480c2f7-0521-80b7-68be-9dbfa486d119"]
                                },
                                xValue: -110,
                                xUnit: "%",
                                yUnit: "PX",
                                zUnit: "PX"
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !1,
                    createdOn: 0x1934f63965e
                },
                "a-48": {
                    id: "a-48",
                    title: "View - 0.4s",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-48-n",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: !0,
                                    id: "66aaa6f9df23317315a19aa3|593fb161-df47-08f4-613c-8f442471082a"
                                },
                                value: 0,
                                unit: ""
                            }
                        }, {
                            id: "a-48-n-2",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: !0,
                                    id: "66aaa6f9df23317315a19aa3|593fb161-df47-08f4-613c-8f442471082a"
                                },
                                yValue: 15,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }]
                    }, {
                        actionItems: [{
                            id: "a-48-n-3",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 400,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: !0,
                                    id: "66aaa6f9df23317315a19aa3|593fb161-df47-08f4-613c-8f442471082a"
                                },
                                value: 1,
                                unit: ""
                            }
                        }, {
                            id: "a-48-n-4",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 400,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: !0,
                                    id: "66aaa6f9df23317315a19aa3|593fb161-df47-08f4-613c-8f442471082a"
                                },
                                yValue: 0,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !0,
                    createdOn: 0x191450a9e51
                },
                "a-49": {
                    id: "a-49",
                    title: "Hero one - image animation",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-49-n",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_img",
                                    selectorGuids: ["c44c32b8-998a-4528-5113-8504815554cf"]
                                },
                                yValue: -100,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-49-n-3",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_img-content",
                                    selectorGuids: ["b24aa439-af68-4866-6f24-bdb7d1a26021"]
                                },
                                yValue: 100,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-49-n-5",
                            actionTypeId: "TRANSFORM_SCALE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".img.is-hero-one",
                                    selectorGuids: ["5ff94027-8af6-6617-36aa-4d39c03dede5", "78f3a29c-abeb-ec4a-242e-e7737032b044"]
                                },
                                xValue: 1.5,
                                yValue: 1.5,
                                locked: !0
                            }
                        }, {
                            id: "a-49-n-7",
                            actionTypeId: "STYLE_FILTER",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".img.is-hero-one",
                                    selectorGuids: ["5ff94027-8af6-6617-36aa-4d39c03dede5", "78f3a29c-abeb-ec4a-242e-e7737032b044"]
                                },
                                filters: [{
                                    type: "blur",
                                    filterId: "efb3",
                                    value: 10,
                                    unit: "px"
                                }]
                            }
                        }, {
                            id: "a-49-n-9",
                            actionTypeId: "TRANSFORM_SCALE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_balance",
                                    selectorGuids: ["0e9afc01-53cb-d215-7de3-e606d53cc2b6"]
                                },
                                xValue: 0,
                                yValue: 0,
                                locked: !0
                            }
                        }]
                    }, {
                        actionItems: [{
                            id: "a-49-n-2",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 100,
                                easing: "outQuart",
                                duration: 1200,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_img",
                                    selectorGuids: ["c44c32b8-998a-4528-5113-8504815554cf"]
                                },
                                yValue: 0,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-49-n-4",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 100,
                                easing: "outQuart",
                                duration: 1200,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_img-content",
                                    selectorGuids: ["b24aa439-af68-4866-6f24-bdb7d1a26021"]
                                },
                                yValue: 0,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-49-n-6",
                            actionTypeId: "TRANSFORM_SCALE",
                            config: {
                                delay: 100,
                                easing: "outQuart",
                                duration: 1200,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".img.is-hero-one",
                                    selectorGuids: ["5ff94027-8af6-6617-36aa-4d39c03dede5", "78f3a29c-abeb-ec4a-242e-e7737032b044"]
                                },
                                xValue: 1,
                                yValue: 1,
                                locked: !0
                            }
                        }, {
                            id: "a-49-n-8",
                            actionTypeId: "STYLE_FILTER",
                            config: {
                                delay: 100,
                                easing: "outQuart",
                                duration: 1200,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".img.is-hero-one",
                                    selectorGuids: ["5ff94027-8af6-6617-36aa-4d39c03dede5", "78f3a29c-abeb-ec4a-242e-e7737032b044"]
                                },
                                filters: [{
                                    type: "blur",
                                    filterId: "5338",
                                    value: 0,
                                    unit: "px"
                                }]
                            }
                        }, {
                            id: "a-49-n-10",
                            actionTypeId: "TRANSFORM_SCALE",
                            config: {
                                delay: 500,
                                easing: "outQuart",
                                duration: 1e3,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_balance",
                                    selectorGuids: ["0e9afc01-53cb-d215-7de3-e606d53cc2b6"]
                                },
                                xValue: 1,
                                yValue: 1,
                                locked: !0
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !0,
                    createdOn: 0x196d0d3539a
                },
                "a-51": {
                    id: "a-51",
                    title: "Hero two - image animation",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-51-n",
                            actionTypeId: "STYLE_SIZE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".img-wrapper.is-hero-two",
                                    selectorGuids: ["fd717e99-57c3-a924-7e30-2470b6422a82", "f8d6a66c-867e-0b8e-567c-4a6e523253f4"]
                                },
                                widthValue: 100,
                                heightValue: 0,
                                widthUnit: "%",
                                heightUnit: "px",
                                locked: !1
                            }
                        }, {
                            id: "a-51-n-3",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_balance.is-two",
                                    selectorGuids: ["0e9afc01-53cb-d215-7de3-e606d53cc2b6", "21ad9ee8-d787-8bc5-e0bd-632e0b3c083f"]
                                },
                                xValue: 120,
                                yValue: null,
                                xUnit: "%",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }]
                    }, {
                        actionItems: [{
                            id: "a-51-n-2",
                            actionTypeId: "STYLE_SIZE",
                            config: {
                                delay: 300,
                                easing: "outQuart",
                                duration: 1200,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".img-wrapper.is-hero-two",
                                    selectorGuids: ["fd717e99-57c3-a924-7e30-2470b6422a82", "f8d6a66c-867e-0b8e-567c-4a6e523253f4"]
                                },
                                widthValue: 100,
                                widthUnit: "%",
                                heightUnit: "AUTO",
                                locked: !1
                            }
                        }]
                    }, {
                        actionItems: [{
                            id: "a-51-n-4",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "outBack",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_balance.is-two",
                                    selectorGuids: ["0e9afc01-53cb-d215-7de3-e606d53cc2b6", "21ad9ee8-d787-8bc5-e0bd-632e0b3c083f"]
                                },
                                xValue: 0,
                                yValue: null,
                                xUnit: "%",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !0,
                    createdOn: 0x196d0f9c28d
                },
                "a-50": {
                    id: "a-50",
                    title: "Hero two - content animation",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-50-n",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".heading-style-h1",
                                    selectorGuids: ["07815991-952a-8d98-0e00-e4c25af2710c"]
                                },
                                yValue: 3,
                                xUnit: "PX",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-50-n-3",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".heading-style-h1",
                                    selectorGuids: ["07815991-952a-8d98-0e00-e4c25af2710c"]
                                },
                                value: 0,
                                unit: ""
                            }
                        }, {
                            id: "a-50-n-5",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-color-secondary",
                                    selectorGuids: ["07815991-952a-8d98-0e00-e4c25af270fe"]
                                },
                                yValue: 3,
                                xUnit: "PX",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-50-n-7",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-color-secondary",
                                    selectorGuids: ["07815991-952a-8d98-0e00-e4c25af270fe"]
                                },
                                value: 0,
                                unit: ""
                            }
                        }, {
                            id: "a-50-n-9",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_info.is-first",
                                    selectorGuids: ["8f045a61-ad13-0db7-360e-05b3ce74ecc7", "ad2b6077-198a-0f60-fb6d-e4db3c4090a3"]
                                },
                                xValue: 3,
                                xUnit: "rem",
                                yUnit: "PX",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-50-n-11",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_info.is-first",
                                    selectorGuids: ["8f045a61-ad13-0db7-360e-05b3ce74ecc7", "ad2b6077-198a-0f60-fb6d-e4db3c4090a3"]
                                },
                                value: 0,
                                unit: ""
                            }
                        }, {
                            id: "a-50-n-13",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_info.is-second",
                                    selectorGuids: ["8f045a61-ad13-0db7-360e-05b3ce74ecc7", "343c2928-3973-4021-ad4b-f06f96255f30"]
                                },
                                xValue: 3,
                                xUnit: "rem",
                                yUnit: "PX",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-50-n-15",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_info.is-second",
                                    selectorGuids: ["8f045a61-ad13-0db7-360e-05b3ce74ecc7", "343c2928-3973-4021-ad4b-f06f96255f30"]
                                },
                                value: 0,
                                unit: ""
                            }
                        }, {
                            id: "a-50-n-17",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_info.is-thirth",
                                    selectorGuids: ["8f045a61-ad13-0db7-360e-05b3ce74ecc7", "c268e9e8-40c8-7f18-c521-35027ca8ba37"]
                                },
                                xValue: 3,
                                xUnit: "rem",
                                yUnit: "PX",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-50-n-19",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_info.is-thirth",
                                    selectorGuids: ["8f045a61-ad13-0db7-360e-05b3ce74ecc7", "c268e9e8-40c8-7f18-c521-35027ca8ba37"]
                                },
                                value: 0,
                                unit: ""
                            }
                        }, {
                            id: "a-50-n-21",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_info.is-fourth",
                                    selectorGuids: ["8f045a61-ad13-0db7-360e-05b3ce74ecc7", "d2eed518-1219-b81c-42eb-2f483d294e7c"]
                                },
                                xValue: 3,
                                xUnit: "rem",
                                yUnit: "PX",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-50-n-23",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_info.is-fourth",
                                    selectorGuids: ["8f045a61-ad13-0db7-360e-05b3ce74ecc7", "d2eed518-1219-b81c-42eb-2f483d294e7c"]
                                },
                                value: 0,
                                unit: ""
                            }
                        }, {
                            id: "a-50-n-25",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero-two_button-wrapper",
                                    selectorGuids: ["5bd201c0-719d-8a35-5174-3ce58b7d9bea"]
                                },
                                yValue: 3,
                                xUnit: "PX",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-50-n-27",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero-two_button-wrapper",
                                    selectorGuids: ["5bd201c0-719d-8a35-5174-3ce58b7d9bea"]
                                },
                                value: 0,
                                unit: ""
                            }
                        }]
                    }, {
                        actionItems: [{
                            id: "a-50-n-2",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 100,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".heading-style-h1",
                                    selectorGuids: ["07815991-952a-8d98-0e00-e4c25af2710c"]
                                },
                                yValue: 0,
                                xUnit: "PX",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-50-n-4",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 100,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".heading-style-h1",
                                    selectorGuids: ["07815991-952a-8d98-0e00-e4c25af2710c"]
                                },
                                value: 1,
                                unit: ""
                            }
                        }, {
                            id: "a-50-n-8",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 200,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-color-secondary",
                                    selectorGuids: ["07815991-952a-8d98-0e00-e4c25af270fe"]
                                },
                                value: 1,
                                unit: ""
                            }
                        }, {
                            id: "a-50-n-6",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 200,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-color-secondary",
                                    selectorGuids: ["07815991-952a-8d98-0e00-e4c25af270fe"]
                                },
                                yValue: 0,
                                xUnit: "PX",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-50-n-10",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 300,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_info.is-first",
                                    selectorGuids: ["8f045a61-ad13-0db7-360e-05b3ce74ecc7", "ad2b6077-198a-0f60-fb6d-e4db3c4090a3"]
                                },
                                xValue: 0,
                                xUnit: "rem",
                                yUnit: "PX",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-50-n-12",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 300,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_info.is-first",
                                    selectorGuids: ["8f045a61-ad13-0db7-360e-05b3ce74ecc7", "ad2b6077-198a-0f60-fb6d-e4db3c4090a3"]
                                },
                                value: 1,
                                unit: ""
                            }
                        }, {
                            id: "a-50-n-26",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 300,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero-two_button-wrapper",
                                    selectorGuids: ["5bd201c0-719d-8a35-5174-3ce58b7d9bea"]
                                },
                                yValue: 0,
                                xUnit: "PX",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-50-n-28",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 300,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero-two_button-wrapper",
                                    selectorGuids: ["5bd201c0-719d-8a35-5174-3ce58b7d9bea"]
                                },
                                value: 1,
                                unit: ""
                            }
                        }, {
                            id: "a-50-n-14",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 400,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_info.is-second",
                                    selectorGuids: ["8f045a61-ad13-0db7-360e-05b3ce74ecc7", "343c2928-3973-4021-ad4b-f06f96255f30"]
                                },
                                xValue: 0,
                                xUnit: "rem",
                                yUnit: "PX",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-50-n-16",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 400,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_info.is-second",
                                    selectorGuids: ["8f045a61-ad13-0db7-360e-05b3ce74ecc7", "343c2928-3973-4021-ad4b-f06f96255f30"]
                                },
                                value: 1,
                                unit: ""
                            }
                        }, {
                            id: "a-50-n-18",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 500,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_info.is-thirth",
                                    selectorGuids: ["8f045a61-ad13-0db7-360e-05b3ce74ecc7", "c268e9e8-40c8-7f18-c521-35027ca8ba37"]
                                },
                                xValue: 0,
                                xUnit: "rem",
                                yUnit: "PX",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-50-n-20",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 500,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_info.is-thirth",
                                    selectorGuids: ["8f045a61-ad13-0db7-360e-05b3ce74ecc7", "c268e9e8-40c8-7f18-c521-35027ca8ba37"]
                                },
                                value: 1,
                                unit: ""
                            }
                        }, {
                            id: "a-50-n-22",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 600,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_info.is-fourth",
                                    selectorGuids: ["8f045a61-ad13-0db7-360e-05b3ce74ecc7", "d2eed518-1219-b81c-42eb-2f483d294e7c"]
                                },
                                xValue: 0,
                                xUnit: "rem",
                                yUnit: "PX",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-50-n-24",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 600,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero_info.is-fourth",
                                    selectorGuids: ["8f045a61-ad13-0db7-360e-05b3ce74ecc7", "d2eed518-1219-b81c-42eb-2f483d294e7c"]
                                },
                                value: 1,
                                unit: ""
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !0,
                    createdOn: 0x196d0f9c28d
                },
                "a-52": {
                    id: "a-52",
                    title: "Blogs - card hover on",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-52-n",
                            actionTypeId: "TRANSFORM_SCALE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".img",
                                    selectorGuids: ["5ff94027-8af6-6617-36aa-4d39c03dede5"]
                                },
                                xValue: 1,
                                yValue: 1,
                                locked: !0
                            }
                        }, {
                            id: "a-52-n-3",
                            actionTypeId: "STYLE_BACKGROUND_COLOR",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".blogs_card-category",
                                    selectorGuids: ["5f6432e1-ba97-998f-a98d-8d7ab139ae8d"]
                                },
                                globalSwatchId: "--brand--gray-light",
                                rValue: 215,
                                bValue: 215,
                                gValue: 215,
                                aValue: 1
                            }
                        }]
                    }, {
                        actionItems: [{
                            id: "a-52-n-2",
                            actionTypeId: "TRANSFORM_SCALE",
                            config: {
                                delay: 0,
                                easing: "outQuad",
                                duration: 300,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".img",
                                    selectorGuids: ["5ff94027-8af6-6617-36aa-4d39c03dede5"]
                                },
                                xValue: 1.1,
                                yValue: 1.1,
                                locked: !0
                            }
                        }, {
                            id: "a-52-n-4",
                            actionTypeId: "STYLE_BACKGROUND_COLOR",
                            config: {
                                delay: 0,
                                easing: "outQuad",
                                duration: 300,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".blogs_card-category",
                                    selectorGuids: ["5f6432e1-ba97-998f-a98d-8d7ab139ae8d"]
                                },
                                globalSwatchId: "--brand--secondary-light",
                                rValue: 95,
                                bValue: 255,
                                gValue: 88,
                                aValue: .3
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !0,
                    createdOn: 0x196d59d1896
                },
                "a-53": {
                    id: "a-53",
                    title: "Blogs - card hover off",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-53-n",
                            actionTypeId: "TRANSFORM_SCALE",
                            config: {
                                delay: 0,
                                easing: "outQuad",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".img",
                                    selectorGuids: ["5ff94027-8af6-6617-36aa-4d39c03dede5"]
                                },
                                xValue: 1,
                                yValue: 1,
                                locked: !0
                            }
                        }, {
                            id: "a-53-n-2",
                            actionTypeId: "STYLE_BACKGROUND_COLOR",
                            config: {
                                delay: 0,
                                easing: "outQuad",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".blogs_card-category",
                                    selectorGuids: ["5f6432e1-ba97-998f-a98d-8d7ab139ae8d"]
                                },
                                globalSwatchId: "--brand--gray-light",
                                rValue: 215,
                                bValue: 215,
                                gValue: 215,
                                aValue: 1
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !1,
                    createdOn: 0x196d59d1896
                },
                "a-54": {
                    id: "a-54",
                    title: "Hero three - images animation",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-54-n",
                            actionTypeId: "STYLE_SIZE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".img-wrapper",
                                    selectorGuids: ["fd717e99-57c3-a924-7e30-2470b6422a82"]
                                },
                                heightValue: 0,
                                widthUnit: "PX",
                                heightUnit: "px",
                                locked: !1
                            }
                        }, {
                            id: "a-54-n-3",
                            actionTypeId: "TRANSFORM_ROTATE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero-three_balance-wrapper",
                                    selectorGuids: ["e5c5959e-88a3-f91b-9609-146d82642502"]
                                },
                                yValue: 90,
                                xUnit: "DEG",
                                yUnit: "deg",
                                zUnit: "DEG"
                            }
                        }, {
                            id: "a-54-n-5",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero-three_balance-wrapper",
                                    selectorGuids: ["e5c5959e-88a3-f91b-9609-146d82642502"]
                                },
                                value: 0,
                                unit: ""
                            }
                        }]
                    }, {
                        actionItems: [{
                            id: "a-54-n-2",
                            actionTypeId: "STYLE_SIZE",
                            config: {
                                delay: 100,
                                easing: "outQuart",
                                duration: 1e3,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".img-wrapper",
                                    selectorGuids: ["fd717e99-57c3-a924-7e30-2470b6422a82"]
                                },
                                widthUnit: "PX",
                                heightUnit: "AUTO",
                                locked: !1
                            }
                        }, {
                            id: "a-54-n-4",
                            actionTypeId: "TRANSFORM_ROTATE",
                            config: {
                                delay: 800,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero-three_balance-wrapper",
                                    selectorGuids: ["e5c5959e-88a3-f91b-9609-146d82642502"]
                                },
                                yValue: 0,
                                xUnit: "DEG",
                                yUnit: "deg",
                                zUnit: "DEG"
                            }
                        }, {
                            id: "a-54-n-6",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 800,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".hero-three_balance-wrapper",
                                    selectorGuids: ["e5c5959e-88a3-f91b-9609-146d82642502"]
                                },
                                value: 1,
                                unit: ""
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !0,
                    createdOn: 0x196d0f9c28d
                },
                "a-37": {
                    id: "a-37",
                    title: "Image - grow horizontal",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-37-n",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".img-wrapper",
                                    selectorGuids: ["fd717e99-57c3-a924-7e30-2470b6422a82"]
                                },
                                xValue: null,
                                yValue: -100,
                                xUnit: "%",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-37-n-3",
                            actionTypeId: "STYLE_SIZE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: !0,
                                    id: "68221c5b4392811788febfb7|0a73b730-d46b-ee36-7288-2709c2168087"
                                },
                                widthValue: 0,
                                heightValue: 100,
                                widthUnit: "%",
                                heightUnit: "%",
                                locked: !1
                            }
                        }]
                    }, {
                        actionItems: [{
                            id: "a-37-n-2",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 200,
                                easing: "outQuart",
                                duration: 1e3,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".img-wrapper",
                                    selectorGuids: ["fd717e99-57c3-a924-7e30-2470b6422a82"]
                                },
                                xValue: null,
                                yValue: 0,
                                xUnit: "%",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-37-n-4",
                            actionTypeId: "STYLE_SIZE",
                            config: {
                                delay: 200,
                                easing: "outQuart",
                                duration: 1e3,
                                target: {
                                    useEventTarget: !0,
                                    id: "68221c5b4392811788febfb7|0a73b730-d46b-ee36-7288-2709c2168087"
                                },
                                widthValue: 100,
                                heightValue: 100,
                                widthUnit: "%",
                                heightUnit: "%",
                                locked: !1
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !0,
                    createdOn: 0x196c68fbdef
                },
                "a-55": {
                    id: "a-55",
                    title: "Features hero - image animation",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-55-n-2",
                            actionTypeId: "STYLE_SIZE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: !0,
                                    id: "68275be9e04e285df4a099a7|0a6bd0dd-8de3-e83d-fdaa-1662c2558c26"
                                },
                                widthValue: 0,
                                widthUnit: "px",
                                heightUnit: "px",
                                locked: !1
                            }
                        }, {
                            id: "a-55-n-4",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".img-wrapper",
                                    selectorGuids: ["fd717e99-57c3-a924-7e30-2470b6422a82"]
                                },
                                yValue: -100,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-55-n",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".features-hero_tag",
                                    selectorGuids: ["5a77049c-638b-f3ad-f981-fce44e6a8843"]
                                },
                                value: 0,
                                unit: ""
                            }
                        }, {
                            id: "a-55-n-7",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".features-hero_tag",
                                    selectorGuids: ["5a77049c-638b-f3ad-f981-fce44e6a8843"]
                                },
                                xValue: 120,
                                xUnit: "%",
                                yUnit: "PX",
                                zUnit: "PX"
                            }
                        }]
                    }, {
                        actionItems: [{
                            id: "a-55-n-3",
                            actionTypeId: "STYLE_SIZE",
                            config: {
                                delay: 100,
                                easing: "outQuart",
                                duration: 1e3,
                                target: {
                                    useEventTarget: !0,
                                    id: "68275be9e04e285df4a099a7|0a6bd0dd-8de3-e83d-fdaa-1662c2558c26"
                                },
                                widthUnit: "AUTO",
                                heightUnit: "px",
                                locked: !1
                            }
                        }, {
                            id: "a-55-n-5",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 100,
                                easing: "outQuart",
                                duration: 1e3,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".img-wrapper",
                                    selectorGuids: ["fd717e99-57c3-a924-7e30-2470b6422a82"]
                                },
                                yValue: 0,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-55-n-8",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 800,
                                easing: "outBack",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".features-hero_tag",
                                    selectorGuids: ["5a77049c-638b-f3ad-f981-fce44e6a8843"]
                                },
                                xValue: 0,
                                xUnit: "%",
                                yUnit: "PX",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-55-n-6",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 800,
                                easing: "outBack",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".features-hero_tag",
                                    selectorGuids: ["5a77049c-638b-f3ad-f981-fce44e6a8843"]
                                },
                                value: 1,
                                unit: ""
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !0,
                    createdOn: 0x196d9dfd272
                },
                "a-56": {
                    id: "a-56",
                    title: "About one - image animation",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-56-n",
                            actionTypeId: "STYLE_SIZE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: !0,
                                    id: "68276e6af4aef884568058a0|9babf21f-04ec-2fa9-e15f-27cd358cde59"
                                },
                                widthValue: 0,
                                widthUnit: "px",
                                heightUnit: "PX",
                                locked: !1
                            }
                        }, {
                            id: "a-56-n-3",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".img-wrapper",
                                    selectorGuids: ["fd717e99-57c3-a924-7e30-2470b6422a82"]
                                },
                                yValue: -100,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-56-n-5",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".about_tag",
                                    selectorGuids: ["3dde8cbf-fa01-7bf6-aa08-27e7cded128d"]
                                },
                                xValue: 120,
                                xUnit: "%",
                                yUnit: "PX",
                                zUnit: "PX"
                            }
                        }]
                    }, {
                        actionItems: [{
                            id: "a-56-n-2",
                            actionTypeId: "STYLE_SIZE",
                            config: {
                                delay: 100,
                                easing: "outQuart",
                                duration: 1e3,
                                target: {
                                    useEventTarget: !0,
                                    id: "68276e6af4aef884568058a0|9babf21f-04ec-2fa9-e15f-27cd358cde59"
                                },
                                widthUnit: "AUTO",
                                heightUnit: "AUTO",
                                locked: !0
                            }
                        }, {
                            id: "a-56-n-4",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 100,
                                easing: "outQuart",
                                duration: 1e3,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".img-wrapper",
                                    selectorGuids: ["fd717e99-57c3-a924-7e30-2470b6422a82"]
                                },
                                yValue: 0,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-56-n-6",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 800,
                                easing: "outBack",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".about_tag",
                                    selectorGuids: ["3dde8cbf-fa01-7bf6-aa08-27e7cded128d"]
                                },
                                xValue: 0,
                                xUnit: "%",
                                yUnit: "PX",
                                zUnit: "PX"
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !0,
                    createdOn: 0x196da33e0fa
                },
                "a-57": {
                    id: "a-57",
                    title: "Features - scroll animation 2",
                    continuousParameterGroups: [{
                        id: "a-57-p",
                        type: "SCROLL_PROGRESS",
                        parameterLabel: "Scroll",
                        continuousActionGroups: [{
                            keyframe: 20,
                            actionItems: [{
                                id: "a-57-n",
                                actionTypeId: "TRANSFORM_MOVE",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".features_image-wrapper.is-one",
                                        selectorGuids: ["b8362909-d21d-8777-e631-3240977bd6bd", "47329e4b-6927-52d8-0641-74a64da2d59e"]
                                    },
                                    yValue: 0,
                                    xUnit: "PX",
                                    yUnit: "%",
                                    zUnit: "PX"
                                }
                            }, {
                                id: "a-57-n-2",
                                actionTypeId: "TRANSFORM_MOVE",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".features_image-wrapper.is-two",
                                        selectorGuids: ["b8362909-d21d-8777-e631-3240977bd6bd", "858a1ab3-68ab-34d6-4ff6-02d799b89287"]
                                    },
                                    yValue: 100,
                                    xUnit: "PX",
                                    yUnit: "%",
                                    zUnit: "PX"
                                }
                            }, {
                                id: "a-57-n-3",
                                actionTypeId: "STYLE_TEXT_COLOR",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".heading-style-h3.is-one",
                                        selectorGuids: ["07815991-952a-8d98-0e00-e4c25af27103", "7e485437-b8a3-a2bd-3188-fceb639349ae"]
                                    },
                                    globalSwatchId: "--text-color--text-primary",
                                    rValue: 19,
                                    bValue: 19,
                                    gValue: 19,
                                    aValue: 1
                                }
                            }, {
                                id: "a-57-n-4",
                                actionTypeId: "STYLE_TEXT_COLOR",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".heading-style-h3.is-two",
                                        selectorGuids: ["07815991-952a-8d98-0e00-e4c25af27103", "0ba0fce2-cbf4-ac73-0bb2-4cd187290486"]
                                    },
                                    globalSwatchId: "--text-color--text-tertiary",
                                    rValue: 175,
                                    bValue: 175,
                                    gValue: 175,
                                    aValue: 1
                                }
                            }]
                        }, {
                            keyframe: 25,
                            actionItems: [{
                                id: "a-57-n-5",
                                actionTypeId: "TRANSFORM_MOVE",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".features_image-wrapper.is-one",
                                        selectorGuids: ["b8362909-d21d-8777-e631-3240977bd6bd", "47329e4b-6927-52d8-0641-74a64da2d59e"]
                                    },
                                    yValue: -100,
                                    xUnit: "PX",
                                    yUnit: "%",
                                    zUnit: "PX"
                                }
                            }, {
                                id: "a-57-n-6",
                                actionTypeId: "TRANSFORM_MOVE",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".features_image-wrapper.is-two",
                                        selectorGuids: ["b8362909-d21d-8777-e631-3240977bd6bd", "858a1ab3-68ab-34d6-4ff6-02d799b89287"]
                                    },
                                    yValue: 0,
                                    xUnit: "PX",
                                    yUnit: "%",
                                    zUnit: "PX"
                                }
                            }, {
                                id: "a-57-n-7",
                                actionTypeId: "STYLE_TEXT_COLOR",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".heading-style-h3.is-one",
                                        selectorGuids: ["07815991-952a-8d98-0e00-e4c25af27103", "7e485437-b8a3-a2bd-3188-fceb639349ae"]
                                    },
                                    globalSwatchId: "--text-color--text-tertiary",
                                    rValue: 175,
                                    bValue: 175,
                                    gValue: 175,
                                    aValue: 1
                                }
                            }, {
                                id: "a-57-n-8",
                                actionTypeId: "STYLE_TEXT_COLOR",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".heading-style-h3.is-two",
                                        selectorGuids: ["07815991-952a-8d98-0e00-e4c25af27103", "0ba0fce2-cbf4-ac73-0bb2-4cd187290486"]
                                    },
                                    globalSwatchId: "--text-color--text-primary",
                                    rValue: 19,
                                    bValue: 19,
                                    gValue: 19,
                                    aValue: 1
                                }
                            }]
                        }, {
                            keyframe: 40,
                            actionItems: [{
                                id: "a-57-n-9",
                                actionTypeId: "TRANSFORM_MOVE",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".features_image-wrapper.is-two",
                                        selectorGuids: ["b8362909-d21d-8777-e631-3240977bd6bd", "858a1ab3-68ab-34d6-4ff6-02d799b89287"]
                                    },
                                    yValue: 0,
                                    xUnit: "PX",
                                    yUnit: "%",
                                    zUnit: "PX"
                                }
                            }, {
                                id: "a-57-n-10",
                                actionTypeId: "TRANSFORM_MOVE",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".features_image-wrapper.is-three",
                                        selectorGuids: ["b8362909-d21d-8777-e631-3240977bd6bd", "b35c9cba-7cb1-e1b8-813a-2525c7114a40"]
                                    },
                                    yValue: 100,
                                    xUnit: "PX",
                                    yUnit: "%",
                                    zUnit: "PX"
                                }
                            }, {
                                id: "a-57-n-11",
                                actionTypeId: "STYLE_TEXT_COLOR",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".heading-style-h3.is-two",
                                        selectorGuids: ["07815991-952a-8d98-0e00-e4c25af27103", "0ba0fce2-cbf4-ac73-0bb2-4cd187290486"]
                                    },
                                    globalSwatchId: "--text-color--text-primary",
                                    rValue: 19,
                                    bValue: 19,
                                    gValue: 19,
                                    aValue: 1
                                }
                            }, {
                                id: "a-57-n-12",
                                actionTypeId: "STYLE_TEXT_COLOR",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".heading-style-h3.is-three",
                                        selectorGuids: ["07815991-952a-8d98-0e00-e4c25af27103", "996689c4-279a-f96a-801c-9e467ce87e54"]
                                    },
                                    globalSwatchId: "--text-color--text-tertiary",
                                    rValue: 175,
                                    bValue: 175,
                                    gValue: 175,
                                    aValue: 1
                                }
                            }]
                        }, {
                            keyframe: 45,
                            actionItems: [{
                                id: "a-57-n-13",
                                actionTypeId: "TRANSFORM_MOVE",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".features_image-wrapper.is-two",
                                        selectorGuids: ["b8362909-d21d-8777-e631-3240977bd6bd", "858a1ab3-68ab-34d6-4ff6-02d799b89287"]
                                    },
                                    yValue: -100,
                                    xUnit: "PX",
                                    yUnit: "%",
                                    zUnit: "PX"
                                }
                            }, {
                                id: "a-57-n-14",
                                actionTypeId: "TRANSFORM_MOVE",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".features_image-wrapper.is-three",
                                        selectorGuids: ["b8362909-d21d-8777-e631-3240977bd6bd", "b35c9cba-7cb1-e1b8-813a-2525c7114a40"]
                                    },
                                    yValue: 0,
                                    xUnit: "PX",
                                    yUnit: "%",
                                    zUnit: "PX"
                                }
                            }, {
                                id: "a-57-n-15",
                                actionTypeId: "STYLE_TEXT_COLOR",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".heading-style-h3.is-two",
                                        selectorGuids: ["07815991-952a-8d98-0e00-e4c25af27103", "0ba0fce2-cbf4-ac73-0bb2-4cd187290486"]
                                    },
                                    globalSwatchId: "--text-color--text-tertiary",
                                    rValue: 175,
                                    bValue: 175,
                                    gValue: 175,
                                    aValue: 1
                                }
                            }, {
                                id: "a-57-n-16",
                                actionTypeId: "STYLE_TEXT_COLOR",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".heading-style-h3.is-three",
                                        selectorGuids: ["07815991-952a-8d98-0e00-e4c25af27103", "996689c4-279a-f96a-801c-9e467ce87e54"]
                                    },
                                    globalSwatchId: "--text-color--text-primary",
                                    rValue: 19,
                                    bValue: 19,
                                    gValue: 19,
                                    aValue: 1
                                }
                            }]
                        }, {
                            keyframe: 60,
                            actionItems: [{
                                id: "a-57-n-17",
                                actionTypeId: "TRANSFORM_MOVE",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".features_image-wrapper.is-four",
                                        selectorGuids: ["b8362909-d21d-8777-e631-3240977bd6bd", "237fe6fa-5560-e336-f3ba-d9d9e8ad6837"]
                                    },
                                    yValue: 100,
                                    xUnit: "PX",
                                    yUnit: "%",
                                    zUnit: "PX"
                                }
                            }, {
                                id: "a-57-n-18",
                                actionTypeId: "TRANSFORM_MOVE",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".features_image-wrapper.is-three",
                                        selectorGuids: ["b8362909-d21d-8777-e631-3240977bd6bd", "b35c9cba-7cb1-e1b8-813a-2525c7114a40"]
                                    },
                                    yValue: 0,
                                    xUnit: "PX",
                                    yUnit: "%",
                                    zUnit: "PX"
                                }
                            }, {
                                id: "a-57-n-19",
                                actionTypeId: "STYLE_TEXT_COLOR",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".heading-style-h3.is-three",
                                        selectorGuids: ["07815991-952a-8d98-0e00-e4c25af27103", "996689c4-279a-f96a-801c-9e467ce87e54"]
                                    },
                                    globalSwatchId: "--text-color--text-primary",
                                    rValue: 19,
                                    bValue: 19,
                                    gValue: 19,
                                    aValue: 1
                                }
                            }, {
                                id: "a-57-n-20",
                                actionTypeId: "STYLE_TEXT_COLOR",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".heading-style-h3.is-four",
                                        selectorGuids: ["07815991-952a-8d98-0e00-e4c25af27103", "8849cfc3-0ec8-3890-3dfa-688011b44253"]
                                    },
                                    globalSwatchId: "--text-color--text-tertiary",
                                    rValue: 175,
                                    bValue: 175,
                                    gValue: 175,
                                    aValue: 1
                                }
                            }]
                        }, {
                            keyframe: 65,
                            actionItems: [{
                                id: "a-57-n-21",
                                actionTypeId: "TRANSFORM_MOVE",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".features_image-wrapper.is-four",
                                        selectorGuids: ["b8362909-d21d-8777-e631-3240977bd6bd", "237fe6fa-5560-e336-f3ba-d9d9e8ad6837"]
                                    },
                                    yValue: 0,
                                    xUnit: "PX",
                                    yUnit: "%",
                                    zUnit: "PX"
                                }
                            }, {
                                id: "a-57-n-22",
                                actionTypeId: "TRANSFORM_MOVE",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".features_image-wrapper.is-three",
                                        selectorGuids: ["b8362909-d21d-8777-e631-3240977bd6bd", "b35c9cba-7cb1-e1b8-813a-2525c7114a40"]
                                    },
                                    yValue: -100,
                                    xUnit: "PX",
                                    yUnit: "%",
                                    zUnit: "PX"
                                }
                            }, {
                                id: "a-57-n-23",
                                actionTypeId: "STYLE_TEXT_COLOR",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".heading-style-h3.is-three",
                                        selectorGuids: ["07815991-952a-8d98-0e00-e4c25af27103", "996689c4-279a-f96a-801c-9e467ce87e54"]
                                    },
                                    globalSwatchId: "--text-color--text-tertiary",
                                    rValue: 175,
                                    bValue: 175,
                                    gValue: 175,
                                    aValue: 1
                                }
                            }, {
                                id: "a-57-n-24",
                                actionTypeId: "STYLE_TEXT_COLOR",
                                config: {
                                    delay: 0,
                                    easing: "outQuart",
                                    duration: 500,
                                    target: {
                                        useEventTarget: "CHILDREN",
                                        selector: ".heading-style-h3.is-four",
                                        selectorGuids: ["07815991-952a-8d98-0e00-e4c25af27103", "8849cfc3-0ec8-3890-3dfa-688011b44253"]
                                    },
                                    globalSwatchId: "--text-color--text-primary",
                                    rValue: 19,
                                    bValue: 19,
                                    gValue: 19,
                                    aValue: 1
                                }
                            }]
                        }]
                    }],
                    createdOn: 0x196ca89043d
                },
                "a-60": {
                    id: "a-60",
                    title: "Team -  card entry animation",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-60-n",
                            actionTypeId: "STYLE_SIZE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".img-wrapper",
                                    selectorGuids: ["fd717e99-57c3-a924-7e30-2470b6422a82"]
                                },
                                heightValue: 0,
                                widthUnit: "PX",
                                heightUnit: "px",
                                locked: !1
                            }
                        }, {
                            id: "a-60-n-3",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".team_card-content",
                                    selectorGuids: ["694db5a2-1abc-1c80-967d-fffdc0bd953b"]
                                },
                                yValue: 150,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }]
                    }, {
                        actionItems: [{
                            id: "a-60-n-2",
                            actionTypeId: "STYLE_SIZE",
                            config: {
                                delay: 100,
                                easing: "outQuart",
                                duration: 1e3,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".img-wrapper",
                                    selectorGuids: ["fd717e99-57c3-a924-7e30-2470b6422a82"]
                                },
                                widthUnit: "PX",
                                heightUnit: "AUTO",
                                locked: !1
                            }
                        }, {
                            id: "a-60-n-4",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 800,
                                easing: "outQuart",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".team_card-content",
                                    selectorGuids: ["694db5a2-1abc-1c80-967d-fffdc0bd953b"]
                                },
                                yValue: 0,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !0,
                    createdOn: 0x196dad0511d
                },
                "a-61": {
                    id: "a-61",
                    title: "Team - card hover on",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-61-n",
                            actionTypeId: "TRANSFORM_SCALE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".img",
                                    selectorGuids: ["5ff94027-8af6-6617-36aa-4d39c03dede5"]
                                },
                                xValue: 1,
                                yValue: 1,
                                locked: !0
                            }
                        }, {
                            id: "a-61-n-3",
                            actionTypeId: "STYLE_BACKGROUND_COLOR",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".team_card-content",
                                    selectorGuids: ["694db5a2-1abc-1c80-967d-fffdc0bd953b"]
                                },
                                globalSwatchId: "--brand--white",
                                rValue: 255,
                                bValue: 255,
                                gValue: 255,
                                aValue: 1
                            }
                        }, {
                            id: "a-61-n-5",
                            actionTypeId: "STYLE_TEXT_COLOR",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-xl",
                                    selectorGuids: ["07815991-952a-8d98-0e00-e4c25af27118"]
                                },
                                globalSwatchId: "--text-color--text-primary",
                                rValue: 19,
                                bValue: 19,
                                gValue: 19,
                                aValue: 1
                            }
                        }, {
                            id: "a-61-n-7",
                            actionTypeId: "STYLE_TEXT_COLOR",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-color-secondary",
                                    selectorGuids: ["07815991-952a-8d98-0e00-e4c25af270fe"]
                                },
                                globalSwatchId: "--text-color--text-secondary",
                                rValue: 78,
                                bValue: 78,
                                gValue: 78,
                                aValue: 1
                            }
                        }, {
                            id: "a-61-n-9",
                            actionTypeId: "STYLE_BORDER",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".team_card-icon",
                                    selectorGuids: ["0abbc0de-f54d-64f8-6b1b-a99e7e249b9c"]
                                },
                                globalSwatchId: "--brand--gray-light",
                                rValue: 215,
                                bValue: 215,
                                gValue: 215,
                                aValue: 1
                            }
                        }, {
                            id: "a-61-n-11",
                            actionTypeId: "STYLE_TEXT_COLOR",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".team_card-icon",
                                    selectorGuids: ["0abbc0de-f54d-64f8-6b1b-a99e7e249b9c"]
                                },
                                globalSwatchId: "--text-color--text-primary",
                                rValue: 19,
                                bValue: 19,
                                gValue: 19,
                                aValue: 1
                            }
                        }]
                    }, {
                        actionItems: [{
                            id: "a-61-n-2",
                            actionTypeId: "TRANSFORM_SCALE",
                            config: {
                                delay: 0,
                                easing: "outQuad",
                                duration: 300,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".img",
                                    selectorGuids: ["5ff94027-8af6-6617-36aa-4d39c03dede5"]
                                },
                                xValue: 1.1,
                                yValue: 1.1,
                                locked: !0
                            }
                        }, {
                            id: "a-61-n-4",
                            actionTypeId: "STYLE_BACKGROUND_COLOR",
                            config: {
                                delay: 0,
                                easing: "outQuad",
                                duration: 300,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".team_card-content",
                                    selectorGuids: ["694db5a2-1abc-1c80-967d-fffdc0bd953b"]
                                },
                                globalSwatchId: "--brand--secondary-light",
                                rValue: 95,
                                bValue: 255,
                                gValue: 88,
                                aValue: .3
                            }
                        }, {
                            id: "a-61-n-6",
                            actionTypeId: "STYLE_TEXT_COLOR",
                            config: {
                                delay: 0,
                                easing: "outQuad",
                                duration: 300,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-xl",
                                    selectorGuids: ["07815991-952a-8d98-0e00-e4c25af27118"]
                                },
                                globalSwatchId: "--brand--white",
                                rValue: 255,
                                bValue: 255,
                                gValue: 255,
                                aValue: 1
                            }
                        }, {
                            id: "a-61-n-8",
                            actionTypeId: "STYLE_TEXT_COLOR",
                            config: {
                                delay: 0,
                                easing: "outQuad",
                                duration: 300,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-color-secondary",
                                    selectorGuids: ["07815991-952a-8d98-0e00-e4c25af270fe"]
                                },
                                globalSwatchId: "--brand--white",
                                rValue: 255,
                                bValue: 255,
                                gValue: 255,
                                aValue: 1
                            }
                        }, {
                            id: "a-61-n-10",
                            actionTypeId: "STYLE_BORDER",
                            config: {
                                delay: 0,
                                easing: "outQuad",
                                duration: 300,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".team_card-icon",
                                    selectorGuids: ["0abbc0de-f54d-64f8-6b1b-a99e7e249b9c"]
                                },
                                globalSwatchId: "--brand--white",
                                rValue: 255,
                                bValue: 255,
                                gValue: 255,
                                aValue: 1
                            }
                        }, {
                            id: "a-61-n-12",
                            actionTypeId: "STYLE_TEXT_COLOR",
                            config: {
                                delay: 0,
                                easing: "outQuad",
                                duration: 300,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".team_card-icon",
                                    selectorGuids: ["0abbc0de-f54d-64f8-6b1b-a99e7e249b9c"]
                                },
                                globalSwatchId: "--brand--white",
                                rValue: 255,
                                bValue: 255,
                                gValue: 255,
                                aValue: 1
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !0,
                    createdOn: 0x196db144144
                },
                "a-62": {
                    id: "a-62",
                    title: "Team - card hover off",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-62-n",
                            actionTypeId: "TRANSFORM_SCALE",
                            config: {
                                delay: 0,
                                easing: "outQuad",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".img",
                                    selectorGuids: ["5ff94027-8af6-6617-36aa-4d39c03dede5"]
                                },
                                xValue: 1,
                                yValue: 1,
                                locked: !0
                            }
                        }, {
                            id: "a-62-n-2",
                            actionTypeId: "STYLE_BACKGROUND_COLOR",
                            config: {
                                delay: 0,
                                easing: "outQuad",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".team_card-content",
                                    selectorGuids: ["694db5a2-1abc-1c80-967d-fffdc0bd953b"]
                                },
                                globalSwatchId: "--brand--white",
                                rValue: 255,
                                bValue: 255,
                                gValue: 255,
                                aValue: 1
                            }
                        }, {
                            id: "a-62-n-3",
                            actionTypeId: "STYLE_TEXT_COLOR",
                            config: {
                                delay: 0,
                                easing: "outQuad",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-xl",
                                    selectorGuids: ["07815991-952a-8d98-0e00-e4c25af27118"]
                                },
                                globalSwatchId: "--text-color--text-primary",
                                rValue: 19,
                                bValue: 19,
                                gValue: 19,
                                aValue: 1
                            }
                        }, {
                            id: "a-62-n-4",
                            actionTypeId: "STYLE_TEXT_COLOR",
                            config: {
                                delay: 0,
                                easing: "outQuad",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-color-secondary",
                                    selectorGuids: ["07815991-952a-8d98-0e00-e4c25af270fe"]
                                },
                                globalSwatchId: "--text-color--text-secondary",
                                rValue: 78,
                                bValue: 78,
                                gValue: 78,
                                aValue: 1
                            }
                        }, {
                            id: "a-62-n-5",
                            actionTypeId: "STYLE_BORDER",
                            config: {
                                delay: 0,
                                easing: "outQuad",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".team_card-icon",
                                    selectorGuids: ["0abbc0de-f54d-64f8-6b1b-a99e7e249b9c"]
                                },
                                globalSwatchId: "--brand--gray-light",
                                rValue: 215,
                                bValue: 215,
                                gValue: 215,
                                aValue: 1
                            }
                        }, {
                            id: "a-62-n-6",
                            actionTypeId: "STYLE_TEXT_COLOR",
                            config: {
                                delay: 0,
                                easing: "outQuad",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".team_card-icon",
                                    selectorGuids: ["0abbc0de-f54d-64f8-6b1b-a99e7e249b9c"]
                                },
                                globalSwatchId: "--text-color--text-primary",
                                rValue: 19,
                                bValue: 19,
                                gValue: 19,
                                aValue: 1
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !1,
                    createdOn: 0x196db144144
                },
                "a-63": {
                    id: "a-63",
                    title: "About three - image animation",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-63-n",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".about-three_img",
                                    selectorGuids: ["dd9e862b-83d1-dc10-67a0-f2ba7c2c2776"]
                                },
                                yValue: -100,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-63-n-3",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".about-three_img-content",
                                    selectorGuids: ["a9f40743-b02f-7504-08c5-774c77cd6a17"]
                                },
                                yValue: 100,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-63-n-5",
                            actionTypeId: "TRANSFORM_SCALE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".img.is-about-three",
                                    selectorGuids: ["5ff94027-8af6-6617-36aa-4d39c03dede5", "69c3707c-92f5-88e7-26a0-9d395b4682a7"]
                                },
                                xValue: 1.5,
                                yValue: 1.5,
                                locked: !0
                            }
                        }, {
                            id: "a-63-n-7",
                            actionTypeId: "STYLE_FILTER",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".img.is-about-three",
                                    selectorGuids: ["5ff94027-8af6-6617-36aa-4d39c03dede5", "69c3707c-92f5-88e7-26a0-9d395b4682a7"]
                                },
                                filters: [{
                                    type: "blur",
                                    filterId: "123b",
                                    value: 10,
                                    unit: "px"
                                }]
                            }
                        }]
                    }, {
                        actionItems: [{
                            id: "a-63-n-2",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "outQuart",
                                duration: 1200,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".about-three_img",
                                    selectorGuids: ["dd9e862b-83d1-dc10-67a0-f2ba7c2c2776"]
                                },
                                yValue: 0,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-63-n-4",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "outQuart",
                                duration: 1200,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".about-three_img-content",
                                    selectorGuids: ["a9f40743-b02f-7504-08c5-774c77cd6a17"]
                                },
                                yValue: 0,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-63-n-6",
                            actionTypeId: "TRANSFORM_SCALE",
                            config: {
                                delay: 0,
                                easing: "outQuart",
                                duration: 1200,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".img.is-about-three",
                                    selectorGuids: ["5ff94027-8af6-6617-36aa-4d39c03dede5", "69c3707c-92f5-88e7-26a0-9d395b4682a7"]
                                },
                                xValue: 1,
                                yValue: 1,
                                locked: !0
                            }
                        }, {
                            id: "a-63-n-8",
                            actionTypeId: "STYLE_FILTER",
                            config: {
                                delay: 0,
                                easing: "outQuart",
                                duration: 1200,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".img.is-about-three",
                                    selectorGuids: ["5ff94027-8af6-6617-36aa-4d39c03dede5", "69c3707c-92f5-88e7-26a0-9d395b4682a7"]
                                },
                                filters: [{
                                    type: "blur",
                                    filterId: "d3aa",
                                    value: 0,
                                    unit: "px"
                                }]
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !0,
                    createdOn: 0x196d0d3539a
                },
                "a-64": {
                    id: "a-64",
                    title: "About three - content animaiton",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-64-n",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-6xl.is-about-three",
                                    selectorGuids: ["6859a98f-3be7-710f-eaae-867b912d1aa4", "20947aa1-c3d1-0481-f840-a942fc966eff"]
                                },
                                yValue: 3,
                                xUnit: "PX",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-64-n-3",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-6xl.is-about-three",
                                    selectorGuids: ["6859a98f-3be7-710f-eaae-867b912d1aa4", "20947aa1-c3d1-0481-f840-a942fc966eff"]
                                },
                                value: 0,
                                unit: ""
                            }
                        }, {
                            id: "a-64-n-5",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".about-three_description",
                                    selectorGuids: ["2db91afa-3462-0f5e-e4e0-ba432a261191"]
                                },
                                yValue: 3,
                                xUnit: "PX",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-64-n-7",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".about-three_description",
                                    selectorGuids: ["2db91afa-3462-0f5e-e4e0-ba432a261191"]
                                },
                                value: 0,
                                unit: ""
                            }
                        }, {
                            id: "a-64-n-9",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".button-wrapper",
                                    selectorGuids: ["b3f9fff2-d868-aa9f-f72a-568b68966c17"]
                                },
                                yValue: 3,
                                xUnit: "PX",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-64-n-11",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".button-wrapper",
                                    selectorGuids: ["b3f9fff2-d868-aa9f-f72a-568b68966c17"]
                                },
                                value: 0,
                                unit: ""
                            }
                        }]
                    }, {
                        actionItems: [{
                            id: "a-64-n-2",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 200,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-6xl.is-about-three",
                                    selectorGuids: ["6859a98f-3be7-710f-eaae-867b912d1aa4", "20947aa1-c3d1-0481-f840-a942fc966eff"]
                                },
                                yValue: 0,
                                xUnit: "PX",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-64-n-4",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 200,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".text-6xl.is-about-three",
                                    selectorGuids: ["6859a98f-3be7-710f-eaae-867b912d1aa4", "20947aa1-c3d1-0481-f840-a942fc966eff"]
                                },
                                value: 1,
                                unit: ""
                            }
                        }, {
                            id: "a-64-n-6",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 300,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".about-three_description",
                                    selectorGuids: ["2db91afa-3462-0f5e-e4e0-ba432a261191"]
                                },
                                yValue: 0,
                                xUnit: "PX",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-64-n-8",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 300,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".about-three_description",
                                    selectorGuids: ["2db91afa-3462-0f5e-e4e0-ba432a261191"]
                                },
                                value: 1,
                                unit: ""
                            }
                        }, {
                            id: "a-64-n-10",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 400,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".button-wrapper",
                                    selectorGuids: ["b3f9fff2-d868-aa9f-f72a-568b68966c17"]
                                },
                                yValue: 0,
                                xUnit: "PX",
                                yUnit: "rem",
                                zUnit: "PX"
                            }
                        }, {
                            id: "a-64-n-12",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 400,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".button-wrapper",
                                    selectorGuids: ["b3f9fff2-d868-aa9f-f72a-568b68966c17"]
                                },
                                value: 1,
                                unit: ""
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !0,
                    createdOn: 0x196e96d69c1
                },
                "a-73": {
                    id: "a-73",
                    title: "View - 0.5s",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-73-n",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: !0,
                                    id: "66aaa6f9df23317315a19aa3|593fb161-df47-08f4-613c-8f442471082a"
                                },
                                value: 0,
                                unit: ""
                            }
                        }, {
                            id: "a-73-n-2",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: !0,
                                    id: "66aaa6f9df23317315a19aa3|593fb161-df47-08f4-613c-8f442471082a"
                                },
                                yValue: 15,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }]
                    }, {
                        actionItems: [{
                            id: "a-73-n-3",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 500,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: !0,
                                    id: "66aaa6f9df23317315a19aa3|593fb161-df47-08f4-613c-8f442471082a"
                                },
                                value: 1,
                                unit: ""
                            }
                        }, {
                            id: "a-73-n-4",
                            actionTypeId: "TRANSFORM_MOVE",
                            config: {
                                delay: 500,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: !0,
                                    id: "66aaa6f9df23317315a19aa3|593fb161-df47-08f4-613c-8f442471082a"
                                },
                                yValue: 0,
                                xUnit: "PX",
                                yUnit: "%",
                                zUnit: "PX"
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !0,
                    createdOn: 0x191450a9e51
                },
                "a-74": {
                    id: "a-74",
                    title: "Contact one - hover on",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-74-n",
                            actionTypeId: "STYLE_BACKGROUND_COLOR",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: !0,
                                    id: "682b8e40e47efb3f7d410edf|eaf13c40-1a84-070e-9e3e-62ca24d3a309"
                                },
                                globalSwatchId: "--brand--neutral-dark",
                                rValue: 19,
                                bValue: 19,
                                gValue: 19,
                                aValue: 1
                            }
                        }]
                    }, {
                        actionItems: [{
                            id: "a-74-n-2",
                            actionTypeId: "STYLE_BACKGROUND_COLOR",
                            config: {
                                delay: 0,
                                easing: "outQuart",
                                duration: 300,
                                target: {
                                    useEventTarget: !0,
                                    id: "682b8e40e47efb3f7d410edf|eaf13c40-1a84-070e-9e3e-62ca24d3a309"
                                },
                                globalSwatchId: "--brand--secondary",
                                rValue: 95,
                                bValue: 255,
                                gValue: 88,
                                aValue: 1
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !0,
                    createdOn: 0x19713e98df9
                },
                "a-75": {
                    id: "a-75",
                    title: "Contact one - hover off",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-75-n",
                            actionTypeId: "STYLE_BACKGROUND_COLOR",
                            config: {
                                delay: 0,
                                easing: "outQuart",
                                duration: 500,
                                target: {
                                    useEventTarget: !0,
                                    id: "682b8e40e47efb3f7d410edf|eaf13c40-1a84-070e-9e3e-62ca24d3a309"
                                },
                                globalSwatchId: "--brand--neutral-dark",
                                rValue: 19,
                                bValue: 19,
                                gValue: 19,
                                aValue: 1
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !1,
                    createdOn: 0x19713e98df9
                },
                "a-78": {
                    id: "a-78",
                    title: "Image zoom out",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-78-n",
                            actionTypeId: "TRANSFORM_SCALE",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".img-wrapper",
                                    selectorGuids: ["fd717e99-57c3-a924-7e30-2470b6422a82"]
                                },
                                xValue: 1.5,
                                yValue: 1.5,
                                locked: !0
                            }
                        }, {
                            id: "a-78-n-3",
                            actionTypeId: "STYLE_FILTER",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".img-wrapper",
                                    selectorGuids: ["fd717e99-57c3-a924-7e30-2470b6422a82"]
                                },
                                filters: [{
                                    type: "blur",
                                    filterId: "2fb5",
                                    value: 5,
                                    unit: "px"
                                }]
                            }
                        }]
                    }, {
                        actionItems: [{
                            id: "a-78-n-2",
                            actionTypeId: "TRANSFORM_SCALE",
                            config: {
                                delay: 0,
                                easing: "outQuart",
                                duration: 1200,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".img-wrapper",
                                    selectorGuids: ["fd717e99-57c3-a924-7e30-2470b6422a82"]
                                },
                                xValue: 1,
                                yValue: 1,
                                locked: !0
                            }
                        }, {
                            id: "a-78-n-4",
                            actionTypeId: "STYLE_FILTER",
                            config: {
                                delay: 0,
                                easing: "outQuart",
                                duration: 1200,
                                target: {
                                    useEventTarget: "CHILDREN",
                                    selector: ".img-wrapper",
                                    selectorGuids: ["fd717e99-57c3-a924-7e30-2470b6422a82"]
                                },
                                filters: [{
                                    type: "blur",
                                    filterId: "4134",
                                    value: 0,
                                    unit: "px"
                                }]
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !0,
                    createdOn: 0x19765071430
                },
                "a-77": {
                    id: "a-77",
                    title: "Opacity - 0.1s",
                    actionItemGroups: [{
                        actionItems: [{
                            id: "a-77-n",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 0,
                                easing: "",
                                duration: 500,
                                target: {
                                    useEventTarget: !0,
                                    id: "66aaa6f9df23317315a19aa3|593fb161-df47-08f4-613c-8f442471082a"
                                },
                                value: 0,
                                unit: ""
                            }
                        }]
                    }, {
                        actionItems: [{
                            id: "a-77-n-2",
                            actionTypeId: "STYLE_OPACITY",
                            config: {
                                delay: 100,
                                easing: "outQuart",
                                duration: 700,
                                target: {
                                    useEventTarget: !0,
                                    id: "66aaa6f9df23317315a19aa3|593fb161-df47-08f4-613c-8f442471082a"
                                },
                                value: 1,
                                unit: ""
                            }
                        }]
                    }],
                    useFirstGroupAsInitialState: !0,
                    createdOn: 0x191450a9e51
                }
            },
            site: {
                mediaQueries: [{
                    key: "main",
                    min: 992,
                    max: 1e4
                }, {
                    key: "medium",
                    min: 768,
                    max: 991
                }, {
                    key: "small",
                    min: 480,
                    max: 767
                }, {
                    key: "tiny",
                    min: 0,
                    max: 479
                }]
            }
        })
    }
}]);
