// 排序工具函数

// 按日期排序
export const sortByDate = <T extends { date: string }>(list: T[], order: 'asc' | 'desc' = 'asc'): T[] => {
  const arr = [...list];
  arr.sort((a, b) => {
    const ta = Date.parse(a.date);
    const tb = Date.parse(b.date);
    return order === 'asc' ? ta - tb : tb - ta;
  });
  return arr;
};

// 按名称排序
export const sortByName = <T extends { music_title: string }>(list: T[], order: 'asc' | 'desc' = 'asc'): T[] => {
  const arr = [...list];
  arr.sort((a, b) => {
    const nameA = a.music_title.toLowerCase();
    const nameB = b.music_title.toLowerCase();
    return order === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
  });
  return arr;
};

// 按艺术家排序
export const sortByArtist = <T extends { artist: string }>(list: T[], order: 'asc' | 'desc' = 'asc'): T[] => {
  const arr = [...list];
  arr.sort((a, b) => {
    const artistA = a.artist.toLowerCase();
    const artistB = b.artist.toLowerCase();
    return order === 'asc' ? artistA.localeCompare(artistB) : artistB.localeCompare(artistA);
  });
  return arr;
}; 