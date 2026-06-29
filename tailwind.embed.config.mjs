import base from './tailwind.config.mjs';
import typography from '@tailwindcss/typography';
import forms from '@tailwindcss/forms';
import scrollbarHide from 'tailwind-scrollbar-hide';

/*
 * Embed config: identical to the standalone config, except the forms plugin runs
 * with the `class` strategy. The default `base` strategy injects global element
 * selectors (`input`, `[type='text']`, `textarea`, `select`, …) which would leak
 * into and overwrite a host application's form styling. With the `class` strategy
 * those styles are only applied via explicit `form-*` classes, so nothing global
 * is emitted.
 */
export default {
  ...base,
  plugins: [
    typography,
    forms({ strategy: 'class' }),
    scrollbarHide,
    ({ addVariant }) => {
      addVariant('fullscreen', '.is-fullscreen &');
    },
  ],
};
