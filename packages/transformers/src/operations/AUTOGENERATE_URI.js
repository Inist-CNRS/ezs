import InistArk from 'inist-ark';

export const autoGenerateUri = (globalConfig) => (statementParamters) => () =>
    new Promise((resolve, reject) => {
        try {
            const config = globalConfig || {};
            const args = statementParamters || {};
            const naan = config.naan || args.naan || '00000';
            const subpublisher = config.subpublisher || args.subpublisher || '000';
            const uriSize = config.uriSize || args.uriSize || false;
            if (naan && subpublisher) {
                const ark = new InistArk({
                    naan,
                    subpublisher,
                });

                return resolve(ark.generate());
            }

            const ark = new InistArk({
                subpublisher,
            });

            const { identifier } = ark.parse(ark.generate());
            if (uriSize && Number.isInteger(uriSize)) {
                return resolve(`uid:/${identifier.slice(0, uriSize)}`);
            }
            return resolve(`uid:/${identifier}`);
        } catch (error) {
            return reject(error);
        }
    });

const transformation = autoGenerateUri();

transformation.getMetas = () => ({
    name: 'AUTOGENERATE_URI',
    type: 'value',
    args: [],
});

export default transformation;
