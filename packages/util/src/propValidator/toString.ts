const toString = (value: string | undefined): string | undefined => {
  if (value === undefined || value === "") {
    return undefined;
  }

  return String(value);
};

export { toString };
