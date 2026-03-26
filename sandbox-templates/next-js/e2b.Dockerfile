# Use stable Node version
FROM node:20-slim

# Install curl
RUN apt-get update && apt-get install -y curl && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY compile_page.sh /compile_page.sh
RUN chmod +x /compile_page.sh

WORKDIR /home/user/nextjs-app

# Create Next.js app
RUN npx --yes create-next-app@latest . --yes

# Initialize shadcn correctly
RUN npx --yes shadcn@latest init --yes -b base --force

# Add all components (FIXED TYPO)
RUN npx --yes shadcn@latest add --all --yes

# Move files
RUN mv /home/user/nextjs-app/* /home/user/ && rm -rf /home/user/nextjs-app