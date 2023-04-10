import { load } from 'cheerio';

import got from '@/utils/got';
import { Route } from '@/types';

async function handler() {
    const url = 'http://www.banshujiang.cn/e_books/page/1';
    const $ = load((await got(url)).data);

    function itemize() {
        const a = $(this).find('li > a');
        const img = $('<img>').attr('src', $(this).find('img').attr('src'));
        const ul = $(this).find('ul').clone().removeAttr('class');

        // Texts directly inside <li> elements.
        ul.find('li > *').contents().unwrap();

        return {
            title: a.text(),
            link: a.attr('href'),
            description: $('<div>').append(img, ul).html(),
        };
    }

    return {
        title: '搬书匠',
        link: url,
        description: $('meta[name=description]').attr('content'),
        item: $('li').has('img').map(itemize).get(),
    };
}

export const route: Route = {
    path: '/',
    name: '搬书匠',
    maintainers: ['cubroe'],
    handler,
    example: '/banshujiang',
    features: {},
};
