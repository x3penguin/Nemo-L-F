FROM python:3.10-slim
WORKDIR /usr/src/app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "./index.py"]	
# CMD ["gunicorn", "--bind", "0.0.0.0:3005", "index:app"]
