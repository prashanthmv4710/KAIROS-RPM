import * as React from 'react';

import {
  DataTable,
  DataTableHead,
  DataTableRow,
  DataTableHeader,
  DataTableHeaderSelect,
  DataTableBody,
  DataTableCell,
  DataTableCellSelect,
  DataTableCellActions,
  DataTableBulkActions,
} from '../../components/DataTable';
import { Card } from '../../components/Card';
import { Modal } from '../../components/Modal';
import { SpinButton } from '../../components/SpinButton';
import { useSnackbar } from '../../components/Snackbar';
import { TextField } from '../../components/TextField';
import {
  SelectDropdown,
  SelectDropdownTrigger,
  SelectDropdownContent,
  SelectDropdownRadioGroup,
  SelectDropdownRadioItem,
} from '../../components/SelectDropdown';
import { IconButton } from '../../components/IconButton';
import { Icon } from '../../components/Icons';
import { Button } from '../../components/Button';
import { Body, Caption } from '../../components/Text';
import { LineClamp } from '../../components/LineClamp';
import { Tooltip } from '../../components/Tooltip';
import { VisuallyHidden } from '../../components/VisuallyHidden';
import { TablePagination } from '../../patterns/TablePagination';
import { ArticleThumbnail } from './ArticleThumbnail';
import { FilterDropdownChip, type FilterDropdownChipOption } from './FilterDropdownChip';
import type { RejectedOrderRow } from '../../data/rejectedOrdersData';
import './RejectedOrdersTable.css';

export interface RejectedOrdersTableProps {
  rows: RejectedOrderRow[];
  a11yLabel: string;
}

const SEARCH_SCOPES = [{ value: 'articleId', label: 'Article ID' }] as const;

/** Unique, sorted `{value, label}` options for a FilterDropdownChip, derived
 *  straight from the row data instead of a hand-maintained static list — new
 *  departments/delivery types in the data show up in the filter for free. */
function getUniqueOptions(rows: RejectedOrderRow[], selector: (row: RejectedOrderRow) => string): FilterDropdownChipOption[] {
  const values = new Set<string>();
  rows.forEach((row) => values.add(selector(row)));
  return Array.from(values)
    .sort()
    .map((value) => ({ value, label: value }));
}

/**
 * Orders data grid. The Article ID column (plus the leading checkbox and
 * thumbnail columns ahead of it) stays pinned to the left, and Actions
 * stays pinned to the right, while every other column scrolls horizontally
 * beneath them — matching the Figma spec. Pinning is implemented via the
 * `data-sticky` attribute selectors in RejectedOrdersTable.css because the
 * DataTable cell/header sub-components don't accept `style`/`UNSAFE_style`.
 */
