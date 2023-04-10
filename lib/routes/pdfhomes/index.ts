import { load } from 'cheerio';
import got from '@/utils/got';
import { Route } from '@/types';

async function handler(ctx) {
    const url = `https://${ctx.req.param().domain}/`;
    const $ = load((await got(url)).data);

    function itemize() {
        const figure = $(this).parent();
        const imgURL = $(this).attr('data-original');

        return {
            title: figure.next().text().trim(),
            link: figure.find('a').attr('href'),
            description: `<img src="${imgURL}">`,
        };
    }

    return {
        title: $('title').text().trim().split(' ').pop(),
        link: url,
        description: $('meta[name=description]').attr('content'),
        item: $('img[data-original]').map(itemize).get(),
    };
}

export const route: Route = {
    path: '/:domain',
    name: 'Generic PDF Homes',
    maintainers: ['cubroe'],
    handler,
    example: '/pdfhomes/homeofpdf.com',
    features: {},
};
