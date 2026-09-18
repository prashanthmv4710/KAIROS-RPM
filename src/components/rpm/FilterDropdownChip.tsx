import * as React from 'react';

import { FilterChip } from '../FilterChip';
import { Checkbox } from '../Checkbox';
import { Body } from '../Text';
import { LinkButton } from '../LinkButton';
import {
  SelectDropdown,
  SelectDropdownTrigger,
  SelectDropdownContent,
  SelectDropdownRadioGroup,
  SelectDropdownRadioItem,
} from '../SelectDropdown';

export interface FilterDropdownChipOption {
  value: string;
  label: string;
}

// Beyond this many options the list scrolls instead of growing the popover
// indefinitely. ~40px is one checkbox/radio row (label + padding).
const MAX_VISIBLE_OPTIONS = 10;
const OPTION_ROW_HEIGHT = 40;

function scrollableListStyle(optionCount: number): React.CSSProperties | undefined {
  if (optionCount <= MAX_VISIBLE_OPTIONS) return undefined;
  return { maxHeight: MAX_VISIBLE_OPTIONS * OPTION_ROW_HEIGHT, overflowY: 'auto' };
}

interface FilterDropdownChipBaseProps {
  label: string;
  options: FilterDropdownChipOption[];
  align?: 'start' | 'center' | 'end';
}

interface FilterDropdownChipSingleProps extends FilterDropdownChipBaseProps {
  multiple?: false;
  value: string;
  onChange: (value: string) => void;
  defaultValue?: string;
}

interface FilterDropdownChipMultiProps extends FilterDropdownChipBaseProps {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
}

type FilterDropdownChipProps = FilterDropdownChipSingleProps | FilterDropdownChipMultiProps;

/**
 * Compact pill filter trigger matching the Figma "[PX] Filter Button Group"
 * anatomy: a bordered pill with a label + chevron that opens an options
 * popover below it. The pill itself never grows or becomes the panel — the
 * only "expand" affordance on the pill is the chevron flipping Down -> Up
 * (via FilterChip's own `isOpen` prop); the actual expansion is a separate
 * floating SelectDropdownContent popover, positioned under the trigger.
 *
 * Composes the generated `FilterChip` (visual pill + chevron) as the
 * `SelectDropdown` trigger via `asChild`, so FilterChip's own button stays
 * the single real, accessible click target instead of SelectDropdown
 * rendering a second wrapper button around it.
 *
 * - Multi-select (`multiple`): a real `Checkbox` per option, with a
 *   "N selected" counter + "Clear all" LinkButton in a header row. The menu
 *   stays open between picks so several options can be selected in one pass.
 * - Single-select (default): `SelectDropdownRadioGroup`/`SelectDropdownRadioItem`
 *   rows — picking one applies it and closes the menu immediately.
 */
export function FilterDropdownChip(props: FilterDropdownChipProps) {
  const { label, options, align = 'start' } = props;
  const [open, setOpen] = React.useState(false);

  if (props.multiple) {
    const { value, onChange } = props;
    const selectedValues = value;
    const isActive = selectedValues.length > 0;
    const selectedLabels = options
      .filter((option) => selectedValues.includes(option.value))
      .map((option) => option.label);
    const chipLabel =
      selectedLabels.length === 0
        ? label
        : selectedLabels.length === 1
          ? `${label}: ${selectedLabels[0]}`
          : `${label} (${selectedLabels.length})`;

    return (
      <SelectDropdown open={open} onOpenChange={setOpen}>
        <SelectDropdownTrigger asChild>
          {/* No aria-label override here on purpose — the chip's own visible
              text (chipLabel) already IS the accessible name. An aria-label
              would take precedence over that text for screen readers, so
              "Department (2)" would be visually shown but announced as just
              "Department filter" — losing the selection-count/value info
              that sighted users get from the label itself. */}
          <FilterChip isMultiSelect isOpen={open} selected={isActive}>
            {chipLabel}
          </FilterChip>
        </SelectDropdownTrigger>
        <SelectDropdownContent align={align}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--ld-primitive-scale-space-100)',
              padding: 'var(--ld-primitive-scale-space-100) var(--ld-primitive-scale-space-200)',
              borderBottom: '1px solid var(--ld-semantic-color-separator, #e3e4e5)',
            }}
          >
            <Body as="span" size="small" color="subtle">
              {selectedValues.length} selected
            </Body>
            <LinkButton size="small" disabled={selectedValues.length === 0} onClick={() => onChange([])}>
              Clear all
            </LinkButton>
          </div>
          <div
            style={{
              paddingTop: 'var(--ld-primitive-scale-space-100)',
              ...scrollableListStyle(options.length),
            }}
          >
            {options.map((option) => (
              <div
                key={option.value}
                style={{ padding: 'var(--ld-primitive-scale-space-100) var(--ld-primitive-scale-space-200)' }}
              >
                <Checkbox
                  label={option.label}
                  checked={selectedValues.includes(option.value)}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    const next = checked
                      ? [...selectedValues, option.value]
                      : selectedValues.filter((v) => v !== option.value);
                    onChange(next);
                  }}
                />
              </div>
            ))}
          </div>
        </SelectDropdownContent>
      </SelectDropdown>
    );
  }

  const { value, onChange, defaultValue = 'all' } = props;
  const selectedOption = options.find((option) => option.value === value);
  const isActive = value !== defaultValue;
  const chipLabel = isActive && selectedOption ? `${label}: ${selectedOption.label}` : label;

  return (
    <SelectDropdown open={open} onOpenChange={setOpen}>
      <SelectDropdownTrigger asChild>
        <FilterChip isMultiSelect isOpen={open} selected={isActive} aria-label={`${label} filter`}>
          {chipLabel}
        </FilterChip>
      </SelectDropdownTrigger>
      <SelectDropdownContent align={align}>
        <div style={scrollableListStyle(options.length)}>
          <SelectDropdownRadioGroup
            value={value}
            onValueChange={(next) => {
              onChange(next);
              setOpen(false);
            }}
          >
            {options.map((option) => (
              <SelectDropdownRadioItem key={option.value} value={option.value}>
                {option.label}
              </SelectDropdownRadioItem>
            ))}
          </SelectDropdownRadioGroup>
        </div>
      </SelectDropdownContent>
    </SelectDropdown>
  );
}
