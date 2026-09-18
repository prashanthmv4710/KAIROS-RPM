import * as React from 'react';

/**
 * This app is published standalone on puppy.walmart.com/sharing. This
 * footer deliberately does NOT use Living Design tokens/components and
 * sits in its own fixed strip below the app -- it's plumbing from whoever
 * published this prototype, not part of the app being prototyped, and it
 * should read that way at a glance (plain system font, flat grey bar).
 *
 * The links try to open in a new tab, but we can't be 100% sure the
 * embedding iframe's sandbox grants `allow-popups`, so each URL also rides
 * along in the `title` attribute as a copy/paste fallback.
 */
const PROTOTYPE_HUB_URL = 'https://puppy.walmart.com/sharing/p0b05bu/prototype-hub';
const GITHUB_REPO_URL = 'https://github.com/prashanthmv4710/KAIROS-RPM';

export const PROTOTYPE_FOOTER_HEIGHT = '24px';

const linkStyle: React.CSSProperties = { color: '#666', textDecoration: 'underline' };

export function PrototypeFooter() {
  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        height: PROTOTYPE_FOOTER_HEIGHT,
        lineHeight: PROTOTYPE_FOOTER_HEIGHT,
        zIndex: 1000,
        // Plain block layout + textAlign (not display:flex) to match
        // kairos-rex-director's footer exactly: flex containers treat the
        // whitespace-only text node in `{' | '}` as insignificant and
        // collapse it away entirely, silently eating the spacing around
        // the separator that renders fine in normal inline/block flow.
        textAlign: 'right',
        padding: '0 12px',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '11px',
        color: '#666',
        background: '#eee',
        borderTop: '1px dashed #bbb',
      }}
    >
      Shared prototype &middot;{' '}
      <a
        href={PROTOTYPE_HUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        title={`Open ${PROTOTYPE_HUB_URL} in a new tab`}
        style={{ ...linkStyle, marginLeft: '4px' }}
      >
        Back to Prototype Hub
      </a>
      {' | '}
      <a
        href={GITHUB_REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        title={`Open ${GITHUB_REPO_URL} in a new tab`}
        style={linkStyle}
      >
        GitHub
      </a>
    </div>
  );
}
