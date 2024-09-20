export const formatDate = (dateString) => {
    const date = new Date(dateString);
  
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-GB', options); // Outputs '1 October 2024'
  
    // Get the day of the month to add the correct suffix
    const day = date.getDate();
    let daySuffix;
  
    if (day === 1 || day === 21 || day === 31) {
      daySuffix = 'st';
    } else if (day === 2 || day === 22) {
      daySuffix = 'nd';
    } else if (day === 3 || day === 23) {
      daySuffix = 'rd';
    } else {
      daySuffix = 'th';
    }
  
    // Format the date as '1st October, 2024'
    const [dayPart, monthPart, yearPart] = formattedDate.split(' ');
    return `${day}${daySuffix} ${monthPart}, ${yearPart}`;
  };
  