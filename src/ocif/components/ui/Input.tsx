import type React from "react";

import clsx from "clsx";

export const Input: React.FC<React.ComponentProps<"input">> = ({
  className,
  ...props
}) => {
  return <input className={clsx("ocif-input", className)} {...props} />;
};
