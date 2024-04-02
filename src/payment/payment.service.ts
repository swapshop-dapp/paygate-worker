import { Injectable, OnModuleInit } from "@nestjs/common";
import { MessageDto } from "../kafka/message.dto";
import { UserDto } from "../kafka/dto/user.dto";
import { plainToInstance } from "class-transformer";
import { DB_OPERATIONS, GROUP_IDS, TOPICS } from "../common/const/kafka";
import { KafkaConsumer } from "../kafka/kafka.consumer";
import { PrismaService } from "../common/connections/prisma.service";
import { PAYOUT_TYPE } from "../common/const/const";
import AccountClientService from "../shares/httpclient/accountclient.service";

@Injectable()
export class PaymentService implements OnModuleInit {
    constructor(
        private readonly kafkaConsumer: KafkaConsumer,
        private readonly prisma: PrismaService,
        private readonly accountService: AccountClientService
    ) {
    }

    async userCreated() {
        await this.kafkaConsumer.consume(
            { topic: TOPICS.ACCOUNT_PUBLIC_USER },
            {
                eachMessage: async ({ topic, message }) => {
                    try {
                        const data: MessageDto = JSON.parse(message.value.toString()) as MessageDto
                        const user: UserDto = plainToInstance(UserDto, data.after)
                        const supportedPayment = await this.prisma.supportedPayment.findMany({
                            where: {
                                visibility: true
                            },
                            select: {
                                type: true,
                                key: true,
                                currency: true,
                                name: true,
                                icon: true,
                                order: true,
                                changeable: true
                            },
                            orderBy: {
                                order: 'asc'
                            }
                        })
                        if (data.op === DB_OPERATIONS.INSERT) {
                            let paymentMethodByUser = supportedPayment.map(payment => {
                                let status = false
                                if (user.walletId && payment.type === "CRYPTO") {
                                    status = true
                                }

                                if (['STRIPE', 'TRVL'].includes(payment.key) || !payment.changeable) {
                                    status = false
                                }
                                return {
                                    ...payment,
                                    userId: user.id,
                                    walletId: user.walletId,
                                    status,
                                    partnerId: user.partnerId
                                }
                            })
                            if (user.partnerId) {
                                const stripeConnection = await this.prisma.stripeConnect.findFirst({
                                    where: {
                                        userId: user.partnerId
                                    },
                                    select: {
                                        status: true,
                                        tokenType: true,
                                        stripePublishableKey: true,
                                        scope: true,
                                        liveMode: true,
                                        stripeUserId: true,
                                        refreshToken: true,
                                        accessToken: true,
                                    }
                                })
                                if (stripeConnection) {
                                    await this.prisma.stripeConnect.createMany({
                                        data: [{
                                            ...stripeConnection,
                                            partnerId: user.partnerId,
                                            userId: user.id,
                                            walletId: user.walletId
                                        }],
                                    })
                                }
                                const paymentMethodOfHost = await this.prisma.paymentMethod.findMany({
                                    where: {
                                        userId: user.partnerId
                                    },
                                    select: {
                                        type: true,
                                        key: true,
                                        currency: true,
                                        name: true,
                                        icon: true,
                                        order: true,
                                        changeable: true,
                                        status: true
                                    }
                                })
                                paymentMethodByUser = paymentMethodOfHost.map(payment => {
                                    return {
                                        ...payment,
                                        userId: user.id,
                                        walletId: user.walletId,
                                        partnerId: user.partnerId
                                    }
                                })
                            }
                            await this.prisma.paymentMethod.createMany({
                                data: paymentMethodByUser,
                                skipDuplicates: true
                            })
                        }
                        // if (data.op === DB_OPERATIONS.UPDATE) {
                        // const before: UserDto = plainToInstance(UserDto, data.before)
                        // }
                    } catch (e) {
                        console.error(e)
                    }
                },
            },
            GROUP_IDS.USER,
        )
    }

    async migrateUserHostWithStripeConnection() {
        const partnerIds = [
            "6cf48c9a-3b1e-4a87-9760-02447f89c283",
            "8990fc3a-d076-4d6a-a4e4-83321054144d",
            "67f701d4-b2df-4778-9e70-f8259f449cb9",
            "a0a614ce-8903-48c6-8ce7-4d0649bc7e02",
            "d285c914-a2ce-478d-af77-e6616fb22a5c"
        ]
        await Promise.all(partnerIds.map(async partnerId => {
            console.log(partnerId);
            const hosts = await this.accountService.getAllHostFromPartnerId(partnerId, 1, 10)
            console.log(hosts);
            const stripe = await this.prisma.stripeConnect.findFirst({
                where: {
                    userId: partnerId
                },
                select: {
                    status: true,
                    tokenType: true,
                    stripePublishableKey: true,
                    scope: true,
                    liveMode: true,
                    stripeUserId: true,
                    refreshToken: true,
                    accessToken: true,
                }

            })
            console.log(stripe);
            if (stripe) {
                await this.prisma.stripeConnect.createMany({
                    data: hosts.map(host => {
                        return {
                            ...stripe,
                            userId: host.id,
                            walletId: host.walletId,
                            partnerId,
                        }
                    }),
                    skipDuplicates: true
                })
            }
            await Promise.all(hosts.map(async host => {
                return await this.prisma.paymentMethod.updateMany({
                    where: {
                        userId: host.id
                    },
                    data: {
                        partnerId: partnerId
                    }

                })
            }))
        }))
    }

    async migrateHostPaymentMethod() {
        const partnerIds = [
            "6cf48c9a-3b1e-4a87-9760-02447f89c283",
            "8990fc3a-d076-4d6a-a4e4-83321054144d",
            "67f701d4-b2df-4778-9e70-f8259f449cb9",
            "a0a614ce-8903-48c6-8ce7-4d0649bc7e02",
            "d285c914-a2ce-478d-af77-e6616fb22a5c"
        ]
        await Promise.all(partnerIds.map(async partnerId => {
            console.log(partnerId);
            const hosts = await this.accountService.getAllHostFromPartnerId(partnerId, 1, 10)
            console.log(hosts);
            const paymentMethod = await this.prisma.paymentMethod.findMany({
                where: {
                    userId: partnerId
                },
                select: {
                    type: true,
                    key: true,
                    currency: true,
                    name: true,
                    icon: true,
                    order: true,
                    changeable: true,
                    status: true
                }
            })
            await Promise.all(hosts.map(async host => {
                return Promise.all(paymentMethod.map(payment => {
                    return this.prisma.paymentMethod.updateMany({
                        where: {
                            userId: host.id,
                            key: payment.key,
                        },
                        data: {
                            ...payment,
                            partnerId: partnerId
                        },
                    })
                }))
            }))
        }))
    }

    async onModuleInit() {
        await this.userCreated()
        // console.log("migrate host")
        // await this.migrateUserHostWithStripeConnection()
    }
}
