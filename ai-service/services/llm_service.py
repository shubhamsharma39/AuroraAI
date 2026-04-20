"""
AuroraAI LLM Service — Upgraded
Architecture:
  1. PRIMARY: Ollama (local, mistral model) — zero internet required
  2. FALLBACK: Groq API (free tier, mixtral-8x7b) — if Ollama is down
  3. MOCK: If both are unavailable, returns a clearly labelled mock response
"""

import logging
import os
import urllib.parse
import asyncio
from functools import wraps

# Load environment variables
from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../../.env'))

logger = logging.getLogger("aurora.llm")

# ── Configuration ────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OLLAMA_MODEL   = os.getenv("OLLAMA_MODEL", "mistral")
OLLAMA_HOST    = os.getenv("OLLAMA_HOST", "http://localhost:11434")
GROQ_API_KEY   = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL     = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
STABILITY_KEY  = os.getenv("STABILITY_API_KEY", "")
GIPHY_KEY      = os.getenv("GIPHY_API_KEY", "dc6zaTOxFJmzC")

# ── Retry helper ─────────────────────────────────────────────────
async def with_retry(coro_fn, retries=2, delay=1.0):
    """Retry an async call up to `retries` times with linear backoff."""
    for attempt in range(retries + 1):
        try:
            return await coro_fn()
        except Exception as e:
            if attempt < retries:
                logger.warning(f"Retry {attempt+1}/{retries} after error: {e}")
                await asyncio.sleep(delay * (attempt + 1))
            else:
                raise

# ── LLM Drivers ──────────────────────────────────────────────────
async def _call_gemini(messages: list) -> str:
    """Call Google Gemini 2.5 Pro via REST API (Primary)."""
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        raise RuntimeError("Gemini API key not configured")
    
    import aiohttp
    
    contents = []
    system_instruction = None
    
    for msg in messages:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if role == "system":
            system_instruction = {"parts": [{"text": content}]}
            continue
            
        g_role = "model" if role == "assistant" else "user"
        parts = [{"text": content}]
        
        if "images" in msg:
            for img in msg["images"]:
                if img["base64"].startswith("data:"):
                    mime_type = img["base64"].split(";")[0].split(":")[1]
                    raw_b64 = img["base64"].split(",")[1]
                    parts.append({
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": raw_b64
                        }
                    })
                    
        contents.append({"role": g_role, "parts": parts})
        
    payload = {"contents": contents}
    if system_instruction:
        payload["systemInstruction"] = system_instruction
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key={GEMINI_API_KEY}"
    
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload, timeout=aiohttp.ClientTimeout(total=45)) as resp:
            data = await resp.json()
            if resp.status != 200:
                raise RuntimeError(f"Gemini API returned {resp.status}: {data}")
            
            try:
                return data["candidates"][0]["content"]["parts"][0]["text"]
            except (KeyError, IndexError):
                raise RuntimeError(f"Unexpected Gemini format: {data}")


async def _call_ollama(messages: list) -> str:
    """Fallback 2: Call standard local Ollama installation (http://localhost:11434)."""
    import aiohttp
    
    clean_messages = []
    for m in messages:
        content_text = m.get("content", "")
        if "images" in m and len(m["images"]) > 0:
            content_text += f"\n\n(Note: User provided images. If you cannot perceive them, prioritize answering via the text context provided.)"
        clean_messages.append({"role": m.get("role", "user"), "content": content_text})
        
    payload = {"model": OLLAMA_MODEL, "messages": clean_messages, "stream": False}
    async with aiohttp.ClientSession() as session:
        async with session.post(
            f"{OLLAMA_HOST}/api/chat",
            json=payload,
            timeout=aiohttp.ClientTimeout(total=60)
        ) as resp:
            if resp.status != 200:
                raise RuntimeError(f"Ollama returned HTTP {resp.status}")
            data = await resp.json()
            return data["message"]["content"]


