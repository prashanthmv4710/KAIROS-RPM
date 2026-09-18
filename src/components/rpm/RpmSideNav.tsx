import * as React from 'react';

import { Icon } from '../../components/Icons';
import { cx } from '../../common/cx';
import { loadIconFont } from '../../utils/iconManager';
import './RpmSideNav.css';

/**
 * Figma's "Expand collapse" spec (node 12642:73191) uses PX's line-style
 * icons — [PX] ArrowRightLine (expand) and [PX] ArrowLineLeft (collapse).
 * Both exist only in the `px` icon font (codepoints `ArrowLineRight` /
 * `ArrowLineLeft` per src/fonts/px/PXIcons.tsx), not in `wcp` (Walmart's
 * active theme font) — and the themed <Icon> component always resolves
 * through the theme's one primary font with no per-call override. `px`
 * isn't in Walmart's `_loadFonts` list, so its @font-face is loaded here on
 * demand via the sanctioned `loadIconFont` utility, and the two glyphs are
 * rendered directly with the `px`/`px-` prefix (mirroring <Icon>'s own
 * markup) so the exact Figma icons show up regardless of active theme.
 */
const PX_ICON_PREFIX = 'px';

function PxIcon({ name, decorative }: { name: 'ArrowLineLeft' | 'ArrowLineRight'; decorative?: boolean }) {
  return (
    <i
      aria-hidden={decorative ? true : undefined}
      className={`${PX_ICON_PREFIX} ${PX_ICON_PREFIX}-${name}`}
      style={{ fontSize: '1rem', verticalAlign: '-0.175em' }}
    />
  );
}

export interface RpmSideNavMenuItem {
  id: string;
  label: string;
  /** Font icon name — see src/components/Icons */
  iconName: string;
}

export interface RpmSideNavProps {
  menuItems: RpmSideNavMenuItem[];
  activeMenuItem?: string;
  onMenuItemClick?: (itemId: string) => void;
  /** Whether the sidebar starts pinned open (expanded) rather than hover-to-expand. */
  defaultLocked?: boolean;
  /** Accessible label for the sidebar landmark. */
  'aria-label'?: string;
}

const MIN_WIDTH = 64;
const MAX_WIDTH = 400;
const DEFAULT_WIDTH = 220;
const COLLAPSED_WIDTH = 64;

/**
 * Left navigation rail — hover-to-expand, lock, and resize, ported from the
 * Kairos REX Director reference app's AppSidebar (same underlying
 * SidebarShell visual system, reauthored locally because SidebarShell is
 * generated/read-only and its built-in lock toggle always renders the
 * static label "Lock" with no prop to relabel it when locked).
 */
export function RpmSideNav({
  menuItems,
  activeMenuItem,
  onMenuItemClick,
  defaultLocked = false,
  'aria-label': ariaLabel = 'Application navigation',
}: RpmSideNavProps) {
  const [locked, setLocked] = React.useState(defaultLocked);
  const [hovered, setHovered] = React.useState(false);
  const [width, setWidth] = React.useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = React.useState(false);
  const resizeStartX = React.useRef(0);
  const resizeStartWidth = React.useRef(0);

  const expanded = locked || hovered;

  React.useEffect(() => {
    loadIconFont(PX_ICON_PREFIX);
  }, []);

  React.useEffect(() => {
    if (!isResizing) return;
    const onMove = (e: MouseEvent) => {
      const delta = e.clientX - resizeStartX.current;
      const next = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, resizeStartWidth.current + delta));
      setWidth(next);
    };
    const onUp = () => setIsResizing(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [isResizing]);

  const handleToggleLock = () => {
    if (locked) {
      setLocked(false);
      // `expanded` is `locked || hovered` — the cursor is still physically
      // over the sidebar right after this click, so `hovered` alone would
      // keep it expanded until the mouse eventually leaves. Clear it here
      // so "Collapse" collapses immediately.
      setHovered(false);
    } else {
      setLocked(true);
      if (width < DEFAULT_WIDTH) setWidth(DEFAULT_WIDTH);
    }
  };

  return (
    <aside
      aria-label={ariaLabel}
      className="rpm-sidenav"
      style={{
        width: expanded ? `${width}px` : `${COLLAPSED_WIDTH}px`,
        transition: isResizing ? 'none' : 'width 300ms ease-in-out',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <nav aria-label="Main" className="rpm-sidenav__items">
        {menuItems.map((item) => {
          const isActive = activeMenuItem === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={cx(
                'rpm-sidenav__item',
                expanded ? 'rpm-sidenav__item--expanded' : 'rpm-sidenav__item--collapsed',
                isActive && expanded && 'rpm-sidenav__item--active'
              )}
              onClick={() => onMenuItemClick?.(item.id)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={!expanded ? item.label : undefined}
              title={!expanded ? item.label : undefined}
            >
              <span className="rpm-sidenav__item-content">
                <span className={cx('rpm-sidenav__item-icon', isActive && 'rpm-sidenav__item-icon--active')}>
                  <Icon name={item.iconName} size="small" decorative />
                </span>
                {expanded ? (
                  <span className={cx('rpm-sidenav__item-label', isActive && 'rpm-sidenav__item-label--active')}>
                    {item.label}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </nav>

      <div>
        <button
          type="button"
          className={cx(
            'rpm-sidenav__toggle',
            expanded ? 'rpm-sidenav__toggle--expanded' : 'rpm-sidenav__toggle--collapsed'
          )}
          onClick={handleToggleLock}
          aria-label={!expanded ? (locked ? 'Collapse sidebar' : 'Lock sidebar open') : undefined}
          aria-expanded={locked}
        >
          <span className="rpm-sidenav__toggle-icon">
            <PxIcon name={locked ? 'ArrowLineLeft' : 'ArrowLineRight'} decorative />
          </span>
          {expanded ? (
            <span className="rpm-sidenav__toggle-label">{locked ? 'Collapse' : 'Lock'}</span>
          ) : null}
        </button>
      </div>

      {expanded ? (
        <div
          className="rpm-sidenav__resize-handle"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizing(true);
            resizeStartX.current = e.clientX;
            resizeStartWidth.current = width;
          }}
        />
      ) : null}
    </aside>
  );
}
