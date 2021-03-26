import { parse, parseISO } from 'date-fns';

export const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
export const percentFormatter = new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const numericFormatter = new Intl.NumberFormat('en-US', {});

export const checkFocus = (element, func) => {
  let isFocused = null;
  document.addEventListener('click', (event) => {
    let targetElement = event.target;
    do {
      if (targetElement === element) {
        if (isFocused !== true) {
          func(true);
          isFocused = true;
        }
        return;
      }
      targetElement = targetElement.parentNode;
    } while (targetElement);
    if (isFocused !== false) {
      func(false);
      isFocused = false;
    }
  });
};

export const parseCellDateTime = (value, column, format) => {
  // eslint-disable-next-line no-param-reassign
  value = parse(value, column.format || format, new Date());
  // eslint-disable-next-line no-restricted-globals
  if (isNaN(value)) {
    throw new Error(`Invalid date format ${format}`);
  }
  return value;
};

export const sameDates = (date1, date2) => {
  if (!date1 && date2) return false;
  if (date1 && !date2) return false;
  if (!date1 && !date2) return true;
  return date1.getFullYear() === date2.getFullYear()
  && date1.getMonth() === date2.getMonth()
  && date1.getDate() === date2.getDate()
  && date1.getHours() === date2.getHours()
  && date1.getMinutes() === date2.getMinutes();
};
