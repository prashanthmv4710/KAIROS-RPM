import * as React from 'react';

import { Heading, Body, Caption } from '../../components/Text';
import { Tag } from '../../components/Tag';
import { Icon } from '../../components/Icons';
import './ProjectHeader.css';

export interface ProjectHeaderStatusTag {
  label: string;
  /** "negative" renders filled-red (e.g. "Needs focus"); "neutral" renders outlined. */
  color: 'negative' | 'neutral';
}

export interface ProjectHeaderMilestone {
  label: string;
  date: string;
  /** "(N days to go)" suffix — shown for non-active milestones that have one, per Figma. */
  daysToGo?: string;
}

export interface ProjectHeaderProps {
  projectName: string;
  storeNumber: string;
  projectType: string;
  statusTags: ProjectHeaderStatusTag[];
  milestones: ProjectHeaderMilestone[];
  activeMilestoneIndex: number;
}

/**
 * Project identity block — name, store metadata, status tags, and the
 * milestone status line (Today → PD → GO), matching Figma node
 * 12534:358305: a single inline row of text separated by ArrowRight icons.
 * The active milestone (e.g. "Today 07/25/2026") renders bold in the
 * activated-text color with no parenthetical; each later milestone renders
 * as a bold label + regular date, plus an "(N days to go)" suffix when
 * supplied — these are independent display strings from the design mock,
 * not computed from the date values.
 */
export function ProjectHeader({
  projectName,
  storeNumber,
  projectType,
  statusTags,
  milestones,
  activeMilestoneIndex,
}: ProjectHeaderProps) {
  return (
    <div
      style={{
        padding: 'var(--ld-primitive-scale-space-150) var(--ld-primitive-scale-space-300)',
        background: 'var(--ld-semantic-color-surface-brand)',
        borderBottom: '1px solid var(--ld-semantic-color-separator)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--ld-primitive-scale-space-600)',
        flexWrap: 'nowrap',
        overflowX: 'auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ld-primitive-scale-space-100)', flexWrap: 'nowrap', flexShrink: 0 }}>
        {/* Project name is still a real "h2" for heading-level a11y semantics,
            but sized down to match the body/small (14px/20px) text on the
            rest of this line — Store#, "|", Project type — so the whole
            thing reads as one continuous line rather than a title over a
            metadata row. */}
        <Heading as="h2" size="small" weight="default" UNSAFE_style={{ fontSize: '0.875rem', lineHeight: '1.25rem' }}>
          {projectName}
        </Heading>
        <Body size="small" color="subtlest" aria-hidden="true">
          |
        </Body>
        <Body size="small" color="subtle">
          Store# {storeNumber}
        </Body>
        <Body size="small" color="subtlest" aria-hidden="true">
          |
        </Body>
        <Body size="small" color="subtle">
          Project type: {projectType}
        </Body>

        <div style={{ display: 'flex', gap: 'var(--ld-primitive-scale-space-100)', flexWrap: 'wrap' }}>
          {statusTags.map((tag) => (
            // Tag has no style/className escape hatch at all (unlike most
            // LD components, it doesn't accept UNSAFE_style), and its own
            // CSS only ships a "medium" (rounded-rect) corner radius while
            // Figma's status pills are fully round. Wrapping it lets the
            // radius be overridden via a descendant selector in
            // ProjectHeader.css without touching the generated component.
            <span key={tag.label} className="rpm-status-tag-wrap">
              <Tag variant="primary" color={tag.color} size="small">
                {tag.label}
              </Tag>
            </span>
          ))}
        </div>
      </div>

      {/* Figma node 12534:358305 — a single inline text row, not a visual
          track: active milestone bold + activated-color with no
          parenthetical, later milestones bold-label + regular date (plus an
          optional "(N days to go)" suffix), each pair joined by a real
          ArrowRight icon rather than a decorative line/dot track. */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ld-primitive-scale-space-100)',
          flexWrap: 'nowrap',
          flexShrink: 0,
        }}
      >
        {milestones.map((milestone, index) => (
          <React.Fragment key={milestone.label}>
            {index > 0 && (
              <Icon
                name="ArrowRight"
                decorative
                size="small"
                style={{ color: 'var(--ld-semantic-color-action-border-tertiary)' }}
              />
            )}
            <span style={{ whiteSpace: 'nowrap' }}>
              {index === activeMilestoneIndex ? (
                <Caption as="span" weight="alt" color="activated">
                  {milestone.label} {milestone.date}
                </Caption>
              ) : (
                <>
                  <Caption as="span" weight="alt">
                    {milestone.label}
                  </Caption>
                  <Caption as="span" weight="default">
                    {' '}
                    {milestone.date}
                    {milestone.daysToGo ? ` (${milestone.daysToGo})` : ''}
                  </Caption>
                </>
              )}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
