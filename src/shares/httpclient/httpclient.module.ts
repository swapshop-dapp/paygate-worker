import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import AccountClientService from './accountclient.service'

@Module({
    imports: [ConfigModule],
    controllers: [],
    providers: [AccountClientService],
    exports: [AccountClientService],
})
export class HttpclientModule {
}
