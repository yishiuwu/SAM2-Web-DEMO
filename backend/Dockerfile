# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/
ARG PERSONAL=0
ARG PYTHON_VERSION=3.11
# FROM nvcr.io/nvidia/pytorch:22.12-py3 as base
# FROM pytorch/pytorch:2.4.0-cuda11.8-cudnn9-devel
FROM pytorch/pytorch:2.4.1-cuda11.8-cudnn9-devel as base

ENV HOST docker
ENV LANG=C.UTF-8 LC_ALL=C.UTF-8
ENV TZ America/Los_Angeles
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    curl \
    ca-certificates \
    sudo \
    less \
    htop \
    git \
    tzdata \
    wget \
    tmux \
    zip \
    unzip \
    zsh stow subversion fasd \
    redis-server \
    libgl1-mesa-glx \
    python3-opencv \
    && rm -rf /var/lib/apt/lists/*

# RUN pip uninstall -y xgboost && DS_BUILD_UTILS=1 DS_BUILD_FUSED_LAMB=1 pip install deepspeed==0.7.7
# twine to upload package to PyPI
RUN pip install pytest matplotlib jupyter ipython ipdb gpustat scikit-learn spacy munch einops opt_einsum fvcore gsutil cmake pykeops zstandard psutil h5py twine gdown \
    && python -m spacy download en_core_web_sm
# hydra
RUN pip install hydra-core==1.3.1 hydra-colorlog==1.2.0 hydra-optuna-sweeper==1.2.0 pyrootutils rich
# Core packages
RUN pip install transformers==4.25.1 datasets==2.8.0 pytorch-lightning==1.8.6 triton==2.0.0 wandb==0.13.7 timm==0.6.12 torchmetrics==0.10.3
# torchmetrics 0.11.0 broke hydra's instantiate

# For MLPerf
RUN pip install git+https://github.com/mlcommons/logging.git@2.1.0

# install SAM2
RUN pip install 'git+https://github.com/facebookresearch/sam2.git'

# install autodistill grounded sam 2 (sam 2 extension)
# RUN pip install autodistill-grounded-sam-2

# Install FlashAttention
# RUN pip install flash-attn==2.6.3

RUN pip install pillow opencv-python

# Prevents Python from writing pyc files.
ENV PYTHONDONTWRITEBYTECODE=1

# Keeps Python from buffering stdout and stderr to avoid situations where
# the application crashes without emitting any logs due to buffering.
ENV PYTHONUNBUFFERED=1

# RUN mkdir -p /app && \
#     wget https://dl.fbaipublicfiles.com/segment_anything_2/092824/sam2.1_hiera_base_plus.pt && \
#     mv sam2.1_hiera_base_plus.pt /app
WORKDIR /app

# Create a non-privileged user that the app will run under.
# See https://docs.docker.com/go/dockerfile-user-best-practices/
ARG UID=10001
# RUN adduser \
#     --disabled-password \
#     --gecos "" \
#     --home "/nonexistent" \
#     --shell "/sbin/nologin" \
#     --no-create-home \
#     --uid "${UID}" \
#     appuser

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.cache/pip to speed up subsequent builds.
# Leverage a bind mount to requirements.txt to avoid having to copy them into
# into this layer.
RUN --mount=type=cache,target=/root/.cache/pip \
    --mount=type=bind,source=requirements.txt,target=requirements.txt \
    python -m pip install -r requirements.txt

RUN pip install --upgrade numpy==1.26.0

# Switch to the non-privileged user to run the application.
# USER appuser

# Copy the source code into the container.
COPY . .

# Expose the port that the application listens on.
EXPOSE 5000

# Run the application.
# RUN python -c 'import secrets; print(secrets.token_hex())'
# ENV SECRET_KEY=8A8237E9BFD0C90128

CMD service redis-server start && python3 app.py
