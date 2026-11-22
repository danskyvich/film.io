import { Switch, type SwitchProps } from "react-aria-components"

interface CustomSwitchProps extends Omit<SwitchProps, "className"> {
    className?: string,
}

export function CustomSwitch({children, className, ...props}: CustomSwitchProps) {
    return (
      <Switch
        {...props}
        className={`group flex items-center gap-2 ${className ?? ""}`}
      >
        {(renderProps) => (
          <>
            <div className="relative h-5 w-9 shrink-0 rounded-full border border-gray-400 bg-gray-300 transition group-data-selected:bg-blue-600 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition group-data-[selected]:after:translate-x-4" />
            {typeof children === "function" ? children(renderProps) : children}
          </>
        )}
      </Switch>
    );
}