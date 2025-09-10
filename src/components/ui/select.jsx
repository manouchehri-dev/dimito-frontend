import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Simple Select Component using native HTML select
 * More reliable than custom dropdown implementation
 */
const Select = ({ children, value, onValueChange, className, ...props }) => {
  const handleChange = (e) => {
    onValueChange?.(e.target.value);
  };

  return (
    <div className="relative">
      <select
        value={value || ""}
        onChange={handleChange}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 pointer-events-none" />
    </div>
  );
};

const SelectTrigger = ({ children, className, ...props }) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

const SelectValue = ({ placeholder, children }) => {
  return children || placeholder;
};

const SelectContent = ({ children }) => {
  return <>{children}</>;
};

const SelectItem = ({ value, children, disabled }) => {
  return (
    <option value={value} disabled={disabled}>
      {children}
    </option>
  );
};

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
