import { AxiosResponse } from 'axios'
import request from '@renderer/request'

/**
 * 歌单接口
 * @param {Object} params - 参数
 * @param  {number} page - 页数
 * @param  {number} data_index - 返回几条数据 默认10条
 * @return {Object} - 返回结果
 * */
export const getPlaylist = (params?: {
  page?: number
  data_index?: number
}): Promise<AxiosResponse> => {
  return request({
    url: '/api/playList',
    method: 'get',
    params
  })
}

/**
 * 歌单里面的所有歌曲
 * @param {Object} params - 参数
 * @param {number} page - 页数
 * @param {number} data_index - 返回几条数据 默认10条
 * @param {string} url - 歌单url
 * @return {Object} - 返回结果
 * */

export const getPlayListDetail = (params?: {
  page?: number
  data_index?: number
  url?: string
}): Promise<AxiosResponse> => {
  return request({
    url: '/api/playListDetail',
    method: 'get',
    params
  })
}

/**
 * 获取音乐信息
 * @param {Object} params - 参数
 * @param {string} href - 音乐
 * @return {Object} - 返回结果
 * */
export const getMusicInfo = (params?: { href?: string }): Promise<AxiosResponse> => {
  return request({
    url: '/api/playUrl',
    method: 'get',
    params
  })
}

/**
 * @param {Object} params - 参数
 * @param {string} page - 页数
 * @param {string} query - 音乐
 * @return {Object} - 搜索结果
 * */
export const getSearch = (params?: { query?: string, page?: number }): Promise<AxiosResponse> => {
  return request({
    url: '/api/search',
    method: 'get',
    params
  })
}

/*乐库 13首 音乐*/
export const getMusicLibrary = (): Promise<AxiosResponse> => {
  return request({
    url: '/api/yk_dj',
    method: 'get'
  })
}
/*乐库*/
export const getMusicLibraryList = (): Promise<AxiosResponse> => {
  return request({
    url: '/api/gd',
    method: 'get'
  })
}
/*乐库 swiper*/
export const getMusicLibraryListSwiper = (): Promise<AxiosResponse> => {
  return request({
    url: '/api/yk_swiper',
    method: 'get'
  })
}
