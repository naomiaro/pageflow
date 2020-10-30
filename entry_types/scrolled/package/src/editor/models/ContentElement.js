import Backbone from 'backbone';
import {editor} from '../api';

import {
  configurationContainer,
  entryTypeEditorControllerUrls,
  failureTracking,
  delayedDestroying
} from 'pageflow/editor';

export const ContentElement = Backbone.Model.extend({
  paramRoot: 'content_element',

  mixins: [
    configurationContainer({
      autoSave: true,
      includeAttributesInJSON: ['position', 'typeName']
    }),
    delayedDestroying,
    entryTypeEditorControllerUrls.forModel({resources: 'content_elements'}),
    failureTracking
  ],

  getType(contentElement) {
    return editor.contentElementTypes.findByTypeName(this.get('typeName'));
  },

  postCommand(command) {
    this.trigger('postCommand', this.id, command);
  },

  getAdjacentContentElements() {
    const section = this.section;
    const index = section.contentElements.indexOf(this);

    return [
      section.contentElements.at(index - 1),
      section.contentElements.at(index + 1)
    ];
  },

  applyDefaultConfiguration(sibling) {
    this.configuration.set({
      ...this.getType().defaultConfig,
      position: sibling.getDefaultSiblingPosition()
    });
  },

  getPosition() {
    return this.configuration.get('position') || 'inline';
  },

  getAvailablePositions() {
    const supportedByLayout =
      this.section.configuration.get('layout') === 'center' ?
      ['inline', 'left', 'right', 'full'] :
      ['inline', 'sticky', 'full'];
    const supportedByType = this.getType().supportedPositions;

    if (supportedByType) {
      return supportedByLayout.filter(position => supportedByType.includes(position));
    }
    else {
      return supportedByLayout;
    }
  },

  getDefaultSiblingPosition() {
    const position = this.getPosition();

    if (position === 'full') {
      return 'inline';
    }

    return position;
  }
});
