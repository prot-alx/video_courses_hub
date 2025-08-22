export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("ru");
};

export const truncateText = (text: string | null, maxLength: number = 50) => {
  if (!text) return "Без описания";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};
