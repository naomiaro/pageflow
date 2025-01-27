import {EffectListInputView} from 'editor/views/inputs/EffectListInputView';

import Backbone from 'backbone';

import {within} from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import {useFakeTranslations} from 'pageflow/testHelpers';

describe('EffectListInputView', () => {
  useFakeTranslations({
    'pageflow_scrolled.editor.backdrop_effects.blur.label': 'Blur',
    'pageflow_scrolled.editor.effect_list_input.add': 'Add effect',
    'pageflow_scrolled.editor.effect_list_input.remove': 'Remove effect'
  });

  it('displays effects', () => {
    const model = new Backbone.Model({effects: [
      {name: 'blur', value: 30}
    ]});

    const view = new EffectListInputView({model, propertyName: 'effects'});
    view.render();

    expect(view.el).toHaveTextContent('Blur 30');
  });

  it('allows adding effects', () => {
    const model = new Backbone.Model();

    const view = new EffectListInputView({model, propertyName: 'effects'});

    const {getByRole} = within(view.render().el);
    userEvent.click(getByRole('button', {name: 'Add effect'}));
    userEvent.click(getByRole('link', {name: 'Blur'}));

    expect(model.get('effects')).toEqual([{name: 'blur', value: 50}])
  });

  it('allows removing effects', () => {
    const model = new Backbone.Model({effects: [
      {name: 'blur', value: 30}
    ]});

    const view = new EffectListInputView({model, propertyName: 'effects'});

    const {getByRole} = within(view.render().el);
    userEvent.click(getByRole('button', {name: 'Remove effect'}));

    expect(model.get('effects')).toEqual([])
  });
});
