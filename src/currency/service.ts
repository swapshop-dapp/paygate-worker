import {
    Inject,
    Injectable,
    OnModuleInit,
}                        from '@nestjs/common'
import { PrismaService } from '../common/connections/prisma.service'
import {
    Cron,
    CronExpression,
}                        from '@nestjs/schedule'
import { crypto }        from '../common/const/currency'
import { HttpService }   from '@nestjs/axios'
import Big               from 'big.js'
import { ConfigService } from '@nestjs/config'
import { PrismaPromise } from '@prisma/client'

@Injectable()
export default class CurrencyService implements OnModuleInit {
    @Inject()
    private readonly prisma: PrismaService
    @Inject()
    private readonly request: HttpService
    @Inject()
    private readonly config: ConfigService

    async onModuleInit(): Promise<any> {
        await Promise.all([
            this.fetchDataFromCoinGecko(),
            this.fetchDataFromExchangeFiat(),
        ])
    }

    @Cron(process.env.CRON_TIME_FETCH_DATA_FROM_COIN_GECKO || CronExpression.EVERY_30_SECONDS)
    async fetchDataFromCoinGecko() {
        // console.log(`${new Date().toISOString()} Start fetch exchange rate crypto`)
        const currenciesOrder = {
            USDC: {
                order: 1000,
                display: true,
            },
            USDT: {
                order: 1010,
                display: true,
            },
            BUSD: {
                order: 1020,
                display: true,
            },
            TRVL: {
                order: 1030,
                display: true,
            },
            ETH: {
                order: 1040,
                display: true,
            },
        }
        try {
            const axios = this.request.axiosRef
            // console.log(crypto.join());
            const { data } = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
                params: {
                    ids: crypto.join(),
                    vs_currency: 'usd',
                },
            })
            await Promise.all(
                data.map(async (currency) => {
                    const symbol = currency.symbol.toUpperCase()
                    return this.upsertCurrency({
                        key: currency.symbol.toUpperCase(),
                        name: currency.name,
                        symbol,
                        rate: currency.current_price,
                        type: 'CRYPTO',
                        source: 'COIN_GECKO',
                        display: true,
                        ...currenciesOrder[symbol],
                    })
                }),
            )
        } catch (e) {
            console.error(JSON.stringify(e))
        }
    }

    @Cron(process.env.CRON_TIME_FETCH_EXCHANGE_RATE_FIAT || CronExpression.EVERY_3_HOURS)
    async fetchDataFromExchangeFiat() {
        console.log(`${new Date().toISOString()} Start fetch exchange rate fiat`)
        const currencies = {
            USD: {
                symbol: '$',
                name: 'US Dollar',
                key: 'USD',
                order: 1,
                display: true,
            },
            GBP: {
                symbol: '£',
                name: 'Pound Sterling',
                order: 10,
                display: true,
            },
            EUR: {
                symbol: '€',
                name: 'Euro',
                order: 20,
                display: true,
            },
            AUD: {
                symbol: 'AU$',
                name: 'Australian Dollar',
                order: 30,
                display: true,
            },
            SGD: {
                symbol: 'S$',
                name: 'Singapore Dollar',
                key: 'SGD',
                order: 40,
                display: true,
            },
            CAD: {
                symbol: 'CA$',
                name: 'Canadian Dollar',
                order: 50,
                display: true,
            },
            HKD: {
                symbol: 'HK$',
                name: 'Hong Kong Dollar',
                order: 60,
                display: true,
            },
            CNY: {
                symbol: '¥',
                name: 'Chinese Yuan',
                order: 70,
                display: true,
            },
            NZD: {
                symbol: 'NZ$',
                name: 'New Zealand Dollar',
                key: 'NZD',
                order: 80,
                display: true,
            },
            INR: {
                symbol: '₹',
                name: 'Indian Rupee',
                key: 'INR',
                order: 90,
                display: true,
            },
            VND: {
                symbol: '₫',
                name: 'Vietnamese Dong',
                key: 'VND',
                order: 100,
                display: true,
            },
            AED: {
                name: 'UAE Dirham',
                symbol: 'د.إ',
                order: 110,
                display: true,
            },
            KRW: {
                symbol: '₩',
                name: 'South Korean Won',
                key: 'KRW',
                order: 120,
                display: true,
            },
            BRL: {
                symbol: 'R$',
                name: 'Brazilian Real',
                key: 'BRL',
                order: 130,
                display: true,
            },
            THB: {
                symbol: '฿',
                name: 'Thai Baht',
                key: 'THB',
                order: 140,
                display: true,
            },
            PLN: {
                symbol: 'zł',
                name: 'Polish złoty',
                key: 'PLN',
                order: 150,
                display: true,
            },
            JPY: {
                symbol: '¥',
                name: 'Japanese Yen',
                key: 'JPY',
                order: 160,
                display: true,
            },
        }
        try {
            const axios = this.request.axiosRef
            const {
                data: { data },
            } = await axios.get('https://api.currencyapi.com/v3/latest', {
                params: {
                    apikey: this.config.get('exchange.currencyApi'),
                    // currencies: Object.keys(currencies).join(',')
                },
            })
            const keysCurrencies = Object.keys(currencies)
            await this.prisma.$transaction(
                Object.keys(data).map((key) => {
                    const currencyRate = data[key]
                    const currency = currencies[key]
                    const record = currency || {}
                    if (!keysCurrencies.includes(key)) {
                        record.name = key
                        record.symbol = key
                        record.order = 100000
                        record.display = false
                    }
                    return this.upsertCurrency({
                        ...record,
                        key: currencyRate['code'].toUpperCase(),
                        rate: new Big(1).div(currencyRate['value']).toNumber(),
                        visibility: true,
                        type: 'FIAT',
                        source: 'CURRENCY_API',
                    })
                }),
            )
        } catch (e) {
            console.log(e)
        }
    }

    upsertCurrency(currency): PrismaPromise<any> {
        return this.prisma.currency.upsert({
            where: {
                key: currency.key,
            },
            update: {
                ...currency,
            },
            create: currency,
        })
    }
}
