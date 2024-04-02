import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaService } from "../common/connections/prisma.service";
import { PaymentService } from "./payment.service";
import { KafkaModule } from "../kafka/kafka.module";
import { HttpclientModule } from "../shares/httpclient/httpclient.module";

@Module({
    imports: [ConfigModule, KafkaModule, PrismaService, HttpclientModule],
    providers: [PaymentService],
    exports: [PaymentService],
})
export class PaymentModule {
}
