import * as React from 'react';

import { Page } from '../components/Page';
import { Heading } from '../components/Text';
import { Button } from '../components/Button';
import { Icon } from '../components/Icons';
import { TabNavigation, TabNavigationItem } from '../components/TabNavigation';
import { ContentMessage } from '../components/ContentMessage';

import { RpmTopNav } from '../components/rpm/RpmTopNav';
import { RpmSideNav, type RpmSideNavMenuItem } from '../components/rpm/RpmSideNav';
import { ProjectHeader } from '../components/rpm/ProjectHeader';
import { OrderStatusMetrics } from '../components/rpm/OrderStatusMetrics';
import { RejectedOrdersTable } from '../components/rpm/RejectedOrdersTable';
import { rejectedOrders } from '../data/rejectedOrdersData';
import { PROTOTYPE_FOOTER_HEIGHT } from '../components/custom/PrototypeFooter';

const ORDER_TABS = [
  { value: 'active', label: 'Active orders', count: 3242 },
  { value: 'pending', label: 'Pending & queued orders', count: 3242 },
] as const;

const STATUS_METRICS = [
  { value: 'excess', label: 'Excess quantity for approval', count: 342 },
  { value: 'rejected', label: 'Rejected', count: 342 },
  { value: 'queued', label: 'Queued', count: 342 },
];

const NAV_ITEMS: RpmSideNavMenuItem[] = [
  { id: 'home', label: 'Home', iconName: 'Home' },
  { id: 'orders', label: 'Orders', iconName: 'Article' },
  { id: 'receiving', label: 'Receiving', iconName: 'Truck' },
  { id: 'departments', label: 'Departments', iconName: 'Facility' },
];

// Shared wrapper for the "Design in progress" placeholders below. ContentMessage
// only centers its own text (text-align: center) — the component itself is a
// block that stretches to the full width of its flex-column parent, so without
// this wrapper it renders left-hugging the top of a mostly-empty scroll pane.
// `flex: 1` lets it claim the remaining vertical space in that column so
// alignItems/justifyContent can center the message both horizontally and
// vertically within it.
const EMPTY_STATE_WRAPPER_STYLE: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  // Floor so the message still has real breathing room to center within
  // even if the scroll pane itself is short (e.g. a small viewport) —
  // `flex: 1` alone would let it collapse toward zero height there.
  minHeight: '20rem',
};

/**
 * Orders page for the Kairos RPM (Rejected & queued order reprocess) flow.
 * The project header + page title + tabs are fixed (outside the scroll
 * pane) so they stay visible while only the body below — the KPI cards and
 * the data table — scrolls. That body has no gray canvas or elevated Card:
 * it sits directly on the page's white background, matching the Figma
 * design.
 */
