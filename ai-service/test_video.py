import urllib.parse
import aiohttp
import asyncio

async def fetch_video(topic):
    headers = {"User-Agent": "AuroraAIBot/1.0 (https://aurora.ai; dev@aurora.ai)"}
    search_url = f"https://commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6&srsearch={urllib.parse.quote(topic)}%20filetype:webm&utf8=&format=json"
    async with aiohttp.ClientSession(headers=headers) as session:
        async with session.get(search_url) as resp:
            data = await resp.json()
            if data.get('query', {}).get('search'):
                title = data['query']['search'][0]['title']
                info_url = f"https://commons.wikimedia.org/w/api.php?action=query&titles={urllib.parse.quote(title)}&prop=imageinfo&iiprop=url&format=json"
                async with session.get(info_url) as i_resp:
                    i_data = await i_resp.json()
                    pages = i_data.get('query', {}).get('pages', {})
                    for page_id, page_info in pages.items():
                        if 'imageinfo' in page_info:
                            return page_info['imageinfo'][0]['url']
    return "https://www.w3schools.com/html/mov_bbb.mp4"

async def main():
    print(await fetch_video("cat"))

asyncio.run(main())
