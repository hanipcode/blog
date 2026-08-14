import { useEffect, useEffectEvent, useId, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import "./ComplexTableDemo.css";

const DEFAULT_ROW_COUNT = 2_000;
const ROW_HEIGHT = 44;
const HEADER_HEIGHT = 40;
const OVERSCAN_ROWS = Math.ceil(500 / ROW_HEIGHT);
const statuses = ["Completed", "Pending", "Failed", "Review"] as const;
const risks = ["Low", "Medium", "High"] as const;
const channels = ["API", "Dashboard", "Checkout"] as const;
const methods = ["Card", "Bank transfer", "Wallet", "QR"] as const;
const countries = ["US", "GB", "ID", "SG", "DE"] as const;

type CopyableValueProps = {
  readonly label: string;
  readonly value: string;
};

function CopyableValue({ label, value }: CopyableValueProps) {
  const [copied, setCopied] = useState(false);
  const tooltipId = useId();

  const copy = async () => {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
  };

  return (
    <span className="complex-demo__copyable">
      <span
        className="complex-demo__truncated"
        tabIndex={0}
        aria-describedby={tooltipId}
      >
        {value}
        <span id={tooltipId} className="complex-demo__tooltip" role="tooltip">
          {value}
        </span>
      </span>
      <button type="button" onClick={copy} aria-label={`Copy ${label} ${value}`}>
        {copied ? "Copied" : "Copy"}
      </button>
    </span>
  );
}

type SelectAllCheckboxProps = {
  readonly checked: boolean;
  readonly indeterminate: boolean;
  readonly rowCount: number;
  readonly onChange: () => void;
};

function SelectAllCheckbox({
  checked,
  indeterminate,
  rowCount,
  onChange,
}: SelectAllCheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <input
      ref={inputRef}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      aria-label={`Select all ${rowCount.toLocaleString()} rows`}
    />
  );
}

type ComplexTableDemoProps = {
  /** Replaces all row objects every second while changing one visible record. */
  readonly polling?: boolean;
  /** Number of parent records represented by the table. */
  readonly rowCount?: number;
  /** Adds expandable parents with three column-aligned subrows each. */
  readonly expandable?: boolean;
};

type RowState = {
  readonly revision: number;
  readonly updatedAt: string;
};

type FlatRow =
  | { readonly kind: "parent"; readonly rowIndex: number }
  | {
      readonly kind: "subrow";
      readonly rowIndex: number;
      readonly subIndex: number;
    };

const createRowState = (rowCount: number): ReadonlyArray<RowState> =>
  Array.from({ length: rowCount }, (_, index) => ({
    revision: 0,
    updatedAt: `10:${String(index % 60).padStart(2, "0")}:24`,
  }));

