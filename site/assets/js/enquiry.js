/* Private dining enquiry: rendered from the live Wix form schema (see js/wix/).
   Fields, labels, required marks and the thank-you text all come from the form in the Wix dashboard. */
import { createFormStore, FORM_ERROR } from '../../js/wix/form-store.js';

var DEFAULT_FORM_ID = 'f7951ef6-cde3-47a8-9789-737f9084dc3a';
var root = document.getElementById('enquiry-root');
var FORM_ID = (root && root.getAttribute('data-form-id')) || DEFAULT_FORM_ID;
if (root) {
  var store = createFormStore({ formId: FORM_ID });
  var formEl = null, sig = '', els = {}, wantRole = '';

  var el = function (tag, attrs, text) {
    var n = document.createElement(tag);
    for (var k in (attrs || {})) n.setAttribute(k, attrs[k]);
    if (text) n.textContent = text;
    return n;
  };

  function labelText(form, f) {
    var t = f.label;
    if (f.required && form.requiredIndicator === 'ASTERISK') t = form.requiredIndicatorBefore ? '* ' + t : t + ' *';
    if (f.required && form.requiredIndicator === 'TEXT') t += ' (required)';
    return t;
  }

  function control(f) {
    var c = f.control, i;
    if (c === 'textarea') return el('textarea', { name: f.target });
    if (c === 'select') {
      var s = el('select', { name: f.target });
      s.appendChild(el('option', { value: '' }, ''));
      f.choices.forEach(function (o) { s.appendChild(el('option', { value: o.value }, o.label)); });
      return s;
    }
    if (c === 'checkbox') return el('input', { type: 'checkbox', name: f.target });
    if (c === 'radio') {
      var g = el('div', { class: 'choices', role: 'radiogroup' });
      f.choices.forEach(function (o) {
        var r = el('label', { class: 'choice' });
        r.appendChild(el('input', { type: 'radio', name: f.target, value: o.value }));
        r.appendChild(document.createTextNode(o.label));
        g.appendChild(r);
      });
      return g;
    }
    if (c === 'file') {
      var fi = el('input', { type: 'file', name: f.target });
      if (f.validation.accept) fi.setAttribute('accept', f.validation.accept);
      if (f.validation.fileLimit > 1) fi.multiple = true;
      return fi;
    }
    if (c === 'signature' || c === 'payment' || c === 'appointment' || c === 'unknown') return null;
    var type = { email: 'email', phone: 'tel', url: 'url', number: 'number', rating: 'number', date: 'date', time: 'time', datetime: 'datetime-local', password: 'password' }[c] || 'text';
    i = el('input', { type: type, name: f.target });
    if (f.placeholder) i.setAttribute('placeholder', f.placeholder);
    if (type === 'number') {
      if (f.validation.minimum != null) i.min = f.validation.minimum;
      if (f.validation.maximum != null) i.max = f.validation.maximum;
      if (f.validation.multipleOf) i.step = f.validation.multipleOf;
    }
    if (type === 'date') {
      if (f.validation.minDate) i.min = String(f.validation.minDate).slice(0, 10);
      if (f.validation.maxDate) i.max = String(f.validation.maxDate).slice(0, 10);
    }
    return i;
  }

  /* A careers popup's "Apply for this role" asks for its role to be chosen: the first dropdown that offers it */
  function pickRole() {
    var st = store.getState();
    if (!wantRole || !st.form) return;
    var f = st.form.fields.filter(function (x) { return x.control === 'select' && x.choices.some(function (o) { return o.value === wantRole; }); })[0];
    if (!f || !els[f.target]) return;
    store.setValue(f.target, wantRole);
    els[f.target].input.value = wantRole;
  }
  document.addEventListener('careers:role', function (e) { wantRole = e.detail; pickRole(); });

  function build(state) {
    var form = state.form;
    formEl = el('form', { class: 'form', novalidate: '' });
    els = {};
    form.fields.forEach(function (f) {
      var lab = el(f.control === 'radio' ? 'div' : 'label', f.control === 'textarea' ? { class: 'full' } : f.control === 'radio' ? { class: 'grp' } : {});
      lab.appendChild(document.createTextNode(labelText(form, f)));
      var c = control(f);
      if (!c) { lab.appendChild(el('span', {}, 'This field type is not supported on this page.')); formEl.appendChild(lab); return; }
      c.setAttribute('aria-describedby', 'err-' + f.target);
      if (f.control === 'radio') {
        c.addEventListener('change', function (e) { store.setValue(f.target, e.target.value); store.validate(f.target); });
      } else if (f.control === 'file') {
        c.addEventListener('change', function () { store.setValue(f.target, Array.prototype.slice.call(c.files)); store.validate(f.target); });
      } else {
        c.addEventListener(c.tagName === 'SELECT' || c.type === 'checkbox' ? 'change' : 'input', function () {
          store.setValue(f.target, c.type === 'checkbox' ? c.checked : c.value);
        });
        c.addEventListener('blur', function () { store.validate(f.target); });
      }
      lab.appendChild(c);
      if (f.description) lab.appendChild(el('small', {}, f.description));
      var err = el('p', { id: 'err-' + f.target, role: 'alert', style: 'color:#b3261e;font-size:13px;margin:0;text-transform:none;letter-spacing:0' });
      lab.appendChild(err);
      els[f.target] = { input: c, err: err };
      formEl.appendChild(lab);
    });
    var foot = el('div', { class: 'full' });
    els.formErr = el('p', { role: 'alert', style: 'color:#b3261e;font-size:14px;margin:0 0 12px' });
    foot.appendChild(els.formErr);
    els.btn = el('button', { class: 'pill pill--solid', type: 'submit' }, form.submitText || 'Send enquiry');
    foot.appendChild(els.btn);
    if (!root.hasAttribute('data-no-alt')) {
    foot.appendChild(document.createTextNode(' '));
    var alt = el('a', { class: 'pill', href: 'https://restaurant-1779620176.resos.com/booking', target: '_blank', rel: 'noopener' }, 'Book a table instead');
    foot.appendChild(alt);
    }
    formEl.appendChild(foot);
    formEl.addEventListener('submit', function (e) { e.preventDefault(); store.submit(e); });
    root.replaceChildren(formEl);
    pickRole();
  }

  function render() {
    var s = store.getState();
    if (s.outcome) {
      var box = el('div', { class: 'enq-done', role: 'status' });
      var o = s.outcome;
      if (o.url) { if (o.newTab) window.open(o.url); else window.location.assign(o.url); }
      (o.message || 'Thank you. We have received your enquiry.').split('\n').forEach(function (p) { box.appendChild(el('p', {}, p)); });
      root.replaceChildren(box); formEl = null; sig = '';
      return;
    }
    if (!s.form) {
      if (s.errors[FORM_ERROR]) root.replaceChildren(el('p', { role: 'alert' }, s.errors[FORM_ERROR]));
      return;
    }
    if (s.closed) { root.replaceChildren(el('p', {}, s.form.disabledMessage || 'This form is no longer accepting responses.')); formEl = null; return; }
    var now = s.form.fields.map(function (f) { return f.target; }).join('|');
    if (!formEl || now !== sig) { build(s); sig = now; }
    s.form.fields.forEach(function (f) {
      var e = els[f.target]; if (!e) return;
      var msg = s.errors[f.target] || '';
      e.err.textContent = msg;
      if (msg) e.input.setAttribute('aria-invalid', 'true'); else e.input.removeAttribute('aria-invalid');
    });
    els.formErr.textContent = s.errors[FORM_ERROR] || '';
    els.btn.disabled = !!s.loading;
  }

  store.subscribe(render);
  root.textContent = root.getAttribute('data-loading') || 'Loading the enquiry form…';
  store.start();
  render();
}
