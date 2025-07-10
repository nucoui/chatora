export const disableError = () => {
  if (typeof window !== "undefined") {
    const originalConsoleError = console.error;

    // Pre-compile regex for better performance
    const NUCO_COMPONENT_REGEX = /n-[a-z-]+/;

    // Define hydration error patterns
    const HYDRATION_ERROR_PATTERNS = [
      "Hydration failed",
      "hydration mismatch",
      "throwOnHydrationMismatch",
      "server rendered HTML didn't match the client",
    ];

    // Define template-related patterns
    const TEMPLATE_PATTERNS = [
      "template",
      "shadowrootmode",
      "dangerouslySetInnerHTML",
      "shadow",
    ];

    // Define React DOM internal patterns
    const REACT_DOM_PATTERNS = [
      "beginWork",
      "performUnitOfWork",
      "workLoopConcurrent",
      "react-dom",
    ];

    console.error = (...args) => {
    // Early return for empty args
      if (args.length === 0) {
        originalConsoleError.apply(console, args);
        return;
      }

      // Convert arguments to searchable text
      const errorText = args.map((arg) => {
        if (typeof arg === "string")
          return arg;
        if (arg instanceof Error)
          return `${arg.message} ${arg.stack || ""}`;
        if (arg && typeof arg === "object") {
          try {
            return JSON.stringify(arg);
          }
          catch {
            return String(arg);
          }
        }
        return String(arg);
      }).join(" ");

      // Check for hydration errors
      const isHydrationError = HYDRATION_ERROR_PATTERNS.some(pattern =>
        errorText.includes(pattern),
      );

      // Check for template/Web Components related content
      const isTemplateRelated = TEMPLATE_PATTERNS.some(pattern =>
        errorText.includes(pattern),
      ) || NUCO_COMPONENT_REGEX.test(errorText);

      // Check for React DOM internal errors
      const isReactDOMError = REACT_DOM_PATTERNS.some(pattern =>
        errorText.includes(pattern),
      );

      // Suppress hydration errors related to our Web Components
      if ((isHydrationError && isTemplateRelated) || isReactDOMError) {
        return;
      }

      // Log all other errors normally
      originalConsoleError.apply(console, args);
    };

    // Suppress unhandled hydration errors
    window.addEventListener("error", (event) => {
      const errorMessage = event.error?.message || event.message || "";
      const isHydrationError = HYDRATION_ERROR_PATTERNS.some(pattern =>
        errorMessage.includes(pattern),
      );

      if (isHydrationError) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    }, { passive: false });
  }
};
