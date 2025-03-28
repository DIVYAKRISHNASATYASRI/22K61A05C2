# Average Calculator Microservice

A FastAPI-based microservice that calculates averages of different types of numbers fetched from a third-party server.

## Features

- REST API endpoint `/numbers/{numberId}`
- Supports different number types:
  - `p`: Prime numbers
  - `f`: Fibonacci numbers
  - `e`: Even numbers
  - `r`: Random numbers
- Maintains a sliding window of unique numbers
- Fast response times (< 500ms)
- Error handling for timeouts and service unavailability

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
python main.py
```

The server will start on `http://localhost:9876`

## API Usage

Make GET requests to `/numbers/{numberId}` where `numberId` can be:
- `p` for prime numbers
- `f` for fibonacci numbers
- `e` for even numbers
- `r` for random numbers

### Example Response

```json
{
    "windowPrevState": [],
    "windowCurrState": [2, 4, 6, 8],
    "numbers": [2, 4, 6, 8],
    "avg": 5.00
}
```
