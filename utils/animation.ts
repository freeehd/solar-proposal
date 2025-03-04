import type { MutableRefObject } from "react";

export function getCenterPoint(element: Element) {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

export function calculateBeamPath(
  containerRef: MutableRefObject<HTMLElement | null>,
  fromRef: MutableRefObject<HTMLElement | null>,
  toRef: MutableRefObject<HTMLElement | null>
) {
  if (!containerRef.current || !fromRef.current || !toRef.current) return "";

  const containerRect = containerRef.current.getBoundingClientRect();
  const fromRect = fromRef.current.getBoundingClientRect();
  const toRect = toRef.current.getBoundingClientRect();

  const startX = fromRect.left - containerRect.left + fromRect.width / 2;
  const startY = fromRect.top - containerRect.top + fromRect.height / 2;
  const endX = toRect.left - containerRect.left + toRect.width / 2;
  const endY = toRect.top - containerRect.top + toRect.height / 2;

  const controlPointX = (startX + endX) / 2;
  const controlPointY = startY;

  return `M ${startX},${startY} Q ${controlPointX},${controlPointY} ${endX},${endY}`;
}
