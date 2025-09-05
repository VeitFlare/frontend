// Utility function to format dates in a readable format
export function formatReadableDate(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'N/A';
  }
  
  // Format as "3rd of September, 2025"
  const options: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  };
  
  const formattedDate = date.toLocaleDateString('en-US', options);
  
  // Add ordinal suffix to day (st, nd, rd, th)
  return formattedDate.replace(/\b(\d+)(st|nd|rd|th)\b/, (match, day) => {
    const dayNum = parseInt(day);
    const suffix = dayNum % 10 === 1 && dayNum !== 11 ? 'st' :
                  dayNum % 10 === 2 && dayNum !== 12 ? 'nd' :
                  dayNum % 10 === 3 && dayNum !== 13 ? 'rd' : 'th';
    return dayNum + suffix;
  });
}