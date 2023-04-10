import iconv from 'iconv-lite';
import { load } from 'cheerio';

import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';

async function handler(ctx) {
    const listId = ctx.req.param().listId || "6";
    const url = `https://${ctx.req.param().domain}/list/${listId}_1.html`;
    const $ = load(iconv.decode((await got(url, { responseType: 'arrayBuffer' })).data, 'gb2312'));

    function itemize() {
        const a = $(this).parent().find('a');
        const table = $(this).parents('table').eq(1);
        const img = $('<img>').attr('src', table.find('img[alt]').attr('src'));
        const desc = $('<p>').append(table.find('p').text());
        const date = $('<p>').append(a.parent().next().text());

        return {
            title: a.text(),
            link: a.attr('href'),
            description: $('<div>').append(img, desc, date).html(),
            pubDate: timezone(parseDate(date.text()), +8),
        };
    }

    return {
        title: '快吧软件：' + $('head > title').text().split("，")[0],
        link: url,
        description: $('meta[name=description]').attr('content'),
        item: $('img[src$=/book5.png]').map(itemize).get(),
    };
}

export const route: Route = {
    path: '/books/:domain/:listId?',
    name: '快吧软件电子书籍',
    maintainers: ['cubroe'],
    handler,
    example: '/fast8/books/www.fast8.cc',
    features: {},
};
