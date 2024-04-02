export default () => ({
    port: parseInt(process.env.PORT, 10) || 3000,

    jwtKey: process.env.JWT_SECRET,
    exchange: {
        currencyApi: process.env.CURRENCY_API_KEY,
    },
    throttle: {
        ttl: process.env.THROTTLE_TTL || 60,
        limit: process.env.THROTTLE_LIMIT || 10,
    },
    testWallet: process.env.TEST_WALLET,
    accountService: process.env.ACCOUNT_SERVICE,
    internalApiKey: process.env.INTERNAL_API_KEY,
})
