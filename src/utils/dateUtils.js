// src/utils/dateUtils.js
import { format } from 'date-fns';

export function formatDate(date) {
  if (!date) return '';
  try {
    return format(new Date(date), 'dd-MM-yyyy');
  } catch {
    return date.split('T')[0];
  }
}