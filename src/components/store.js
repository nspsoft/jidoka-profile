export const store = {
  get(k) {
    try {
      return typeof window !== 'undefined' && window.localStorage ? localStorage.getItem(k) : null;
    } catch (e) {
      return null;
    }
  },
  set(k, v) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) localStorage.setItem(k, v);
    } catch (e) {}
  }
};
