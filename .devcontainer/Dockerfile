FROM node:14-bullseye

# Set shell
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Install git, process tools
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        procps git \
        build-essential \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

# Install test utils
WORKDIR /workspaces

# Set the default shell to bash rather than sh
ENV SHELL /bin/bash
ENV LC_ALL=C.UTF-8
ENV LANG=C.UTF-8
