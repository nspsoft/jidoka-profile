import { store } from './components/store.js';

export let LANG = store.get('jri-lang') || 'en';

export const getLang = () => LANG;

export const setLang = l => {
  LANG = l;
  store.set('jri-lang', l);
};

export const L = o => (o ? (o[LANG] !== undefined ? o[LANG] : o.en) : '');
