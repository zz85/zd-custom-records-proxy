const request = require('request');

const user = process.env.USER;
const password = process.env.PASS;
const zendesk_subdomain = process.env.HOST;

const resource_ids_url = `${zendesk_subdomain}/api/custom_resources/resource_ids?resource_type=product_feedback`;
const resources_by_id_url = `${zendesk_subdomain}/api/custom_resources/resources?ids=`;

function get(url) {
    return new Promise((accept, reject) => {
        request.get(url, {
            json: true,
            auth: {
                user,
                pass: password
            }
        }, (error, response, body) => {
            if (error) return reject({ error });
            if (response.statusCode !== 200) return reject({ response, body });
            
            accept(body);
        });
    });
}

const fetch = () => get(resource_ids_url)
    .then((body) => {
        if (body.resource_id && body.resource_id.ids) {
            return get(`${resources_by_id_url}${body.resource_id.ids.join(',')}`)
        }
    })
    .then((body) => {
        return JSON.stringify(body, 0, 2);
    })
    .catch(e => console.error('error', e));

module.exports = async (req, res) => {
    const results = await fetch();
    res.end(results);
};
