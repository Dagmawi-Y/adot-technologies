# Color theme

`theme.css` is the color source for Astro, React, plain CSS, and Tailwind. It is imported once by `global.css`.

Brand primitives (`--brand-*`) hold the approved swatches. Components use semantic tokens (`--color-*`) so a palette change does not require editing each component. Tailwind's `@theme static` exposes these roles as utilities and preserves the CSS variables used by the existing stylesheets.

| Role | Token | Use |
| --- | --- | --- |
| Brand accent | `--color-accent` | Burnt orange `#C05230` details, service icons, secondary calls to action |
| Accent text | `--color-accent-ink` | White text on burnt orange |
| Accent hover | `--color-accent-hover` | Deep rust `#923D26` with white text |
| Soft accent | `--color-accent-soft` | Pale peach `#EFD4C4` for neutral button hover surfaces |
| Primary action | `--color-action` | Deep rust `#923D26` for explicitly colored actions with white text |
| Link and focus | `--color-link`, `--color-focus` | Deep rust on light surfaces |
| Focus surface | `--color-focus-surface` | Cream `#FCF3EE` for focused fields |
| Dark surface | `--color-inverse` | Original charcoal navigation, portfolio, footer |
| Dark surface text | `--color-on-inverse`, `--color-on-inverse-muted` | Original white and gray supporting text |
| Information | `--color-info` | Burnt orange progress indicators |
| Calm accent | `--color-calm` | Muted sage `#727A62`, available for future supporting surfaces |

Use `primary`, `accent`, `outline`, or `white` variants on `LinkButton`. The `primary` link button and React `default` button retain the original charcoal. Use `accent` for burnt orange. Keep hover, focus, error, and disabled colors tied to their semantic roles.

Burnt orange uses white text (4.68:1 contrast); deep rust uses white text (7.20:1). Existing dark surfaces, black buttons, body text, and neutral colors stay unchanged. On dark surfaces, use burnt orange for focus rings. Success and error colors retain their established meanings.

The numbered `--reference-color-*` variables are compatibility aliases for the existing layout stylesheet. New styles should use semantic names. Browser chrome keeps its original charcoal `theme-color` meta value in `Layout.astro` because HTML metadata cannot read CSS variables.
