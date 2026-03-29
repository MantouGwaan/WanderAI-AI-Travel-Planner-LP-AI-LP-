export const formatDestinations = (destinations: string[]) => {
  if (destinations.length === 0) return '';
  
  const groups: { [suffix: string]: string[] } = {};
  
  destinations.forEach(dest => {
    const firstCommaIndex = dest.indexOf(',');
    if (firstCommaIndex === -1) {
      const suffix = '';
      if (!groups[suffix]) groups[suffix] = [];
      groups[suffix].push(dest.trim());
    } else {
      const city = dest.substring(0, firstCommaIndex).trim();
      const suffix = dest.substring(firstCommaIndex).trim(); // includes the leading comma and space
      if (!groups[suffix]) groups[suffix] = [];
      groups[suffix].push(city);
    }
  });

  const formattedGroups = Object.entries(groups).map(([suffix, cities]) => {
    const citiesStr = cities.join(' & ');
    return citiesStr + suffix;
  });

  return formattedGroups.join(' & ');
};
