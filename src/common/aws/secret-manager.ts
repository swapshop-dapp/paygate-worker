import aws from 'aws-sdk'

export default async () => {
    const SecretManager = new aws.SecretsManager({
        region: process.env.REGION,
    })
    const { SECRET_NAMES } = process.env
    if (!SECRET_NAMES) {
        // throw new Error('Check env variables SECRET_NAMES')
        return
    }
    const secrets = SECRET_NAMES.split(',')
    if (secrets.length) {
        const environments = await Promise.all(
            secrets.map(async (secret) => {
                const secretFromAWS = await SecretManager.getSecretValue({ SecretId: secret.trim() }).promise()
                return JSON.parse(secretFromAWS.SecretString)
            }),
        )
        Object.assign(process.env, ...environments)
    }
}
