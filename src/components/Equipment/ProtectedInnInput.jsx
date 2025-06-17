import React, { useState, useEffect } from "react";
import { Input } from "antd";

const ProtectedInnInput = ({
  value = "",
  onChange,
  templatePrefix = "",
  placeholder = "",
  style = {},
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (e) => {
    let newValue = e.target.value;

    // If there's a template prefix, ensure it's protected with "/" separator
    if (templatePrefix && templatePrefix.trim() !== "") {
      const prefixWithSlash = `${templatePrefix}/`;

      // If user tries to delete the prefix, restore it
      if (!newValue.startsWith(prefixWithSlash)) {
        // Extract any suffix the user might have typed
        const possibleSuffix = newValue
          .replace(templatePrefix, "")
          .replace("/", "");
        newValue = `${prefixWithSlash}${possibleSuffix}`;
      }
    }

    setInputValue(newValue);
    onChange(newValue);
  };

  const handleKeyDown = (e) => {
    if (templatePrefix && templatePrefix.trim() !== "") {
      const prefixWithSlash = `${templatePrefix}/`;
      const cursorPosition = e.target.selectionStart;

      // Prevent deletion of prefix characters
      if (
        (e.key === "Backspace" || e.key === "Delete") &&
        cursorPosition <= prefixWithSlash.length
      ) {
        e.preventDefault();
        // Move cursor to after prefix
        setTimeout(() => {
          e.target.setSelectionRange(
            prefixWithSlash.length,
            prefixWithSlash.length
          );
        }, 0);
      }
    }
  };

  const handleClick = (e) => {
    if (templatePrefix && templatePrefix.trim() !== "") {
      const prefixWithSlash = `${templatePrefix}/`;
      const cursorPosition = e.target.selectionStart;

      // If user clicks within prefix area, move cursor to after prefix
      if (cursorPosition < prefixWithSlash.length) {
        setTimeout(() => {
          e.target.setSelectionRange(
            prefixWithSlash.length,
            prefixWithSlash.length
          );
        }, 0);
      }
    }
  };

  return (
    <Input
      value={inputValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      placeholder={placeholder}
      style={style}
      disabled={disabled}
    />
  );
};

export default ProtectedInnInput;