/** Renders the expensive cell features found in a dense administrative table. */
export default function ComplexTableDemo({
  polling = false,
  rowCount = DEFAULT_ROW_COUNT,
  expandable = false,
}: ComplexTableDemoProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollTopRef = useRef(0);
  const pollRef = useRef(0);
  const titleId = useId();
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<number>>(
    () => new Set(),
  );
  const [expandedRows, setExpandedRows] = useState<ReadonlySet<number>>(() =>
    expandable ? new Set([0, 1, 2]) : new Set(),
  );
  const [rows, setRows] = useState(() => createRowState(rowCount));
  const [pollNumber, setPollNumber] = useState(0);
  const [changedRow, setChangedRow] = useState(1);

  let flatRows: ReadonlyArray<FlatRow> | undefined;
  if (expandable) {
    const nextRows: FlatRow[] = [];
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
      nextRows.push({ kind: "parent", rowIndex });
      if (!expandedRows.has(rowIndex)) continue;
      for (let subIndex = 0; subIndex < 3; subIndex += 1) {
        nextRows.push({ kind: "subrow", rowIndex, subIndex });
      }
    }
    flatRows = nextRows;
  }

  const virtualRowCount = flatRows?.length ?? rowCount;

  const virtualizer = useVirtualizer({
    count: virtualRowCount,
    getScrollElement: () => scrollerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN_ROWS,
    paddingStart: HEADER_HEIGHT,
    getItemKey: (index) => {
      const row = flatRows?.[index];
      if (!row) return index;
      return row.kind === "parent"
        ? `parent-${row.rowIndex}`
        : `subrow-${row.rowIndex}-${row.subIndex}`;
    },
  });

  const items = virtualizer.getVirtualItems();
  const allSelected = selectedRows.size === rowCount;
  const someSelected = selectedRows.size > 0 && !allSelected;

  const runPoll = useEffectEvent(() => {
    pollRef.current += 1;
    const revision = pollRef.current;
    const firstVisible = Math.max(
      0,
      Math.floor((scrollTopRef.current - HEADER_HEIGHT) / ROW_HEIGHT),
    );
    const changedIndex = Math.min(rowCount - 1, firstVisible + (revision % 8));

    setRows((currentRows) =>
      currentRows.map((row, index) => ({
        ...row,
        revision,
        updatedAt: index === changedIndex ? `Poll #${revision}` : row.updatedAt,
      })),
    );
    setChangedRow(changedIndex + 1);
    setPollNumber(revision);
  });

  useEffect(() => {
    if (!polling) return;
    const timer = window.setInterval(() => runPoll(), 1_000);
    return () => window.clearInterval(timer);
  }, [polling]);

  const toggleAll = () => {
    setSelectedRows(
      allSelected
        ? new Set()
        : new Set(Array.from({ length: rowCount }, (_, index) => index)),
    );
  };

  const toggleRow = (index: number) => {
    setSelectedRows((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleExpanded = (index: number) => {
    setExpandedRows((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const jumpTarget = Math.min(rowCount - 1, 1_499);
  const jumpVirtualIndex =
    flatRows?.findIndex(
      (row) => row.kind === "parent" && row.rowIndex === jumpTarget,
    ) ?? jumpTarget;

  return (
    <section className="complex-demo" aria-labelledby={titleId}>
      <div className="complex-demo__toolbar">
        <div>
          <strong id={titleId}>
            {polling
              ? "Complex table with one-second polling"
              : expandable
                ? "Complex table with collapsible subrows"
                : "Complex table"}
            : {rowCount.toLocaleString()} parent rows x 13 columns
          </strong>
          <span>
            {polling
              ? `Poll #${pollNumber} replaces every row object; record #${changedRow} changed`
              : expandable
                ? `${items.length} virtual rows mounted | ${virtualRowCount - rowCount} subrows revealed`
                : `${items.length} rows mounted | ${items.length * 13} cells plus controls and tooltips`}
          </span>
        </div>
        <button
          type="button"
          onClick={() =>
            virtualizer.scrollToIndex(jumpVirtualIndex, { align: "center" })
          }
        >
          Jump to row {jumpTarget + 1}
        </button>
      </div>

      <div className="complex-demo__selection" aria-live="polite">
        {polling
          ? `${rowCount.toLocaleString()} objects allocated | ${items.length * 13} mounted cells rerendered this poll`
          : expandable
            ? `${expandedRows.size} parents expanded | ${selectedRows.size.toLocaleString()} of ${rowCount.toLocaleString()} parents selected`
            : `${selectedRows.size.toLocaleString()} of ${rowCount.toLocaleString()} rows selected`}
      </div>

      <div className="complex-demo__table" role="table" aria-rowcount={virtualRowCount}>
          <div
            ref={scrollerRef}
            className="complex-demo__scroller"
            tabIndex={0}
          onScroll={(event) => {
            scrollTopRef.current = event.currentTarget.scrollTop;
          }}
        >
          <div
            className="complex-demo__spacer"
            style={{ height: virtualizer.getTotalSize() }}
          >
            <div className="complex-demo__header" role="row">
              <span role="columnheader">
                <SelectAllCheckbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  rowCount={rowCount}
                  onChange={toggleAll}
                />
              </span>
              <span role="columnheader">Transaction ID</span>
              <span role="columnheader">Merchant</span>
              <span role="columnheader">Reference</span>
              <span role="columnheader">Status</span>
              <span role="columnheader">Channel</span>
              <span role="columnheader">Method</span>
              <span role="columnheader">Currency</span>
              <span role="columnheader">Country</span>
              <span role="columnheader">Risk</span>
              <span role="columnheader">Customer ID</span>
              <span role="columnheader">Created</span>
              <span role="columnheader">Updated</span>
            </div>

            {items.map((item) => {
              const flatRow = flatRows?.[item.index];
              const rowIndex = flatRow?.rowIndex ?? item.index;
              const subIndex = flatRow?.kind === "subrow" ? flatRow.subIndex : undefined;
              const isSubrow = subIndex !== undefined;
              const rowState = rows[rowIndex];
              if (!rowState) return null;
              const identityIndex = rowIndex * 3 + (subIndex ?? 0);
              const transactionId = `${isSubrow ? "ent" : "txn"}_${String(identityIndex * 97).padStart(12, "0")}`;
              const reference = `REF-${String(identityIndex * 7_919).padStart(10, "0")}`;
              const customerId = `cus_${String(identityIndex * 313).padStart(11, "0")}`;
              const status = statuses[identityIndex % statuses.length] ?? "Completed";
              const risk = risks[identityIndex % risks.length] ?? "Low";
              const selected = !isSubrow && selectedRows.has(rowIndex);

              return (
                <div
                  key={item.key}
                  className="complex-demo__row"
                  data-selected={selected ? "true" : undefined}
                  data-kind={isSubrow ? "subrow" : "parent"}
                  data-pulse={polling ? rowState.revision % 2 : undefined}
                  role="row"
                  aria-rowindex={item.index + 1}
                  style={{
                    height: item.size,
                    transform: `translateY(${item.start}px)`,
                  }}
                >
                  <span role="cell" className="complex-demo__checkbox-cell">
                    {isSubrow ? (
                      <span className="complex-demo__subrow-marker">
                        Sub {subIndex + 1}
                      </span>
                    ) : (
                      <>
                        {expandable ? (
                          <button
                            type="button"
                            className="complex-demo__expand"
                            aria-expanded={expandedRows.has(rowIndex)}
                            aria-label={`${expandedRows.has(rowIndex) ? "Collapse" : "Expand"} transaction ${transactionId}`}
                            onClick={() => toggleExpanded(rowIndex)}
                          >
                            {expandedRows.has(rowIndex) ? "-" : "+"}
                          </button>
                        ) : null}
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleRow(rowIndex)}
                          aria-label={`Select transaction ${transactionId}`}
                        />
                      </>
                    )}
                  </span>
                  <span role="cell">
                    <CopyableValue label="transaction ID" value={transactionId} />
                  </span>
                  <span role="cell">
                    {isSubrow
                      ? `Entity ${rowIndex + 1}.${subIndex + 1}`
                      : `Merchant ${(rowIndex % 137) + 1}`}
                  </span>
                  <span role="cell">
                    <CopyableValue label="reference" value={reference} />
                  </span>
                  <span role="cell">
                    <i className="complex-demo__chip" data-tone={status.toLowerCase()}>
                      {status}
                    </i>
                  </span>
                  <span role="cell">{channels[identityIndex % channels.length]}</span>
                  <span role="cell">{methods[identityIndex % methods.length]}</span>
                  <span role="cell">{["USD", "EUR", "GBP", "IDR"][identityIndex % 4]}</span>
                  <span role="cell">{countries[identityIndex % countries.length]}</span>
                  <span role="cell">
                    <i className="complex-demo__chip" data-tone={risk.toLowerCase()}>
                      {risk}
                    </i>
                  </span>
                  <span role="cell">
                    <CopyableValue label="customer ID" value={customerId} />
                  </span>
                  <span role="cell">2026-08-{String((identityIndex % 28) + 1).padStart(2, "0")}</span>
                  <span role="cell">
                    {isSubrow ? `Child ${subIndex + 1}` : rowState.updatedAt}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p className="complex-demo__note">
        {polling
          ? "Drag the scrollbar thumb while a poll lands. Only one visible value changes, but replacing every row object rerenders the complete mounted range. Any green flash is the row underlay showing through."
          : expandable
            ? "Expand and collapse parent rows, then drag the scrollbar thumb quickly. Each revealed subrow is a separate fixed-height virtual item aligned to the parent columns. Any green flash is the row underlay showing through."
            : "Drag the scrollbar thumb quickly. Every mounted row keeps three tooltip trees, three copy controls, two chips, and a checkbox alive while the virtualizer replaces the visible range. Any green flash is the row underlay showing through."}
      </p>
    </section>
  );
}
