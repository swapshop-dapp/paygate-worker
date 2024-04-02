import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BaseClientService } from './baseclient.service'

@Injectable()
export default class AccountClientService extends BaseClientService {
    constructor(private readonly config: ConfigService) {
        super(config.get('accountService'))
        this.httpClient.defaults.headers.common['x-api-key'] = config.get<string>('internalApiKey')
        this.httpClient.defaults.headers.common['user-agent'] = config.get('INTERNAL_USER_AGENT')
    }

    async getListUserTesting() {
        try {
            const { data } = await this.httpClient.get(`/v1/user/get-user-testing`)
            return data?.data
        } catch (e) {
            console.log(e)
        }
    }
    async getActiveUserByWalletId(walletId) {
        try {
            const {data} = await this.httpClient.get(`/v1/user/internal/${walletId}`)
            return data?.data
        }catch (e) {
            console.log(e)
        }
    }

    async getAllHostFromPartnerId(partnerId, page = 1, pageSize = 100, hosts = []) {
        let hostsFromAccountService = hosts
        const { data } = await this.httpClient.get('/v1/user/internal/partner/host', {
            params: {
                partnerId,
                page,
                pageSize
            }
        })
        hostsFromAccountService = hostsFromAccountService.concat(data.data)

        if(data.paging.totalPages <= page) {
            return hostsFromAccountService
        }
        return this.getAllHostFromPartnerId(partnerId, ++page, pageSize, hostsFromAccountService)
    }

    async getPrimaryUrl(userIds) {
        try {
            const { data } = await this.httpClient.get(`/v1/user/custom-url`, {
                params: {
                    userIds
                }
            })
            return data?.data
        } catch (e) {
            console.log(e)
        }
    }
}

