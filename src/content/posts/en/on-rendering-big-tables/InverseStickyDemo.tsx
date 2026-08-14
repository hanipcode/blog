import { useId, useRef, useState } from "react";
import "./InverseStickyDemo.css";

const ROW_COUNT = 1_000;
const ROW_HEIGHT = 32;
const VIEWPORT_HEIGHT = 256;
const OVERSCAN_ROWS = 4;

type VirtualWindowProps = {
  readonly inverseSticky: boolean;
  readonly renderedScrollTop: number;
};

function VirtualWindow({
  inverseSticky,
  renderedScrollTop,
}: VirtualWindowProps) {
  const firstVisible = Math.floor(renderedScrollTop / ROW_HEIGHT);
  const firstRendered = Math.max(0, firstVisible - OVERSCAN_ROWS);
  const lastRendered = Math.min(
    ROW_COUNT - 1,
    Math.ceil((renderedScrollTop + VIEWPORT_HEIGHT) / ROW_HEIGHT) +
      OVERSCAN_ROWS -
      1,
  );
  const renderedRows = Array.from(
    { length: lastRendered - firstRendered + 1 },
    (_, offset) => firstRendered + offset,
  );
  const renderedHeight = renderedRows.length * ROW_HEIGHT;
  const stickyOffset = -(renderedHeight - VIEWPORT_HEIGHT);

  const rows = renderedRows.map((rowIndex) => (
    <div
      key={rowIndex}
      className="inverse-sticky-demo__row"
      role="row"
      aria-rowindex={rowIndex + 1}
      style={{
        height: ROW_HEIGHT,
        transform: `translateY(${(rowIndex - firstRendered) * ROW_HEIGHT}px)`,
      }}
    >
      <span role="cell">#{String(rowIndex + 1).padStart(4, "0")}</span>
      <span role="cell">Payment {(rowIndex % 89) + 1}</span>
      <span role="cell">Rendered</span>
    </div>
  ));

  if (inverseSticky) {
    return (
      <div
        className="inverse-sticky-demo__spacer"
        style={{ height: ROW_COUNT * ROW_HEIGHT }}
      >
        <div style={{ height: firstRendered * ROW_HEIGHT }} />
        <div
          className="inverse-sticky-demo__window inverse-sticky-demo__window--sticky"
          style={{
            height: renderedHeight,
            top: stickyOffset,
            bottom: stickyOffset,
          }}
        >
          {rows}
        </div>
      </div>
    );
  }

  return (
    <div
      className="inverse-sticky-demo__spacer"
      style={{ height: ROW_COUNT * ROW_HEIGHT }}
    >
      <div
        className="inverse-sticky-demo__window"
        style={{
          height: renderedHeight,
          transform: `translateY(${firstRendered * ROW_HEIGHT}px)`,
        }}
      >
        {rows}
      </div>
    </div>
  );
}

/** Contrasts a normal virtual window with Pierre's inverse-sticky geometry. */
export default function InverseStickyDemo() {
  const normalScrollerRef = useRef<HTMLDivElement>(null);
  const stickyScrollerRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [renderedScrollTop, setRenderedScrollTop] = useState(0);

  const synchronizeScrollers = (
    source: HTMLDivElement,
    scrollTop: number,
  ) => {
    const otherScroller =
      source === normalScrollerRef.current
        ? stickyScrollerRef.current
        : normalScrollerRef.current;

    if (otherScroller && otherScroller.scrollTop !== scrollTop) {
      otherScroller.scrollTop = scrollTop;
    }
    setRenderedScrollTop(scrollTop);
  };

  const scrollBothTo = (scrollTop: number) => {
    if (normalScrollerRef.current) normalScrollerRef.current.scrollTop = scrollTop;
    if (stickyScrollerRef.current) stickyScrollerRef.current.scrollTop = scrollTop;
    setRenderedScrollTop(scrollTop);
  };

  return (
    <section className="inverse-sticky-demo" aria-labelledby={titleId}>
      <div className="inverse-sticky-demo__toolbar">
        <div>
          <strong id={titleId}>Make JavaScript fall behind</strong>
          <span>
            Both lists update continuously with {OVERSCAN_ROWS * ROW_HEIGHT}px
            of overscan on each side.
          </span>
        </div>
        <div className="inverse-sticky-demo__actions">
          <button
            type="button"
            onClick={() => scrollBothTo(750 * ROW_HEIGHT)}
          >
            Jump to row 751
          </button>
          <button
            type="button"
            className="inverse-sticky-demo__secondary"
            onClick={() => scrollBothTo(0)}
          >
            Return to top
          </button>
        </div>
      </div>

      <div className="inverse-sticky-demo__comparison">
        <article className="inverse-sticky-demo__panel">
          <header>
            <strong>Ordinary virtual window</strong>
            <span>Rendered rows scroll away</span>
          </header>
          <div
            ref={normalScrollerRef}
            className="inverse-sticky-demo__scroller"
            tabIndex={0}
            role="table"
            aria-label="Ordinary virtualized table"
            aria-rowcount={ROW_COUNT}
            onScroll={(event) =>
              synchronizeScrollers(
                event.currentTarget,
                event.currentTarget.scrollTop,
              )
            }
          >
            <VirtualWindow
              inverseSticky={false}
              renderedScrollTop={renderedScrollTop}
            />
          </div>
        </article>

        <article className="inverse-sticky-demo__panel">
          <header>
            <strong>Inverse-sticky window</strong>
            <span>Rendered rows pin to the viewport edge</span>
          </header>
          <div
            ref={stickyScrollerRef}
            className="inverse-sticky-demo__scroller"
            tabIndex={0}
            role="table"
            aria-label="Inverse-sticky virtualized table"
            aria-rowcount={ROW_COUNT}
            onScroll={(event) =>
              synchronizeScrollers(
                event.currentTarget,
                event.currentTarget.scrollTop,
              )
            }
          >
            <VirtualWindow
              inverseSticky
              renderedScrollTop={renderedScrollTop}
            />
          </div>
        </article>
      </div>

      <p className="inverse-sticky-demo__note">
        Drag either scrollbar or use the jump button. Green is the empty spacer:
        if scrolling outruns React, the sticky list keeps the last committed
        range pinned to the viewport edge.
      </p>
    </section>
  );
}
