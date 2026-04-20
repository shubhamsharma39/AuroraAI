import asyncio
from services.llm_service import llm_service

async def main():
    print("Testing Image Concept...")
    res = await llm_service.generate_content("dog", "Professional", "Image Concept")
    print(res)
    
    print("\nTesting Anime Art...")
    res = await llm_service.generate_content("dog", "Professional", "Anime Art")
    print(res)

    print("\nTesting Short Video Hook...")
    res = await llm_service.generate_content("dog", "Professional", "Short Video Hook")
    print(res)

asyncio.run(main())
