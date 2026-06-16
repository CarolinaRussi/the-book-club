import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const TOP_GAP_PX = 24;
const BOTTOM_GAP_PX = 24;

type StickySidebarColumnProps = {
  children: ReactNode;
  className?: string;
};

function getDocumentTop(element: HTMLElement) {
  return element.getBoundingClientRect().top + window.scrollY;
}

export default function StickySidebarColumn({
  children,
  className,
}: StickySidebarColumnProps) {
  const columnRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const [topPx, setTopPx] = useState(TOP_GAP_PX);

  useEffect(() => {
    const column = columnRef.current;
    const sticky = stickyRef.current;
    if (!column || !sticky) return;

    const update = () => {
      const sidebarHeight = sticky.offsetHeight;
      const viewportHeight = window.innerHeight;
      const columnTop = getDocumentTop(column);
      const scrollY = window.scrollY;
      const fitsInViewport =
        sidebarHeight <= viewportHeight - TOP_GAP_PX - BOTTOM_GAP_PX;

      if (fitsInViewport) {
        setTopPx(TOP_GAP_PX);
        return;
      }

      const scrollStart = columnTop - TOP_GAP_PX;
      const revealDistance =
        sidebarHeight - viewportHeight + TOP_GAP_PX + BOTTOM_GAP_PX;
      const scrollEnd = scrollStart + revealDistance;
      const minTop = viewportHeight - sidebarHeight - BOTTOM_GAP_PX;

      if (scrollY <= scrollStart) {
        setTopPx(TOP_GAP_PX);
      } else if (scrollY >= scrollEnd) {
        setTopPx(minTop);
      } else {
        const progress = (scrollY - scrollStart) / revealDistance;
        setTopPx(TOP_GAP_PX + progress * (minTop - TOP_GAP_PX));
      }
    };

    update();

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(sticky);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div ref={columnRef} className={cn("min-h-0", className)}>
      <div
        ref={stickyRef}
        className="sticky will-change-[top]"
        style={{ top: `${topPx}px` }}
      >
        {children}
      </div>
    </div>
  );
}
