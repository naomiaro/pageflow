import {watchCollection} from '../collections';

export function watchCollections(entry, {dispatch}) {
  const {chapters, sections, contentElements, files} = entry;
  watchCollection(new Backbone.Collection([entry.configuration]), {
    name: 'entries',
    attributes: ['id', {shareProviders: 'share_providers'}, {shareUrl: 'share_url'}],
    dispatch
  });
  watchCollection(chapters, {
    name: 'chapters',
    attributes: ['id', 'permaId'],
    includeConfiguration: true,
    dispatch
  });
  watchCollection(sections, {
    name: 'sections',
    attributes: ['id', 'permaId', 'chapterId'],
    includeConfiguration: true,
    dispatch
  });
  watchCollection(contentElements, {
    name: 'contentElements',
    attributes: ['id', 'permaId', 'typeName', 'sectionId'],
    keyAttribute: 'permaId',
    includeConfiguration: true,
    dispatch
  });

  Object.keys(files).forEach(collectionName => {
    watchCollection(files[collectionName], {
      name: camelize(collectionName),
      attributes: ['id', {permaId: 'perma_id'}, 'width', 'height', 'basename'],
      keyAttribute: 'permaId',
      includeConfiguration: true,
      dispatch
    });
  });
}

function camelize(snakeCase) {
  return snakeCase.replace(/_[a-z]/g, function(match) {
    return match[1].toUpperCase();
  });
}
