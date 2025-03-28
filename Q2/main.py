from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
from collections import deque
from typing import List, Dict, Union
import statistics
import asyncio
import aiohttp
from fastapi.responses import JSONResponse

app = FastAPI(title="Average Calculator Microservice")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
WINDOW_SIZE = 10
BASE_URL = "http://20.244.56.144/test"
TIMEOUT = 0.5  # 500ms timeout

# Store for numbers
number_store = deque(maxlen=WINDOW_SIZE)

# API endpoint mapping
NUMBER_APIS = {
    'p': f"{BASE_URL}/primes",
    'f': f"{BASE_URL}/fibo",
    'e': f"{BASE_URL}/even",
    'r': f"{BASE_URL}/rand"
}

@app.get("/")
async def root():
    return {
        "message": "Average Calculator Microservice",
        "endpoints": {
            "/numbers/p": "Get prime numbers",
            "/numbers/f": "Get fibonacci numbers",
            "/numbers/e": "Get even numbers",
            "/numbers/r": "Get random numbers"
        }
    }

async def fetch_numbers(url: str) -> List[int]:
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=TIMEOUT) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get("numbers", [])
                else:
                    raise HTTPException(status_code=response.status, detail="Error fetching numbers from external service")
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Request timeout")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/numbers/{number_id}")
async def get_numbers(number_id: str) -> Dict[str, Union[List[int], float]]:
    if number_id not in NUMBER_APIS:
        return JSONResponse(
            status_code=400,
            content={"detail": "Invalid number ID. Use 'p' for prime, 'f' for fibonacci, 'e' for even, or 'r' for random"}
        )

    # Store current state before updating
    prev_state = list(number_store)
    
    try:
        # Fetch new numbers
        new_numbers = await fetch_numbers(NUMBER_APIS[number_id])
        
        # Update store with new unique numbers
        for num in new_numbers:
            if num not in number_store:
                if len(number_store) == WINDOW_SIZE:
                    number_store.popleft()  # Remove oldest number
                number_store.append(num)
        
        # Calculate average
        curr_state = list(number_store)
        avg = statistics.mean(curr_state) if curr_state else 0
        
        return {
            "windowPrevState": prev_state,
            "windowCurrState": curr_state,
            "numbers": new_numbers,
            "avg": round(avg, 2)
        }
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"detail": f"Internal server error: {str(e)}"}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=9876, log_level="info")
