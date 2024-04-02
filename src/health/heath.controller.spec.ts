import { Test, TestingModule } from '@nestjs/testing'
import { HealthController } from './health.controller'
import { HealthCheckService, TerminusModule } from '@nestjs/terminus'

describe('HealthController', () => {
    let controller: HealthController
    let service: HealthCheckService

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [HealthController],
            providers: [
                {
                    provide: HealthCheckService,
                    useFactory: () => {
                        return {
                            check: jest.fn(),
                        }
                    },
                },
            ],
        }).compile()

        controller = module.get<HealthController>(HealthController)
        service = module.get<HealthCheckService>(HealthCheckService)
    })

    it('findAll should return 3 records', () => {
        controller.check()
        expect(service.check).toHaveBeenCalled()
    })
})
