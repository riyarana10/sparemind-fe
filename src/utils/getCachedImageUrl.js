const getCachedImageUrl = (url) => {
  const now = new Date();
  const dayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  return `${url}?v=${dayKey}`;
};

export default getCachedImageUrl;
