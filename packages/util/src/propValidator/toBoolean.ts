const toBoolean = (value: string | undefined): boolean | undefined => {
  if (value === "" || value === "true") {
    return true;
  }

  if (value === undefined || value === "false") {
    return false;
  }

  return undefined;
};

export { toBoolean };
