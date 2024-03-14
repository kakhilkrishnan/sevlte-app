
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign$1(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    // Adapted from https://github.com/then/is-promise/blob/master/index.js
    // Distributed under MIT License https://github.com/then/is-promise/blob/master/LICENSE
    function is_promise(value) {
        return !!value && (typeof value === 'object' || typeof value === 'function') && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign$1($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
        return style.sheet;
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { ownerNode } = info.stylesheet;
                // there is no ownerNode if it runs on jsdom.
                if (ownerNode)
                    detach(ownerNode);
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    /**
     * Associates an arbitrary `context` object with the current component and the specified `key`
     * and returns that object. The context is then available to children of the component
     * (including slotted content) with `getContext`.
     *
     * Like lifecycle functions, this must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-setcontext
     */
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
        return context;
    }
    /**
     * Retrieves the context that belongs to the closest parent component with the specified `key`.
     * Must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-getcontext
     */
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        const options = { direction: 'in' };
        let config = fn(node, params, options);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config(options);
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        const options = { direction: 'out' };
        let config = fn(node, params, options);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config(options);
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        const updates = [];
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                // defer updates until all the DOM shuffling is done
                updates.push(() => block.p(child_ctx, dirty));
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        run_all(updates);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    function construct_svelte_component_dev(component, props) {
        const error_message = 'this={...} of <svelte:component> should specify a Svelte component.';
        try {
            const instance = new component(props);
            if (!instance.$$ || !instance.$set || !instance.$on || !instance.$destroy) {
                throw new Error(error_message);
            }
            return instance;
        }
        catch (err) {
            const { message } = err;
            if (typeof message === 'string' && message.indexOf('is not a constructor') !== -1) {
                throw new Error(error_message);
            }
            else {
                throw err;
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const LOCATION = {};
    const ROUTER = {};
    const HISTORY = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     * https://github.com/reach/router/blob/master/LICENSE
     */

    const PARAM = /^:(.+)/;
    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Split up the URI into segments delimited by `/`
     * Strip starting/ending `/`
     * @param {string} uri
     * @return {string[]}
     */
    const segmentize = (uri) => uri.replace(/(^\/+|\/+$)/g, "").split("/");
    /**
     * Strip `str` of potential start and end `/`
     * @param {string} string
     * @return {string}
     */
    const stripSlashes = (string) => string.replace(/(^\/+|\/+$)/g, "");
    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    const rankRoute = (route, index) => {
        const score = route.default
            ? 0
            : segmentize(route.path).reduce((score, segment) => {
                  score += SEGMENT_POINTS;

                  if (segment === "") {
                      score += ROOT_POINTS;
                  } else if (PARAM.test(segment)) {
                      score += DYNAMIC_POINTS;
                  } else if (segment[0] === "*") {
                      score -= SEGMENT_POINTS + SPLAT_PENALTY;
                  } else {
                      score += STATIC_POINTS;
                  }

                  return score;
              }, 0);

        return { route, score, index };
    };
    /**
     * Give a score to all routes and sort them on that
     * If two routes have the exact same score, we go by index instead
     * @param {object[]} routes
     * @return {object[]}
     */
    const rankRoutes = (routes) =>
        routes
            .map(rankRoute)
            .sort((a, b) =>
                a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
            );
    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    const pick = (routes, uri) => {
        let match;
        let default_;

        const [uriPathname] = uri.split("?");
        const uriSegments = segmentize(uriPathname);
        const isRootUri = uriSegments[0] === "";
        const ranked = rankRoutes(routes);

        for (let i = 0, l = ranked.length; i < l; i++) {
            const route = ranked[i].route;
            let missed = false;

            if (route.default) {
                default_ = {
                    route,
                    params: {},
                    uri,
                };
                continue;
            }

            const routeSegments = segmentize(route.path);
            const params = {};
            const max = Math.max(uriSegments.length, routeSegments.length);
            let index = 0;

            for (; index < max; index++) {
                const routeSegment = routeSegments[index];
                const uriSegment = uriSegments[index];

                if (routeSegment && routeSegment[0] === "*") {
                    // Hit a splat, just grab the rest, and return a match
                    // uri:   /files/documents/work
                    // route: /files/* or /files/*splatname
                    const splatName =
                        routeSegment === "*" ? "*" : routeSegment.slice(1);

                    params[splatName] = uriSegments
                        .slice(index)
                        .map(decodeURIComponent)
                        .join("/");
                    break;
                }

                if (typeof uriSegment === "undefined") {
                    // URI is shorter than the route, no match
                    // uri:   /users
                    // route: /users/:userId
                    missed = true;
                    break;
                }

                const dynamicMatch = PARAM.exec(routeSegment);

                if (dynamicMatch && !isRootUri) {
                    const value = decodeURIComponent(uriSegment);
                    params[dynamicMatch[1]] = value;
                } else if (routeSegment !== uriSegment) {
                    // Current segments don't match, not dynamic, not splat, so no match
                    // uri:   /users/123/settings
                    // route: /users/:id/profile
                    missed = true;
                    break;
                }
            }

            if (!missed) {
                match = {
                    route,
                    params,
                    uri: "/" + uriSegments.slice(0, index).join("/"),
                };
                break;
            }
        }

        return match || default_ || null;
    };
    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    const combinePaths = (basepath, path) =>
        `${stripSlashes(
        path === "/"
            ? basepath
            : `${stripSlashes(basepath)}/${stripSlashes(path)}`
    )}/`;

    const canUseDOM = () =>
        typeof window !== "undefined" &&
        "document" in window &&
        "location" in window;

    /* node_modules\svelte-routing\src\Route.svelte generated by Svelte v3.59.2 */
    const get_default_slot_changes$1 = dirty => ({ params: dirty & /*routeParams*/ 4 });
    const get_default_slot_context$1 = ctx => ({ params: /*routeParams*/ ctx[2] });

    // (42:0) {#if $activeRoute && $activeRoute.route === route}
    function create_if_block$4(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$1, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(42:0) {#if $activeRoute && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (51:4) {:else}
    function create_else_block$3(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], get_default_slot_context$1);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, routeParams*/ 132)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, get_default_slot_changes$1),
    						get_default_slot_context$1
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(51:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (43:4) {#if component}
    function create_if_block_1$1(ctx) {
    	let await_block_anchor;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 12,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*component*/ ctx[0], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*component*/ 1 && promise !== (promise = /*component*/ ctx[0]) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(43:4) {#if component}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>     import { getContext, onDestroy }
    function create_catch_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script>     import { getContext, onDestroy }",
    		ctx
    	});

    	return block;
    }

    // (44:49)              <svelte:component                 this={resolvedComponent?.default || resolvedComponent}
    function create_then_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*routeParams*/ ctx[2], /*routeProps*/ ctx[3]];
    	var switch_value = /*resolvedComponent*/ ctx[12]?.default || /*resolvedComponent*/ ctx[12];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign$1(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*routeParams, routeProps*/ 12)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*routeParams*/ 4 && get_spread_object(/*routeParams*/ ctx[2]),
    					dirty & /*routeProps*/ 8 && get_spread_object(/*routeProps*/ ctx[3])
    				])
    			: {};

    			if (dirty & /*component*/ 1 && switch_value !== (switch_value = /*resolvedComponent*/ ctx[12]?.default || /*resolvedComponent*/ ctx[12])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(44:49)              <svelte:component                 this={resolvedComponent?.default || resolvedComponent}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>     import { getContext, onDestroy }
    function create_pending_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(1:0) <script>     import { getContext, onDestroy }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[1] && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[5] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[1] && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Route', slots, ['default']);
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	let routeParams = {};
    	let routeProps = {};
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, 'activeRoute');
    	component_subscribe($$self, activeRoute, value => $$invalidate(1, $activeRoute = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	registerRoute(route);

    	onDestroy(() => {
    		unregisterRoute(route);
    	});

    	$$self.$$set = $$new_props => {
    		$$invalidate(11, $$props = assign$1(assign$1({}, $$props), exclude_internal_props($$new_props)));
    		if ('path' in $$new_props) $$invalidate(6, path = $$new_props.path);
    		if ('component' in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ('$$scope' in $$new_props) $$invalidate(7, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		ROUTER,
    		canUseDOM,
    		path,
    		component,
    		routeParams,
    		routeProps,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		route,
    		$activeRoute
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(11, $$props = assign$1(assign$1({}, $$props), $$new_props));
    		if ('path' in $$props) $$invalidate(6, path = $$new_props.path);
    		if ('component' in $$props) $$invalidate(0, component = $$new_props.component);
    		if ('routeParams' in $$props) $$invalidate(2, routeParams = $$new_props.routeParams);
    		if ('routeProps' in $$props) $$invalidate(3, routeProps = $$new_props.routeProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($activeRoute && $activeRoute.route === route) {
    			$$invalidate(2, routeParams = $activeRoute.params);
    			const { component: c, path, ...rest } = $$props;
    			$$invalidate(3, routeProps = rest);

    			if (c) {
    				if (c.toString().startsWith("class ")) $$invalidate(0, component = c); else $$invalidate(0, component = c());
    			}

    			canUseDOM() && !$activeRoute.preserveScroll && window?.scrollTo(0, 0);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		$activeRoute,
    		routeParams,
    		routeProps,
    		activeRoute,
    		route,
    		path,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { path: 6, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier} [start]
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=} start
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0 && stop) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let started = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (started) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            started = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
                // We need to set this to false because callbacks can still happen despite having unsubscribed:
                // Callbacks might already be placed in the queue which doesn't know it should no longer
                // invoke this derived store.
                started = false;
            };
        });
    }

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     * https://github.com/reach/router/blob/master/LICENSE
     */

    const getLocation = (source) => {
        return {
            ...source.location,
            state: source.history.state,
            key: (source.history.state && source.history.state.key) || "initial",
        };
    };
    const createHistory = (source) => {
        const listeners = [];
        let location = getLocation(source);

        return {
            get location() {
                return location;
            },

            listen(listener) {
                listeners.push(listener);

                const popstateListener = () => {
                    location = getLocation(source);
                    listener({ location, action: "POP" });
                };

                source.addEventListener("popstate", popstateListener);

                return () => {
                    source.removeEventListener("popstate", popstateListener);
                    const index = listeners.indexOf(listener);
                    listeners.splice(index, 1);
                };
            },

            navigate(to, { state, replace = false, preserveScroll = false, blurActiveElement = true } = {}) {
                state = { ...state, key: Date.now() + "" };
                // try...catch iOS Safari limits to 100 pushState calls
                try {
                    if (replace) source.history.replaceState(state, "", to);
                    else source.history.pushState(state, "", to);
                } catch (e) {
                    source.location[replace ? "replace" : "assign"](to);
                }
                location = getLocation(source);
                listeners.forEach((listener) =>
                    listener({ location, action: "PUSH", preserveScroll })
                );
                if(blurActiveElement) document.activeElement.blur();
            },
        };
    };
    // Stores history entries in memory for testing or other platforms like Native
    const createMemorySource = (initialPathname = "/") => {
        let index = 0;
        const stack = [{ pathname: initialPathname, search: "" }];
        const states = [];

        return {
            get location() {
                return stack[index];
            },
            addEventListener(name, fn) {},
            removeEventListener(name, fn) {},
            history: {
                get entries() {
                    return stack;
                },
                get index() {
                    return index;
                },
                get state() {
                    return states[index];
                },
                pushState(state, _, uri) {
                    const [pathname, search = ""] = uri.split("?");
                    index++;
                    stack.push({ pathname, search });
                    states.push(state);
                },
                replaceState(state, _, uri) {
                    const [pathname, search = ""] = uri.split("?");
                    stack[index] = { pathname, search };
                    states[index] = state;
                },
            },
        };
    };
    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const globalHistory = createHistory(
        canUseDOM() ? window : createMemorySource()
    );
    const { navigate } = globalHistory;

    /* node_modules\svelte-routing\src\Router.svelte generated by Svelte v3.59.2 */

    const { Object: Object_1 } = globals;
    const file$7 = "node_modules\\svelte-routing\\src\\Router.svelte";

    const get_default_slot_changes_1 = dirty => ({
    	route: dirty & /*$activeRoute*/ 4,
    	location: dirty & /*$location*/ 2
    });

    const get_default_slot_context_1 = ctx => ({
    	route: /*$activeRoute*/ ctx[2] && /*$activeRoute*/ ctx[2].uri,
    	location: /*$location*/ ctx[1]
    });

    const get_default_slot_changes = dirty => ({
    	route: dirty & /*$activeRoute*/ 4,
    	location: dirty & /*$location*/ 2
    });

    const get_default_slot_context = ctx => ({
    	route: /*$activeRoute*/ ctx[2] && /*$activeRoute*/ ctx[2].uri,
    	location: /*$location*/ ctx[1]
    });

    // (143:0) {:else}
    function create_else_block$2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], get_default_slot_context_1);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, $activeRoute, $location*/ 16390)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[14],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[14])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[14], dirty, get_default_slot_changes_1),
    						get_default_slot_context_1
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(143:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (134:0) {#if viewtransition}
    function create_if_block$3(ctx) {
    	let previous_key = /*$location*/ ctx[1].pathname;
    	let key_block_anchor;
    	let current;
    	let key_block = create_key_block(ctx);

    	const block = {
    		c: function create() {
    			key_block.c();
    			key_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			key_block.m(target, anchor);
    			insert_dev(target, key_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$location*/ 2 && safe_not_equal(previous_key, previous_key = /*$location*/ ctx[1].pathname)) {
    				group_outros();
    				transition_out(key_block, 1, 1, noop);
    				check_outros();
    				key_block = create_key_block(ctx);
    				key_block.c();
    				transition_in(key_block, 1);
    				key_block.m(key_block_anchor.parentNode, key_block_anchor);
    			} else {
    				key_block.p(ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(key_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(key_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(key_block_anchor);
    			key_block.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(134:0) {#if viewtransition}",
    		ctx
    	});

    	return block;
    }

    // (135:4) {#key $location.pathname}
    function create_key_block(ctx) {
    	let div;
    	let div_intro;
    	let div_outro;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], get_default_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			add_location(div, file$7, 135, 8, 4659);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, $activeRoute, $location*/ 16390)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[14],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[14])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[14], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!current) return;
    				if (div_outro) div_outro.end(1);
    				div_intro = create_in_transition(div, /*viewtransitionFn*/ ctx[3], {});
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, /*viewtransitionFn*/ ctx[3], {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block.name,
    		type: "key",
    		source: "(135:4) {#key $location.pathname}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$3, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*viewtransition*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $location;
    	let $routes;
    	let $base;
    	let $activeRoute;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, ['default']);
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	let { viewtransition = null } = $$props;
    	let { history = globalHistory } = $$props;

    	const viewtransitionFn = (node, _, direction) => {
    		const vt = viewtransition(direction);
    		if (typeof vt?.fn === "function") return vt.fn(node, vt); else return vt;
    	};

    	setContext(HISTORY, history);
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, 'routes');
    	component_subscribe($$self, routes, value => $$invalidate(12, $routes = value));
    	const activeRoute = writable(null);
    	validate_store(activeRoute, 'activeRoute');
    	component_subscribe($$self, activeRoute, value => $$invalidate(2, $activeRoute = value));
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : history.location);

    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(1, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, 'base');
    	component_subscribe($$self, base, value => $$invalidate(13, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (!activeRoute) return base;

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	const registerRoute = route => {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) return;

    			const matchingRoute = pick([route], $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => [...rs, route]);
    		}
    	};

    	const unregisterRoute = route => {
    		routes.update(rs => rs.filter(r => r !== route));
    	};

    	let preserveScroll = false;

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = history.listen(event => {
    				$$invalidate(11, preserveScroll = event.preserveScroll || false);
    				location.set(event.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ['basepath', 'url', 'viewtransition', 'history'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('basepath' in $$props) $$invalidate(8, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(9, url = $$props.url);
    		if ('viewtransition' in $$props) $$invalidate(0, viewtransition = $$props.viewtransition);
    		if ('history' in $$props) $$invalidate(10, history = $$props.history);
    		if ('$$scope' in $$props) $$invalidate(14, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onMount,
    		setContext,
    		derived,
    		writable,
    		HISTORY,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		combinePaths,
    		pick,
    		basepath,
    		url,
    		viewtransition,
    		history,
    		viewtransitionFn,
    		locationContext,
    		routerContext,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		location,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		preserveScroll,
    		$location,
    		$routes,
    		$base,
    		$activeRoute
    	});

    	$$self.$inject_state = $$props => {
    		if ('basepath' in $$props) $$invalidate(8, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(9, url = $$props.url);
    		if ('viewtransition' in $$props) $$invalidate(0, viewtransition = $$props.viewtransition);
    		if ('history' in $$props) $$invalidate(10, history = $$props.history);
    		if ('hasActiveRoute' in $$props) hasActiveRoute = $$props.hasActiveRoute;
    		if ('preserveScroll' in $$props) $$invalidate(11, preserveScroll = $$props.preserveScroll);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 8192) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			{
    				const { path: basepath } = $base;
    				routes.update(rs => rs.map(r => Object.assign(r, { path: combinePaths(basepath, r._path) })));
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location, preserveScroll*/ 6146) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			{
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch ? { ...bestMatch, preserveScroll } : bestMatch);
    			}
    		}
    	};

    	return [
    		viewtransition,
    		$location,
    		$activeRoute,
    		viewtransitionFn,
    		routes,
    		activeRoute,
    		location,
    		base,
    		basepath,
    		url,
    		history,
    		preserveScroll,
    		$routes,
    		$base,
    		$$scope,
    		slots
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			basepath: 8,
    			url: 9,
    			viewtransition: 0,
    			history: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get viewtransition() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewtransition(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get history() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set history(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\MaterialApp\MaterialApp.svelte generated by Svelte v3.59.2 */

    const file$6 = "node_modules\\svelte-materialify\\dist\\components\\MaterialApp\\MaterialApp.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-app theme--" + /*theme*/ ctx[0]);
    			add_location(div, file$6, 12, 0, 203097);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*theme*/ 1 && div_class_value !== (div_class_value = "s-app theme--" + /*theme*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MaterialApp', slots, ['default']);
    	let { theme = 'light' } = $$props;
    	const writable_props = ['theme'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MaterialApp> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ theme });

    	$$self.$inject_state = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [theme, $$scope, slots];
    }

    class MaterialApp extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { theme: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MaterialApp",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get theme() {
    		throw new Error("<MaterialApp>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<MaterialApp>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* eslint-disable */
    // Shamefully ripped from https://github.com/lukeed/uid
    let IDX = 36;
    let HEX = '';
    while (IDX--) HEX += IDX.toString(36);

    /* eslint-disable no-param-reassign */

    const themeColors = ['primary', 'secondary', 'success', 'info', 'warning', 'error'];

    /**
     * @param {string} klass
     */
    function formatClass(klass) {
      return klass.split(' ').map((i) => {
        if (themeColors.includes(i)) return `${i}-color`;
        return i;
      });
    }

    function setBackgroundColor(node, text) {
      if (/^(#|rgb|hsl|currentColor)/.test(text)) {
        // This is a CSS hex.
        node.style.backgroundColor = text;
        return false;
      }

      if (text.startsWith('--')) {
        // This is a CSS variable.
        node.style.backgroundColor = `var(${text})`;
        return false;
      }

      const klass = formatClass(text);
      node.classList.add(...klass);
      return klass;
    }

    /**
     * @param node {Element}
     * @param text {string|boolean}
     */
    var BackgroundColor = (node, text) => {
      let klass;
      if (typeof text === 'string') {
        klass = setBackgroundColor(node, text);
      }

      return {
        update(newText) {
          if (klass) {
            node.classList.remove(...klass);
          } else {
            node.style.backgroundColor = null;
          }

          if (typeof newText === 'string') {
            klass = setBackgroundColor(node, newText);
          }
        },
      };
    };

    /* node_modules\svelte-materialify\dist\components\ProgressLinear\ProgressLinear.svelte generated by Svelte v3.59.2 */
    const file$5 = "node_modules\\svelte-materialify\\dist\\components\\ProgressLinear\\ProgressLinear.svelte";

    // (43:2) {:else}
    function create_else_block$1(ctx) {
    	let div;
    	let BackgroundColor_action;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "determinate svelte-yd0o6d");
    			set_style(div, "width", /*value*/ ctx[1] + "%");
    			toggle_class(div, "striped", /*striped*/ ctx[12]);
    			add_location(div, file$5, 43, 4, 3255);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = action_destroyer(BackgroundColor_action = BackgroundColor.call(null, div, /*color*/ ctx[7]));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*value*/ 2) {
    				set_style(div, "width", /*value*/ ctx[1] + "%");
    			}

    			if (BackgroundColor_action && is_function(BackgroundColor_action.update) && dirty & /*color*/ 128) BackgroundColor_action.update.call(null, /*color*/ ctx[7]);

    			if (dirty & /*striped*/ 4096) {
    				toggle_class(div, "striped", /*striped*/ ctx[12]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (38:2) {#if indeterminate}
    function create_if_block_1(ctx) {
    	let div2;
    	let div0;
    	let t;
    	let div1;
    	let BackgroundColor_action;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "indeterminate long svelte-yd0o6d");
    			add_location(div0, file$5, 39, 6, 3153);
    			attr_dev(div1, "class", "indeterminate short svelte-yd0o6d");
    			add_location(div1, file$5, 40, 6, 3194);
    			add_location(div2, file$5, 38, 4, 3113);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t);
    			append_dev(div2, div1);

    			if (!mounted) {
    				dispose = action_destroyer(BackgroundColor_action = BackgroundColor.call(null, div2, /*color*/ ctx[7]));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (BackgroundColor_action && is_function(BackgroundColor_action.update) && dirty & /*color*/ 128) BackgroundColor_action.update.call(null, /*color*/ ctx[7]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(38:2) {#if indeterminate}",
    		ctx
    	});

    	return block;
    }

    // (55:2) {#if stream}
    function create_if_block$2(ctx) {
    	let div;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", div_class_value = "stream " + /*color*/ ctx[7] + " svelte-yd0o6d");
    			set_style(div, "width", 100 - /*buffer*/ ctx[8] + "%");
    			add_location(div, file$5, 55, 4, 3466);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*color*/ 128 && div_class_value !== (div_class_value = "stream " + /*color*/ ctx[7] + " svelte-yd0o6d")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*buffer*/ 256) {
    				set_style(div, "width", 100 - /*buffer*/ ctx[8] + "%");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(55:2) {#if stream}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div2;
    	let div0;
    	let div0_style_value;
    	let BackgroundColor_action;
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let div2_class_value;
    	let div2_style_value;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*indeterminate*/ ctx[3]) return create_if_block_1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], null);
    	let if_block1 = /*stream*/ ctx[10] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			if_block0.c();
    			t1 = space();
    			div1 = element("div");
    			if (default_slot) default_slot.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div0, "class", "background svelte-yd0o6d");
    			attr_dev(div0, "style", div0_style_value = "opacity:" + /*backgroundOpacity*/ ctx[6] + ";" + (/*reversed*/ ctx[9] ? 'right' : 'left') + ":" + /*value*/ ctx[1] + "%;width:" + (/*buffer*/ ctx[8] - /*value*/ ctx[1]) + "%");
    			add_location(div0, file$5, 32, 2, 2910);
    			attr_dev(div1, "class", "s-progress-linear__content svelte-yd0o6d");
    			add_location(div1, file$5, 50, 2, 3383);
    			attr_dev(div2, "role", "progressbar");
    			attr_dev(div2, "aria-valuemin", "0");
    			attr_dev(div2, "aria-valuemax", "100");
    			attr_dev(div2, "aria-valuenow", /*value*/ ctx[1]);
    			attr_dev(div2, "class", div2_class_value = "s-progress-linear " + /*klass*/ ctx[0] + " svelte-yd0o6d");
    			attr_dev(div2, "style", div2_style_value = "height:" + /*height*/ ctx[4] + ";" + /*style*/ ctx[13]);
    			toggle_class(div2, "inactive", !/*active*/ ctx[2]);
    			toggle_class(div2, "reversed", /*reversed*/ ctx[9]);
    			toggle_class(div2, "rounded", /*rounded*/ ctx[11]);
    			add_location(div2, file$5, 22, 0, 2685);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t0);
    			if_block0.m(div2, null);
    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			append_dev(div2, t2);
    			if (if_block1) if_block1.m(div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(BackgroundColor_action = BackgroundColor.call(null, div0, /*backgroundColor*/ ctx[5]));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*backgroundOpacity, reversed, value, buffer*/ 834 && div0_style_value !== (div0_style_value = "opacity:" + /*backgroundOpacity*/ ctx[6] + ";" + (/*reversed*/ ctx[9] ? 'right' : 'left') + ":" + /*value*/ ctx[1] + "%;width:" + (/*buffer*/ ctx[8] - /*value*/ ctx[1]) + "%")) {
    				attr_dev(div0, "style", div0_style_value);
    			}

    			if (BackgroundColor_action && is_function(BackgroundColor_action.update) && dirty & /*backgroundColor*/ 32) BackgroundColor_action.update.call(null, /*backgroundColor*/ ctx[5]);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div2, t1);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16384)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[14],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[14])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[14], dirty, null),
    						null
    					);
    				}
    			}

    			if (/*stream*/ ctx[10]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					if_block1.m(div2, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (!current || dirty & /*value*/ 2) {
    				attr_dev(div2, "aria-valuenow", /*value*/ ctx[1]);
    			}

    			if (!current || dirty & /*klass*/ 1 && div2_class_value !== (div2_class_value = "s-progress-linear " + /*klass*/ ctx[0] + " svelte-yd0o6d")) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (!current || dirty & /*height, style*/ 8208 && div2_style_value !== (div2_style_value = "height:" + /*height*/ ctx[4] + ";" + /*style*/ ctx[13])) {
    				attr_dev(div2, "style", div2_style_value);
    			}

    			if (!current || dirty & /*klass, active*/ 5) {
    				toggle_class(div2, "inactive", !/*active*/ ctx[2]);
    			}

    			if (!current || dirty & /*klass, reversed*/ 513) {
    				toggle_class(div2, "reversed", /*reversed*/ ctx[9]);
    			}

    			if (!current || dirty & /*klass, rounded*/ 2049) {
    				toggle_class(div2, "rounded", /*rounded*/ ctx[11]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if_block0.d();
    			if (default_slot) default_slot.d(detaching);
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ProgressLinear', slots, ['default']);
    	let { class: klass = '' } = $$props;
    	let { value = 0 } = $$props;
    	let { active = true } = $$props;
    	let { indeterminate = false } = $$props;
    	let { height = '4px' } = $$props;
    	let { backgroundColor = 'primary' } = $$props;
    	let { backgroundOpacity = 0.3 } = $$props;
    	let { color = backgroundColor } = $$props;
    	let { buffer = 100 } = $$props;
    	let { reversed = false } = $$props;
    	let { stream = false } = $$props;
    	let { rounded = false } = $$props;
    	let { striped = false } = $$props;
    	let { style = '' } = $$props;

    	const writable_props = [
    		'class',
    		'value',
    		'active',
    		'indeterminate',
    		'height',
    		'backgroundColor',
    		'backgroundOpacity',
    		'color',
    		'buffer',
    		'reversed',
    		'stream',
    		'rounded',
    		'striped',
    		'style'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ProgressLinear> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('class' in $$props) $$invalidate(0, klass = $$props.class);
    		if ('value' in $$props) $$invalidate(1, value = $$props.value);
    		if ('active' in $$props) $$invalidate(2, active = $$props.active);
    		if ('indeterminate' in $$props) $$invalidate(3, indeterminate = $$props.indeterminate);
    		if ('height' in $$props) $$invalidate(4, height = $$props.height);
    		if ('backgroundColor' in $$props) $$invalidate(5, backgroundColor = $$props.backgroundColor);
    		if ('backgroundOpacity' in $$props) $$invalidate(6, backgroundOpacity = $$props.backgroundOpacity);
    		if ('color' in $$props) $$invalidate(7, color = $$props.color);
    		if ('buffer' in $$props) $$invalidate(8, buffer = $$props.buffer);
    		if ('reversed' in $$props) $$invalidate(9, reversed = $$props.reversed);
    		if ('stream' in $$props) $$invalidate(10, stream = $$props.stream);
    		if ('rounded' in $$props) $$invalidate(11, rounded = $$props.rounded);
    		if ('striped' in $$props) $$invalidate(12, striped = $$props.striped);
    		if ('style' in $$props) $$invalidate(13, style = $$props.style);
    		if ('$$scope' in $$props) $$invalidate(14, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		BackgroundColor,
    		klass,
    		value,
    		active,
    		indeterminate,
    		height,
    		backgroundColor,
    		backgroundOpacity,
    		color,
    		buffer,
    		reversed,
    		stream,
    		rounded,
    		striped,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ('klass' in $$props) $$invalidate(0, klass = $$props.klass);
    		if ('value' in $$props) $$invalidate(1, value = $$props.value);
    		if ('active' in $$props) $$invalidate(2, active = $$props.active);
    		if ('indeterminate' in $$props) $$invalidate(3, indeterminate = $$props.indeterminate);
    		if ('height' in $$props) $$invalidate(4, height = $$props.height);
    		if ('backgroundColor' in $$props) $$invalidate(5, backgroundColor = $$props.backgroundColor);
    		if ('backgroundOpacity' in $$props) $$invalidate(6, backgroundOpacity = $$props.backgroundOpacity);
    		if ('color' in $$props) $$invalidate(7, color = $$props.color);
    		if ('buffer' in $$props) $$invalidate(8, buffer = $$props.buffer);
    		if ('reversed' in $$props) $$invalidate(9, reversed = $$props.reversed);
    		if ('stream' in $$props) $$invalidate(10, stream = $$props.stream);
    		if ('rounded' in $$props) $$invalidate(11, rounded = $$props.rounded);
    		if ('striped' in $$props) $$invalidate(12, striped = $$props.striped);
    		if ('style' in $$props) $$invalidate(13, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		klass,
    		value,
    		active,
    		indeterminate,
    		height,
    		backgroundColor,
    		backgroundOpacity,
    		color,
    		buffer,
    		reversed,
    		stream,
    		rounded,
    		striped,
    		style,
    		$$scope,
    		slots
    	];
    }

    class ProgressLinear extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			class: 0,
    			value: 1,
    			active: 2,
    			indeterminate: 3,
    			height: 4,
    			backgroundColor: 5,
    			backgroundOpacity: 6,
    			color: 7,
    			buffer: 8,
    			reversed: 9,
    			stream: 10,
    			rounded: 11,
    			striped: 12,
    			style: 13
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProgressLinear",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get class() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get indeterminate() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set indeterminate(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backgroundColor() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundColor(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backgroundOpacity() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundOpacity(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get buffer() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set buffer(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get reversed() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set reversed(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stream() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stream(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get striped() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set striped(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<ProgressLinear>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<ProgressLinear>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\Card\Card.svelte generated by Svelte v3.59.2 */
    const file$4 = "node_modules\\svelte-materialify\\dist\\components\\Card\\Card.svelte";
    const get_progress_slot_changes = dirty => ({});
    const get_progress_slot_context = ctx => ({});

    // (31:2) {#if loading}
    function create_if_block$1(ctx) {
    	let current;
    	const progress_slot_template = /*#slots*/ ctx[12].progress;
    	const progress_slot = create_slot(progress_slot_template, ctx, /*$$scope*/ ctx[11], get_progress_slot_context);
    	const progress_slot_or_fallback = progress_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			if (progress_slot_or_fallback) progress_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (progress_slot_or_fallback) {
    				progress_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (progress_slot) {
    				if (progress_slot.p && (!current || dirty & /*$$scope*/ 2048)) {
    					update_slot_base(
    						progress_slot,
    						progress_slot_template,
    						ctx,
    						/*$$scope*/ ctx[11],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[11])
    						: get_slot_changes(progress_slot_template, /*$$scope*/ ctx[11], dirty, get_progress_slot_changes),
    						get_progress_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progress_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progress_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (progress_slot_or_fallback) progress_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(31:2) {#if loading}",
    		ctx
    	});

    	return block;
    }

    // (32:26)        
    function fallback_block(ctx) {
    	let progresslinear;
    	let current;

    	progresslinear = new ProgressLinear({
    			props: { indeterminate: true },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(progresslinear.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(progresslinear, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progresslinear.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progresslinear.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(progresslinear, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(32:26)        ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div;
    	let t;
    	let div_class_value;
    	let current;
    	let if_block = /*loading*/ ctx[8] && create_if_block$1(ctx);
    	const default_slot_template = /*#slots*/ ctx[12].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-card " + /*klass*/ ctx[0]);
    			attr_dev(div, "style", /*style*/ ctx[10]);
    			toggle_class(div, "flat", /*flat*/ ctx[1]);
    			toggle_class(div, "tile", /*tile*/ ctx[2]);
    			toggle_class(div, "outlined", /*outlined*/ ctx[3]);
    			toggle_class(div, "raised", /*raised*/ ctx[4]);
    			toggle_class(div, "shaped", /*shaped*/ ctx[5]);
    			toggle_class(div, "hover", /*hover*/ ctx[6]);
    			toggle_class(div, "link", /*link*/ ctx[7]);
    			toggle_class(div, "disabled", /*disabled*/ ctx[9]);
    			add_location(div, file$4, 19, 0, 2223);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*loading*/ ctx[8]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*loading*/ 256) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2048)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[11],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[11])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[11], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-card " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*style*/ 1024) {
    				attr_dev(div, "style", /*style*/ ctx[10]);
    			}

    			if (!current || dirty & /*klass, flat*/ 3) {
    				toggle_class(div, "flat", /*flat*/ ctx[1]);
    			}

    			if (!current || dirty & /*klass, tile*/ 5) {
    				toggle_class(div, "tile", /*tile*/ ctx[2]);
    			}

    			if (!current || dirty & /*klass, outlined*/ 9) {
    				toggle_class(div, "outlined", /*outlined*/ ctx[3]);
    			}

    			if (!current || dirty & /*klass, raised*/ 17) {
    				toggle_class(div, "raised", /*raised*/ ctx[4]);
    			}

    			if (!current || dirty & /*klass, shaped*/ 33) {
    				toggle_class(div, "shaped", /*shaped*/ ctx[5]);
    			}

    			if (!current || dirty & /*klass, hover*/ 65) {
    				toggle_class(div, "hover", /*hover*/ ctx[6]);
    			}

    			if (!current || dirty & /*klass, link*/ 129) {
    				toggle_class(div, "link", /*link*/ ctx[7]);
    			}

    			if (!current || dirty & /*klass, disabled*/ 513) {
    				toggle_class(div, "disabled", /*disabled*/ ctx[9]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Card', slots, ['progress','default']);
    	let { class: klass = '' } = $$props;
    	let { flat = false } = $$props;
    	let { tile = false } = $$props;
    	let { outlined = false } = $$props;
    	let { raised = false } = $$props;
    	let { shaped = false } = $$props;
    	let { hover = false } = $$props;
    	let { link = false } = $$props;
    	let { loading = false } = $$props;
    	let { disabled = false } = $$props;
    	let { style = null } = $$props;

    	const writable_props = [
    		'class',
    		'flat',
    		'tile',
    		'outlined',
    		'raised',
    		'shaped',
    		'hover',
    		'link',
    		'loading',
    		'disabled',
    		'style'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('class' in $$props) $$invalidate(0, klass = $$props.class);
    		if ('flat' in $$props) $$invalidate(1, flat = $$props.flat);
    		if ('tile' in $$props) $$invalidate(2, tile = $$props.tile);
    		if ('outlined' in $$props) $$invalidate(3, outlined = $$props.outlined);
    		if ('raised' in $$props) $$invalidate(4, raised = $$props.raised);
    		if ('shaped' in $$props) $$invalidate(5, shaped = $$props.shaped);
    		if ('hover' in $$props) $$invalidate(6, hover = $$props.hover);
    		if ('link' in $$props) $$invalidate(7, link = $$props.link);
    		if ('loading' in $$props) $$invalidate(8, loading = $$props.loading);
    		if ('disabled' in $$props) $$invalidate(9, disabled = $$props.disabled);
    		if ('style' in $$props) $$invalidate(10, style = $$props.style);
    		if ('$$scope' in $$props) $$invalidate(11, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		ProgressLinear,
    		klass,
    		flat,
    		tile,
    		outlined,
    		raised,
    		shaped,
    		hover,
    		link,
    		loading,
    		disabled,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ('klass' in $$props) $$invalidate(0, klass = $$props.klass);
    		if ('flat' in $$props) $$invalidate(1, flat = $$props.flat);
    		if ('tile' in $$props) $$invalidate(2, tile = $$props.tile);
    		if ('outlined' in $$props) $$invalidate(3, outlined = $$props.outlined);
    		if ('raised' in $$props) $$invalidate(4, raised = $$props.raised);
    		if ('shaped' in $$props) $$invalidate(5, shaped = $$props.shaped);
    		if ('hover' in $$props) $$invalidate(6, hover = $$props.hover);
    		if ('link' in $$props) $$invalidate(7, link = $$props.link);
    		if ('loading' in $$props) $$invalidate(8, loading = $$props.loading);
    		if ('disabled' in $$props) $$invalidate(9, disabled = $$props.disabled);
    		if ('style' in $$props) $$invalidate(10, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		klass,
    		flat,
    		tile,
    		outlined,
    		raised,
    		shaped,
    		hover,
    		link,
    		loading,
    		disabled,
    		style,
    		$$scope,
    		slots
    	];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			class: 0,
    			flat: 1,
    			tile: 2,
    			outlined: 3,
    			raised: 4,
    			shaped: 5,
    			hover: 6,
    			link: 7,
    			loading: 8,
    			disabled: 9,
    			style: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get class() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flat() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flat(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tile() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tile(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get raised() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set raised(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get shaped() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shaped(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hover() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hover(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get link() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loading() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loading(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\Card\CardText.svelte generated by Svelte v3.59.2 */

    const file$3 = "node_modules\\svelte-materialify\\dist\\components\\Card\\CardText.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-card-text " + /*klass*/ ctx[0]);
    			attr_dev(div, "style", /*style*/ ctx[1]);
    			add_location(div, file$3, 8, 0, 316);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-card-text " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*style*/ 2) {
    				attr_dev(div, "style", /*style*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CardText', slots, ['default']);
    	let { class: klass = '' } = $$props;
    	let { style = null } = $$props;
    	const writable_props = ['class', 'style'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CardText> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('class' in $$props) $$invalidate(0, klass = $$props.class);
    		if ('style' in $$props) $$invalidate(1, style = $$props.style);
    		if ('$$scope' in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ klass, style });

    	$$self.$inject_state = $$props => {
    		if ('klass' in $$props) $$invalidate(0, klass = $$props.klass);
    		if ('style' in $$props) $$invalidate(1, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [klass, style, $$scope, slots];
    }

    class CardText extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { class: 0, style: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CardText",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get class() {
    		throw new Error("<CardText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<CardText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<CardText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<CardText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis
    function getGlobal() {
      if (typeof globalThis !== 'undefined') {
        return globalThis;
      }
      if (typeof self !== 'undefined') {
        return self;
      }
      if (typeof window !== 'undefined') {
        return window;
      }
      if (typeof global !== 'undefined') {
        return global;
      }
    }
    function getDevTools() {
      const w = getGlobal();
      if (!!w.__xstate__) {
        return w.__xstate__;
      }
      return undefined;
    }
    const devToolsAdapter = service => {
      if (typeof window === 'undefined') {
        return;
      }
      const devTools = getDevTools();
      if (devTools) {
        devTools.register(service);
      }
    };

    class Mailbox {
      constructor(_process) {
        this._process = _process;
        this._active = false;
        this._current = null;
        this._last = null;
      }
      start() {
        this._active = true;
        this.flush();
      }
      clear() {
        // we can't set _current to null because we might be currently processing
        // and enqueue following clear shouldnt start processing the enqueued item immediately
        if (this._current) {
          this._current.next = null;
          this._last = this._current;
        }
      }
      enqueue(event) {
        const enqueued = {
          value: event,
          next: null
        };
        if (this._current) {
          this._last.next = enqueued;
          this._last = enqueued;
          return;
        }
        this._current = enqueued;
        this._last = enqueued;
        if (this._active) {
          this.flush();
        }
      }
      flush() {
        while (this._current) {
          // atm the given _process is responsible for implementing proper try/catch handling
          // we assume here that this won't throw in a way that can affect this mailbox
          const consumed = this._current;
          this._process(consumed.value);
          this._current = consumed.next;
        }
        this._last = null;
      }
    }

    const STATE_DELIMITER = '.';
    const TARGETLESS_KEY = '';
    const NULL_EVENT = '';
    const STATE_IDENTIFIER$1 = '#';
    const WILDCARD = '*';
    const XSTATE_INIT = 'xstate.init';
    const XSTATE_STOP = 'xstate.stop';

    /**
     * Returns an event that represents an implicit event that
     * is sent after the specified `delay`.
     *
     * @param delayRef The delay in milliseconds
     * @param id The state node ID where this event is handled
     */
    function createAfterEvent(delayRef, id) {
      return {
        type: `xstate.after.${delayRef}.${id}`
      };
    }

    /**
     * Returns an event that represents that a final state node
     * has been reached in the parent state node.
     *
     * @param id The final state node's parent state node `id`
     * @param output The data to pass into the event
     */
    function createDoneStateEvent(id, output) {
      return {
        type: `xstate.done.state.${id}`,
        output
      };
    }

    /**
     * Returns an event that represents that an invoked service has terminated.
     *
     * An invoked service is terminated when it has reached a top-level final state node,
     * but not when it is canceled.
     *
     * @param invokeId The invoked service ID
     * @param output The data to pass into the event
     */
    function createDoneActorEvent(invokeId, output) {
      return {
        type: `xstate.done.actor.${invokeId}`,
        output
      };
    }
    function createErrorActorEvent(id, error) {
      return {
        type: `xstate.error.actor.${id}`,
        error
      };
    }
    function createInitEvent(input) {
      return {
        type: XSTATE_INIT,
        input
      };
    }

    /**
     * This function makes sure that unhandled errors are thrown in a separate macrotask.
     * It allows those errors to be detected by global error handlers and reported to bug tracking services
     * without interrupting our own stack of execution.
     *
     * @param err error to be thrown
     */
    function reportUnhandledError(err) {
      setTimeout(() => {
        throw err;
      });
    }

    const symbolObservable = (() => typeof Symbol === 'function' && Symbol.observable || '@@observable')();

    function createScheduledEventId(actorRef, id) {
      return `${actorRef.sessionId}.${id}`;
    }
    let idCounter = 0;
    function createSystem(rootActor, options) {
      const children = new Map();
      const keyedActors = new Map();
      const reverseKeyedActors = new WeakMap();
      const inspectionObservers = new Set();
      const timerMap = {};
      const clock = options.clock;
      const scheduler = {
        schedule: (source, target, event, delay, id = Math.random().toString(36).slice(2)) => {
          const scheduledEvent = {
            source,
            target,
            event,
            delay,
            id,
            startedAt: Date.now()
          };
          const scheduledEventId = createScheduledEventId(source, id);
          system._snapshot._scheduledEvents[scheduledEventId] = scheduledEvent;
          const timeout = clock.setTimeout(() => {
            delete timerMap[scheduledEventId];
            delete system._snapshot._scheduledEvents[scheduledEventId];
            system._relay(source, target, event);
          }, delay);
          timerMap[scheduledEventId] = timeout;
        },
        cancel: (source, id) => {
          const scheduledEventId = createScheduledEventId(source, id);
          const timeout = timerMap[scheduledEventId];
          delete timerMap[scheduledEventId];
          delete system._snapshot._scheduledEvents[scheduledEventId];
          clock.clearTimeout(timeout);
        },
        cancelAll: actorRef => {
          for (const scheduledEventId in system._snapshot._scheduledEvents) {
            const scheduledEvent = system._snapshot._scheduledEvents[scheduledEventId];
            if (scheduledEvent.source === actorRef) {
              scheduler.cancel(actorRef, scheduledEvent.id);
            }
          }
        }
      };
      const sendInspectionEvent = event => {
        if (!inspectionObservers.size) {
          return;
        }
        const resolvedInspectionEvent = {
          ...event,
          rootId: rootActor.sessionId
        };
        inspectionObservers.forEach(observer => observer.next?.(resolvedInspectionEvent));
      };
      const system = {
        _snapshot: {
          _scheduledEvents: (options?.snapshot && options.snapshot.scheduler) ?? {}
        },
        _bookId: () => `x:${idCounter++}`,
        _register: (sessionId, actorRef) => {
          children.set(sessionId, actorRef);
          return sessionId;
        },
        _unregister: actorRef => {
          children.delete(actorRef.sessionId);
          const systemId = reverseKeyedActors.get(actorRef);
          if (systemId !== undefined) {
            keyedActors.delete(systemId);
            reverseKeyedActors.delete(actorRef);
          }
        },
        get: systemId => {
          return keyedActors.get(systemId);
        },
        _set: (systemId, actorRef) => {
          const existing = keyedActors.get(systemId);
          if (existing && existing !== actorRef) {
            throw new Error(`Actor with system ID '${systemId}' already exists.`);
          }
          keyedActors.set(systemId, actorRef);
          reverseKeyedActors.set(actorRef, systemId);
        },
        inspect: observer => {
          inspectionObservers.add(observer);
        },
        _sendInspectionEvent: sendInspectionEvent,
        _relay: (source, target, event) => {
          system._sendInspectionEvent({
            type: '@xstate.event',
            sourceRef: source,
            actorRef: target,
            event
          });
          target._send(event);
        },
        scheduler,
        getSnapshot: () => {
          return {
            _scheduledEvents: {
              ...system._snapshot._scheduledEvents
            }
          };
        },
        start: () => {
          const scheduledEvents = system._snapshot._scheduledEvents;
          system._snapshot._scheduledEvents = {};
          for (const scheduledId in scheduledEvents) {
            const {
              source,
              target,
              event,
              delay,
              id
            } = scheduledEvents[scheduledId];
            scheduler.schedule(source, target, event, delay, id);
          }
        }
      };
      return system;
    }

    function matchesState(parentStateId, childStateId) {
      const parentStateValue = toStateValue(parentStateId);
      const childStateValue = toStateValue(childStateId);
      if (typeof childStateValue === 'string') {
        if (typeof parentStateValue === 'string') {
          return childStateValue === parentStateValue;
        }

        // Parent more specific than child
        return false;
      }
      if (typeof parentStateValue === 'string') {
        return parentStateValue in childStateValue;
      }
      return Object.keys(parentStateValue).every(key => {
        if (!(key in childStateValue)) {
          return false;
        }
        return matchesState(parentStateValue[key], childStateValue[key]);
      });
    }
    function toStatePath(stateId) {
      if (isArray(stateId)) {
        return stateId;
      }
      let result = [];
      let segment = '';
      for (let i = 0; i < stateId.length; i++) {
        const char = stateId.charCodeAt(i);
        switch (char) {
          // \
          case 92:
            // consume the next character
            segment += stateId[i + 1];
            // and skip over it
            i++;
            continue;
          // .
          case 46:
            result.push(segment);
            segment = '';
            continue;
        }
        segment += stateId[i];
      }
      result.push(segment);
      return result;
    }
    function toStateValue(stateValue) {
      if (isMachineSnapshot(stateValue)) {
        return stateValue.value;
      }
      if (typeof stateValue !== 'string') {
        return stateValue;
      }
      const statePath = toStatePath(stateValue);
      return pathToStateValue(statePath);
    }
    function pathToStateValue(statePath) {
      if (statePath.length === 1) {
        return statePath[0];
      }
      const value = {};
      let marker = value;
      for (let i = 0; i < statePath.length - 1; i++) {
        if (i === statePath.length - 2) {
          marker[statePath[i]] = statePath[i + 1];
        } else {
          const previous = marker;
          marker = {};
          previous[statePath[i]] = marker;
        }
      }
      return value;
    }
    function mapValues(collection, iteratee) {
      const result = {};
      const collectionKeys = Object.keys(collection);
      for (let i = 0; i < collectionKeys.length; i++) {
        const key = collectionKeys[i];
        result[key] = iteratee(collection[key], key, collection, i);
      }
      return result;
    }
    function toArrayStrict(value) {
      if (isArray(value)) {
        return value;
      }
      return [value];
    }
    function toArray(value) {
      if (value === undefined) {
        return [];
      }
      return toArrayStrict(value);
    }
    function resolveOutput(mapper, context, event, self) {
      if (typeof mapper === 'function') {
        return mapper({
          context,
          event,
          self
        });
      }
      return mapper;
    }
    function isArray(value) {
      return Array.isArray(value);
    }
    function isErrorActorEvent(event) {
      return event.type.startsWith('xstate.error.actor');
    }
    function toTransitionConfigArray(configLike) {
      return toArrayStrict(configLike).map(transitionLike => {
        if (typeof transitionLike === 'undefined' || typeof transitionLike === 'string') {
          return {
            target: transitionLike
          };
        }
        return transitionLike;
      });
    }
    function normalizeTarget(target) {
      if (target === undefined || target === TARGETLESS_KEY) {
        return undefined;
      }
      return toArray(target);
    }
    function toObserver(nextHandler, errorHandler, completionHandler) {
      const isObserver = typeof nextHandler === 'object';
      const self = isObserver ? nextHandler : undefined;
      return {
        next: (isObserver ? nextHandler.next : nextHandler)?.bind(self),
        error: (isObserver ? nextHandler.error : errorHandler)?.bind(self),
        complete: (isObserver ? nextHandler.complete : completionHandler)?.bind(self)
      };
    }
    function createInvokeId(stateNodeId, index) {
      return `${index}.${stateNodeId}`;
    }
    function resolveReferencedActor(machine, src) {
      const match = src.match(/^xstate\.invoke\.(\d+)\.(.*)/);
      if (!match) {
        return machine.implementations.actors[src];
      }
      const [, indexStr, nodeId] = match;
      const node = machine.getStateNodeById(nodeId);
      const invokeConfig = node.config.invoke;
      return (Array.isArray(invokeConfig) ? invokeConfig[indexStr] : invokeConfig).src;
    }

    const $$ACTOR_TYPE = 1;
    // those values are currently used by @xstate/react directly so it's important to keep the assigned values in sync
    let ProcessingStatus = /*#__PURE__*/function (ProcessingStatus) {
      ProcessingStatus[ProcessingStatus["NotStarted"] = 0] = "NotStarted";
      ProcessingStatus[ProcessingStatus["Running"] = 1] = "Running";
      ProcessingStatus[ProcessingStatus["Stopped"] = 2] = "Stopped";
      return ProcessingStatus;
    }({});
    const defaultOptions = {
      clock: {
        setTimeout: (fn, ms) => {
          return setTimeout(fn, ms);
        },
        clearTimeout: id => {
          return clearTimeout(id);
        }
      },
      logger: console.log.bind(console),
      devTools: false
    };

    /**
     * An Actor is a running process that can receive events, send events and change its behavior based on the events it receives, which can cause effects outside of the actor. When you run a state machine, it becomes an actor.
     */
    class Actor {
      /**
       * Creates a new actor instance for the given logic with the provided options, if any.
       *
       * @param logic The logic to create an actor from
       * @param options Actor options
       */
      constructor(logic, options) {
        this.logic = logic;
        /**
         * The current internal state of the actor.
         */
        this._snapshot = void 0;
        /**
         * The clock that is responsible for setting and clearing timeouts, such as delayed events and transitions.
         */
        this.clock = void 0;
        this.options = void 0;
        /**
         * The unique identifier for this actor relative to its parent.
         */
        this.id = void 0;
        this.mailbox = new Mailbox(this._process.bind(this));
        this.observers = new Set();
        this.eventListeners = new Map();
        this.logger = void 0;
        /** @internal */
        this._processingStatus = ProcessingStatus.NotStarted;
        // Actor Ref
        this._parent = void 0;
        /** @internal */
        this._syncSnapshot = void 0;
        this.ref = void 0;
        // TODO: add typings for system
        this._actorScope = void 0;
        this._systemId = void 0;
        /**
         * The globally unique process ID for this invocation.
         */
        this.sessionId = void 0;
        /**
         * The system to which this actor belongs.
         */
        this.system = void 0;
        this._doneEvent = void 0;
        this.src = void 0;
        // array of functions to defer
        this._deferred = [];
        const resolvedOptions = {
          ...defaultOptions,
          ...options
        };
        const {
          clock,
          logger,
          parent,
          syncSnapshot,
          id,
          systemId,
          inspect
        } = resolvedOptions;
        this.system = parent ? parent.system : createSystem(this, {
          clock
        });
        if (inspect && !parent) {
          // Always inspect at the system-level
          this.system.inspect(toObserver(inspect));
        }
        this.sessionId = this.system._bookId();
        this.id = id ?? this.sessionId;
        this.logger = logger;
        this.clock = clock;
        this._parent = parent;
        this._syncSnapshot = syncSnapshot;
        this.options = resolvedOptions;
        this.src = resolvedOptions.src ?? logic;
        this.ref = this;
        this._actorScope = {
          self: this,
          id: this.id,
          sessionId: this.sessionId,
          logger: this.logger,
          defer: fn => {
            this._deferred.push(fn);
          },
          system: this.system,
          stopChild: child => {
            if (child._parent !== this) {
              throw new Error(`Cannot stop child actor ${child.id} of ${this.id} because it is not a child`);
            }
            child._stop();
          },
          emit: emittedEvent => {
            const listeners = this.eventListeners.get(emittedEvent.type);
            if (!listeners) {
              return;
            }
            for (const handler of Array.from(listeners)) {
              handler(emittedEvent);
            }
          }
        };

        // Ensure that the send method is bound to this Actor instance
        // if destructured
        this.send = this.send.bind(this);
        this.system._sendInspectionEvent({
          type: '@xstate.actor',
          actorRef: this
        });
        if (systemId) {
          this._systemId = systemId;
          this.system._set(systemId, this);
        }
        this._initState(options?.snapshot ?? options?.state);
        if (systemId && this._snapshot.status !== 'active') {
          this.system._unregister(this);
        }
      }
      _initState(persistedState) {
        try {
          this._snapshot = persistedState ? this.logic.restoreSnapshot ? this.logic.restoreSnapshot(persistedState, this._actorScope) : persistedState : this.logic.getInitialSnapshot(this._actorScope, this.options?.input);
        } catch (err) {
          // if we get here then it means that we assign a value to this._snapshot that is not of the correct type
          // we can't get the true `TSnapshot & { status: 'error'; }`, it's impossible
          // so right now this is a lie of sorts
          this._snapshot = {
            status: 'error',
            output: undefined,
            error: err
          };
        }
      }
      update(snapshot, event) {
        // Update state
        this._snapshot = snapshot;

        // Execute deferred effects
        let deferredFn;
        while (deferredFn = this._deferred.shift()) {
          try {
            deferredFn();
          } catch (err) {
            // this error can only be caught when executing *initial* actions
            // it's the only time when we call actions provided by the user through those deferreds
            // when the actor is already running we always execute them synchronously while transitioning
            // no "builtin deferred" should actually throw an error since they are either safe
            // or the control flow is passed through the mailbox and errors should be caught by the `_process` used by the mailbox
            this._deferred.length = 0;
            this._snapshot = {
              ...snapshot,
              status: 'error',
              error: err
            };
          }
        }
        switch (this._snapshot.status) {
          case 'active':
            for (const observer of this.observers) {
              try {
                observer.next?.(snapshot);
              } catch (err) {
                reportUnhandledError(err);
              }
            }
            break;
          case 'done':
            // next observers are meant to be notified about done snapshots
            // this can be seen as something that is different from how observable work
            // but with observables `complete` callback is called without any arguments
            // it's more ergonomic for XState to treat a done snapshot as a "next" value
            // and the completion event as something that is separate,
            // something that merely follows emitting that done snapshot
            for (const observer of this.observers) {
              try {
                observer.next?.(snapshot);
              } catch (err) {
                reportUnhandledError(err);
              }
            }
            this._stopProcedure();
            this._complete();
            this._doneEvent = createDoneActorEvent(this.id, this._snapshot.output);
            if (this._parent) {
              this.system._relay(this, this._parent, this._doneEvent);
            }
            break;
          case 'error':
            this._error(this._snapshot.error);
            break;
        }
        this.system._sendInspectionEvent({
          type: '@xstate.snapshot',
          actorRef: this,
          event,
          snapshot
        });
      }

      /**
       * Subscribe an observer to an actor’s snapshot values.
       *
       * @remarks
       * The observer will receive the actor’s snapshot value when it is emitted. The observer can be:
       * - A plain function that receives the latest snapshot, or
       * - An observer object whose `.next(snapshot)` method receives the latest snapshot
       *
       * @example
       * ```ts
       * // Observer as a plain function
       * const subscription = actor.subscribe((snapshot) => {
       *   console.log(snapshot);
       * });
       * ```
       *
       * @example
       * ```ts
       * // Observer as an object
       * const subscription = actor.subscribe({
       *   next(snapshot) {
       *     console.log(snapshot);
       *   },
       *   error(err) {
       *     // ...
       *   },
       *   complete() {
       *     // ...
       *   },
       * });
       * ```
       *
       * The return value of `actor.subscribe(observer)` is a subscription object that has an `.unsubscribe()` method. You can call `subscription.unsubscribe()` to unsubscribe the observer:
       *
       * @example
       * ```ts
       * const subscription = actor.subscribe((snapshot) => {
       *   // ...
       * });
       *
       * // Unsubscribe the observer
       * subscription.unsubscribe();
       * ```
       *
       * When the actor is stopped, all of its observers will automatically be unsubscribed.
       *
       * @param observer - Either a plain function that receives the latest snapshot, or an observer object whose `.next(snapshot)` method receives the latest snapshot
       */

      subscribe(nextListenerOrObserver, errorListener, completeListener) {
        const observer = toObserver(nextListenerOrObserver, errorListener, completeListener);
        if (this._processingStatus !== ProcessingStatus.Stopped) {
          this.observers.add(observer);
        } else {
          switch (this._snapshot.status) {
            case 'done':
              try {
                observer.complete?.();
              } catch (err) {
                reportUnhandledError(err);
              }
              break;
            case 'error':
              {
                const err = this._snapshot.error;
                if (!observer.error) {
                  reportUnhandledError(err);
                } else {
                  try {
                    observer.error(err);
                  } catch (err) {
                    reportUnhandledError(err);
                  }
                }
                break;
              }
          }
        }
        return {
          unsubscribe: () => {
            this.observers.delete(observer);
          }
        };
      }
      on(type, handler) {
        let listeners = this.eventListeners.get(type);
        if (!listeners) {
          listeners = new Set();
          this.eventListeners.set(type, listeners);
        }
        const wrappedHandler = handler.bind(undefined);
        listeners.add(wrappedHandler);
        return {
          unsubscribe: () => {
            listeners.delete(wrappedHandler);
          }
        };
      }

      /**
       * Starts the Actor from the initial state
       */
      start() {
        if (this._processingStatus === ProcessingStatus.Running) {
          // Do not restart the service if it is already started
          return this;
        }
        if (this._syncSnapshot) {
          this.subscribe({
            next: snapshot => {
              if (snapshot.status === 'active') {
                this.system._relay(this, this._parent, {
                  type: `xstate.snapshot.${this.id}`,
                  snapshot
                });
              }
            },
            error: () => {}
          });
        }
        this.system._register(this.sessionId, this);
        if (this._systemId) {
          this.system._set(this._systemId, this);
        }
        this._processingStatus = ProcessingStatus.Running;

        // TODO: this isn't correct when rehydrating
        const initEvent = createInitEvent(this.options.input);
        this.system._sendInspectionEvent({
          type: '@xstate.event',
          sourceRef: this._parent,
          actorRef: this,
          event: initEvent
        });
        const status = this._snapshot.status;
        switch (status) {
          case 'done':
            // a state machine can be "done" upon initialization (it could reach a final state using initial microsteps)
            // we still need to complete observers, flush deferreds etc
            this.update(this._snapshot, initEvent);
            // TODO: rethink cleanup of observers, mailbox, etc
            return this;
          case 'error':
            this._error(this._snapshot.error);
            return this;
        }
        if (!this._parent) {
          this.system.start();
        }
        if (this.logic.start) {
          try {
            this.logic.start(this._snapshot, this._actorScope);
          } catch (err) {
            this._snapshot = {
              ...this._snapshot,
              status: 'error',
              error: err
            };
            this._error(err);
            return this;
          }
        }

        // TODO: this notifies all subscribers but usually this is redundant
        // there is no real change happening here
        // we need to rethink if this needs to be refactored
        this.update(this._snapshot, initEvent);
        if (this.options.devTools) {
          this.attachDevTools();
        }
        this.mailbox.start();
        return this;
      }
      _process(event) {
        let nextState;
        let caughtError;
        try {
          nextState = this.logic.transition(this._snapshot, event, this._actorScope);
        } catch (err) {
          // we wrap it in a box so we can rethrow it later even if falsy value gets caught here
          caughtError = {
            err
          };
        }
        if (caughtError) {
          const {
            err
          } = caughtError;
          this._snapshot = {
            ...this._snapshot,
            status: 'error',
            error: err
          };
          this._error(err);
          return;
        }
        this.update(nextState, event);
        if (event.type === XSTATE_STOP) {
          this._stopProcedure();
          this._complete();
        }
      }
      _stop() {
        if (this._processingStatus === ProcessingStatus.Stopped) {
          return this;
        }
        this.mailbox.clear();
        if (this._processingStatus === ProcessingStatus.NotStarted) {
          this._processingStatus = ProcessingStatus.Stopped;
          return this;
        }
        this.mailbox.enqueue({
          type: XSTATE_STOP
        });
        return this;
      }

      /**
       * Stops the Actor and unsubscribe all listeners.
       */
      stop() {
        if (this._parent) {
          throw new Error('A non-root actor cannot be stopped directly.');
        }
        return this._stop();
      }
      _complete() {
        for (const observer of this.observers) {
          try {
            observer.complete?.();
          } catch (err) {
            reportUnhandledError(err);
          }
        }
        this.observers.clear();
      }
      _reportError(err) {
        if (!this.observers.size) {
          if (!this._parent) {
            reportUnhandledError(err);
          }
          return;
        }
        let reportError = false;
        for (const observer of this.observers) {
          const errorListener = observer.error;
          reportError ||= !errorListener;
          try {
            errorListener?.(err);
          } catch (err2) {
            reportUnhandledError(err2);
          }
        }
        this.observers.clear();
        if (reportError) {
          reportUnhandledError(err);
        }
      }
      _error(err) {
        this._stopProcedure();
        this._reportError(err);
        if (this._parent) {
          this.system._relay(this, this._parent, createErrorActorEvent(this.id, err));
        }
      }
      // TODO: atm children don't belong entirely to the actor so
      // in a way - it's not even super aware of them
      // so we can't stop them from here but we really should!
      // right now, they are being stopped within the machine's transition
      // but that could throw and leave us with "orphaned" active actors
      _stopProcedure() {
        if (this._processingStatus !== ProcessingStatus.Running) {
          // Actor already stopped; do nothing
          return this;
        }

        // Cancel all delayed events
        this.system.scheduler.cancelAll(this);

        // TODO: mailbox.reset
        this.mailbox.clear();
        // TODO: after `stop` we must prepare ourselves for receiving events again
        // events sent *after* stop signal must be queued
        // it seems like this should be the common behavior for all of our consumers
        // so perhaps this should be unified somehow for all of them
        this.mailbox = new Mailbox(this._process.bind(this));
        this._processingStatus = ProcessingStatus.Stopped;
        this.system._unregister(this);
        return this;
      }

      /**
       * @internal
       */
      _send(event) {
        if (this._processingStatus === ProcessingStatus.Stopped) {
          return;
        }
        this.mailbox.enqueue(event);
      }

      /**
       * Sends an event to the running Actor to trigger a transition.
       *
       * @param event The event to send
       */
      send(event) {
        this.system._relay(undefined, this, event);
      }
      attachDevTools() {
        const {
          devTools
        } = this.options;
        if (devTools) {
          const resolvedDevToolsAdapter = typeof devTools === 'function' ? devTools : devToolsAdapter;
          resolvedDevToolsAdapter(this);
        }
      }
      toJSON() {
        return {
          xstate$$type: $$ACTOR_TYPE,
          id: this.id
        };
      }

      /**
       * Obtain the internal state of the actor, which can be persisted.
       *
       * @remarks
       * The internal state can be persisted from any actor, not only machines.
       *
       * Note that the persisted state is not the same as the snapshot from {@link Actor.getSnapshot}. Persisted state represents the internal state of the actor, while snapshots represent the actor's last emitted value.
       *
       * Can be restored with {@link ActorOptions.state}
       *
       * @see https://stately.ai/docs/persistence
       */

      getPersistedSnapshot(options) {
        return this.logic.getPersistedSnapshot(this._snapshot, options);
      }
      [symbolObservable]() {
        return this;
      }

      /**
       * Read an actor’s snapshot synchronously.
       *
       * @remarks
       * The snapshot represent an actor's last emitted value.
       *
       * When an actor receives an event, its internal state may change.
       * An actor may emit a snapshot when a state transition occurs.
       *
       * Note that some actors, such as callback actors generated with `fromCallback`, will not emit snapshots.
       *
       * @see {@link Actor.subscribe} to subscribe to an actor’s snapshot values.
       * @see {@link Actor.getPersistedSnapshot} to persist the internal state of an actor (which is more than just a snapshot).
       */
      getSnapshot() {
        return this._snapshot;
      }
    }
    /**
     * Creates a new actor instance for the given actor logic with the provided options, if any.
     *
     * @remarks
     * When you create an actor from actor logic via `createActor(logic)`, you implicitly create an actor system where the created actor is the root actor.
     * Any actors spawned from this root actor and its descendants are part of that actor system.
     *
     * @example
     * ```ts
     * import { createActor } from 'xstate';
     * import { someActorLogic } from './someActorLogic.ts';
     *
     * // Creating the actor, which implicitly creates an actor system with itself as the root actor
     * const actor = createActor(someActorLogic);
     *
     * actor.subscribe((snapshot) => {
     *   console.log(snapshot);
     * });
     *
     * // Actors must be started by calling `actor.start()`, which will also start the actor system.
     * actor.start();
     *
     * // Actors can receive events
     * actor.send({ type: 'someEvent' });
     *
     * // You can stop root actors by calling `actor.stop()`, which will also stop the actor system and all actors in that system.
     * actor.stop();
     * ```
     *
     * @param logic - The actor logic to create an actor from. For a state machine actor logic creator, see {@link createMachine}. Other actor logic creators include {@link fromCallback}, {@link fromEventObservable}, {@link fromObservable}, {@link fromPromise}, and {@link fromTransition}.
     * @param options - Actor options
     */
    function createActor(logic, ...[options]) {
      return new Actor(logic, options);
    }

    /**
     * @deprecated Use `Actor` instead.
     */

    function resolveCancel(_, snapshot, actionArgs, actionParams, {
      sendId
    }) {
      const resolvedSendId = typeof sendId === 'function' ? sendId(actionArgs, actionParams) : sendId;
      return [snapshot, resolvedSendId];
    }
    function executeCancel(actorScope, resolvedSendId) {
      actorScope.defer(() => {
        actorScope.system.scheduler.cancel(actorScope.self, resolvedSendId);
      });
    }
    /**
     * Cancels a delayed `sendTo(...)` action that is waiting to be executed. The canceled `sendTo(...)` action
     * will not send its event or execute, unless the `delay` has already elapsed before `cancel(...)` is called.
     *
     * @param sendId The `id` of the `sendTo(...)` action to cancel.
     * 
     * @example
      ```ts
      import { createMachine, sendTo, cancel } from 'xstate';

      const machine = createMachine({
        // ...
        on: {
          sendEvent: {
            actions: sendTo('some-actor', { type: 'someEvent' }, {
              id: 'some-id',
              delay: 1000
            })
          },
          cancelEvent: {
            actions: cancel('some-id')
          }
        }
      });
      ```
     */
    function cancel(sendId) {
      function cancel(args, params) {
      }
      cancel.type = 'xstate.cancel';
      cancel.sendId = sendId;
      cancel.resolve = resolveCancel;
      cancel.execute = executeCancel;
      return cancel;
    }

    function resolveSpawn(actorScope, snapshot, actionArgs, _actionParams, {
      id,
      systemId,
      src,
      input,
      syncSnapshot
    }) {
      const logic = typeof src === 'string' ? resolveReferencedActor(snapshot.machine, src) : src;
      const resolvedId = typeof id === 'function' ? id(actionArgs) : id;
      let actorRef;
      if (logic) {
        actorRef = createActor(logic, {
          id: resolvedId,
          src,
          parent: actorScope.self,
          syncSnapshot,
          systemId,
          input: typeof input === 'function' ? input({
            context: snapshot.context,
            event: actionArgs.event,
            self: actorScope.self
          }) : input
        });
      }
      return [cloneMachineSnapshot(snapshot, {
        children: {
          ...snapshot.children,
          [resolvedId]: actorRef
        }
      }), {
        id,
        actorRef
      }];
    }
    function executeSpawn(actorScope, {
      id,
      actorRef
    }) {
      if (!actorRef) {
        return;
      }
      actorScope.defer(() => {
        if (actorRef._processingStatus === ProcessingStatus.Stopped) {
          return;
        }
        actorRef.start();
      });
    }
    function spawnChild(...[src, {
      id,
      systemId,
      input,
      syncSnapshot = false
    } = {}]) {
      function spawnChild(args, params) {
      }
      spawnChild.type = 'snapshot.spawnChild';
      spawnChild.id = id;
      spawnChild.systemId = systemId;
      spawnChild.src = src;
      spawnChild.input = input;
      spawnChild.syncSnapshot = syncSnapshot;
      spawnChild.resolve = resolveSpawn;
      spawnChild.execute = executeSpawn;
      return spawnChild;
    }

    function resolveStop(_, snapshot, args, actionParams, {
      actorRef
    }) {
      const actorRefOrString = typeof actorRef === 'function' ? actorRef(args, actionParams) : actorRef;
      const resolvedActorRef = typeof actorRefOrString === 'string' ? snapshot.children[actorRefOrString] : actorRefOrString;
      let children = snapshot.children;
      if (resolvedActorRef) {
        children = {
          ...children
        };
        delete children[resolvedActorRef.id];
      }
      return [cloneMachineSnapshot(snapshot, {
        children
      }), resolvedActorRef];
    }
    function executeStop(actorScope, actorRef) {
      if (!actorRef) {
        return;
      }

      // we need to eagerly unregister it here so a new actor with the same systemId can be registered immediately
      // since we defer actual stopping of the actor but we don't defer actor creations (and we can't do that)
      // this could throw on `systemId` collision, for example, when dealing with reentering transitions
      actorScope.system._unregister(actorRef);

      // this allows us to prevent an actor from being started if it gets stopped within the same macrostep
      // this can happen, for example, when the invoking state is being exited immediately by an always transition
      if (actorRef._processingStatus !== ProcessingStatus.Running) {
        actorScope.stopChild(actorRef);
        return;
      }
      // stopping a child enqueues a stop event in the child actor's mailbox
      // we need for all of the already enqueued events to be processed before we stop the child
      // the parent itself might want to send some events to a child (for example from exit actions on the invoking state)
      // and we don't want to ignore those events
      actorScope.defer(() => {
        actorScope.stopChild(actorRef);
      });
    }
    /**
     * Stops a child actor.
     *
     * @param actorRef The actor to stop.
     */
    function stopChild(actorRef) {
      function stop(args, params) {
      }
      stop.type = 'xstate.stopChild';
      stop.actorRef = actorRef;
      stop.resolve = resolveStop;
      stop.execute = executeStop;
      return stop;
    }

    // TODO: throw on cycles (depth check should be enough)
    function evaluateGuard(guard, context, event, snapshot) {
      const {
        machine
      } = snapshot;
      const isInline = typeof guard === 'function';
      const resolved = isInline ? guard : machine.implementations.guards[typeof guard === 'string' ? guard : guard.type];
      if (!isInline && !resolved) {
        throw new Error(`Guard '${typeof guard === 'string' ? guard : guard.type}' is not implemented.'.`);
      }
      if (typeof resolved !== 'function') {
        return evaluateGuard(resolved, context, event, snapshot);
      }
      const guardArgs = {
        context,
        event
      };
      const guardParams = isInline || typeof guard === 'string' ? undefined : 'params' in guard ? typeof guard.params === 'function' ? guard.params({
        context,
        event
      }) : guard.params : undefined;
      if (!('check' in resolved)) {
        // the existing type of `.guards` assumes non-nullable `TExpressionGuard`
        // inline guards expect `TExpressionGuard` to be set to `undefined`
        // it's fine to cast this here, our logic makes sure that we call those 2 "variants" correctly
        return resolved(guardArgs, guardParams);
      }
      const builtinGuard = resolved;
      return builtinGuard.check(snapshot, guardArgs, resolved // this holds all params
      );
    }

    const isAtomicStateNode = stateNode => stateNode.type === 'atomic' || stateNode.type === 'final';
    function getChildren(stateNode) {
      return Object.values(stateNode.states).filter(sn => sn.type !== 'history');
    }
    function getProperAncestors(stateNode, toStateNode) {
      const ancestors = [];
      if (toStateNode === stateNode) {
        return ancestors;
      }

      // add all ancestors
      let m = stateNode.parent;
      while (m && m !== toStateNode) {
        ancestors.push(m);
        m = m.parent;
      }
      return ancestors;
    }
    function getAllStateNodes(stateNodes) {
      const nodeSet = new Set(stateNodes);
      const adjList = getAdjList(nodeSet);

      // add descendants
      for (const s of nodeSet) {
        // if previously active, add existing child nodes
        if (s.type === 'compound' && (!adjList.get(s) || !adjList.get(s).length)) {
          getInitialStateNodesWithTheirAncestors(s).forEach(sn => nodeSet.add(sn));
        } else {
          if (s.type === 'parallel') {
            for (const child of getChildren(s)) {
              if (child.type === 'history') {
                continue;
              }
              if (!nodeSet.has(child)) {
                const initialStates = getInitialStateNodesWithTheirAncestors(child);
                for (const initialStateNode of initialStates) {
                  nodeSet.add(initialStateNode);
                }
              }
            }
          }
        }
      }

      // add all ancestors
      for (const s of nodeSet) {
        let m = s.parent;
        while (m) {
          nodeSet.add(m);
          m = m.parent;
        }
      }
      return nodeSet;
    }
    function getValueFromAdj(baseNode, adjList) {
      const childStateNodes = adjList.get(baseNode);
      if (!childStateNodes) {
        return {}; // todo: fix?
      }

      if (baseNode.type === 'compound') {
        const childStateNode = childStateNodes[0];
        if (childStateNode) {
          if (isAtomicStateNode(childStateNode)) {
            return childStateNode.key;
          }
        } else {
          return {};
        }
      }
      const stateValue = {};
      for (const childStateNode of childStateNodes) {
        stateValue[childStateNode.key] = getValueFromAdj(childStateNode, adjList);
      }
      return stateValue;
    }
    function getAdjList(stateNodes) {
      const adjList = new Map();
      for (const s of stateNodes) {
        if (!adjList.has(s)) {
          adjList.set(s, []);
        }
        if (s.parent) {
          if (!adjList.has(s.parent)) {
            adjList.set(s.parent, []);
          }
          adjList.get(s.parent).push(s);
        }
      }
      return adjList;
    }
    function getStateValue(rootNode, stateNodes) {
      const config = getAllStateNodes(stateNodes);
      return getValueFromAdj(rootNode, getAdjList(config));
    }
    function isInFinalState(stateNodeSet, stateNode) {
      if (stateNode.type === 'compound') {
        return getChildren(stateNode).some(s => s.type === 'final' && stateNodeSet.has(s));
      }
      if (stateNode.type === 'parallel') {
        return getChildren(stateNode).every(sn => isInFinalState(stateNodeSet, sn));
      }
      return stateNode.type === 'final';
    }
    const isStateId = str => str[0] === STATE_IDENTIFIER$1;
    function getCandidates(stateNode, receivedEventType) {
      const candidates = stateNode.transitions.get(receivedEventType) || [...stateNode.transitions.keys()].filter(eventDescriptor => {
        // check if transition is a wildcard transition,
        // which matches any non-transient events
        if (eventDescriptor === WILDCARD) {
          return true;
        }
        if (!eventDescriptor.endsWith('.*')) {
          return false;
        }
        const partialEventTokens = eventDescriptor.split('.');
        const eventTokens = receivedEventType.split('.');
        for (let tokenIndex = 0; tokenIndex < partialEventTokens.length; tokenIndex++) {
          const partialEventToken = partialEventTokens[tokenIndex];
          const eventToken = eventTokens[tokenIndex];
          if (partialEventToken === '*') {
            const isLastToken = tokenIndex === partialEventTokens.length - 1;
            return isLastToken;
          }
          if (partialEventToken !== eventToken) {
            return false;
          }
        }
        return true;
      }).sort((a, b) => b.length - a.length).flatMap(key => stateNode.transitions.get(key));
      return candidates;
    }

    /**
     * All delayed transitions from the config.
     */
    function getDelayedTransitions(stateNode) {
      const afterConfig = stateNode.config.after;
      if (!afterConfig) {
        return [];
      }
      const mutateEntryExit = (delay, i) => {
        const afterEvent = createAfterEvent(delay, stateNode.id);
        const eventType = afterEvent.type;
        stateNode.entry.push(raise(afterEvent, {
          id: eventType,
          delay
        }));
        stateNode.exit.push(cancel(eventType));
        return eventType;
      };
      const delayedTransitions = Object.keys(afterConfig).flatMap((delay, i) => {
        const configTransition = afterConfig[delay];
        const resolvedTransition = typeof configTransition === 'string' ? {
          target: configTransition
        } : configTransition;
        const resolvedDelay = Number.isNaN(+delay) ? delay : +delay;
        const eventType = mutateEntryExit(resolvedDelay);
        return toArray(resolvedTransition).map(transition => ({
          ...transition,
          event: eventType,
          delay: resolvedDelay
        }));
      });
      return delayedTransitions.map(delayedTransition => {
        const {
          delay
        } = delayedTransition;
        return {
          ...formatTransition(stateNode, delayedTransition.event, delayedTransition),
          delay
        };
      });
    }
    function formatTransition(stateNode, descriptor, transitionConfig) {
      const normalizedTarget = normalizeTarget(transitionConfig.target);
      const reenter = transitionConfig.reenter ?? false;
      const target = resolveTarget(stateNode, normalizedTarget);
      const transition = {
        ...transitionConfig,
        actions: toArray(transitionConfig.actions),
        guard: transitionConfig.guard,
        target,
        source: stateNode,
        reenter,
        eventType: descriptor,
        toJSON: () => ({
          ...transition,
          source: `#${stateNode.id}`,
          target: target ? target.map(t => `#${t.id}`) : undefined
        })
      };
      return transition;
    }
    function formatTransitions(stateNode) {
      const transitions = new Map();
      if (stateNode.config.on) {
        for (const descriptor of Object.keys(stateNode.config.on)) {
          if (descriptor === NULL_EVENT) {
            throw new Error('Null events ("") cannot be specified as a transition key. Use `always: { ... }` instead.');
          }
          const transitionsConfig = stateNode.config.on[descriptor];
          transitions.set(descriptor, toTransitionConfigArray(transitionsConfig).map(t => formatTransition(stateNode, descriptor, t)));
        }
      }
      if (stateNode.config.onDone) {
        const descriptor = `xstate.done.state.${stateNode.id}`;
        transitions.set(descriptor, toTransitionConfigArray(stateNode.config.onDone).map(t => formatTransition(stateNode, descriptor, t)));
      }
      for (const invokeDef of stateNode.invoke) {
        if (invokeDef.onDone) {
          const descriptor = `xstate.done.actor.${invokeDef.id}`;
          transitions.set(descriptor, toTransitionConfigArray(invokeDef.onDone).map(t => formatTransition(stateNode, descriptor, t)));
        }
        if (invokeDef.onError) {
          const descriptor = `xstate.error.actor.${invokeDef.id}`;
          transitions.set(descriptor, toTransitionConfigArray(invokeDef.onError).map(t => formatTransition(stateNode, descriptor, t)));
        }
        if (invokeDef.onSnapshot) {
          const descriptor = `xstate.snapshot.${invokeDef.id}`;
          transitions.set(descriptor, toTransitionConfigArray(invokeDef.onSnapshot).map(t => formatTransition(stateNode, descriptor, t)));
        }
      }
      for (const delayedTransition of stateNode.after) {
        let existing = transitions.get(delayedTransition.eventType);
        if (!existing) {
          existing = [];
          transitions.set(delayedTransition.eventType, existing);
        }
        existing.push(delayedTransition);
      }
      return transitions;
    }
    function formatInitialTransition(stateNode, _target) {
      const resolvedTarget = typeof _target === 'string' ? stateNode.states[_target] : _target ? stateNode.states[_target.target] : undefined;
      if (!resolvedTarget && _target) {
        throw new Error(`Initial state node "${_target}" not found on parent state node #${stateNode.id}`);
      }
      const transition = {
        source: stateNode,
        actions: !_target || typeof _target === 'string' ? [] : toArray(_target.actions),
        eventType: null,
        reenter: false,
        target: resolvedTarget ? [resolvedTarget] : [],
        toJSON: () => ({
          ...transition,
          source: `#${stateNode.id}`,
          target: resolvedTarget ? [`#${resolvedTarget.id}`] : []
        })
      };
      return transition;
    }
    function resolveTarget(stateNode, targets) {
      if (targets === undefined) {
        // an undefined target signals that the state node should not transition from that state when receiving that event
        return undefined;
      }
      return targets.map(target => {
        if (typeof target !== 'string') {
          return target;
        }
        if (isStateId(target)) {
          return stateNode.machine.getStateNodeById(target);
        }
        const isInternalTarget = target[0] === STATE_DELIMITER;
        // If internal target is defined on machine,
        // do not include machine key on target
        if (isInternalTarget && !stateNode.parent) {
          return getStateNodeByPath(stateNode, target.slice(1));
        }
        const resolvedTarget = isInternalTarget ? stateNode.key + target : target;
        if (stateNode.parent) {
          try {
            const targetStateNode = getStateNodeByPath(stateNode.parent, resolvedTarget);
            return targetStateNode;
          } catch (err) {
            throw new Error(`Invalid transition definition for state node '${stateNode.id}':\n${err.message}`);
          }
        } else {
          throw new Error(`Invalid target: "${target}" is not a valid target from the root node. Did you mean ".${target}"?`);
        }
      });
    }
    function resolveHistoryDefaultTransition(stateNode) {
      const normalizedTarget = normalizeTarget(stateNode.config.target);
      if (!normalizedTarget) {
        return stateNode.parent.initial;
      }
      return {
        target: normalizedTarget.map(t => typeof t === 'string' ? getStateNodeByPath(stateNode.parent, t) : t)
      };
    }
    function isHistoryNode(stateNode) {
      return stateNode.type === 'history';
    }
    function getInitialStateNodesWithTheirAncestors(stateNode) {
      const states = getInitialStateNodes(stateNode);
      for (const initialState of states) {
        for (const ancestor of getProperAncestors(initialState, stateNode)) {
          states.add(ancestor);
        }
      }
      return states;
    }
    function getInitialStateNodes(stateNode) {
      const set = new Set();
      function iter(descStateNode) {
        if (set.has(descStateNode)) {
          return;
        }
        set.add(descStateNode);
        if (descStateNode.type === 'compound') {
          iter(descStateNode.initial.target[0]);
        } else if (descStateNode.type === 'parallel') {
          for (const child of getChildren(descStateNode)) {
            iter(child);
          }
        }
      }
      iter(stateNode);
      return set;
    }
    /**
     * Returns the child state node from its relative `stateKey`, or throws.
     */
    function getStateNode(stateNode, stateKey) {
      if (isStateId(stateKey)) {
        return stateNode.machine.getStateNodeById(stateKey);
      }
      if (!stateNode.states) {
        throw new Error(`Unable to retrieve child state '${stateKey}' from '${stateNode.id}'; no child states exist.`);
      }
      const result = stateNode.states[stateKey];
      if (!result) {
        throw new Error(`Child state '${stateKey}' does not exist on '${stateNode.id}'`);
      }
      return result;
    }

    /**
     * Returns the relative state node from the given `statePath`, or throws.
     *
     * @param statePath The string or string array relative path to the state node.
     */
    function getStateNodeByPath(stateNode, statePath) {
      if (typeof statePath === 'string' && isStateId(statePath)) {
        try {
          return stateNode.machine.getStateNodeById(statePath);
        } catch (e) {
          // try individual paths
          // throw e;
        }
      }
      const arrayStatePath = toStatePath(statePath).slice();
      let currentStateNode = stateNode;
      while (arrayStatePath.length) {
        const key = arrayStatePath.shift();
        if (!key.length) {
          break;
        }
        currentStateNode = getStateNode(currentStateNode, key);
      }
      return currentStateNode;
    }

    /**
     * Returns the state nodes represented by the current state value.
     *
     * @param stateValue The state value or State instance
     */
    function getStateNodes(stateNode, stateValue) {
      if (typeof stateValue === 'string') {
        const childStateNode = stateNode.states[stateValue];
        if (!childStateNode) {
          throw new Error(`State '${stateValue}' does not exist on '${stateNode.id}'`);
        }
        return [stateNode, childStateNode];
      }
      const childStateKeys = Object.keys(stateValue);
      const childStateNodes = childStateKeys.map(subStateKey => getStateNode(stateNode, subStateKey)).filter(Boolean);
      return [stateNode.machine.root, stateNode].concat(childStateNodes, childStateKeys.reduce((allSubStateNodes, subStateKey) => {
        const subStateNode = getStateNode(stateNode, subStateKey);
        if (!subStateNode) {
          return allSubStateNodes;
        }
        const subStateNodes = getStateNodes(subStateNode, stateValue[subStateKey]);
        return allSubStateNodes.concat(subStateNodes);
      }, []));
    }
    function transitionAtomicNode(stateNode, stateValue, snapshot, event) {
      const childStateNode = getStateNode(stateNode, stateValue);
      const next = childStateNode.next(snapshot, event);
      if (!next || !next.length) {
        return stateNode.next(snapshot, event);
      }
      return next;
    }
    function transitionCompoundNode(stateNode, stateValue, snapshot, event) {
      const subStateKeys = Object.keys(stateValue);
      const childStateNode = getStateNode(stateNode, subStateKeys[0]);
      const next = transitionNode(childStateNode, stateValue[subStateKeys[0]], snapshot, event);
      if (!next || !next.length) {
        return stateNode.next(snapshot, event);
      }
      return next;
    }
    function transitionParallelNode(stateNode, stateValue, snapshot, event) {
      const allInnerTransitions = [];
      for (const subStateKey of Object.keys(stateValue)) {
        const subStateValue = stateValue[subStateKey];
        if (!subStateValue) {
          continue;
        }
        const subStateNode = getStateNode(stateNode, subStateKey);
        const innerTransitions = transitionNode(subStateNode, subStateValue, snapshot, event);
        if (innerTransitions) {
          allInnerTransitions.push(...innerTransitions);
        }
      }
      if (!allInnerTransitions.length) {
        return stateNode.next(snapshot, event);
      }
      return allInnerTransitions;
    }
    function transitionNode(stateNode, stateValue, snapshot, event) {
      // leaf node
      if (typeof stateValue === 'string') {
        return transitionAtomicNode(stateNode, stateValue, snapshot, event);
      }

      // compound node
      if (Object.keys(stateValue).length === 1) {
        return transitionCompoundNode(stateNode, stateValue, snapshot, event);
      }

      // parallel node
      return transitionParallelNode(stateNode, stateValue, snapshot, event);
    }
    function getHistoryNodes(stateNode) {
      return Object.keys(stateNode.states).map(key => stateNode.states[key]).filter(sn => sn.type === 'history');
    }
    function isDescendant(childStateNode, parentStateNode) {
      let marker = childStateNode;
      while (marker.parent && marker.parent !== parentStateNode) {
        marker = marker.parent;
      }
      return marker.parent === parentStateNode;
    }
    function hasIntersection(s1, s2) {
      const set1 = new Set(s1);
      const set2 = new Set(s2);
      for (const item of set1) {
        if (set2.has(item)) {
          return true;
        }
      }
      for (const item of set2) {
        if (set1.has(item)) {
          return true;
        }
      }
      return false;
    }
    function removeConflictingTransitions(enabledTransitions, stateNodeSet, historyValue) {
      const filteredTransitions = new Set();
      for (const t1 of enabledTransitions) {
        let t1Preempted = false;
        const transitionsToRemove = new Set();
        for (const t2 of filteredTransitions) {
          if (hasIntersection(computeExitSet([t1], stateNodeSet, historyValue), computeExitSet([t2], stateNodeSet, historyValue))) {
            if (isDescendant(t1.source, t2.source)) {
              transitionsToRemove.add(t2);
            } else {
              t1Preempted = true;
              break;
            }
          }
        }
        if (!t1Preempted) {
          for (const t3 of transitionsToRemove) {
            filteredTransitions.delete(t3);
          }
          filteredTransitions.add(t1);
        }
      }
      return Array.from(filteredTransitions);
    }
    function findLeastCommonAncestor(stateNodes) {
      const [head, ...tail] = stateNodes;
      for (const ancestor of getProperAncestors(head, undefined)) {
        if (tail.every(sn => isDescendant(sn, ancestor))) {
          return ancestor;
        }
      }
    }
    function getEffectiveTargetStates(transition, historyValue) {
      if (!transition.target) {
        return [];
      }
      const targets = new Set();
      for (const targetNode of transition.target) {
        if (isHistoryNode(targetNode)) {
          if (historyValue[targetNode.id]) {
            for (const node of historyValue[targetNode.id]) {
              targets.add(node);
            }
          } else {
            for (const node of getEffectiveTargetStates(resolveHistoryDefaultTransition(targetNode), historyValue)) {
              targets.add(node);
            }
          }
        } else {
          targets.add(targetNode);
        }
      }
      return [...targets];
    }
    function getTransitionDomain(transition, historyValue) {
      const targetStates = getEffectiveTargetStates(transition, historyValue);
      if (!targetStates) {
        return;
      }
      if (!transition.reenter && targetStates.every(target => target === transition.source || isDescendant(target, transition.source))) {
        return transition.source;
      }
      const lca = findLeastCommonAncestor(targetStates.concat(transition.source));
      if (lca) {
        return lca;
      }

      // at this point we know that it's a root transition since LCA couldn't be found
      if (transition.reenter) {
        return;
      }
      return transition.source.machine.root;
    }
    function computeExitSet(transitions, stateNodeSet, historyValue) {
      const statesToExit = new Set();
      for (const t of transitions) {
        if (t.target?.length) {
          const domain = getTransitionDomain(t, historyValue);
          if (t.reenter && t.source === domain) {
            statesToExit.add(domain);
          }
          for (const stateNode of stateNodeSet) {
            if (isDescendant(stateNode, domain)) {
              statesToExit.add(stateNode);
            }
          }
        }
      }
      return [...statesToExit];
    }
    function areStateNodeCollectionsEqual(prevStateNodes, nextStateNodeSet) {
      if (prevStateNodes.length !== nextStateNodeSet.size) {
        return false;
      }
      for (const node of prevStateNodes) {
        if (!nextStateNodeSet.has(node)) {
          return false;
        }
      }
      return true;
    }

    /**
     * https://www.w3.org/TR/scxml/#microstepProcedure
     */
    function microstep(transitions, currentSnapshot, actorScope, event, isInitial, internalQueue) {
      if (!transitions.length) {
        return currentSnapshot;
      }
      const mutStateNodeSet = new Set(currentSnapshot._nodes);
      let historyValue = currentSnapshot.historyValue;
      const filteredTransitions = removeConflictingTransitions(transitions, mutStateNodeSet, historyValue);
      let nextState = currentSnapshot;

      // Exit states
      if (!isInitial) {
        [nextState, historyValue] = exitStates(nextState, event, actorScope, filteredTransitions, mutStateNodeSet, historyValue, internalQueue);
      }

      // Execute transition content
      nextState = resolveActionsAndContext(nextState, event, actorScope, filteredTransitions.flatMap(t => t.actions), internalQueue);

      // Enter states
      nextState = enterStates(nextState, event, actorScope, filteredTransitions, mutStateNodeSet, internalQueue, historyValue, isInitial);
      const nextStateNodes = [...mutStateNodeSet];
      if (nextState.status === 'done') {
        nextState = resolveActionsAndContext(nextState, event, actorScope, nextStateNodes.sort((a, b) => b.order - a.order).flatMap(state => state.exit), internalQueue);
      }
      try {
        if (historyValue === currentSnapshot.historyValue && areStateNodeCollectionsEqual(currentSnapshot._nodes, mutStateNodeSet)) {
          return nextState;
        }
        return cloneMachineSnapshot(nextState, {
          _nodes: nextStateNodes,
          historyValue
        });
      } catch (e) {
        // TODO: Refactor this once proper error handling is implemented.
        // See https://github.com/statelyai/rfcs/pull/4
        throw e;
      }
    }
    function getMachineOutput(snapshot, event, actorScope, rootNode, rootCompletionNode) {
      if (rootNode.output === undefined) {
        return;
      }
      const doneStateEvent = createDoneStateEvent(rootCompletionNode.id, rootCompletionNode.output !== undefined && rootCompletionNode.parent ? resolveOutput(rootCompletionNode.output, snapshot.context, event, actorScope.self) : undefined);
      return resolveOutput(rootNode.output, snapshot.context, doneStateEvent, actorScope.self);
    }
    function enterStates(currentSnapshot, event, actorScope, filteredTransitions, mutStateNodeSet, internalQueue, historyValue, isInitial) {
      let nextSnapshot = currentSnapshot;
      const statesToEnter = new Set();
      // those are states that were directly targeted or indirectly targeted by the explicit target
      // in other words, those are states for which initial actions should be executed
      // when we target `#deep_child` initial actions of its ancestors shouldn't be executed
      const statesForDefaultEntry = new Set();
      computeEntrySet(filteredTransitions, historyValue, statesForDefaultEntry, statesToEnter);

      // In the initial state, the root state node is "entered".
      if (isInitial) {
        statesForDefaultEntry.add(currentSnapshot.machine.root);
      }
      const completedNodes = new Set();
      for (const stateNodeToEnter of [...statesToEnter].sort((a, b) => a.order - b.order)) {
        mutStateNodeSet.add(stateNodeToEnter);
        const actions = [];

        // Add entry actions
        actions.push(...stateNodeToEnter.entry);
        for (const invokeDef of stateNodeToEnter.invoke) {
          actions.push(spawnChild(invokeDef.src, {
            ...invokeDef,
            syncSnapshot: !!invokeDef.onSnapshot
          }));
        }
        if (statesForDefaultEntry.has(stateNodeToEnter)) {
          const initialActions = stateNodeToEnter.initial.actions;
          actions.push(...initialActions);
        }
        nextSnapshot = resolveActionsAndContext(nextSnapshot, event, actorScope, actions, internalQueue, stateNodeToEnter.invoke.map(invokeDef => invokeDef.id));
        if (stateNodeToEnter.type === 'final') {
          const parent = stateNodeToEnter.parent;
          let ancestorMarker = parent?.type === 'parallel' ? parent : parent?.parent;
          let rootCompletionNode = ancestorMarker || stateNodeToEnter;
          if (parent?.type === 'compound') {
            internalQueue.push(createDoneStateEvent(parent.id, stateNodeToEnter.output !== undefined ? resolveOutput(stateNodeToEnter.output, nextSnapshot.context, event, actorScope.self) : undefined));
          }
          while (ancestorMarker?.type === 'parallel' && !completedNodes.has(ancestorMarker) && isInFinalState(mutStateNodeSet, ancestorMarker)) {
            completedNodes.add(ancestorMarker);
            internalQueue.push(createDoneStateEvent(ancestorMarker.id));
            rootCompletionNode = ancestorMarker;
            ancestorMarker = ancestorMarker.parent;
          }
          if (ancestorMarker) {
            continue;
          }
          nextSnapshot = cloneMachineSnapshot(nextSnapshot, {
            status: 'done',
            output: getMachineOutput(nextSnapshot, event, actorScope, nextSnapshot.machine.root, rootCompletionNode)
          });
        }
      }
      return nextSnapshot;
    }
    function computeEntrySet(transitions, historyValue, statesForDefaultEntry, statesToEnter) {
      for (const t of transitions) {
        const domain = getTransitionDomain(t, historyValue);
        for (const s of t.target || []) {
          if (!isHistoryNode(s) && (
          // if the target is different than the source then it will *definitely* be entered
          t.source !== s ||
          // we know that the domain can't lie within the source
          // if it's different than the source then it's outside of it and it means that the target has to be entered as well
          t.source !== domain ||
          // reentering transitions always enter the target, even if it's the source itself
          t.reenter)) {
            statesToEnter.add(s);
            statesForDefaultEntry.add(s);
          }
          addDescendantStatesToEnter(s, historyValue, statesForDefaultEntry, statesToEnter);
        }
        const targetStates = getEffectiveTargetStates(t, historyValue);
        for (const s of targetStates) {
          const ancestors = getProperAncestors(s, domain);
          if (domain?.type === 'parallel') {
            ancestors.push(domain);
          }
          addAncestorStatesToEnter(statesToEnter, historyValue, statesForDefaultEntry, ancestors, !t.source.parent && t.reenter ? undefined : domain);
        }
      }
    }
    function addDescendantStatesToEnter(stateNode, historyValue, statesForDefaultEntry, statesToEnter) {
      if (isHistoryNode(stateNode)) {
        if (historyValue[stateNode.id]) {
          const historyStateNodes = historyValue[stateNode.id];
          for (const s of historyStateNodes) {
            statesToEnter.add(s);
            addDescendantStatesToEnter(s, historyValue, statesForDefaultEntry, statesToEnter);
          }
          for (const s of historyStateNodes) {
            addProperAncestorStatesToEnter(s, stateNode.parent, statesToEnter, historyValue, statesForDefaultEntry);
          }
        } else {
          const historyDefaultTransition = resolveHistoryDefaultTransition(stateNode);
          for (const s of historyDefaultTransition.target) {
            statesToEnter.add(s);
            if (historyDefaultTransition === stateNode.parent?.initial) {
              statesForDefaultEntry.add(stateNode.parent);
            }
            addDescendantStatesToEnter(s, historyValue, statesForDefaultEntry, statesToEnter);
          }
          for (const s of historyDefaultTransition.target) {
            addProperAncestorStatesToEnter(s, stateNode.parent, statesToEnter, historyValue, statesForDefaultEntry);
          }
        }
      } else {
        if (stateNode.type === 'compound') {
          const [initialState] = stateNode.initial.target;
          if (!isHistoryNode(initialState)) {
            statesToEnter.add(initialState);
            statesForDefaultEntry.add(initialState);
          }
          addDescendantStatesToEnter(initialState, historyValue, statesForDefaultEntry, statesToEnter);
          addProperAncestorStatesToEnter(initialState, stateNode, statesToEnter, historyValue, statesForDefaultEntry);
        } else {
          if (stateNode.type === 'parallel') {
            for (const child of getChildren(stateNode).filter(sn => !isHistoryNode(sn))) {
              if (![...statesToEnter].some(s => isDescendant(s, child))) {
                if (!isHistoryNode(child)) {
                  statesToEnter.add(child);
                  statesForDefaultEntry.add(child);
                }
                addDescendantStatesToEnter(child, historyValue, statesForDefaultEntry, statesToEnter);
              }
            }
          }
        }
      }
    }
    function addAncestorStatesToEnter(statesToEnter, historyValue, statesForDefaultEntry, ancestors, reentrancyDomain) {
      for (const anc of ancestors) {
        if (!reentrancyDomain || isDescendant(anc, reentrancyDomain)) {
          statesToEnter.add(anc);
        }
        if (anc.type === 'parallel') {
          for (const child of getChildren(anc).filter(sn => !isHistoryNode(sn))) {
            if (![...statesToEnter].some(s => isDescendant(s, child))) {
              statesToEnter.add(child);
              addDescendantStatesToEnter(child, historyValue, statesForDefaultEntry, statesToEnter);
            }
          }
        }
      }
    }
    function addProperAncestorStatesToEnter(stateNode, toStateNode, statesToEnter, historyValue, statesForDefaultEntry) {
      addAncestorStatesToEnter(statesToEnter, historyValue, statesForDefaultEntry, getProperAncestors(stateNode, toStateNode));
    }
    function exitStates(currentSnapshot, event, actorScope, transitions, mutStateNodeSet, historyValue, internalQueue) {
      let nextSnapshot = currentSnapshot;
      const statesToExit = computeExitSet(transitions, mutStateNodeSet, historyValue);
      statesToExit.sort((a, b) => b.order - a.order);
      let changedHistory;

      // From SCXML algorithm: https://www.w3.org/TR/scxml/#exitStates
      for (const exitStateNode of statesToExit) {
        for (const historyNode of getHistoryNodes(exitStateNode)) {
          let predicate;
          if (historyNode.history === 'deep') {
            predicate = sn => isAtomicStateNode(sn) && isDescendant(sn, exitStateNode);
          } else {
            predicate = sn => {
              return sn.parent === exitStateNode;
            };
          }
          changedHistory ??= {
            ...historyValue
          };
          changedHistory[historyNode.id] = Array.from(mutStateNodeSet).filter(predicate);
        }
      }
      for (const s of statesToExit) {
        nextSnapshot = resolveActionsAndContext(nextSnapshot, event, actorScope, [...s.exit, ...s.invoke.map(def => stopChild(def.id))], internalQueue);
        mutStateNodeSet.delete(s);
      }
      return [nextSnapshot, changedHistory || historyValue];
    }
    function resolveAndExecuteActionsWithContext(currentSnapshot, event, actorScope, actions, extra, retries) {
      const {
        machine
      } = currentSnapshot;
      let intermediateSnapshot = currentSnapshot;
      for (const action of actions) {
        const isInline = typeof action === 'function';
        const resolvedAction = isInline ? action :
        // the existing type of `.actions` assumes non-nullable `TExpressionAction`
        // it's fine to cast this here to get a common type and lack of errors in the rest of the code
        // our logic below makes sure that we call those 2 "variants" correctly
        machine.implementations.actions[typeof action === 'string' ? action : action.type];
        if (!resolvedAction) {
          continue;
        }
        const actionArgs = {
          context: intermediateSnapshot.context,
          event,
          self: actorScope.self,
          system: actorScope.system
        };
        const actionParams = isInline || typeof action === 'string' ? undefined : 'params' in action ? typeof action.params === 'function' ? action.params({
          context: intermediateSnapshot.context,
          event
        }) : action.params : undefined;
        function executeAction() {
          actorScope.system._sendInspectionEvent({
            type: '@xstate.action',
            actorRef: actorScope.self,
            action: {
              type: typeof action === 'string' ? action : typeof action === 'object' ? action.type : action.name || '(anonymous)',
              params: actionParams
            }
          });
          resolvedAction(actionArgs, actionParams);
        }
        if (!('resolve' in resolvedAction)) {
          if (actorScope.self._processingStatus === ProcessingStatus.Running) {
            executeAction();
          } else {
            actorScope.defer(() => {
              executeAction();
            });
          }
          continue;
        }
        const builtinAction = resolvedAction;
        const [nextState, params, actions] = builtinAction.resolve(actorScope, intermediateSnapshot, actionArgs, actionParams, resolvedAction,
        // this holds all params
        extra);
        intermediateSnapshot = nextState;
        if ('retryResolve' in builtinAction) {
          retries?.push([builtinAction, params]);
        }
        if ('execute' in builtinAction) {
          if (actorScope.self._processingStatus === ProcessingStatus.Running) {
            builtinAction.execute(actorScope, params);
          } else {
            actorScope.defer(builtinAction.execute.bind(null, actorScope, params));
          }
        }
        if (actions) {
          intermediateSnapshot = resolveAndExecuteActionsWithContext(intermediateSnapshot, event, actorScope, actions, extra, retries);
        }
      }
      return intermediateSnapshot;
    }
    function resolveActionsAndContext(currentSnapshot, event, actorScope, actions, internalQueue, deferredActorIds) {
      const retries = deferredActorIds ? [] : undefined;
      const nextState = resolveAndExecuteActionsWithContext(currentSnapshot, event, actorScope, actions, {
        internalQueue,
        deferredActorIds
      }, retries);
      retries?.forEach(([builtinAction, params]) => {
        builtinAction.retryResolve(actorScope, nextState, params);
      });
      return nextState;
    }
    function macrostep(snapshot, event, actorScope, internalQueue = []) {
      let nextSnapshot = snapshot;
      const microstates = [];
      function addMicrostate(microstate, event, transitions) {
        actorScope.system._sendInspectionEvent({
          type: '@xstate.microstep',
          actorRef: actorScope.self,
          event,
          snapshot: microstate,
          _transitions: transitions
        });
        microstates.push(microstate);
      }

      // Handle stop event
      if (event.type === XSTATE_STOP) {
        nextSnapshot = cloneMachineSnapshot(stopChildren(nextSnapshot, event, actorScope), {
          status: 'stopped'
        });
        addMicrostate(nextSnapshot, event, []);
        return {
          snapshot: nextSnapshot,
          microstates
        };
      }
      let nextEvent = event;

      // Assume the state is at rest (no raised events)
      // Determine the next state based on the next microstep
      if (nextEvent.type !== XSTATE_INIT) {
        const currentEvent = nextEvent;
        const isErr = isErrorActorEvent(currentEvent);
        const transitions = selectTransitions(currentEvent, nextSnapshot);
        if (isErr && !transitions.length) {
          // TODO: we should likely only allow transitions selected by very explicit descriptors
          // `*` shouldn't be matched, likely `xstate.error.*` shouldnt be either
          // similarly `xstate.error.actor.*` and `xstate.error.actor.todo.*` have to be considered too
          nextSnapshot = cloneMachineSnapshot(snapshot, {
            status: 'error',
            error: currentEvent.error
          });
          addMicrostate(nextSnapshot, currentEvent, []);
          return {
            snapshot: nextSnapshot,
            microstates
          };
        }
        nextSnapshot = microstep(transitions, snapshot, actorScope, nextEvent, false,
        // isInitial
        internalQueue);
        addMicrostate(nextSnapshot, currentEvent, transitions);
      }
      let shouldSelectEventlessTransitions = true;
      while (nextSnapshot.status === 'active') {
        let enabledTransitions = shouldSelectEventlessTransitions ? selectEventlessTransitions(nextSnapshot, nextEvent) : [];

        // eventless transitions should always be selected after selecting *regular* transitions
        // by assigning `undefined` to `previousState` we ensure that `shouldSelectEventlessTransitions` gets always computed to true in such a case
        const previousState = enabledTransitions.length ? nextSnapshot : undefined;
        if (!enabledTransitions.length) {
          if (!internalQueue.length) {
            break;
          }
          nextEvent = internalQueue.shift();
          enabledTransitions = selectTransitions(nextEvent, nextSnapshot);
        }
        nextSnapshot = microstep(enabledTransitions, nextSnapshot, actorScope, nextEvent, false, internalQueue);
        shouldSelectEventlessTransitions = nextSnapshot !== previousState;
        addMicrostate(nextSnapshot, nextEvent, enabledTransitions);
      }
      if (nextSnapshot.status !== 'active') {
        stopChildren(nextSnapshot, nextEvent, actorScope);
      }
      return {
        snapshot: nextSnapshot,
        microstates
      };
    }
    function stopChildren(nextState, event, actorScope) {
      return resolveActionsAndContext(nextState, event, actorScope, Object.values(nextState.children).map(child => stopChild(child)), []);
    }
    function selectTransitions(event, nextState) {
      return nextState.machine.getTransitionData(nextState, event);
    }
    function selectEventlessTransitions(nextState, event) {
      const enabledTransitionSet = new Set();
      const atomicStates = nextState._nodes.filter(isAtomicStateNode);
      for (const stateNode of atomicStates) {
        loop: for (const s of [stateNode].concat(getProperAncestors(stateNode, undefined))) {
          if (!s.always) {
            continue;
          }
          for (const transition of s.always) {
            if (transition.guard === undefined || evaluateGuard(transition.guard, nextState.context, event, nextState)) {
              enabledTransitionSet.add(transition);
              break loop;
            }
          }
        }
      }
      return removeConflictingTransitions(Array.from(enabledTransitionSet), new Set(nextState._nodes), nextState.historyValue);
    }

    /**
     * Resolves a partial state value with its full representation in the state node's machine.
     *
     * @param stateValue The partial state value to resolve.
     */
    function resolveStateValue(rootNode, stateValue) {
      const allStateNodes = getAllStateNodes(getStateNodes(rootNode, stateValue));
      return getStateValue(rootNode, [...allStateNodes]);
    }

    function isMachineSnapshot(value) {
      return !!value && typeof value === 'object' && 'machine' in value && 'value' in value;
    }
    const machineSnapshotMatches = function matches(testValue) {
      return matchesState(testValue, this.value);
    };
    const machineSnapshotHasTag = function hasTag(tag) {
      return this.tags.has(tag);
    };
    const machineSnapshotCan = function can(event) {
      const transitionData = this.machine.getTransitionData(this, event);
      return !!transitionData?.length &&
      // Check that at least one transition is not forbidden
      transitionData.some(t => t.target !== undefined || t.actions.length);
    };
    const machineSnapshotToJSON = function toJSON() {
      const {
        _nodes: nodes,
        tags,
        machine,
        getMeta,
        toJSON,
        can,
        hasTag,
        matches,
        ...jsonValues
      } = this;
      return {
        ...jsonValues,
        tags: Array.from(tags)
      };
    };
    const machineSnapshotGetMeta = function getMeta() {
      return this._nodes.reduce((acc, stateNode) => {
        if (stateNode.meta !== undefined) {
          acc[stateNode.id] = stateNode.meta;
        }
        return acc;
      }, {});
    };
    function createMachineSnapshot(config, machine) {
      return {
        status: config.status,
        output: config.output,
        error: config.error,
        machine,
        context: config.context,
        _nodes: config._nodes,
        value: getStateValue(machine.root, config._nodes),
        tags: new Set(config._nodes.flatMap(sn => sn.tags)),
        children: config.children,
        historyValue: config.historyValue || {},
        matches: machineSnapshotMatches,
        hasTag: machineSnapshotHasTag,
        can: machineSnapshotCan,
        getMeta: machineSnapshotGetMeta,
        toJSON: machineSnapshotToJSON
      };
    }
    function cloneMachineSnapshot(snapshot, config = {}) {
      return createMachineSnapshot({
        ...snapshot,
        ...config
      }, snapshot.machine);
    }
    function getPersistedSnapshot(snapshot, options) {
      const {
        _nodes: nodes,
        tags,
        machine,
        children,
        context,
        can,
        hasTag,
        matches,
        getMeta,
        toJSON,
        ...jsonValues
      } = snapshot;
      const childrenJson = {};
      for (const id in children) {
        const child = children[id];
        childrenJson[id] = {
          snapshot: child.getPersistedSnapshot(options),
          src: child.src,
          systemId: child._systemId,
          syncSnapshot: child._syncSnapshot
        };
      }
      const persisted = {
        ...jsonValues,
        context: persistContext(context),
        children: childrenJson
      };
      return persisted;
    }
    function persistContext(contextPart) {
      let copy;
      for (const key in contextPart) {
        const value = contextPart[key];
        if (value && typeof value === 'object') {
          if ('sessionId' in value && 'send' in value && 'ref' in value) {
            copy ??= Array.isArray(contextPart) ? contextPart.slice() : {
              ...contextPart
            };
            copy[key] = {
              xstate$$type: $$ACTOR_TYPE,
              id: value.id
            };
          } else {
            const result = persistContext(value);
            if (result !== value) {
              copy ??= Array.isArray(contextPart) ? contextPart.slice() : {
                ...contextPart
              };
              copy[key] = result;
            }
          }
        }
      }
      return copy ?? contextPart;
    }

    function resolveRaise(_, snapshot, args, actionParams, {
      event: eventOrExpr,
      id,
      delay
    }, {
      internalQueue
    }) {
      const delaysMap = snapshot.machine.implementations.delays;
      if (typeof eventOrExpr === 'string') {
        throw new Error(`Only event objects may be used with raise; use raise({ type: "${eventOrExpr}" }) instead`);
      }
      const resolvedEvent = typeof eventOrExpr === 'function' ? eventOrExpr(args, actionParams) : eventOrExpr;
      let resolvedDelay;
      if (typeof delay === 'string') {
        const configDelay = delaysMap && delaysMap[delay];
        resolvedDelay = typeof configDelay === 'function' ? configDelay(args, actionParams) : configDelay;
      } else {
        resolvedDelay = typeof delay === 'function' ? delay(args, actionParams) : delay;
      }
      if (typeof resolvedDelay !== 'number') {
        internalQueue.push(resolvedEvent);
      }
      return [snapshot, {
        event: resolvedEvent,
        id,
        delay: resolvedDelay
      }];
    }
    function executeRaise(actorScope, params) {
      const {
        event,
        delay,
        id
      } = params;
      if (typeof delay === 'number') {
        actorScope.defer(() => {
          const self = actorScope.self;
          actorScope.system.scheduler.schedule(self, self, event, delay, id);
        });
        return;
      }
    }
    /**
     * Raises an event. This places the event in the internal event queue, so that
     * the event is immediately consumed by the machine in the current step.
     *
     * @param eventType The event to raise.
     */
    function raise(eventOrExpr, options) {
      function raise(args, params) {
      }
      raise.type = 'xstate.raise';
      raise.event = eventOrExpr;
      raise.id = options?.id;
      raise.delay = options?.delay;
      raise.resolve = resolveRaise;
      raise.execute = executeRaise;
      return raise;
    }

    // it's likely-ish that `(TActor & { src: TSrc })['logic']` would be faster
    // but it's only possible to do it since https://github.com/microsoft/TypeScript/pull/53098 (TS 5.1)
    // and we strive to support TS 5.0 whenever possible
    function createSpawner(actorScope, {
      machine,
      context
    }, event, spawnedChildren) {
      const spawn = (src, options = {}) => {
        const {
          systemId,
          input
        } = options;
        if (typeof src === 'string') {
          const logic = resolveReferencedActor(machine, src);
          if (!logic) {
            throw new Error(`Actor logic '${src}' not implemented in machine '${machine.id}'`);
          }
          const actorRef = createActor(logic, {
            id: options.id,
            parent: actorScope.self,
            syncSnapshot: options.syncSnapshot,
            input: typeof input === 'function' ? input({
              context,
              event,
              self: actorScope.self
            }) : input,
            src,
            systemId
          });
          spawnedChildren[actorRef.id] = actorRef;
          return actorRef;
        } else {
          const actorRef = createActor(src, {
            id: options.id,
            parent: actorScope.self,
            syncSnapshot: options.syncSnapshot,
            input: options.input,
            src,
            systemId
          });
          return actorRef;
        }
      };
      return (src, options) => {
        const actorRef = spawn(src, options); // TODO: fix types
        spawnedChildren[actorRef.id] = actorRef;
        actorScope.defer(() => {
          if (actorRef._processingStatus === ProcessingStatus.Stopped) {
            return;
          }
          actorRef.start();
        });
        return actorRef;
      };
    }

    function resolveAssign(actorScope, snapshot, actionArgs, actionParams, {
      assignment
    }) {
      if (!snapshot.context) {
        throw new Error('Cannot assign to undefined `context`. Ensure that `context` is defined in the machine config.');
      }
      const spawnedChildren = {};
      const assignArgs = {
        context: snapshot.context,
        event: actionArgs.event,
        spawn: createSpawner(actorScope, snapshot, actionArgs.event, spawnedChildren),
        self: actorScope.self,
        system: actorScope.system
      };
      let partialUpdate = {};
      if (typeof assignment === 'function') {
        partialUpdate = assignment(assignArgs, actionParams);
      } else {
        for (const key of Object.keys(assignment)) {
          const propAssignment = assignment[key];
          partialUpdate[key] = typeof propAssignment === 'function' ? propAssignment(assignArgs, actionParams) : propAssignment;
        }
      }
      const updatedContext = Object.assign({}, snapshot.context, partialUpdate);
      return [cloneMachineSnapshot(snapshot, {
        context: updatedContext,
        children: Object.keys(spawnedChildren).length ? {
          ...snapshot.children,
          ...spawnedChildren
        } : snapshot.children
      })];
    }
    /**
     * Updates the current context of the machine.
     *
     * @param assignment An object that represents the partial context to update, or a
     * function that returns an object that represents the partial context to update.
     *
     * @example
      ```ts
      import { createMachine, assign } from 'xstate';

      const countMachine = createMachine({
        context: {
          count: 0,
          message: ''
        },
        on: {
          inc: {
            actions: assign({
              count: ({ context }) => context.count + 1
            })
          },
          updateMessage: {
            actions: assign(({ context, event }) => {
              return {
                message: event.message.trim()
              }
            })
          }
        }
      });
      ```
     */
    function assign(assignment) {
      function assign(args, params) {
      }
      assign.type = 'xstate.assign';
      assign.assignment = assignment;
      assign.resolve = resolveAssign;
      return assign;
    }

    const cache = new WeakMap();
    function memo(object, key, fn) {
      let memoizedData = cache.get(object);
      if (!memoizedData) {
        memoizedData = {
          [key]: fn()
        };
        cache.set(object, memoizedData);
      } else if (!(key in memoizedData)) {
        memoizedData[key] = fn();
      }
      return memoizedData[key];
    }

    const EMPTY_OBJECT = {};
    const toSerializableAction = action => {
      if (typeof action === 'string') {
        return {
          type: action
        };
      }
      if (typeof action === 'function') {
        if ('resolve' in action) {
          return {
            type: action.type
          };
        }
        return {
          type: action.name
        };
      }
      return action;
    };
    class StateNode {
      constructor(
      /**
       * The raw config used to create the machine.
       */
      config, options) {
        this.config = config;
        /**
         * The relative key of the state node, which represents its location in the overall state value.
         */
        this.key = void 0;
        /**
         * The unique ID of the state node.
         */
        this.id = void 0;
        /**
         * The type of this state node:
         *
         *  - `'atomic'` - no child state nodes
         *  - `'compound'` - nested child state nodes (XOR)
         *  - `'parallel'` - orthogonal nested child state nodes (AND)
         *  - `'history'` - history state node
         *  - `'final'` - final state node
         */
        this.type = void 0;
        /**
         * The string path from the root machine node to this node.
         */
        this.path = void 0;
        /**
         * The child state nodes.
         */
        this.states = void 0;
        /**
         * The type of history on this state node. Can be:
         *
         *  - `'shallow'` - recalls only top-level historical state value
         *  - `'deep'` - recalls historical state value at all levels
         */
        this.history = void 0;
        /**
         * The action(s) to be executed upon entering the state node.
         */
        this.entry = void 0;
        /**
         * The action(s) to be executed upon exiting the state node.
         */
        this.exit = void 0;
        /**
         * The parent state node.
         */
        this.parent = void 0;
        /**
         * The root machine node.
         */
        this.machine = void 0;
        /**
         * The meta data associated with this state node, which will be returned in State instances.
         */
        this.meta = void 0;
        /**
         * The output data sent with the "xstate.done.state._id_" event if this is a final state node.
         */
        this.output = void 0;
        /**
         * The order this state node appears. Corresponds to the implicit document order.
         */
        this.order = -1;
        this.description = void 0;
        this.tags = [];
        this.transitions = void 0;
        this.always = void 0;
        this.parent = options._parent;
        this.key = options._key;
        this.machine = options._machine;
        this.path = this.parent ? this.parent.path.concat(this.key) : [];
        this.id = this.config.id || [this.machine.id, ...this.path].join(STATE_DELIMITER);
        this.type = this.config.type || (this.config.states && Object.keys(this.config.states).length ? 'compound' : this.config.history ? 'history' : 'atomic');
        this.description = this.config.description;
        this.order = this.machine.idMap.size;
        this.machine.idMap.set(this.id, this);
        this.states = this.config.states ? mapValues(this.config.states, (stateConfig, key) => {
          const stateNode = new StateNode(stateConfig, {
            _parent: this,
            _key: key,
            _machine: this.machine
          });
          return stateNode;
        }) : EMPTY_OBJECT;
        if (this.type === 'compound' && !this.config.initial) {
          throw new Error(`No initial state specified for compound state node "#${this.id}". Try adding { initial: "${Object.keys(this.states)[0]}" } to the state config.`);
        }

        // History config
        this.history = this.config.history === true ? 'shallow' : this.config.history || false;
        this.entry = toArray(this.config.entry).slice();
        this.exit = toArray(this.config.exit).slice();
        this.meta = this.config.meta;
        this.output = this.type === 'final' || !this.parent ? this.config.output : undefined;
        this.tags = toArray(config.tags).slice();
      }

      /** @internal */
      _initialize() {
        this.transitions = formatTransitions(this);
        if (this.config.always) {
          this.always = toTransitionConfigArray(this.config.always).map(t => formatTransition(this, NULL_EVENT, t));
        }
        Object.keys(this.states).forEach(key => {
          this.states[key]._initialize();
        });
      }

      /**
       * The well-structured state node definition.
       */
      get definition() {
        return {
          id: this.id,
          key: this.key,
          version: this.machine.version,
          type: this.type,
          initial: this.initial ? {
            target: this.initial.target,
            source: this,
            actions: this.initial.actions.map(toSerializableAction),
            eventType: null,
            reenter: false,
            toJSON: () => ({
              target: this.initial.target.map(t => `#${t.id}`),
              source: `#${this.id}`,
              actions: this.initial.actions.map(toSerializableAction),
              eventType: null
            })
          } : undefined,
          history: this.history,
          states: mapValues(this.states, state => {
            return state.definition;
          }),
          on: this.on,
          transitions: [...this.transitions.values()].flat().map(t => ({
            ...t,
            actions: t.actions.map(toSerializableAction)
          })),
          entry: this.entry.map(toSerializableAction),
          exit: this.exit.map(toSerializableAction),
          meta: this.meta,
          order: this.order || -1,
          output: this.output,
          invoke: this.invoke,
          description: this.description,
          tags: this.tags
        };
      }

      /** @internal */
      toJSON() {
        return this.definition;
      }

      /**
       * The logic invoked as actors by this state node.
       */
      get invoke() {
        return memo(this, 'invoke', () => toArray(this.config.invoke).map((invokeConfig, i) => {
          const {
            src,
            systemId
          } = invokeConfig;
          const resolvedId = invokeConfig.id ?? createInvokeId(this.id, i);
          const resolvedSrc = typeof src === 'string' ? src : `xstate.invoke.${createInvokeId(this.id, i)}`;
          return {
            ...invokeConfig,
            src: resolvedSrc,
            id: resolvedId,
            systemId: systemId,
            toJSON() {
              const {
                onDone,
                onError,
                ...invokeDefValues
              } = invokeConfig;
              return {
                ...invokeDefValues,
                type: 'xstate.invoke',
                src: resolvedSrc,
                id: resolvedId
              };
            }
          };
        }));
      }

      /**
       * The mapping of events to transitions.
       */
      get on() {
        return memo(this, 'on', () => {
          const transitions = this.transitions;
          return [...transitions].flatMap(([descriptor, t]) => t.map(t => [descriptor, t])).reduce((map, [descriptor, transition]) => {
            map[descriptor] = map[descriptor] || [];
            map[descriptor].push(transition);
            return map;
          }, {});
        });
      }
      get after() {
        return memo(this, 'delayedTransitions', () => getDelayedTransitions(this));
      }
      get initial() {
        return memo(this, 'initial', () => formatInitialTransition(this, this.config.initial));
      }

      /** @internal */
      next(snapshot, event) {
        const eventType = event.type;
        const actions = [];
        let selectedTransition;
        const candidates = memo(this, `candidates-${eventType}`, () => getCandidates(this, eventType));
        for (const candidate of candidates) {
          const {
            guard
          } = candidate;
          const resolvedContext = snapshot.context;
          let guardPassed = false;
          try {
            guardPassed = !guard || evaluateGuard(guard, resolvedContext, event, snapshot);
          } catch (err) {
            const guardType = typeof guard === 'string' ? guard : typeof guard === 'object' ? guard.type : undefined;
            throw new Error(`Unable to evaluate guard ${guardType ? `'${guardType}' ` : ''}in transition for event '${eventType}' in state node '${this.id}':\n${err.message}`);
          }
          if (guardPassed) {
            actions.push(...candidate.actions);
            selectedTransition = candidate;
            break;
          }
        }
        return selectedTransition ? [selectedTransition] : undefined;
      }

      /**
       * All the event types accepted by this state node and its descendants.
       */
      get events() {
        return memo(this, 'events', () => {
          const {
            states
          } = this;
          const events = new Set(this.ownEvents);
          if (states) {
            for (const stateId of Object.keys(states)) {
              const state = states[stateId];
              if (state.states) {
                for (const event of state.events) {
                  events.add(`${event}`);
                }
              }
            }
          }
          return Array.from(events);
        });
      }

      /**
       * All the events that have transitions directly from this state node.
       *
       * Excludes any inert events.
       */
      get ownEvents() {
        const events = new Set([...this.transitions.keys()].filter(descriptor => {
          return this.transitions.get(descriptor).some(transition => !(!transition.target && !transition.actions.length && !transition.reenter));
        }));
        return Array.from(events);
      }
    }

    const STATE_IDENTIFIER = '#';
    class StateMachine {
      constructor(
      /**
       * The raw config used to create the machine.
       */
      config, implementations) {
        this.config = config;
        /**
         * The machine's own version.
         */
        this.version = void 0;
        this.schemas = void 0;
        this.implementations = void 0;
        /** @internal */
        this.__xstatenode = true;
        /** @internal */
        this.idMap = new Map();
        this.root = void 0;
        this.id = void 0;
        this.states = void 0;
        this.events = void 0;
        /**
         * @deprecated an internal property that was acting as a "phantom" type, it's not used by anything right now but it's kept around for compatibility reasons
         **/
        this.__TResolvedTypesMeta = void 0;
        this.id = config.id || '(machine)';
        this.implementations = {
          actors: implementations?.actors ?? {},
          actions: implementations?.actions ?? {},
          delays: implementations?.delays ?? {},
          guards: implementations?.guards ?? {}
        };
        this.version = this.config.version;
        this.schemas = this.config.schemas;
        this.transition = this.transition.bind(this);
        this.getInitialSnapshot = this.getInitialSnapshot.bind(this);
        this.getPersistedSnapshot = this.getPersistedSnapshot.bind(this);
        this.restoreSnapshot = this.restoreSnapshot.bind(this);
        this.start = this.start.bind(this);
        this.root = new StateNode(config, {
          _key: this.id,
          _machine: this
        });
        this.root._initialize();
        this.states = this.root.states; // TODO: remove!
        this.events = this.root.events;
      }

      /**
       * Clones this state machine with the provided implementations
       * and merges the `context` (if provided).
       *
       * @param implementations Options (`actions`, `guards`, `actors`, `delays`, `context`)
       *  to recursively merge with the existing options.
       *
       * @returns A new `StateMachine` instance with the provided implementations.
       */
      provide(implementations) {
        const {
          actions,
          guards,
          actors,
          delays
        } = this.implementations;
        return new StateMachine(this.config, {
          actions: {
            ...actions,
            ...implementations.actions
          },
          guards: {
            ...guards,
            ...implementations.guards
          },
          actors: {
            ...actors,
            ...implementations.actors
          },
          delays: {
            ...delays,
            ...implementations.delays
          }
        });
      }
      resolveState(config) {
        const resolvedStateValue = resolveStateValue(this.root, config.value);
        const nodeSet = getAllStateNodes(getStateNodes(this.root, resolvedStateValue));
        return createMachineSnapshot({
          _nodes: [...nodeSet],
          context: config.context || {},
          children: {},
          status: isInFinalState(nodeSet, this.root) ? 'done' : config.status || 'active',
          output: config.output,
          error: config.error,
          historyValue: config.historyValue
        }, this);
      }

      /**
       * Determines the next snapshot given the current `snapshot` and received `event`.
       * Calculates a full macrostep from all microsteps.
       *
       * @param snapshot The current snapshot
       * @param event The received event
       */
      transition(snapshot, event, actorScope) {
        return macrostep(snapshot, event, actorScope).snapshot;
      }

      /**
       * Determines the next state given the current `state` and `event`.
       * Calculates a microstep.
       *
       * @param state The current state
       * @param event The received event
       */
      microstep(snapshot, event, actorScope) {
        return macrostep(snapshot, event, actorScope).microstates;
      }
      getTransitionData(snapshot, event) {
        return transitionNode(this.root, snapshot.value, snapshot, event) || [];
      }

      /**
       * The initial state _before_ evaluating any microsteps.
       * This "pre-initial" state is provided to initial actions executed in the initial state.
       */
      getPreInitialState(actorScope, initEvent, internalQueue) {
        const {
          context
        } = this.config;
        const preInitial = createMachineSnapshot({
          context: typeof context !== 'function' && context ? context : {},
          _nodes: [this.root],
          children: {},
          status: 'active'
        }, this);
        if (typeof context === 'function') {
          const assignment = ({
            spawn,
            event,
            self
          }) => context({
            spawn,
            input: event.input,
            self
          });
          return resolveActionsAndContext(preInitial, initEvent, actorScope, [assign(assignment)], internalQueue);
        }
        return preInitial;
      }

      /**
       * Returns the initial `State` instance, with reference to `self` as an `ActorRef`.
       */
      getInitialSnapshot(actorScope, input) {
        const initEvent = createInitEvent(input); // TODO: fix;
        const internalQueue = [];
        const preInitialState = this.getPreInitialState(actorScope, initEvent, internalQueue);
        const nextState = microstep([{
          target: [...getInitialStateNodes(this.root)],
          source: this.root,
          reenter: true,
          actions: [],
          eventType: null,
          toJSON: null // TODO: fix
        }], preInitialState, actorScope, initEvent, true, internalQueue);
        const {
          snapshot: macroState
        } = macrostep(nextState, initEvent, actorScope, internalQueue);
        return macroState;
      }
      start(snapshot) {
        Object.values(snapshot.children).forEach(child => {
          if (child.getSnapshot().status === 'active') {
            child.start();
          }
        });
      }
      getStateNodeById(stateId) {
        const fullPath = toStatePath(stateId);
        const relativePath = fullPath.slice(1);
        const resolvedStateId = isStateId(fullPath[0]) ? fullPath[0].slice(STATE_IDENTIFIER.length) : fullPath[0];
        const stateNode = this.idMap.get(resolvedStateId);
        if (!stateNode) {
          throw new Error(`Child state node '#${resolvedStateId}' does not exist on machine '${this.id}'`);
        }
        return getStateNodeByPath(stateNode, relativePath);
      }
      get definition() {
        return this.root.definition;
      }
      toJSON() {
        return this.definition;
      }
      getPersistedSnapshot(snapshot, options) {
        return getPersistedSnapshot(snapshot, options);
      }
      restoreSnapshot(snapshot, _actorScope) {
        const children = {};
        const snapshotChildren = snapshot.children;
        Object.keys(snapshotChildren).forEach(actorId => {
          const actorData = snapshotChildren[actorId];
          const childState = actorData.snapshot;
          const src = actorData.src;
          const logic = typeof src === 'string' ? resolveReferencedActor(this, src) : src;
          if (!logic) {
            return;
          }
          const actorRef = createActor(logic, {
            id: actorId,
            parent: _actorScope.self,
            syncSnapshot: actorData.syncSnapshot,
            snapshot: childState,
            src,
            systemId: actorData.systemId
          });
          children[actorId] = actorRef;
        });
        const restoredSnapshot = createMachineSnapshot({
          ...snapshot,
          children,
          _nodes: Array.from(getAllStateNodes(getStateNodes(this.root, snapshot.value)))
        }, this);
        let seen = new Set();
        function reviveContext(contextPart, children) {
          if (seen.has(contextPart)) {
            return;
          }
          seen.add(contextPart);
          for (let key in contextPart) {
            const value = contextPart[key];
            if (value && typeof value === 'object') {
              if ('xstate$$type' in value && value.xstate$$type === $$ACTOR_TYPE) {
                contextPart[key] = children[value.id];
                continue;
              }
              reviveContext(value, children);
            }
          }
        }
        reviveContext(restoredSnapshot.context, children);
        return restoredSnapshot;
      }
    }

    // this is not 100% accurate since we can't make parallel regions required in the result
    // `TTestValue` doesn't encode this information anyhow for us to be able to do that
    // this is fine for most practical use cases anyway though
    /**
     * Creates a state machine (statechart) with the given configuration.
     *
     * The state machine represents the pure logic of a state machine actor.
     *
     * @param config The state machine configuration.
     * @param options DEPRECATED: use `setup({ ... })` or `machine.provide({ ... })` to provide machine implementations instead.
     *
     * @example
      ```ts
      import { createMachine } from 'xstate';

      const lightMachine = createMachine({
        id: 'light',
        initial: 'green',
        states: {
          green: {
            on: {
              TIMER: { target: 'yellow' }
            }
          },
          yellow: {
            on: {
              TIMER: { target: 'red' }
            }
          },
          red: {
            on: {
              TIMER: { target: 'green' }
            }
          }
        }
      });

      const lightActor = createActor(lightMachine);
      lightActor.start();

      lightActor.send({ type: 'TIMER' });
      ```
     */
    function createMachine(config, implementations) {
      return new StateMachine(config, implementations);
    }

    // store.js

    const itemMachine = createMachine({
      id: "item",
      initial: "unfocused",
      states: {
        unfocused: {
          on: { FOCUS: "focused" },
        },
        focused: {
          on: { BLUR: "unfocused" },
        },
      },
    });
    {
      console.log("item", itemMachine);
    }

    /* src\SpotlightCarousel.svelte generated by Svelte v3.59.2 */

    const { console: console_1$1 } = globals;
    const file$2 = "src\\SpotlightCarousel.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    // (118:2) {:else}
    function create_else_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Loading...";
    			attr_dev(div, "class", "loading");
    			add_location(div, file$2, 118, 4, 3163);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(118:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (99:2) {#if spotlightItems.length > 0}
    function create_if_block(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let each_value = /*spotlightItems*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*item*/ ctx[13].id;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*focusItem, spotlightItems, blurItem, navigateToDetail*/ 15) {
    				each_value = /*spotlightItems*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block$1, each_1_anchor, get_each_context$1);
    			}
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(99:2) {#if spotlightItems.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (101:4) {#each spotlightItems as item (item.id)}
    function create_each_block$1(key_1, ctx) {
    	let div3;
    	let div2;
    	let div1;
    	let div0;
    	let t0_value = /*item*/ ctx[13].title + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[4](/*item*/ ctx[13]);
    	}

    	function mouseenter_handler() {
    		return /*mouseenter_handler*/ ctx[5](/*item*/ ctx[13]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			add_location(div0, file$2, 109, 12, 2974);
    			add_location(div1, file$2, 108, 10, 2956);
    			attr_dev(div2, "class", "card-style svelte-g2yzx4");
    			set_style(div2, "max-width", "300px");
    			add_location(div2, file$2, 107, 8, 2897);
    			attr_dev(div3, "class", "d-flex justify-center mt-4 mb-4 card-container svelte-g2yzx4");
    			add_location(div3, file$2, 102, 6, 2726);
    			this.first = div3;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div3, t1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", click_handler, false, false, false, false),
    					listen_dev(div3, "mouseenter", mouseenter_handler, false, false, false, false),
    					listen_dev(div3, "mouseleave", /*mouseleave_handler*/ ctx[6], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*spotlightItems*/ 1 && t0_value !== (t0_value = /*item*/ ctx[13].title + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(101:4) {#each spotlightItems as item (item.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div0;
    	let t;
    	let div1;

    	function select_block_type(ctx, dirty) {
    		if (/*spotlightItems*/ ctx[0].length > 0) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			if_block.c();
    			attr_dev(div0, "class", "spotlight-carousel svelte-g2yzx4");
    			add_location(div0, file$2, 96, 0, 2437);
    			attr_dev(div1, "class", "carousel svelte-g2yzx4");
    			add_location(div1, file$2, 97, 0, 2476);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			if_block.m(div1, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function fetchData$1(timeout) {
    	return new Promise(resolve => {
    			setTimeout(
    				() => {
    					const sampleData = [
    						{ id: 1, title: "Spotlight Item 1" },
    						{ id: 2, title: "Spotlight Item 2" },
    						{ id: 3, title: "Spotlight Item 3" },
    						{ id: 4, title: "Spotlight Item 4" }
    					];

    					resolve(sampleData);
    				},
    				timeout
    			);
    		});
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SpotlightCarousel', slots, []);
    	const itemContext = getContext(itemMachine);
    	let send;
    	let spotlightItems = [];
    	let currentIndex = 0;
    	let focusedItem = null; // Variable to store the currently focused item

    	onMount(async () => {
    		// Emulate fetching data from backend using promises
    		const response = await fetchData$1(2000);

    		const data = await response;
    		$$invalidate(0, spotlightItems = data);
    	});

    	function nextSlide() {
    		currentIndex = (currentIndex + 1) % spotlightItems.length;
    	}

    	function prevSlide() {
    		currentIndex = (currentIndex - 1 + spotlightItems.length) % spotlightItems.length;
    	}

    	function focusItem(item) {
    		{
    			console.log("item focused", item);
    		}

    		if (send) {
    			send("FOCUS");
    			focusedItem = item;
    		}
    	}

    	function blurItem() {
    		if (send) {
    			send("BLUR");
    			focusedItem = null;
    		}
    	} // Implement logic to hide item's title

    	function navigateToDetail(title) {
    		navigate(`/detail/${encodeURIComponent(title)}`);
    	} // navigate(`/detail/?title=`+ title);
    	// {

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<SpotlightCarousel> was created with unknown prop '${key}'`);
    	});

    	const click_handler = item => navigateToDetail(item.title);
    	const mouseenter_handler = item => focusItem(item);
    	const mouseleave_handler = () => blurItem();

    	$$self.$capture_state = () => ({
    		onMount,
    		navigate,
    		Card,
    		CardText,
    		MaterialApp,
    		itemMachine,
    		getContext,
    		itemContext,
    		send,
    		spotlightItems,
    		currentIndex,
    		focusedItem,
    		fetchData: fetchData$1,
    		nextSlide,
    		prevSlide,
    		focusItem,
    		blurItem,
    		navigateToDetail
    	});

    	$$self.$inject_state = $$props => {
    		if ('send' in $$props) send = $$props.send;
    		if ('spotlightItems' in $$props) $$invalidate(0, spotlightItems = $$props.spotlightItems);
    		if ('currentIndex' in $$props) currentIndex = $$props.currentIndex;
    		if ('focusedItem' in $$props) focusedItem = $$props.focusedItem;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	{
    		if (itemContext) {
    			send = itemContext.send;
    		}
    	}

    	return [
    		spotlightItems,
    		focusItem,
    		blurItem,
    		navigateToDetail,
    		click_handler,
    		mouseenter_handler,
    		mouseleave_handler
    	];
    }

    class SpotlightCarousel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SpotlightCarousel",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\ItemRow.svelte generated by Svelte v3.59.2 */
    const file$1 = "src\\ItemRow.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (34:2) {#each items as item}
    function create_each_block(ctx) {
    	let div;
    	let t_value = /*item*/ ctx[3].title + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[2](/*item*/ ctx[3]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "item");
    			add_location(div, file$1, 34, 4, 786);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*items*/ 1 && t_value !== (t_value = /*item*/ ctx[3].title + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(34:2) {#each items as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let each_value = /*items*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "item-row");
    			add_location(div, file$1, 31, 0, 706);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*navigateToDetail, items*/ 3) {
    				each_value = /*items*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function fetchData(timeout) {
    	return new Promise(resolve => {
    			setTimeout(
    				() => {
    					const sampleData = [
    						{ id: 1, title: "Spotlight Item 1" },
    						{ id: 2, title: "Spotlight Item 2" },
    						{ id: 3, title: "Spotlight Item 3" },
    						{ id: 4, title: "Spotlight Item 4" }
    					];

    					resolve(sampleData);
    				},
    				timeout
    			);
    		});
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ItemRow', slots, []);
    	let items = [];

    	onMount(async () => {
    		const response = await fetchData(2000);
    		const data = await response;
    		$$invalidate(0, items = data);
    	});

    	function navigateToDetail(title) {
    		navigate(`/detail/${encodeURIComponent(title)}`);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ItemRow> was created with unknown prop '${key}'`);
    	});

    	const click_handler = item => navigateToDetail(item.title);

    	$$self.$capture_state = () => ({
    		onMount,
    		navigate,
    		items,
    		fetchData,
    		navigateToDetail
    	});

    	$$self.$inject_state = $$props => {
    		if ('items' in $$props) $$invalidate(0, items = $$props.items);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [items, navigateToDetail, click_handler];
    }

    class ItemRow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ItemRow",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\routes\ItemDetail.svelte generated by Svelte v3.59.2 */

    const { console: console_1 } = globals;
    const file = "src\\routes\\ItemDetail.svelte";

    function create_fragment$1(ctx) {
    	let a;
    	let button;
    	let t1;
    	let div;
    	let h2;
    	let t2;

    	const block = {
    		c: function create() {
    			a = element("a");
    			button = element("button");
    			button.textContent = "Back";
    			t1 = space();
    			div = element("div");
    			h2 = element("h2");
    			t2 = text(/*$title*/ ctx[0]);
    			attr_dev(button, "class", "button-33 svelte-ecehqw");
    			add_location(button, file, 18, 12, 467);
    			attr_dev(a, "href", "/");
    			add_location(a, file, 18, 0, 455);
    			add_location(h2, file, 20, 2, 539);
    			attr_dev(div, "class", "item-detail svelte-ecehqw");
    			add_location(div, file, 19, 0, 511);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, button);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(h2, t2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$title*/ 1) set_data_dev(t2, /*$title*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $title;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ItemDetail', slots, []);
    	let title = writable("");
    	validate_store(title, 'title');
    	component_subscribe($$self, title, value => $$invalidate(0, $title = value));

    	onMount(() => {
    		const pathname = decodeURIComponent(window.location.pathname);
    		console.log("Pathname:", pathname);
    		const parts = pathname.split("/");
    		console.log("Parts:", parts);

    		// Assuming the title is the last part of the URL
    		title.set(parts[parts.length - 1]);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<ItemDetail> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount, writable, title, $title });

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$title, title];
    }

    class ItemDetail extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ItemDetail",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.59.2 */

    // (9:1) <Route path="/">
    function create_default_slot_1(ctx) {
    	let spotlightcarousel;
    	let current;
    	spotlightcarousel = new SpotlightCarousel({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(spotlightcarousel.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(spotlightcarousel, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(spotlightcarousel.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(spotlightcarousel.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(spotlightcarousel, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(9:1) <Route path=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (8:2) <Router>
    function create_default_slot(ctx) {
    	let route0;
    	let t;
    	let route1;
    	let current;

    	route0 = new Route({
    			props: {
    				path: "/",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route1 = new Route({
    			props: {
    				path: "/detail/:title",
    				component: ItemDetail
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route0.$$.fragment);
    			t = space();
    			create_component(route1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(route1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				route0_changes.$$scope = { dirty, ctx };
    			}

    			route0.$set(route0_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(route1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(8:2) <Router>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Router,
    		Route,
    		SpotlightCarousel,
    		ItemRow,
    		ItemDetail
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
