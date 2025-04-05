FROM python:3.10-slim

WORKDIR /usr/src/app

COPY requirements.txt ./

RUN python -m pip install --no-cache-dir -r requirements.txt

ENV PYTHONUNBUFFERED=1

COPY . .

CMD ["python", "./main.py"]
