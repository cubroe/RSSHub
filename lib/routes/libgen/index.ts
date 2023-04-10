import { load } from 'cheerio';

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

async function _byKeywords(domain, field, keywords) {
    const url = `http://${domain}/search.php`;
    const searchParams = {
        column: field,
        req: keywords,
        res: '100',
        view: 'detailed',
        sort: 'id',
        sortmode: 'DESC',
    };
    const response = await got(url, { searchParams });
    const $ = load(response.data);

    function itemize() {
        const lang = $(this).find('td:contains(Language:)').next().text().toLowerCase();

        if (!lang.includes('english') && !lang.includes('chinese')) {
            return null;
        }

        const a = $(this).find('td:contains(Title)').next().find('a');
        const date = $(this).find('td:contains(Time added:)').next();

        return {
            title: a.text(),
            link: new URL(a.attr('href'), url).href,
            description: $(this).prop('outerHTML'),
            pubDate: parseDate(date.text()),
        };
    }

    return {
        title: $('title').text(),
        link: response.url,
        description: $('meta[name=description]').attr('content'),
        item: $('table').has('img').map(itemize).get().filter(Boolean),
    };
}

function handler(ctx) {
    const { domain, ids, field } = ctx.req.param();

    if (field) {
        return _byKeywords(domain, field, ctx.req.param().keywords);
    }

    const keywords = ids
        .split(',')
        .map((id) => `topicid${id}`)
        .join(' ');

    return _byKeywords(domain, 'topic', keywords);
}

export const route: Route = {
    path: ['/:domain/topics/:ids', '/:domain/:field/:keywords'],
    name: 'Library Genesis',
    maintainers: ['cubroe'],
    handler,
    example: '/libgen/libgen.rs/topics/69,113,178',
    features: {},
};
