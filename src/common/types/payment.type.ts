export enum PaymentType {
    BOOKING = 'BOOKING',
    REFUND = 'REFUND',
    PAYMENT = 'PAYMENT',
    PARTIAL_PAYMENT = 'PARTIAL_PAYMENT',
    PAYOUT = 'PAYOUT',
    PARTIAL_PAYOUT = 'PARTIAL_PAYOUT',
}

export enum PaymentGateway {
    STRIPE = 'STRIPE',
    WALLET = 'WALLET',
}

export enum PaymentStatus {
    CREATED = 'CREATED',
    CANCELED = 'CANCELED',
    FAILED = 'FAILED',
    PROCESSING = 'PROCESSING',
    SUCCEEDED = 'SUCCEEDED',
}

export const StripePaymentMapping = {
    'payment_intent.canceled': PaymentStatus.CANCELED,
    'payment_intent.payment_failed': PaymentStatus.FAILED,
    'payment_intent.succeeded': PaymentStatus.SUCCEEDED,
    'charge.succeeded': PaymentStatus.SUCCEEDED,
    'charge.refunded': PaymentStatus.SUCCEEDED,
}
