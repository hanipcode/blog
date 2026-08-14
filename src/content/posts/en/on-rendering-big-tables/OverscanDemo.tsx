import { useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import "./OverscanDemo.css";

const ROW_COUNT = 10_000;
const ROW_HEIGHT = 38;
const VIEWPORT_HEIGHT = 304;
const DEFAULT_OVERSCAN_PX = 500;
const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Shows how a pixel-sized overscan buffer becomes mounted virtual rows. */
export default function OverscanDemo() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [overscanPx, setOverscanPx] = useState(DEFAULT_OVERSCAN_PX);
  const [scrollTop, setScrollTop] = useState(0);
  const overscanRows = Math.ceil(overscanPx / ROW_HEIGHT);

  const virtualizer = useVirtualizer({
    count: ROW_COUNT,
    getScrollElement: () => scrollerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: overscanRows,
  });

  const items = virtualizer.getVirtualItems();
  const firstMounted = items.at(0)?.index ?? 0;
  const lastMounted = items.at(-1)?.index ?? 0;
  const firstVisible = Math.floor(scrollTop / ROW_HEIGHT);
  const lastVisible = Math.min(
    ROW_COUNT - 1,
    Math.ceil((scrollTop + VIEWPORT_HEIGHT) / ROW_HEIGHT) - 1,
  );

  return (
    <section className="overscan-demo" aria-labelledby="overscan-demo-title">
      <div className="overscan-demo__toolbar">
        <div>
          <strong id="overscan-demo-title">Overscan laboratory</strong>
          <span>
            {overscanPx}px buffer = {overscanRows} extra rows on each side
          </span>
        </div>
        <div className="overscan-demo__actions">
          <button
            type="button"
            aria-pressed={overscanPx === DEFAULT_OVERSCAN_PX}
            onClick={() =>
              setOverscanPx((current) =>
                current === 0 ? DEFAULT_OVERSCAN_PX : 0,
              )
            }
          >
            {overscanPx === 0 ? "Add 500px overscan" : "Remove overscan"}
          </button>
          <button
            type="button"
            className="overscan-demo__secondary"
            onClick={() => virtualizer.scrollToIndex(5_000, { align: "center" })}
          >
            Jump to row 5,000
          </button>
        </div>
      </div>

      <div className="overscan-demo__metrics" aria-hidden="true">
        <span>
          Viewport <b>{firstVisible + 1}-{lastVisible + 1}</b>
        </span>
        <span>
          Mounted <b>{firstMounted + 1}-{lastMounted + 1}</b>
        </span>
        <span>
          DOM rows <b>{items.length}</b>
        </span>
      </div>

      <div className="overscan-demo__table" role="table" aria-rowcount={ROW_COUNT}>
        <div className="overscan-demo__header" role="row">
          <span role="columnheader">ID</span>
          <span role="columnheader">Merchant</span>
          <span role="columnheader">Amount</span>
        </div>
        <div
          ref={scrollerRef}
          className="overscan-demo__scroller"
          tabIndex={0}
          onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
        >
          <div
            className="overscan-demo__spacer"
            style={{ height: virtualizer.getTotalSize() }}
          >
            {items.map((item) => {
              const visible =
                item.index >= firstVisible && item.index <= lastVisible;
              return (
                <div
                  key={item.key}
                  className="overscan-demo__row"
                  data-region={visible ? "viewport" : "overscan"}
                  role="row"
                  aria-rowindex={item.index + 1}
                  style={{
                    height: item.size,
                    transform: `translateY(${item.start}px)`,
                  }}
                >
                  <span role="cell">
                    #{String(item.index + 1).padStart(5, "0")}
                  </span>
                  <span role="cell">Merchant {(item.index % 137) + 1}</span>
                  <span role="cell">
                    {currency.format((item.index * 7_919) % 50_000)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="overscan-demo__legend" aria-hidden="true">
        <span><i data-region="viewport"></i>Inside viewport</span>
        <span><i data-region="overscan"></i>Mounted overscan</span>
      </div>
    </section>
  );
}
