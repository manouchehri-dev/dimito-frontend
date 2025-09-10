import jalaali from "jalaali-js";

export function formatPersianDate(date) {
  const g = new Date(date);
  const j = jalaali.toJalaali(g);
  return `${j.jy}/${j.jm.toString().padStart(2, "0")}/${j.jd
    .toString()
    .padStart(2, "0")}`;
}
