import { NestFactory }    from '@nestjs/core'
import { VersioningType } from '@nestjs/common'
import { AppModule }      from './app.module'
import { PrismaService }  from './common/connections/prisma.service'
import { ConfigService }  from '@nestjs/config'
import secretManager      from './common/aws/secret-manager'

async function bootstrap() {
    await secretManager()
    const app = await NestFactory.create(AppModule)
    app.enableVersioning({
        type: VersioningType.URI,
    })
    const config = app.get(ConfigService)
    const prismaService: PrismaService = app.get(PrismaService)
    await prismaService.enableShutdownHooks(app)
    await app.listen(config.get('port'))
}

bootstrap()