export function RejectedOrdersTable({ rows, a11yLabel }: RejectedOrdersTableProps) {
  const { addSnack } = useSnackbar();
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [isBulkEditOpen, setIsBulkEditOpen] = React.useState(false);
  const [bulkFinalizedQty, setBulkFinalizedQty] = React.useState(0);
  // Per-row edit modal. `editingRow` is intentionally NOT cleared on close —
  // it stays populated through the close transition so the Modal's `title`
  // (which requires a truthy value the whole time it's mounted, even while
  // animating out) never goes stale mid-close; it's just overwritten the
  // next time a row's "Edit and reprocess" is clicked.
  const [editingRow, setEditingRow] = React.useState<RejectedOrderRow | null>(null);
  const [isRowEditOpen, setIsRowEditOpen] = React.useState(false);
  const [rowFinalizedQty, setRowFinalizedQty] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [departmentFilter, setDepartmentFilter] = React.useState<string[]>([]);
  const [deliveryTypeFilter, setDeliveryTypeFilter] = React.useState<string[]>([]);
  const departmentOptions = React.useMemo(() => getUniqueOptions(rows, (row) => row.department), [rows]);
  const deliveryTypeOptions = React.useMemo(() => getUniqueOptions(rows, (row) => row.deliveryType), [rows]);
  const [searchValue, setSearchValue] = React.useState('');
  const [searchScope, setSearchScope] = React.useState<string>(SEARCH_SCOPES[0].value);
  const searchScopeLabel = SEARCH_SCOPES.find((scope) => scope.value === searchScope)?.label ?? SEARCH_SCOPES[0].label;

  // The search pill's value/scope were wired to state but never actually
  // applied to the data — `pagedRows` sliced straight from the `rows` prop,
  // so typing here did nothing. Filter first, then page/select off the
  // filtered set instead of the raw `rows`. Department/delivery type chain
  // onto the same result — an empty array for either means "no filter"
  // (matches every row), same convention as the search box being empty.
  const normalizedSearch = searchValue.trim().toLowerCase();
  const filteredRows = React.useMemo(() => {
    let result = rows;
    if (normalizedSearch) {
      result = result.filter((row) => {
        switch (searchScope) {
          case 'articleId':
          default:
            return row.articleId.toLowerCase().includes(normalizedSearch);
        }
      });
    }
    if (departmentFilter.length > 0) {
      result = result.filter((row) => departmentFilter.includes(row.department));
    }
    if (deliveryTypeFilter.length > 0) {
      result = result.filter((row) => deliveryTypeFilter.includes(row.deliveryType));
    }
    return result;
  }, [rows, normalizedSearch, searchScope, departmentFilter, deliveryTypeFilter]);

  // A stale page (e.g. page 3 of an unfiltered set) can point past the end
  // once a search/filter narrows the result set — snap back to page 1
  // whenever any of them changes.
  React.useEffect(() => {
    setPage(1);
  }, [normalizedSearch, searchScope, departmentFilter, deliveryTypeFilter]);

  // Selection stays scoped to the full `rows` set, not `filteredRows` — the
  // bulk action bar's count (selectedIds.size, below) and selectedRows are
  // both computed off the whole table, so "select all" / "deselect all"
  // need to match that same scope. Scoping select-all to the filtered/
  // visible rows instead would let a search-then-deselect-all leave
  // off-screen rows selected while the bulk bar keeps counting them.
  const allSelected = rows.length > 0 && selectedIds.size === rows.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const toggleAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(rows.map((row) => row.id)));
  };

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const pagedRows = filteredRows.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
  const selectedRows = rows.filter((row) => selectedIds.has(row.id));

  return (
    <div>
      {/* Figma wraps the search/filter bar + table + pagination footer in
          one white Card floating on the page's gray canvas. */}
      <Card>
      {/* Search and filter utility bar — matches Figma's [PX] Scoped Search Bar +
          [PX] Filter Button group. The scoped search is a single bordered
          pill: search icon, an inline "Search by **Article ID**" scope
          picker, then the free-text input — all sharing one border, per
          design. A native <select> can't render that mixed-weight compound
          label in its closed state, so the scope picker is a real
          SelectDropdown (accessible menu semantics, arbitrary trigger
          content) instead of Select; the actual typed input is still a real
          TextField, restyled borderless via .rpm-search-textfield so it
          blends into the shared pill instead of drawing its own border. */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ld-primitive-scale-space-150)',
          padding: 'var(--ld-primitive-scale-space-200)',
          background: 'var(--ld-semantic-color-surface)',
        }}
      >
        <div className="rpm-search-pill" style={{ flex: '1 1 375px', minWidth: 375 }}>
          <Icon name="Search" decorative size="small" />

          <SelectDropdown>
            <SelectDropdownTrigger UNSAFE_className="rpm-search-scope-button">
              <span className="rpm-search-scope-trigger">
                <Body as="span" size="small" color="subtle">
                  Search by
                </Body>
                <Body as="span" size="small" weight="alt">
                  {searchScopeLabel}
                </Body>
                <Icon name="ChevronDown" decorative size="small" />
              </span>
            </SelectDropdownTrigger>
            <SelectDropdownContent align="start">
              <SelectDropdownRadioGroup value={searchScope} onValueChange={setSearchScope}>
                {SEARCH_SCOPES.map((scope) => (
                  <SelectDropdownRadioItem key={scope.value} value={scope.value}>
                    {scope.label}
                  </SelectDropdownRadioItem>
                ))}
              </SelectDropdownRadioGroup>
            </SelectDropdownContent>
          </SelectDropdown>

          <TextField
            label={<VisuallyHidden>{`Search by ${searchScopeLabel}`}</VisuallyHidden>}
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            size="xsmall"
            UNSAFE_className="rpm-search-textfield"
          />
        </div>
        <FilterDropdownChip
          multiple
          label="Department"
          options={departmentOptions}
          value={departmentFilter}
          onChange={setDepartmentFilter}
        />
        <FilterDropdownChip
          multiple
          label="Delivery type"
          options={deliveryTypeOptions}
          value={deliveryTypeFilter}
          onChange={setDeliveryTypeFilter}
        />
        {/* Figma spec (node 12653:73193, "[LD 3.5] Download") renders a
            cloud-with-arrow glyph, not the plain arrow-into-tray "Download"
            icon — CloudDownload is the matching name in our icon set. */}
        <IconButton a11yLabel="Download table data" variant="round" color="secondary" size="small">
          <Icon name="CloudDownload" decorative />
        </IconButton>
      </div>

      {/* Bulk action bar — only appears once at least one row is selected.
          A single action ("Edit and reprocess") is intentional per the
          current ask; more actions can be added to actionContent later. */}
      {selectedIds.size > 0 && (
        // DataTableBulkActionsProps doesn't type UNSAFE_className (unlike
        // most generated components), so the dark-bar override is scoped via
        // a wrapping div instead — see .rpm-bulk-action-bar in the CSS.
        <div className="rpm-bulk-action-bar">
          <DataTableBulkActions
            a11yLabel="Selected rejected orders actions"
            count={selectedIds.size}
            onSelectAll={toggleAll}
            onClearSelected={() => setSelectedIds(new Set())}
            selectAllButtonProps={{ color: 'white' }}
            onClearSelectedButtonProps={{ color: 'white' }}
            actionContent={
              <Button
                variant="secondary"
                size="small"
                onClick={() => {
                  setBulkFinalizedQty(selectedRows[0]?.quantity ?? 0);
                  setIsBulkEditOpen(true);
                }}
              >
                Edit and reprocess
              </Button>
            }
          />
        </div>
      )}

      {/* Horizontally scrollable table — Article ID (+ leading columns) frozen left, Actions frozen right */}
      <div
        role="region"
        aria-label={a11yLabel}
        tabIndex={0}
        className="rpm-orders-table"
        style={{
          overflowX: 'auto',
        }}
      >
        <DataTable
          UNSAFE_style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: 0,
            // Auto layout treats every column's `width` as a soft hint that
            // shrinks back down to fit its actual content — that's why
            // widening the Reason header alone had no visible effect. Fixed
            // layout makes each header's `width` authoritative.
            tableLayout: 'fixed',
          }}
        >
          <DataTableHead>
            <DataTableRow>
              <DataTableHeaderSelect
                checked={allSelected}
                indeterminate={someSelected}
                onChange={toggleAll}
                a11yCheckboxLabel="Select all rows"
                data-sticky="select"
              />
              <th scope="col" data-sticky="thumbnail">
                <VisuallyHidden>Article image</VisuallyHidden>
              </th>
              <DataTableHeader width={180} data-sticky="article-id">
                Article ID
              </DataTableHeader>
              <DataTableHeader width={220}>Department</DataTableHeader>
              <DataTableHeader width={110}>Delivery type</DataTableHeader>
              <DataTableHeader width={120}>Delivery date</DataTableHeader>
              <DataTableHeader width={120}>Source</DataTableHeader>
              <DataTableHeader width={110}>Destination</DataTableHeader>
              <DataTableHeader width={110} alignment="right">
                Quantity
              </DataTableHeader>
              <DataTableHeader width={150} alignment="right">
                Excess quantity
              </DataTableHeader>
              <DataTableHeader width={240}>Reason</DataTableHeader>
              <DataTableHeader width={130}>Submitted by</DataTableHeader>
              <DataTableHeader width={220}>Tentative SAP submission date</DataTableHeader>
              <DataTableHeader width={180} data-sticky="actions">
                Actions
              </DataTableHeader>
            </DataTableRow>
          </DataTableHead>

          <DataTableBody>
            {pagedRows.map((row) => {
              const selected = selectedIds.has(row.id);
              const labelId = `article-id-${row.id}`;

              return (
                <DataTableRow key={row.id} selected={selected}>
                  <DataTableCellSelect
                    checked={selected}
                    onChange={() => toggleRow(row.id)}
                    a11yLabelledBy={labelId}
                    data-sticky="select"
                  />
                  <td
                    data-sticky="thumbnail"
                    style={{
                      padding: 'var(--ld-primitive-scale-space-200)',
                      verticalAlign: 'middle',
                    }}
                  >
                    <ArticleThumbnail
                      articleId={row.articleId}
                      articleName={row.articleName}
                      imageUrl={row.imageUrl}
                      imageAlt={row.imageAlt}
                    />
                  </td>
                  <DataTableCell data-sticky="article-id">
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <Body id={labelId} size="small" weight="alt">
                        {row.articleId}
                      </Body>
                      <Tooltip content={row.articleName}>
                        <span style={{ display: 'inline-block', maxWidth: '100%' }}>
                          <Caption color="subtle">
                            <LineClamp lines={1}>{row.articleName}</LineClamp>
                          </Caption>
                        </span>
                      </Tooltip>
                    </div>
                  </DataTableCell>
                  <DataTableCell>
                    <LineClamp lines={2}>{row.department}</LineClamp>
                  </DataTableCell>
                  <DataTableCell>{row.deliveryType}</DataTableCell>
                  <DataTableCell>{row.deliveryDate}</DataTableCell>
                  <DataTableCell>{row.source}</DataTableCell>
                  <DataTableCell>{row.destination}</DataTableCell>
                  <DataTableCell variant="numeric">{row.quantity.toLocaleString()}</DataTableCell>
                  <DataTableCell variant="numeric">{row.excessQuantity.toLocaleString()}</DataTableCell>
                  <DataTableCell>
                    <LineClamp lines={2}>{row.reason}</LineClamp>
                  </DataTableCell>
                  <DataTableCell>{row.submittedBy}</DataTableCell>
                  <DataTableCell>{row.tentativeSapDate}</DataTableCell>
                  <DataTableCellActions data-sticky="actions">
                    <Button
                      variant="tertiary"
                      size="small"
                      onClick={() => {
                        setEditingRow(row);
                        setRowFinalizedQty(row.quantity);
                        setIsRowEditOpen(true);
                      }}
                    >
                      Edit and reprocess
                    </Button>
                  </DataTableCellActions>
                </DataTableRow>
              );
            })}
          </DataTableBody>
        </DataTable>
      </div>

      {/* Pagination now lives inside the same Card as the table, separated
          by a divider, matching Figma's single-surface table + footer. */}
      <div
        style={{
          borderTop: '1px solid var(--ld-semantic-color-separator)',
          padding: 'var(--ld-primitive-scale-space-200)',
        }}
      >
        <TablePagination
          page={page}
          pageCount={pageCount}
          pageSize={pageSize}
          totalItems={filteredRows.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          pageSizeOptions={[10, 25, 50]}
        />
      </div>
      </Card>

      {/* Bulk edit modal — mirrors the Figma "Approve N articles" reference:
          h2 title naming the count, a one-line instruction, a bold
          "Finalized qty" label over a SpinButton (free-text numeric entry,
          not just +/- taps), then a bordered footer (Modal's `actions` prop)
          with Cancel + a primary button that repeats the title text. */}
      <Modal
        isOpen={isBulkEditOpen}
        onClose={() => setIsBulkEditOpen(false)}
        title={`Edit and reprocess ${selectedRows.length} ${selectedRows.length === 1 ? 'order' : 'orders'}`}
        size="medium"
        actions={
          <>
            <Button variant="secondary" onClick={() => setIsBulkEditOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsBulkEditOpen(false);
                addSnack({
                  message: `${selectedRows.length} ${selectedRows.length === 1 ? 'order' : 'orders'} sent for reprocessing.`,
                });
              }}
            >
              {`Edit and reprocess ${selectedRows.length} ${selectedRows.length === 1 ? 'order' : 'orders'}`}
            </Button>
          </>
        }
      >
        <Body size="small" UNSAFE_style={{ display: 'block', marginBottom: 'var(--ld-primitive-scale-space-300)' }}>
          {`${selectedRows.length} ${selectedRows.length === 1 ? 'order' : 'orders'} selected. Set the finalized quantity to apply to all of them.`}
        </Body>
        <Body
          id="rpm-bulk-finalized-qty-label"
          size="small"
          weight="alt"
          UNSAFE_style={{ display: 'block', marginBottom: 'var(--ld-primitive-scale-space-100)' }}
        >
          Finalized qty
        </Body>
        {/* The pill is the wrapper div itself (see .rpm-finalized-qty-spinbutton
            in the CSS) — real IconButtons for +/- flank a bare SpinButton
            input, matching the old QuantityStepper's minus-count-plus pill
            while keeping SpinButton's free-text entry. */}
        <div className="rpm-finalized-qty-spinbutton">
          <IconButton
            a11yLabel="Decrease finalized quantity"
            size="small"
            variant="round"
            onClick={() => setBulkFinalizedQty((q) => Math.max(0, q - 1))}
          >
            <Icon name="Minus" decorative />
          </IconButton>
          <SpinButton
            a11yLabelledBy="rpm-bulk-finalized-qty-label"
            value={bulkFinalizedQty}
            onChange={setBulkFinalizedQty}
            min={0}
            max={999999}
          />
          <IconButton
            a11yLabel="Increase finalized quantity"
            size="small"
            variant="round"
            onClick={() => setBulkFinalizedQty((q) => Math.min(999999, q + 1))}
          >
            <Icon name="Plus" decorative />
          </IconButton>
        </div>
      </Modal>

      {/* Per-row edit modal — same layout as the bulk one, scoped to the
          single order that triggered it. */}
      <Modal
        isOpen={isRowEditOpen}
        onClose={() => setIsRowEditOpen(false)}
        title={editingRow ? `Edit and reprocess ${editingRow.articleId}` : 'Edit and reprocess'}
        size="medium"
        actions={
          <>
            <Button variant="secondary" onClick={() => setIsRowEditOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsRowEditOpen(false);
                addSnack({
                  message: editingRow ? `${editingRow.articleId} sent for reprocessing.` : 'Order sent for reprocessing.',
                });
              }}
            >
              Edit and reprocess
            </Button>
          </>
        }
      >
        <Body size="small" UNSAFE_style={{ display: 'block', marginBottom: 'var(--ld-primitive-scale-space-300)' }}>
          {editingRow ? `Set the finalized quantity for ${editingRow.articleName}.` : ''}
        </Body>
        <Body
          id="rpm-row-finalized-qty-label"
          size="small"
          weight="alt"
          UNSAFE_style={{ display: 'block', marginBottom: 'var(--ld-primitive-scale-space-100)' }}
        >
          Finalized qty
        </Body>
        <div className="rpm-finalized-qty-spinbutton">
          <IconButton
            a11yLabel="Decrease finalized quantity"
            size="small"
            variant="round"
            onClick={() => setRowFinalizedQty((q) => Math.max(0, q - 1))}
          >
            <Icon name="Minus" decorative />
          </IconButton>
          <SpinButton
            a11yLabelledBy="rpm-row-finalized-qty-label"
            value={rowFinalizedQty}
            onChange={setRowFinalizedQty}
            min={0}
            max={999999}
          />
          <IconButton
            a11yLabel="Increase finalized quantity"
            size="small"
            variant="round"
            onClick={() => setRowFinalizedQty((q) => Math.min(999999, q + 1))}
          >
            <Icon name="Plus" decorative />
          </IconButton>
        </div>
      </Modal>
    </div>
  );
}
