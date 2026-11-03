export const formatAddressLabel = (label: string) =>
  label === 'current'
    ? 'Current location'
    : label.charAt(0).toUpperCase() + label.slice(1);
