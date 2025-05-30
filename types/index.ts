import { SVGProps } from "react";

const ORDER_STATUSES = ["PENDING", "COMPLETED"] as const;

export type OrderStatus = typeof ORDER_STATUSES[number];

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};
