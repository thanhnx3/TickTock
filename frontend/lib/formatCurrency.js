export const formatCurrency = (value) => {
  const number = Number(value);
  if (isNaN(number)) return "0 VND";

  const scaledValue = number < 10 ? number * 1000000 : number;

  return (
    scaledValue.toLocaleString("vi-VN", {
      maximumFractionDigits: 0,
    }) + " VND"
  );
};
