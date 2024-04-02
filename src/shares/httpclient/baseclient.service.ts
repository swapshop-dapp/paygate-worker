import { Injectable, HttpException } from '@nestjs/common'
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { AxiosException } from '../../common/exceptions/AxiosException'

const catchAxiosException = (e) => {
    if (!e.response) throw e
    const { status, config: responseConfig, data: responseData } = e.response
    throw new AxiosException(
        {
            response: responseData,
            method: responseConfig.method,
            url: responseConfig.url,
            data: responseConfig.data,
            baseUrl: responseConfig.baseURL,
        },
        status,
    )
}

@Injectable()
export abstract class BaseClientService {
    protected httpClient: AxiosInstance

    protected constructor(baseurl: string) {
        console.log(baseurl)
        if (!baseurl.startsWith('http')) {
            baseurl = `http://${baseurl}`
        }
        this.httpClient = axios.create({
            baseURL: baseurl,
            timeout: 60000,
        })
        // this.httpClient.defaults.headers.common['content-type'] = 'application/x-www-form-urlencoded'
    }

    async post<T = any, R = AxiosResponse<T>>(url: string, data?, config?: AxiosRequestConfig): Promise<R> {
        return this.httpClient.post<T, R>(url, data, config).catch(catchAxiosException)
    }

    async get<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
        return this.httpClient.get<T, R>(url, config).catch(catchAxiosException)
    }

    async put<T = any, R = AxiosResponse<T>>(url: string, data?, config?: AxiosRequestConfig): Promise<R> {
        return this.httpClient.put<T, R>(url, data, config).catch(catchAxiosException)
    }

    async delete<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
        return this.httpClient.delete<T, R>(url, config).catch(catchAxiosException)
    }

    async patch<T = any, R = AxiosResponse<T>>(url: string, data?, config?: AxiosRequestConfig): Promise<R> {
        return this.httpClient.patch<T, R>(url, data, config).catch(catchAxiosException)
    }
}
