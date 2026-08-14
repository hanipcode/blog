import { Fragment, useEffect, useId, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import "./PooledInverseStickyTableDemo.css";

const ROW_COUNT = 2_000;
const ROW_HEIGHT = 41;
const OVERSCAN_ROWS = 12;
const DEFAULT_VIEWPORT_HEIGHT = 384;
const DEFAULT_HEADER_HEIGHT = 40;
const statuses = ["Completed", "Pending", "Failed", "Review"] as const;
const risks = ["Low", "Medium", "High"] as const;
const channels = ["API", "Dashboard", "Checkout"] as const;
const methods = ["Card", "Bank transfer", "Wallet", "QR"] as const;
const countries = ["US", "GB", "ID", "SG", "DE"] as const;

type CopyableCellProps = {
  readonly label: string;
  readonly value: string;
};

function CopyableCell({ label, value }: CopyableCellProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
  };

  return (
    <span className="pooled-inverse-demo__copyable">
      <span className="pooled-inverse-demo__truncate" title={value}>
        {value}
      </span>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${label} ${value}`}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </span>
  );
}

/** Reproduces  pooled inverse-sticky virtual-table architecture. */
export default function PooledInverseStickyTableDemo() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLTableElement>(null);
  const titleId = useId();
  const [viewportHeight, setViewportHeight] = useState(DEFAULT_VIEWPORT_HEIGHT);
  const [headerHeight, setHeaderHeight] = useState(DEFAULT_HEADER_HEIGHT);
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<number>>(
    () => new Set(),
  );

  const virtualizer = useVirtualizer({
    count: ROW_COUNT,
    getScrollElement: () => scrollerRef.current,
    getItemKey: (index) => `transaction-${index}`,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN_ROWS,
  });

  const items = virtualizer.getVirtualItems();
  const windowStart = items.at(0)?.start ?? 0;
  const windowEnd = items.at(-1)?.end ?? windowStart;
  const windowHeight = windowEnd - windowStart;
  const overhang = windowHeight - viewportHeight;
  const windowSticky = overhang > 0;
  const stickyOverlap = windowSticky ? Math.min(ROW_HEIGHT, overhang) : 0;
  const stickyTop = windowSticky ? -overhang + stickyOverlap : undefined;
  const stickyBottom =
    stickyTop === undefined ? undefined : stickyTop + headerHeight;
  const allSelected = selectedRows.size === ROW_COUNT;
  const someSelected = selectedRows.size > 0 && !allSelected;

  useEffect(() => {
    const scroller = scrollerRef.current;
    const header = headerRef.current;
    if (!scroller || !header) return;

    const measure = () => {
      setViewportHeight(scroller.clientHeight);
      setHeaderHeight(header.getBoundingClientRect().height);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    observer.observe(header);
    measure();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const input = document.getElementById(`${titleId}-select-all`);
    if (input instanceof HTMLInputElement) input.indeterminate = someSelected;
  }, [someSelected, titleId]);

  const toggleAll = () => {
    setSelectedRows(
      allSelected
        ? new Set()
        : new Set(Array.from({ length: ROW_COUNT }, (_, index) => index)),
    );
  };

  const toggleRow = (rowIndex: number) => {
    setSelectedRows((current) => {
      const next = new Set(current);
      if (next.has(rowIndex)) next.delete(rowIndex);
      else next.add(rowIndex);
      return next;
    });
  };

  return (
    <section className="pooled-inverse-demo" aria-labelledby={titleId}>
      <div className="pooled-inverse-demo__toolbar">
        <div>
          <strong id={titleId}>Pooled inverse sticky</strong>
          <span>
            {items.length} physical row slots | {OVERSCAN_ROWS * ROW_HEIGHT}px
            overscan per side
          </span>
        </div>
        <button
          type="button"
          onClick={() => virtualizer.scrollToIndex(1_499, { align: "center" })}
        >
          Jump to row 1500
        </button>
      </div>

      <div className="pooled-inverse-demo__metrics">
        <span>Rows: {ROW_COUNT.toLocaleString()}</span>
        <span>Columns: 13</span>
        <span>Pool: {items.length} reusable slots</span>
        <span>{virtualizer.isScrolling ? "Scrolling" : "Settled"}</span>
      </div>

      <div
        ref={scrollerRef}
        className="pooled-inverse-demo__scroller"
        tabIndex={0}
      >
        <div className="pooled-inverse-demo__content">
          <table
            ref={headerRef}
            className="pooled-inverse-demo__header"
            role="table"
            aria-rowcount={ROW_COUNT}
          >
            <thead>
              <tr>
                <th>
                  <input
                    id={`${titleId}-select-all`}
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label={`Select all ${ROW_COUNT} rows`}
                  />
                </th>
                <th>Transaction ID</th>
                <th>Merchant</th>
                <th>Reference</th>
                <th>Status</th>
                <th>Channel</th>
                <th>Method</th>
                <th>Currency</th>
                <th>Country</th>
                <th>Risk</th>
                <th>Customer ID</th>
                <th>Created</th>
                <th>Updated</th>
              </tr>
            </thead>
          </table>

          <div
            className="pooled-inverse-demo__virtual-body"
            style={{ height: virtualizer.getTotalSize() }}
          >
            <div
              className="pooled-inverse-demo__range-buffer"
              style={{ height: windowStart }}
              aria-hidden="true"
            />
            <div
              className="pooled-inverse-demo__row-window"
              role="rowgroup"
              style={{
                position: windowSticky ? "sticky" : "relative",
                top: stickyTop,
                bottom: stickyBottom,
                height: windowHeight,
                pointerEvents: virtualizer.isScrolling ? "none" : undefined,
              }}
            >
              <div
                className="pooled-inverse-demo__underlay"
                aria-hidden="true"
              />
              <table
                role="presentation"
                className="pooled-inverse-demo__body-table"
              >
                <tbody>
                  {items.map((item, slot) => {
                    const rowIndex = item.index;
                    const contentKey = `transaction-${rowIndex}`;
                    const identityIndex = rowIndex * 3;
                    const transactionId = `txn_${String(identityIndex * 97).padStart(12, "0")}`;
                    const reference = `REF-${String(identityIndex * 7_919).padStart(10, "0")}`;
                    const customerId = `cus_${String(identityIndex * 313).padStart(11, "0")}`;
                    const status =
                      statuses[identityIndex % statuses.length] ?? "Completed";
                    const risk = risks[identityIndex % risks.length] ?? "Low";
                    const selected = selectedRows.has(rowIndex);

                    return (
                      <tr
                        key={`slot-${slot}`}
                        data-index={item.index}
                        data-selected={selected ? "true" : undefined}
                        aria-rowindex={item.index + 1}
                        style={{
                          height: ROW_HEIGHT,
                          transform: `translateY(${item.start - windowStart}px)`,
                        }}
                      >
                        <td>
                          <Fragment key={`${contentKey}:selection`}>
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleRow(rowIndex)}
                              aria-label={`Select transaction ${transactionId}`}
                            />
                          </Fragment>
                        </td>
                        <td>
                          <CopyableCell
                            key={`${contentKey}:transaction`}
                            label="transaction ID"
                            value={transactionId}
                          />
                        </td>
                        <td>
                          <Fragment key={`${contentKey}:merchant`}>
                            Merchant {(rowIndex % 137) + 1}
                          </Fragment>
                        </td>
                        <td>
                          <CopyableCell
                            key={`${contentKey}:reference`}
                            label="reference"
                            value={reference}
                          />
                        </td>
                        <td>
                          <Fragment key={`${contentKey}:status`}>
                            <i
                              className="pooled-inverse-demo__chip"
                              data-tone={status.toLowerCase()}
                            >
                              {status}
                            </i>
                          </Fragment>
                        </td>
                        <td>{channels[identityIndex % channels.length]}</td>
                        <td>{methods[identityIndex % methods.length]}</td>
                        <td>
                          {["USD", "EUR", "GBP", "IDR"][identityIndex % 4]}
                        </td>
                        <td>{countries[identityIndex % countries.length]}</td>
                        <td>
                          <Fragment key={`${contentKey}:risk`}>
                            <i
                              className="pooled-inverse-demo__chip"
                              data-tone={risk.toLowerCase()}
                            >
                              {risk}
                            </i>
                          </Fragment>
                        </td>
                        <td>
                          <CopyableCell
                            key={`${contentKey}:customer`}
                            label="customer ID"
                            value={customerId}
                          />
                        </td>
                        <td>
                          2026-08-
                          {String((identityIndex % 28) + 1).padStart(2, "0")}
                        </td>
                        <td>10:{String(rowIndex % 60).padStart(2, "0")}:24</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <p className="pooled-inverse-demo__note">
        The row and cell shells are keyed by pool slot, while stateful cell
        content is keyed by record identity. The opaque underlay and one-row
        sticky overlap keep the pooled window covered while those slots are
        rebound.
      </p>
    </section>
  );
}