async def _call_groq(messages: list) -> str:
    """Call Groq API. Automatically switches to Vision model if images are present."""
    if not GROQ_API_KEY or GROQ_API_KEY == "your_groq_api_key_here":
        raise RuntimeError("Groq API key not configured")
    from groq import AsyncGroq
    
    # Check for images to decide model
    has_images = any("images" in m and len(m["images"]) > 0 for m in messages)
    target_model = "llama-3.2-11b-vision-preview" if has_images else GROQ_MODEL
    
    formatted_messages = []
    for m in messages:
        role = m.get("role", "user")
        content = m.get("content", "")
        images = m.get("images", [])
        
        if has_images:
            # Multi-modal format
            msg_content = [{"type": "text", "text": content}]
            for img in images:
                # Groq expects data URI in the image_url field
                msg_content.append({
                    "type": "image_url",
                    "image_url": {"url": img["base64"]}
                })
            formatted_messages.append({"role": role, "content": msg_content})
        else:
            # Text-only format
            formatted_messages.append({"role": role, "content": content})
        
    client = AsyncGroq(api_key=GROQ_API_KEY)
    chat = await client.chat.completions.create(
        model=target_model,
        messages=formatted_messages,
        max_tokens=2048,
        temperature=0.7,
    )
    return chat.choices[0].message.content


async def _call_pollinations(messages: list) -> str:
    """Ultimate Fallback: Call Pollinations AI Text API (100% free, no key)."""
    import aiohttp
    import json
    
    clean_messages = []
    for m in messages:
        content_text = m.get("content", "")
        if "images" in m and len(m["images"]) > 0:
            content_text += f"\n\n[System Note: User attached {len(m['images'])} image(s), but Pollinations lacks vision capabilities in this environment. Inform them.]"
        clean_messages.append({"role": m.get("role", "user"), "content": content_text})
        
    payload = {"messages": clean_messages}
    async with aiohttp.ClientSession() as session:
        async with session.post(
            "https://text.pollinations.ai/",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=aiohttp.ClientTimeout(total=20)
        ) as resp:
            if resp.status != 200:
                # Instead of raising, return a partial error so the chat doesn't go 500
                return f"⚠️ [LLM ERROR] Pollinations Free API is currently overloaded (HTTP {resp.status}). Please try again in a few seconds or add a Gemini Key."
            
            text = await resp.text()
            try:
                data = json.loads(text)
                # It might be an OpenAI-compatible response object
                if "choices" in data and len(data["choices"]) > 0:
                    msg = data["choices"][0].get("message", {})
                    if "content" in msg:
                        return msg["content"]
                # Or it might be the raw message dictionary
                if "content" in data:
                    return data["content"]
                if "reasoning_content" in data:
                    return data["reasoning_content"]
            except Exception:
                pass # Not JSON or weird format, return raw text
                
            return text

async def llm_chat(messages: list) -> str:
    """
    Universal LLM dispatcher:
      Tries Gemini 2.5 Pro → Groq API → Ollama (Local) → Pollinations (Free)
    """
    # 1. PRIMARY: Try Gemini
    if GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here":
        try:
            response = await with_retry(lambda: _call_gemini(messages))
            logger.info("LLM responded via Gemini 2.5 Pro")
            return response
        except Exception as e:
            logger.warning(f"Gemini failed: {e}. Trying Groq...")
    
    # 2. FALLBACK 1: Try Groq (Now with Vision support!)
    if GROQ_API_KEY and GROQ_API_KEY != "your_groq_api_key_here":
        try:
            response = await with_retry(lambda: _call_groq(messages))
            logger.info("LLM responded via Groq")
            return response
        except Exception as e:
            logger.warning(f"Groq failed: {e}. Trying Ollama local backup...")
    
    # 3. FALLBACK 2: Try Ollama (Local Backup)
    # Note: Currently assumes text-only unless Llava is configured.
    try:
        response = await with_retry(lambda: _call_ollama(messages))
        logger.info(f"LLM responded via Ollama ({OLLAMA_MODEL})")
        return response
    except Exception as e:
        logger.warning(f"Ollama unavailable: {e}. Trying Pollinations...")

    # 4. Ultimate Fallback: Try Pollinations AI (100% Free)
    try:
        response = await with_retry(lambda: _call_pollinations(messages))
        return response
    except Exception as e:
        logger.error(f"All AI services failed! {e}")
        
    # Final Error String
    user_msg = next((m["content"] for m in reversed(messages) if m.get("role") == "user"), "?")
    if isinstance(user_msg, list): # Handle multi-modal content list
        user_msg = user_msg[0].get("text", "...")
        
    return (
        f"⚠️ [SYSTEM FAILURE] AuroraAI is completely disconnected from all LLM providers.\n\n"
        f"Your message: \"{user_msg}\"\n\n"
        f"Please verify your API keys in .env or start the local Ollama mistral node."
    )


