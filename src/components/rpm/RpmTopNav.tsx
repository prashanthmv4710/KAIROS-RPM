import * as React from 'react';

import { Masthead } from '../../components/Masthead';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icons';
import './RpmTopNav.css';

export interface RpmTopNavProps {
  /** Active store number shown in the location switcher, e.g. "4535". */
  storeNumber: string;
}

/**
 * Top application bar for the Kairos RPM tool — brand wordmark, active
 * project switcher, and the notification / help / account action cluster.
 * Theming matches the Kairos REX Director reference app's masthead: the
 * nav-label text is dialed down to the subtle text token instead of full
 * body text, giving the light, low-contrast top bar in that reference.
 */
export function RpmTopNav({ storeNumber }: RpmTopNavProps) {
  return (
    <Masthead
      a11yLabel="Kairos application header"
      appName="Kairos"
      UNSAFE_className="rpm-top-nav-masthead"
      rightSlot={
        // `rightSlot` renders as the first child of the masthead's
        // right-hand flex group, immediately before the built-in
        // Bell/Help/Account cluster — that group's own flex `gap` already
        // contributes 8px (--ld-semantic-spacing-100) toward the
        // notification icon, so an extra 16px (--ld-primitive-scale-space-200)
        // right margin here makes the total gap exactly 24px. Unlike the
        // old `centerSlot` (which is absolutely centered in the bar), a
        // `rightSlot` child is a normal flex item, so it renders left-aligned
        // within its own slot rather than centered.
        <span style={{ marginRight: 'var(--ld-primitive-scale-space-200)' }}>
          <Button
            variant="tertiary"
            size="small"
            leading={<Icon name="Location" decorative />}
            trailing={<Icon name="ChevronDown" decorative />}
          >
            Store# {storeNumber}
          </Button>
        </span>
      }
      onNotificationClick={() => {}}
      notificationDot
      notificationLabel="Notifications"
      onHelpClick={() => {}}
      helpLabel="Help"
      onAccountClick={() => {}}
      accountLabel="Account"
      UNSAFE_style={{
        ['--ld-semantic-color-topNav-fill' as string]: 'var(--ld-semantic-color-surface)',
        ['--ld-semantic-color-topNav-text-onFill' as string]: 'var(--ld-semantic-color-text-subtle)',
        ['--ld-semantic-color-topNav-separator' as string]: 'var(--ld-semantic-color-separator)',
      }}
    />
  );
}
