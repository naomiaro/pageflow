/**
 * Construct data structure that resembles seed generated by server
 * side JBuilder templates.
 *
 * @param {Object} [options]
 * @param {Object} [options.imageFileUrlTemplates] - Mapping of url template names to url templates.
 * @param {String} [options.prettyUrl] - The entry's url (Default share url).
 * @param {Object} [options.shareUrlTemplates] - Mapping of share provider names to sharing urls.
 * @param {String} [options.defaultFileRights] - Default file rights of entry's account.
 * @param {Object} [options.legalInfo] - imprint, copyright and privacy information of entry.
 * @param {Object} [options.themeOptions] - Options set via theme registration.
 * @param {Object} [options.themeAssets] - Paths to theme assets.
 * @param {Object} [options.entry] - attributes of entry.
 * @param {Array} [options.imageFiles] - Array of objects with image file attributes of entry.
 * @param {Array} [options.videoFiles] - Array of objects with video file attributes of entry.
 * @param {Array} [options.audioFiles] - Array of objects with audio file attributes of entry.
 * @param {Array} [options.textTrackFiles] - Array of objects with text track file attributes of entry.
 * @param {Array} [options.chapters] - Array of objects with chapter attributes of entry.
 * @param {Array} [options.sections] - Array of objects with section attributes of entry.
 * @param {Array} [options.contentElements] - Array of objects with content element attributes of entry.
 * @param {Array} [options.widgets] - Array of objects with widget attributes of entry.
 * @returns {Object} - Data that resembles seed generated by server side rendering.
 */
export function normalizeSeed({
  imageFileUrlTemplates,
  fileUrlTemplates,
  fileModelTypes,
  prettyUrl,
  shareUrlTemplates,
  defaultFileRights,
  legalInfo,
  themeOptions,
  themeAssets,
  entry,
  imageFiles,
  videoFiles,
  audioFiles,
  textTrackFiles,
  chapters,
  sections,
  contentElements,
  widgets
} = {}) {
  const entries = entry ? [entry] : [{}];
  const normalizedEntries = normalizeCollection(entries);

  const normalizedContentElements = normalizeCollection(contentElements, {
    typeName: 'textBlock',
    configuration: {}
  });

  const normalizedSections = normalizeSections(sections, normalizedContentElements);
  const normalizedChapters = normalizeChapters(chapters, normalizedSections);

  return {
    config: {
      fileUrlTemplates: {
        imageFiles: {
          ...imageFileUrlTemplates
        },
        videoFiles: {},
        audioFiles: {},
        textTrackFiles: {},
        ...fileUrlTemplates
      },
      fileModelTypes: {
        audioFiles: 'Pageflow::AudioFile',
        imageFiles: 'Pageflow::ImageFile',
        textTrackFiles: 'Pageflow::TextTrackFile',
        videoFiles: 'Pageflow::VideoFile',
        ...fileModelTypes
      },
      prettyUrl: prettyUrl,
      shareUrlTemplates: normalizeShareUrlTemplates(shareUrlTemplates),
      defaultFileRights: defaultFileRights,
      legalInfo: normalizeLegalInfo(legalInfo),
      theme: normalizeTheme({themeOptions, themeAssets})
    },
    collections: {
      entries: normalizedEntries,
      imageFiles: normalizeCollection(imageFiles, {
        isReady: true,
        width: 1920,
        height: 1279,
        configuration: {}
      }),
      videoFiles: normalizeCollection(videoFiles, {
        isReady: true,
        width: 1920,
        height: 1279,
        configuration: {}
      }),
      audioFiles: normalizeCollection(audioFiles, {
        isReady: true,
        configuration: {}
      }),
      textTrackFiles: normalizeCollection(textTrackFiles, {
        parentFileId: null,
        parentFileType: null,
        configuration: {}
      }),
      chapters: normalizedChapters,
      sections: normalizedSections,
      contentElements: normalizedContentElements,
      widgets: normalizeWidgets(widgets)
    }
  }
}

function normalizeSections(sections = [], contentElements) {
  const sectionDefaults = {
    configuration: {transition: 'scroll', backdrop: {image: '#000'}}
  };

  if (contentElements.length && !sections.length) {
    contentElements.forEach(contentElement => contentElement.sectionId = 10);
    return [
      {
        id: 10,
        permaId: 1,
        ...sectionDefaults
      }
    ];
  }

 return normalizeCollection(sections, sectionDefaults);
}

function normalizeChapters(chapters = [], sections) {
  const chapterDefaults = {
    configuration: {}
  };

  if (sections.length && !chapters.length) {
    sections.forEach(section => section.chapterId = 100);
    return [
      {
        id: 100,
        permaId: 10,
        ...chapterDefaults
      }
    ]
  }

  return normalizeCollection(chapters, chapterDefaults);
}

function normalizeShareUrlTemplates(shareUrlTemplates) {
  if(shareUrlTemplates) {
    return shareUrlTemplates;
  } else {
    return {
      email: 'mailto:?body=%{url}',
      facebook: 'http://www.facebook.com/sharer/sharer.php?u=%{url}',
      google: 'https://plus.google.com/share?url=%{url}',
      linked_in: 'https://www.linkedin.com/shareArticle?mini=true&url=%{url}',
      telegram: 'tg://msg?text=%{url}',
      twitter: 'https://twitter.com/intent/tweet?url=%{url}',
      whats_app: 'WhatsApp://send?text=%{url}'
    }
  }
}

function normalizeLegalInfo(legalInfo) {
  if (legalInfo) {
    return legalInfo;
  } else {
    return {
      imprint: {label: '',url: ''},
      copyright: {label: '',url: ''},
      privacy: {label: '',url: ''},
    }
  }
}

function normalizeTheme({themeAssets, themeOptions}) {
  return {
    assets: {
      icons: {},
      ...themeAssets
    },
    options: {
      colors: {},
      ...themeOptions
    }
  }
}

function normalizeWidgets(widgets = []) {
  return widgets.map(widget => ({
    permaId: widget.role,
    configuration: {},
    ...widget
  }));
}

function normalizeCollection(collection = [], defaults = {}) {
  return collection.map((item, index) => ({
    id: index + 1,
    permaId: index + 1,
    ...defaults,
    ...item
  }));
}
