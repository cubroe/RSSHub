import { load } from 'cheerio';

import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';

async function handler() {
    const url = 'https://www.kindle8.net/';
    const $ = load((await got(url)).data);

    function itemize() {
        const a = $(this).find('a').not(':has(img)');
        const img = $('<img>').attr('src', $(this).find('img').attr('src'));
        const date = $('<p>').append($(this).find('.icon-time').text());

        return {
            title: a.text(),
            link: a.attr('href'),
            description: $('<div>').append(img, date).html(),
            pubDate: timezone(parseDate(date.text()), +8),
        };
    }

    return {
        title: 'Kindle吧',
        link: url,
        description: $('meta[name=description]').attr('content'),
        item: $('.content-item').map(itemize).get(),
    };
}

export const route: Route = {
    path: '/',
    name: 'Kindle吧',
    maintainers: ['cubroe'],
    handler,
    example: '/kindle8',
    features: {},
};
