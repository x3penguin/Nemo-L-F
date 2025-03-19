FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 3005

CMD ["gunicorn", "--bind", "0.0.0.0:3005", "index:app"]
