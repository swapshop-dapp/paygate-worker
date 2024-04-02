import { Module }         from '@nestjs/common'
import { PrismaModule }   from '../common/connections/prisma.module'
import { HttpModule }     from '@nestjs/axios'
import CurrencyService    from './service'
import { ConfigModule }   from '@nestjs/config'

@Module({
    providers: [CurrencyService],
    exports: [CurrencyService],
    imports: [PrismaModule, HttpModule, ConfigModule],
    controllers: [],
})
export default class CurrencyModule {

}
