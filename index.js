const md = require('markdown-it')({
    html: true,
    breaks: true,
    linkify: true,
})
const fs = require('fs')
const RSSParser = require('rss-parser')

const parser = new RSSParser()

const bbcBangkokId = '1609350'
const weatherUrl = `https://weather-broker-cdn.api.bbci.co.uk/en/forecast/rss/3day/${bbcBangkokId}`
const feedUrl = 'https://www.kitchenrai.com/feed'
const websiteUrl = 'https://www.kitchenrai.com'
const linkedInUrl = 'https://www.linkedin.com/in/ipiranhaa'
const mediumUrl = 'https://medium.com/@ipiranhaa'
const blogPostLimit = 5
const badgeHeight = '25'

;(async () => {
    let blogPosts = ''
    let weatherDetail = ''
    try {
        blogPosts = await fetchBlogPosts()
        weatherDetail = await fetchWeather()
    } catch (e) {
        console.error('Fetch data failed', e)
    }

    const linkedInBadge = `[<img src="https://img.shields.io/badge/linkedin-%230077B5.svg?&style=for-the-badge&logo=linkedin&logoColor=white" height=${badgeHeight}>](${linkedInUrl})`
    const mediumBadge = `[<img src="https://img.shields.io/badge/medium-%2312100E.svg?&style=for-the-badge&logo=medium&logoColor=white" height=${badgeHeight}>](${mediumUrl})`
    const thailandFlag = `<img src="https://image.flaticon.com/icons/svg/323/323281.svg" width="14"/>`
    const bangkokIcon = `<img src="https://image.flaticon.com/icons/svg/909/909143.svg" width="20"/>`
    const footer = getFooter()

    text = `👋 Hi, I'm Tanate Meaksriswan. I'm a software engineer from ${thailandFlag} <b>Bangkok, Thailand</b>.\n\n ${linkedInBadge} ${mediumBadge}\n\n## Latest Blog Posts\n${blogPosts}\n\n## ${bangkokIcon} Bangkok weather\n${weatherDetail}\n\n${footer}`

    const result = md.render(text)

    fs.writeFile('README.md', result, function (err) {
        if (err) return console.log(err)
        console.log(`${result} > README.md`)
    })
})()

async function fetchBlogPosts() {
    const feed = await parser.parseURL(feedUrl)

    let result = ''

    feed.items.slice(0, blogPostLimit).forEach((item) => {
        result += `<li><a href=${item.link}>${item.title}</a></li>`
    })

    return `<ul>${result}</ul>\n<a href=${websiteUrl} target="_blank">More posts</a>`
}

async function fetchWeather() {
    const weather = await parser.parseURL(weatherUrl)
    const title = weather.items[0].title.split(',')[0]
    const descriptions = weather.items[0].content
        .split(',')
        .map((text) => text.trim())
    const dataSource = [title, ...descriptions].reduce((indexing, text) => {
        const key = text.split(':')[0].split(' ').join('_').toLowerCase()
        const value = text.split(': ')[1]
        indexing[key] = value
        return indexing
    }, {})

    const minWeather = Number(
        dataSource['minimum_temperature'].split(' ')[0].split('°')[0]
    )
    const maxWeather = Number(
        dataSource['maximum_temperature'].split(' ')[0].split('°')[0]
    )
    const averageWeather = (minWeather + maxWeather) / 2
    const sunrise = dataSource['sunrise'].split(' ')[0]
    const sunset = dataSource['sunset'].split(' ')[0]

    return `Currently, the weather is <b>${averageWeather}°C, ${dataSource[
        'today'
    ].toLowerCase()}</b>, ${
        dataSource['humidity']
    } humidity \nToday, the sun rises at ${sunrise} and sets at ${sunset}.`
}

function getFooter() {
    const refreshDate = new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZoneName: 'short',
        timeZone: 'Asia/Bangkok',
    })
    const buildStatusBadge = `<p align="center"><img src="https://github.com/ipiranhaa/ipiranhaa/workflows/README%20build/badge.svg" /></p>`

    return `------------\n<p align="center">This <i>README</i> is generated <b>every 3 hours</b><br>Last refresh: ${refreshDate}\n${buildStatusBadge}`
}
