import {
    MiddlewareConsumer,
    Module,
}                         from '@nestjs/common'
import { ConfigModule }   from '@nestjs/config'
import { PrismaModule }   from './common/connections/prisma.module'
import configuration      from '../config/configuration'
import CurrencyModule     from './currency/module'
import { ScheduleModule } from '@nestjs/schedule'
import { PaymentModule }  from './payment/payment.module'

@Module({
    imports: [
        ConfigModule.forRoot({
            expandVariables: true,
            load: [configuration],
            isGlobal: true,
        }),
        PrismaModule,
        ScheduleModule.forRoot(),
        CurrencyModule,
        PaymentModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
    }
}
