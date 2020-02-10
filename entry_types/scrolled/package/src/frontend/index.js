import React from 'react';
import ReactDOM from 'react-dom';

import {AppHeader} from './navigation/AppHeader';
import Entry from './Entry';

import './global.module.css';
import {EntryStateProvider} from '../entryState';

export {api as frontend} from './api';

export * from './Image';
export * from './Text';
export * from './Video';

export * from './useOnScreen';
export * from './useMediaSettings';

export * from './SectionThumbnail';
export {default as Entry} from './Entry';
export {EntryStateProvider} from '../entryState/EntryStateProvider'

window.pageflowScrolledRender = function(seed) {
  ReactDOM.render(<Root seed={seed} />, document.getElementById('root'));
}

function Root({seed}) {
  return (
    <>
      <EntryStateProvider seed={seed}>
        <AppHeader />
        <Entry />
      </EntryStateProvider>
    </>
  );
}
