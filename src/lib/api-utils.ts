import { AxiosError, AxiosResponse } from 'axios'
import { RequestConfig } from '../../types'
import { API } from './constants'
import instance from './api-interceptors-utils'
import { buildDynamicPath } from './url-utils'
import { logError } from './action-log'

export async function fetchAllWithLogs(reqsConfig: RequestConfig[]) {
  return await Promise.all(reqsConfig.map(async (requestConfig) => await request(requestConfig)))
}

export async function fetchWithLogs(
  requestConfig: RequestConfig
): Promise<AxiosResponse<any> | AxiosError<any>> {
  return await request(requestConfig)
}

export async function request<T>(requestConfig: RequestConfig): Promise<T | AxiosError<any>> {
  const {
    path: { endpoint, endpointParams },
    config,
  } = requestConfig

  const method = API[endpoint].METHOD

  // Replace dynamic parts of the URL by substitution
  const url = buildDynamicPath(API[endpoint].URL, endpointParams)

  try {
    return await instance.request({ url, method, ...(config || {}) })
  } catch (error) {
    logError(error)
    return error as AxiosError<any>
  }
}