# ── Web Scraper ───────────────────────────────────────────────────
async def scrape_url(url: str) -> str:
    """
    Scrape a URL.
    1. Try Playwright (handles JavaScript-rendered pages)
    2. Fallback to simple requests + BeautifulSoup
    """
    # --- Try Playwright ---
    try:
        from playwright.async_api import async_playwright
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.goto(url, timeout=10000, wait_until="domcontentloaded")
            content = await page.inner_text("body")
            await browser.close()
            # Clean up whitespace
            lines = [l.strip() for l in content.splitlines() if l.strip()]
            return "\n".join(lines)[:8000]
    except Exception as e:
        logger.warning(f"Playwright scrape failed: {e}. Trying requests...")

    # --- Fallback: requests + BeautifulSoup ---
    try:
        import requests
        from bs4 import BeautifulSoup
        headers = {"User-Agent": "Mozilla/5.0 (AuroraAI/1.0)"}
        resp = requests.get(url, headers=headers, timeout=7)
        soup = BeautifulSoup(resp.text, "html.parser")
        paragraphs = " ".join(p.get_text() for p in soup.find_all("p"))
        return paragraphs[:8000]
    except Exception as e:
        logger.error(f"All scrapers failed for {url}: {e}")
        return f"FAILED TO EXTRACT CONTENT FROM: {url}"


# ── Image Generation ──────────────────────────────────────────────
async def generate_image_url(prompt: str, style: str = "realistic") -> str:
    """
    1. Try Stability AI API (if key provided)
    2. Fallback to free Public Stable Diffusion Node (Pollinations)
    """
    import base64
    import urllib.parse
    import aiohttp
    
    encoded_prompt = urllib.parse.quote(prompt)
    
    # --- Stability AI ---
    if STABILITY_KEY and STABILITY_KEY != "your_stability_api_key_here":
        try:
            body = {
                "text_prompts": [{"text": prompt, "weight": 1}],
                "cfg_scale": 7,
                "height": 1024,
                "width": 1024,
                "samples": 1,
                "steps": 30,
            }
            engine = "stable-diffusion-xl-1024-v1-0"
            if style == "anime":
                engine = "stable-diffusion-v1-6"
                body["style_preset"] = "anime"

            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"https://api.stability.ai/v1/generation/{engine}/text-to-image",
                    headers={"Authorization": f"Bearer {STABILITY_KEY}", "Accept": "application/json"},
                    json=body,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        img_b64 = data["artifacts"][0]["base64"]
                        return f"data:image/png;base64,{img_b64}"
        except Exception as e:
            logger.warning(f"Stability AI failed: {e}. Falling back to Public Pool...")

    # --- Public Free SD Pool ---
    try:
        seed = hash(prompt) % 99999
        if style == "anime":
            return f"https://image.pollinations.ai/prompt/{encoded_prompt}?model=anime&width=1024&height=1024&nologo=true&enhance=true"
        return f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=1024&seed={seed}&nologo=true&enhance=true"
    except Exception as e:
        logger.error(f"Public Fallback failed: {e}")

    return "https://via.placeholder.com/1024?text=Image+Generation+Failed"


# ── Video/GIF Retrieval ───────────────────────────────────────────
async def fetch_video_url(topic: str) -> str:
    """
    Fetch a short MP4 using Giphy API (primary) or Tenor (fallback).
    """
    encoded_topic = urllib.parse.quote(topic)

    # --- Giphy ---
    try:
        import aiohttp
        giphy_url = f"https://api.giphy.com/v1/gifs/search?q={encoded_topic}&api_key={GIPHY_KEY}&limit=5&rating=g"
        async with aiohttp.ClientSession() as session:
            async with session.get(giphy_url, timeout=aiohttp.ClientTimeout(total=5)) as resp:
                data = await resp.json()
                results = data.get("data", [])
                if results:
                    # Prefer the mp4 from "original" media
                    mp4 = results[0].get("images", {}).get("original_mp4", {}).get("mp4")
                    if mp4:
                        logger.info(f"Video via Giphy for '{topic}'")
                        return mp4
    except Exception as e:
        logger.warning(f"Giphy failed: {e}. Trying Tenor...")

    # --- Tenor fallback ---
    try:
        import aiohttp
        tenor_url = f"https://g.tenor.com/v1/search?q={encoded_topic}&key=LIVDSRZULELA&limit=1"
        async with aiohttp.ClientSession() as session:
            async with session.get(tenor_url, timeout=aiohttp.ClientTimeout(total=5)) as resp:
                data = await resp.json()
                if data.get("results"):
                    return data["results"][0]["media"][0]["mp4"]["url"]
    except Exception as e:
        logger.warning(f"Tenor also failed: {e}")

    # --- Static safe fallback ---
    return "https://www.w3schools.com/html/mov_bbb.mp4"


