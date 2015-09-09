/**
 * Mixin for input views handling common concerns like labels,
 * inline help, visiblity and disabling.
 *
 * ## Label and Inline Help Translations
 *
 * By default `#labelText` and `#inlineHelpText` are defined through
 * translations. If no `attributeTranslationKeyPrefixes` are given,
 * translation keys for labels and inline help are constructed from
 * the `i18nKey` of the model and the given `propertyName`
 * option. Suppose the model's `i18nKey` is "page" and the
 * `propertyName` option is "title". Then the key
 *
 *     activerecord.attributes.page.title
 *
 * will be used for the label. And the key
 *
 *     pageflow.ui.inline_help.page.title
 *
 * will be used for the inline help.
 *
 * ### Attribute Translation Key Prefixes
 *
 * The `attributeTranslationKeyPrefixes` option can be used to supply
 * an array of scopes in which label and inline help translations
 * shall be looked up based on the `propertyName` option.
 *
 * Suppose the array `['some.attributes', 'fallback.attributes']` is
 * given as `attributeTranslationKeyPrefixes` option. Then, in the
 * example above, the first existing translation key is used as label:
 *
 *     some.attributes.title.label
 *     fallback.attributes.title.label
 *     activerecord.attributes.post.title
 *
 * Accordingly, for the inline help:
 *
 *     some.attributes.title.inline_help
 *     fallback.attributes.title.inline_help
 *     pageflow.ui.inline_help.post.title
 *
 * This setup allows to keep all translation keys for an attribute
 * to share a common prefix:
 *
 *    some:
 *      attributes:
 *        title:
 *          label: "Label"
 *          inline_help: "..."
 *          inline_help_disabled: "..."
 *
 * ### Inline Help for Disabled Inputs
 *
 * For each inline help translation key, a separate key with an
 * `"_disbaled"` suffix can be supplied, which provides a help string
 * that shall be displayed when the input is disabled. More specific
 * attribute translation key prefixes take precedence over suffixed
 * keys:
 *
 *     some.attributes.title.inline_help
 *     some.attributes.title.inline_help_disabled
 *     fallback.attributes.title.inline_help
 *     fallback.attributes.title.inline_help_disabled
 *     pageflow.ui.inline_help.post.title
 *     pageflow.ui.inline_help.post.title_disabled
 *
 * @option propertyName [String]
 *   Name of the attribute on the model to display and edit.
 *
 * @option label [String]
 *   Label text for the input.
 *
 * @option attributeTranslationKeyPrefixes [Array<String>]
 *   An array of prefixes to lookup translations for labels and
 *   inline help texts based on attribute names.
 *
 * @option disabled [Boolean]
 *   Render input as disabled.
 *
 * @option visibleBinding [String]
 *   Name of an attribute to control whether the input is visible. If
 *   the `visible` and `visibleBindingValue` options are not set,
 *   input will be visible whenever this attribute as a truthy value.
 *
 * @option visible [Function|Boolean]
 *   A Function taking the value of the `visibleBinding` attribute as
 *   parameter. Input will be visible only if function returns `true`.
 *
 * @option visibleBindingValue [Any]
 *   Input will be visible whenever the value of the `visibleBinding`
 *   attribute equals the value of this option.
 */
pageflow.inputView = {
  ui: {
    labelText: 'label .name',
    inlineHelp: 'label .inline_help'
  },

  /**
   * Returns an array of translation keys based on the propertyName
   * options and the given prefixes.
   *
   * @param keyName [String]
   *   Suffix to append to prefixes.
   *
   * @option attributeTranslationKeyPrefixes [Array<String>]
   *   An array of strings to use as prefixes to constructs
   *   translation keys.
   *
   * @option fallbackPrefix [String]
   *   Optional additional prefix to form a model based translation
   *   key of the form `prefix.modelI18nKey.propertyName.keyName
   *
   * @api edge
   */
  attributeTranslationKeys: function(keyName, options) {
    var result = [];

    if (this.options.attributeTranslationKeyPrefixes) {
      result = result.concat(_(this.options.attributeTranslationKeyPrefixes).map(function(prefix) {
        return prefix + '.' + this.options.propertyName + '.' + keyName;
      }, this));
    }

    if (options && options.fallbackPrefix) {
      result.push(options.fallbackPrefix + '.' + this.model.i18nKey + '.' + this.options.propertyName);
    }

    return result;
  },

  /** @private */
  onRender: function() {
    this.$el.addClass(this.model.modelName + '_' + this.options.propertyName);
    this.ui.labelText.text(this.labelText());

    this.ui.inlineHelp.text(this.inlineHelpText());

    if (!this.inlineHelpText()) {
      this.ui.inlineHelp.hide();
    }

    this.updateDisabled();
    this.setupVisibleBinding();
  },

  labelText: function() {
    return this.options.label || this.localizedAttributeName();
  },

  localizedAttributeName: function() {
    return pageflow.i18nUtils.findTranslation(this.attributeTranslationKeys('label', {fallbackPrefix: 'activerecord.attributes'}));
  },

  inlineHelpText: function() {
    var keys = this.attributeTranslationKeys('inline_help', {fallbackPrefix: 'pageflow.ui.inline_help'});

    if (this.options.disabled) {
      keys = pageflow.i18nUtils.translationKeysWithSuffix(keys, 'disabled');
    }

    return pageflow.i18nUtils.findTranslation(keys, {defaultValue: ''});
  },

  /** @private */
  updateDisabled: function() {
    if (this.ui.input) {
      this.updateDisabledAttribute(this.ui.input);
    }
  },

  /** @private */
  updateDisabledAttribute: function(element) {
    if (this.options.disabled) {
      element.attr('disabled', true);
    }
    else {
      element.removeAttr('disabled');
    }
  },

  /** @private */
  setupVisibleBinding: function() {
    var view = this;

    if (this.options.visibleBinding) {
      this.listenTo(this.model, 'change:' + this.options.visibleBinding, updateVisible);
      updateVisible(this.model, this.model.get(this.options.visibleBinding));
    }

    function updateVisible(model, value) {
      view.$el.toggle(isVisible(value));
    }

    function isVisible(value) {
      if (view.options.visibleBindingValue) {
        return value === view.options.visibleBindingValue;
      }
      else if (typeof view.options.visible === 'function') {
        return !!view.options.visible(value);
      }
      else if ('visible' in view.options) {
        return !!view.options.visible;
      }
      else {
        return !!value;
      }
    }
  }
};