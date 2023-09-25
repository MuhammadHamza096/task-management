export const dateFormat = (d) => {
  const date = new Date(d);

  const formattedDate = `${
    date.getMonth() + 1
  }/${date.getDate()}/${date.getFullYear()} ${String(date.getHours()).padStart(
    2,
    "0"
  )}:${String(date.getMinutes()).padStart(2, "0")}:${String(
    date.getSeconds()
  ).padStart(2, "0")}`;
  return formattedDate;
};
