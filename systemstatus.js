const https = require('https');

const getHttps = function(url, query) {
    return new Promise((resolve, reject) => {
        const request = https.get(`${url}/${query}`, response => {
            response.setEncoding('utf8');
           
            let returnData = '';
            if (response.statusCode < 200 || response.statusCode >= 300) {
                return reject(new Error(`${response.statusCode}: ${response.req.getHeader('host')} ${response.req.path}`));
            }
           
            response.on('data', chunk => {
                returnData += chunk;
            });
           
            response.on('end', () => {
                resolve(returnData);
            });
           
            response.on('error', error => {
                reject(error);
            });
        });
        request.end();
    });
}

const unifiedApiHost = 'https://unified-api-qa.axs.com';

const getStatus = async () => {
    try {
        console.log('fetch healthcheck');
        const response  = await getHttps(unifiedApiHost,"v1/healthcheck?recursive=1");
        console.log(`response:${response}`);
        return JSON.parse(response);
    } catch (error) {
        console.log(error);
        return 'unhealthy';
    }
}

module.exports.getStatus = getStatus
