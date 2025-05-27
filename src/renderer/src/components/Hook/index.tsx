import { useInfiniteQuery, useQuery, UseQueryResult } from '@tanstack/react-query'
import {
  getMusicInfo,
  getMusicLibrary,
  getMusicLibraryListSwiper,
  getPlaylist,
  getPlayListDetail,
  getSearch
} from '@renderer/Api'
import { SongProps } from '@renderer/InterFace'

//首页歌单请求
export const usePlaylist = (page: number, data_index: number): any => {
  return useQuery({
    queryKey: ['playlist', page, data_index],
    queryFn: async () => {
      const res = await getPlaylist({ page, data_index })
      return res.data.data
    },
    // staleTime: 1000 * 60 * 24, // 一天内不会重新请求
    // gcTime: 1000 * 60 * 24, // 一天未使用就会被清除
    staleTime: Infinity, // 永久保留
    gcTime: Infinity, // 永久保留
    refetchOnWindowFocus: false, // electron 应用不需要窗口焦点时自动刷新请求
    refetchOnReconnect: false, // 断线重连时不自动刷新，避免频繁请求
  })
}
//显示更多无限加载 独立使用
export const useInfinitePlaylist = (limit = 25): any => {
  return useInfiniteQuery({
    queryKey: ['playlist-infinite', limit],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      console.log('fetch page', pageParam);
      const res = await getPlaylist({ page: pageParam, data_index: limit });
      console.log('getPlaylist 返回:', res);
      return res.data.data || []; // 确保返回数组，防止 undefined
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.length < limit) return undefined; // 没有更多数据
      return pages.length + 1; // 下一页
    },
    staleTime: 1000 * 60 * 60, // 60 分钟缓存
    gcTime: 1000 * 60 * 50, // 50 分钟垃圾回收
    placeholderData: (previous) => previous, // 保留旧数据，防止闪烁
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });
};

// 歌单详情
export const usePlaylistDetail = (
  url: string
): UseQueryResult<{
  music_list: SongProps[]
  current_page: string | number
  has_next: boolean
}> => {
  return useQuery({
    queryKey: ['playlistDetail', url],
    queryFn: async () => {
      const res = await getPlayListDetail({ url })
      return res.data.data
    },
    enabled: !!url, // 👈 只有 url 存在时才发起请求
    staleTime: 1000 * 60 * 24,
    gcTime: 1000 * 60 * 24,
    placeholderData: undefined,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  })
}

// 搜索内容
export const useSearch = (query: string): any => {
  return useInfiniteQuery({
    queryKey: ['search', query],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await getSearch({ query, page: pageParam });
      return {
        list: res.data.data || [],
        hasNext: res.data.has_next || false,
        nextPage: pageParam + 1,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextPage : undefined),

    enabled: !!query,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};
// 乐库13首音乐
export const useMusicLibrary = (): any => {
  return useQuery({
    queryKey: ['musicLibrary'],
    queryFn: async () => {
      const res = await getMusicLibrary()
      return res.data.data
    },
    staleTime: 1000 * 60 * 24, // 24 小时缓存
    gcTime: 1000 * 60 * 24, //  24 小时垃圾回收
    refetchOnWindowFocus: false,
    refetchInterval: false,
  })
}
//乐库swiper
export const useMusicLibrarySwiper = () => {
  return useQuery({
    queryKey: ['musicLibrarySwiper'],
    queryFn: async () => {
      const res = await getMusicLibraryListSwiper();
      return res.data.data;
    },
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

//获取音乐地址
export const useSongInfo = (item: SongProps | null) => {
  return useQuery({
    queryKey: ['songInfo', item?.href], //以 href 作为缓存 key 的一部分
    queryFn: async () => {
      const res = await getMusicInfo({ href: item?.href })
      return res.data.data
    },
    enabled: !!item?.href, // 只有 href 有值时才触发请求
    staleTime: 1000 * 60 * 24,
    gcTime: 1000 * 60 * 24,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}
