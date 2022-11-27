import React from "react";
import { Button, ButtonProps } from "./Button";

export type ComplexButtonProps = ButtonProps & {
  /** fire action on click with previous click count */
  onClick?: (prevClickCount: number) => void;
  /** fire a second action with a different count */
  onClick2?: (prevClickCount2: number) => void;
};

const white = { style: { color: "white" } };
const leftPad = { style: { paddingLeft: "10px", ...white.style } };

/**
 * Two buttons which show individual click counts
 */
export const ClickCount = ({
  onClick,
  onClick2,
  ...rest
}: ComplexButtonProps) => {
  const [clickCount, setClickCount] = React.useState(0);
  const [clickCount2, setClickCount2] = React.useState(0);
  const handleClick =
    (isCount = true) =>
    () => {
      // send in previous click
      if (isCount) {
        onClick?.(clickCount);
        setClickCount(clickCount + 1);
      } else {
        onClick2?.(clickCount2);
        setClickCount2(clickCount2 + 1);
      }
    };

  return (
    <>
      <span data-cy="count" {...white}>
        Count is {clickCount}
      </span>
      <span {...leftPad}>
        <Button onClick={handleClick()} {...rest} />
      </span>
      <span data-cy="count-2" {...leftPad}>
        Count 2 is {clickCount2}
      </span>
      <span {...leftPad}>
        <Button dataCy={"button-2"} onClick={handleClick(false)} {...rest} />
      </span>
    </>
  );
};
