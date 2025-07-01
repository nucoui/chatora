const toNumber = (value: string | undefined): number | undefined => {
  if (value === undefined || value === "") {
    return undefined;
  }

  const numberValue = Number(value);

  return Number.isNaN(numberValue) ? undefined : numberValue;
};

export { toNumber };
