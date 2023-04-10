import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';

async function gotJSON(url, ...args) {
    // Some stupid sites may return JSON payload with a leading BOM (`\ufeff`)
    // that is invisible but definitely fails JSON parsing.  RSSHub doesn't deal
    // with the situation properly, hence I have to explicitly tackle it.
    return JSON.parse((await got(url, ...args)).body.trim());
}

async function handler(ctx) {
    const { scheme, domain } = ctx.req.param();
    const baseURL = `${scheme}://${domain}/wp-json`;
    const site = await gotJSON(baseURL);

    const searchParams = { per_page: 100 };
    const posts = await gotJSON(`${baseURL}/wp/v2/posts`, { searchParams });

    return {
        title: site.name,
        link: site.url,
        description: site.description,
        item: posts.map((post) => ({
            title: post.title.rendered,
            link: post.link,
            description: post.content.rendered,
            pubDate: timezone(parseDate(post.date), Number(site.gmt_offset)),
            guid: post.guid.rendered,
        })),
    };
}

export const route: Route = {
    path: '/:scheme/:domain',
    name: 'Generic WordPress API (JSON)',
    maintainers: ['cubroe'],
    handler,
    example: '/wp-json/https/wordpress.org',
    features: {},
};
