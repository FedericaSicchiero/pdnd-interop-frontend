import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { ApiEndpointKey } from '../../types'
import { logAction } from './action-log'
import { API, USE_LOCAL_DATA, USE_LOCAL_DATA_RESPONSE_STATUS } from './constants'

type Endpoint = {
  endpoint: ApiEndpointKey
  additionalPath?: string
}

export async function fetchWithLogs(
  { endpoint, additionalPath }: Endpoint,
  { method, params, data }: AxiosRequestConfig
) {
  if (!API[endpoint]) {
    throw new Error(`The endpoint ${endpoint} does not exist in constants.ts`)
  }

  let url = API[endpoint].URL
  let baseURL = API.BASE.URL

  if (additionalPath) {
    url += `/${additionalPath}`
  }

  logAction('Fetch data', 'API', {
    isUsingLocalData: USE_LOCAL_DATA,
    endpoint,
    baseURL,
    url,
    method,
    params,
    data,
  })

  if (USE_LOCAL_DATA) {
    url = API[endpoint].LOCAL
    baseURL = API.BASE.LOCAL
    params = {}

    // Mock taking time for req/res round trip
    await sleep(1500)

    // Don't let POST and PATCH requests go through, they are useless while mocking
    if (!method || method !== 'GET') {
      // Return the status code so to test handling error case scenarios
      return { status: USE_LOCAL_DATA_RESPONSE_STATUS } as AxiosResponse
    }
  }

  try {
    const response = await axios.request({
      url,
      method,
      params,
      data,
      baseURL,
      headers: { Authorization: `Bearer 123` },
    })

    logAction('Log data', 'API', response)

    return response
  } catch (error) {
    console.error(error)
    // return { status: 404 } as AxiosResponse
  }
}

// Utility to wait some time
export const sleep = async (ms: number) => await new Promise((resolve) => setTimeout(resolve, ms))