export default function OrdersPage() {
  const [activeTab, setActiveTab] = React.useState<(typeof ORDER_TABS)[number]['value']>('pending');
  const [activeMetric, setActiveMetric] = React.useState('rejected');

  // Collapse the blue ProjectHeader band while scrolling down (to give the
  // table more room), and bring it back while scrolling up -- a common
  // pattern for secondary header content that isn't needed once you're
  // already reading the list. Small deltas are ignored so trackpad/momentum
  // jitter doesn't flicker it, and scrolling back near the top always shows
  // it again regardless of direction.
  const [isProjectHeaderCollapsed, setIsProjectHeaderCollapsed] = React.useState(false);
  const lastScrollTopRef = React.useRef(0);

  const handleBodyScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = event.currentTarget;
    const delta = scrollTop - lastScrollTopRef.current;

    if (scrollTop <= 4) {
      setIsProjectHeaderCollapsed(false);
    } else if (Math.abs(delta) > 4) {
      setIsProjectHeaderCollapsed(delta > 0);
    }

    lastScrollTopRef.current = scrollTop;
  };

  return (
    <Page title="Orders — Project 00500/RM, pending and queued reprocess queue" titleVisuallyHidden>
      {/* `position: fixed` (not height: '100vh') pins the whole app shell to
          the viewport regardless of `<main>`'s own `min-height: 100vh` or
          anything else in the document. With `height: 100vh` alone, this div
          was still a normal in-flow block — a wheel scroll over the
          non-scrollable header band (or any other in-flow area) had nowhere
          local to go and fell through to <body>, scrolling the entire page,
          masthead and side nav included. Taking the shell out of flow
          entirely means there is no outer scroll surface left to fall
          through to; only the one `overflow-y: auto` pane below can ever
          move. */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: PROTOTYPE_FOOTER_HEIGHT, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <RpmTopNav storeNumber="4535" />

        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <RpmSideNav menuItems={NAV_ITEMS} activeMenuItem="orders" defaultLocked />

          <div style={{ flex: 1, minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Fixed header band — stays in place; only the section below scrolls. */}
            <div style={{ background: 'var(--ld-semantic-color-surface)', flexShrink: 0 }}>
              {/* `grid-template-rows` 1fr/0fr is the modern collapse-to-auto-height
                  trick -- unlike `max-height`, it animates smoothly to/from the
                  band's real height without needing to hardcode a pixel value
                  that could clip content or leave a dead zone in the transition. */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateRows: isProjectHeaderCollapsed ? '0fr' : '1fr',
                  transition: 'grid-template-rows 220ms ease',
                }}
              >
                <div style={{ overflow: 'hidden', minHeight: 0 }}>
                  <ProjectHeader
                    projectName="Project - 000500/RM"
                    storeNumber="4535"
                    projectType="Remodel"
                    statusTags={[
                      { label: 'Needs focus', color: 'negative' },
                      { label: 'Swim upstream', color: 'neutral' },
                      { label: 'Pre possession', color: 'neutral' },
                    ]}
                    milestones={[
                      { label: 'Today', date: '07/25/2026' },
                      { label: 'PD', date: '10/15/2026', daysToGo: '100 days to go' },
                      { label: 'GO', date: '05/03/2027' },
                    ]}
                    activeMilestoneIndex={0}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 'var(--ld-primitive-scale-space-200)',
                  paddingTop: 'var(--ld-primitive-scale-space-200)',
                  paddingBottom: 'var(--ld-primitive-scale-space-100)',
                  paddingInline: 'var(--ld-primitive-scale-space-300)',
                  flexWrap: 'wrap',
                }}
              >
                {/* Figma's "Orders" title is heading/large/default: 24px/32px,
                    weight 700. "alt" weight on LD's Heading maps to 400, and
                    the "large" class bumps to 32px/40px above 900px — both
                    would drift from the design, so weight is corrected and
                    the exact size/line-height are pinned. */}
                <Heading as="h3" size="large" weight="default" UNSAFE_style={{ fontSize: '1.5rem', lineHeight: '2rem' }}>
                  Orders
                </Heading>
                <Button variant="primary" leading={<Icon name="Plus" decorative />}>
                  Create add-on
                </Button>
              </div>

              <TabNavigation
                aria-label="Order status"
                UNSAFE_style={{ paddingInline: 'var(--ld-primitive-scale-space-100)' }}
              >
                {ORDER_TABS.map((tab) => (
                  <TabNavigationItem
                    key={tab.value}
                    isCurrent={activeTab === tab.value}
                    onClick={() => setActiveTab(tab.value)}
                  >
                    {tab.label} ({tab.count.toLocaleString()})
                  </TabNavigationItem>
                ))}
              </TabNavigation>
            </div>

            {/* Scrollable body — Figma renders this viewport as a light gray
                canvas (surface-subtle) with the KPI cards and the table's own
                white Card floating on top of it. */}
            <div
              onScroll={handleBodyScroll}
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                // Without this, once this pane's own scroll is exhausted, the
                // wheel/trackpad gesture chains up to <body> and rubber-bands
                // the whole page (masthead + sidebar included). `contain`
                // keeps the scroll from ever leaving this pane.
                overscrollBehavior: 'contain',
                background: 'var(--ld-semantic-color-surface-subtle)',
                padding: 'var(--ld-primitive-scale-space-300)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--ld-primitive-scale-space-300)',
              }}
            >
              {activeTab === 'pending' ? (
                <>
                  <OrderStatusMetrics
                    metrics={STATUS_METRICS}
                    value={activeMetric}
                    onChange={setActiveMetric}
                    name="order-status"
                    aria-label="Pending and queued order status"
                  />

                  {activeMetric === 'rejected' ? (
                    <RejectedOrdersTable
                      rows={rejectedOrders}
                      a11yLabel="Rejected orders table, scroll horizontally for more columns"
                    />
                  ) : (
                    // "Excess quantity for approval" and "Queued" don't have a
                    // built screen yet — placeholder empty state instead of
                    // showing the (unrelated) rejected-orders table. Centered
                    // (both axes) within the remaining scroll-pane space via
                    // the flex:1 wrapper, rather than sitting left-aligned at
                    // the top of a mostly-empty page.
                    <div style={EMPTY_STATE_WRAPPER_STYLE}>
                      <ContentMessage title="Design in progress">
                        This view hasn't been designed yet. Check back soon.
                      </ContentMessage>
                    </div>
                  )}
                </>
              ) : (
                // "Active orders" tab has no built screen yet either — same
                // "Design in progress" placeholder, centered the same way.
                <div style={EMPTY_STATE_WRAPPER_STYLE}>
                  <ContentMessage title="Design in progress">
                    This view hasn't been designed yet. Check back soon.
                  </ContentMessage>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