# ─────────────────────────────────────────────────────────────────
class LLMService:
    """
    Drop-in replacement for the old LLMService class.
    All methods maintain exact same signatures for backward compatibility.
    """

    @staticmethod
    async def generate_content(topic: str, tone: str, content_type: str) -> str:
        # ── Image / Anime ──
        if content_type in ["Image Concept", "Anime Art"]:
            style = "anime" if content_type == "Anime Art" else "realistic"
            enhanced_topic = f"{tone} style, {topic}"
            return await generate_image_url(enhanced_topic, style)

        # ── Short Video Hook ──
        if content_type == "Short Video Hook":
            enhanced_topic = f"{tone} {topic}"
            return await fetch_video_url(enhanced_topic)

        # ── Text Generation ──
        sys_prompt = (
            "You are an expert creative AI content writer. "
            "Generate high-quality, engaging content. "
            "Respond ONLY with the content — no preamble, no meta-commentary."
        )
        user_prompt = f"Write a {tone} {content_type} about: {topic}"
        messages = [
            {"role": "system", "content": sys_prompt},
            {"role": "user",   "content": user_prompt},
        ]
        return await llm_chat(messages)

    @staticmethod
    async def chat_with_docs(question: str, context: str) -> str:
        sys_prompt = (
            "You are a precise document analysis assistant. "
            "Use ONLY the provided context to answer. "
            "If the answer isn't in the context, say so clearly."
        )
        user_prompt = f"Context:\n{context}\n\nQuestion: {question}"
        messages = [
            {"role": "system", "content": sys_prompt},
            {"role": "user",   "content": user_prompt},
        ]
        return await llm_chat(messages)

    @staticmethod
    async def universal_chat(
        message: str,
        history: list,
        attachments: list,
        doc_id: str = None
    ) -> str:
        from services.doc_service import doc_service
        
        context_parts = []
        image_attachments = []

        # 1. Handle primary doc_id (legacy support)
        if doc_id:
            try:
                doc_ctx = doc_service.search(doc_id, message)
                if doc_ctx:
                    context_parts.append(f"[DOCUMENT CONTEXT]\n{doc_ctx}")
            except Exception as e:
                logger.warning(f"Doc RAG failed: {e}")

        # 2. Process modern attachments array
        for att in attachments:
            if not isinstance(att, dict): continue
            
            a_type = att.get("type")
            if a_type == "doc":
                a_id = att.get("id")
                if a_id:
                    try:
                        doc_ctx = doc_service.search(a_id, message)
                        if doc_ctx:
                            context_parts.append(f"[ATTACHED DOCUMENT: {att.get('name', 'file')}]\n{doc_ctx}")
                    except Exception as e:
                        logger.warning(f"Attachment RAG failed: {e}")
            elif a_type == "image":
                b64 = att.get("data")
                if b64:
                    image_attachments.append({"base64": b64, "name": att.get("name", "image")})

        # 3. Assemble Prompt
        # We inject the document context directly into the User's message body.
        # This is significantly more effective for models like Llama/Mistral than system prompts.
        context_block = ""
        if context_parts:
            context_block = (
                "STRICT INSTRUCTION: Use the following attached data to answer the user's question.\n"
                "If the answer is not in the data, use your general knowledge but mention the data was searched.\n"
                "--- ATTACHED DATA ---\n"
                + "\n\n".join(context_parts)
                + "\n--- END OF ATTACHED DATA ---\n\n"
            )

        sys_prompt = "You are ChatGPT, a helpful AI assistant. Be conversational, accurate, and professional."
        
        # 4. Build message history
        messages = [{"role": "system", "content": sys_prompt}]
        for msg in history[-12:]: # Keep a healthy slice of history
            role = msg.get("role", "user")
            if role == "bot": role = "assistant"
            messages.append({"role": role, "content": msg.get("content", "")})

        # Final Payload
        final_user_content = context_block + message
        user_msg = {"role": "user", "content": final_user_content}
        if image_attachments:
            user_msg["images"] = image_attachments
            
        messages.append(user_msg)

        # Dispatch to the fallback chain (Gemini -> Groq -> Ollama -> Pollinations)
        return await llm_chat(messages)


# Module-level singleton
llm_service = LLMService()
