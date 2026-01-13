# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the pyproject.toml and source code
COPY pyproject.toml README.md ./
COPY app ./app

# Install dependencies
# We install the package in editable mode or just install dependencies
RUN pip install --no-cache-dir .

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
