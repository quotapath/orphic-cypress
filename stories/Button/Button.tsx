import React from "react";

export type ButtonProps = {
  /** fire action on click */
  onClick?: () => void;
  /** label for the button */
  label?: string;
  /** if the button should be disabled or not */
  disabled?: boolean;
  /** tag to make test selection easy + stable */
  dataCy?: string;
};

/**
 * Just a typical button really
 */
export const Button = ({
  onClick,
  disabled,
  label = "click me",
  dataCy = "button",
}: ButtonProps) => (
  <button onClick={onClick} disabled={disabled} data-cy={dataCy}>
    {label}
  </button>
);
